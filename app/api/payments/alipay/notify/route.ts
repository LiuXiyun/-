import { OrderStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { creditTopup } from "@/lib/billing";
import { verifyAlipaySignature } from "@/lib/payment/alipay";
import { getEnabledPaymentConfig } from "@/lib/payment/config";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        params[key] = value;
      }
    }

    const signature = params.sign;
    const orderNo = params.out_trade_no;
    const tradeStatus = params.trade_status;

    if (!signature || !orderNo) {
      return new NextResponse("fail", { status: 400 });
    }

    const config = await getEnabledPaymentConfig("ALIPAY");
    if (!config.publicKey) {
      return new NextResponse("fail", { status: 400 });
    }

    const verifyPayload = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => key !== "sign" && key !== "sign_type" && value !== ""),
    );
    const verified = verifyAlipaySignature(verifyPayload, signature, config.publicKey);
    if (!verified) {
      return new NextResponse("fail", { status: 400 });
    }

    if (tradeStatus === "TRADE_SUCCESS" || tradeStatus === "TRADE_FINISHED") {
      await prisma.$transaction(async (tx) => {
        const order = await tx.rechargeOrder.findUnique({
          where: { orderNo },
          select: { id: true, status: true, userId: true, amountCny: true },
        });
        if (!order || order.status === "PAID") {
          return;
        }

        await tx.rechargeOrder.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.PAID,
            externalOrderNo: params.trade_no || orderNo,
            paidAt: new Date(),
          },
        });

        await creditTopup({
          userId: order.userId,
          amountCny: order.amountCny,
          note: `支付宝充值到账（订单 ${orderNo}）`,
          referenceId: order.id,
          tx,
        });
      });
    }

    return new NextResponse("success");
  } catch (error) {
    console.error("支付宝回调处理失败:", error);
    return new NextResponse("fail", { status: 400 });
  }
}
