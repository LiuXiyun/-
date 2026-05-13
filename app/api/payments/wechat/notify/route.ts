import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { creditTopup } from "@/lib/billing";
import { getEnabledPaymentConfig } from "@/lib/payment/config";
import { parseWechatNotification } from "@/lib/payment/wechat";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("wechatpay-signature");
    const timestamp = request.headers.get("wechatpay-timestamp");
    const nonce = request.headers.get("wechatpay-nonce");

    if (!signature || !timestamp || !nonce) {
      return NextResponse.json({ code: "FAIL", message: "缺少微信签名头" }, { status: 400 });
    }

    const config = await getEnabledPaymentConfig("WECHAT");
    if (!config.publicKey || !config.apiV3Key) {
      return NextResponse.json({ code: "FAIL", message: "微信配置不完整" }, { status: 400 });
    }

    const payload = parseWechatNotification(
      rawBody,
      { signature, timestamp, nonce },
      { platformPublicKey: config.publicKey, apiV3Key: config.apiV3Key },
    );

    if (payload.trade_state === "SUCCESS") {
      await prisma.$transaction(async (tx) => {
        const order = await tx.rechargeOrder.findUnique({
          where: { orderNo: payload.out_trade_no },
          select: { id: true, status: true, userId: true, amountCny: true },
        });
        if (!order || order.status === "PAID") {
          return;
        }

        await tx.rechargeOrder.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.PAID,
            externalOrderNo: payload.transaction_id,
            paidAt: new Date(),
          },
        });

        await creditTopup({
          userId: order.userId,
          amountCny: order.amountCny,
          note: `微信充值到账（订单 ${payload.out_trade_no}）`,
          referenceId: order.id,
          tx,
        });
      });
    }

    return NextResponse.json({ code: "SUCCESS", message: "OK" });
  } catch (error) {
    console.error("微信支付回调失败:", error);
    return NextResponse.json({ code: "FAIL", message: "invalid payload" }, { status: 400 });
  }
}
