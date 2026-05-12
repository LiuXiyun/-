import { PaymentChannel } from "@prisma/client";
import { NextResponse } from "next/server";
import { createAlipayOrder } from "@/lib/payment/alipay";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getEnabledPaymentConfig } from "@/lib/payment/config";
import { buildOrderNo } from "@/lib/payment/shared";
import { createWechatNativeOrder } from "@/lib/payment/wechat";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const isAdmin = await isAdminAuthenticated();

    const {
      channel,
      amountCny,
      subject,
      userId,
    }: {
      channel?: PaymentChannel;
      amountCny?: number;
      subject?: string;
      userId?: string;
    } = await request.json();

    if (!user && !isAdmin) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    if (!channel || !amountCny || amountCny <= 0) {
      return NextResponse.json({ error: "请传入正确的支付渠道和金额" }, { status: 400 });
    }

    const paymentConfig = await getEnabledPaymentConfig(channel);
    const orderNo = buildOrderNo(channel === "ALIPAY" ? "ALI" : "WX");

    let payUrl = "";
    let externalOrderNo = orderNo;
    let rawPayload = "";

    if (channel === "ALIPAY") {
      if (!paymentConfig.publicKey || !paymentConfig.notifyUrl) {
        return NextResponse.json(
          { error: "支付宝配置不完整，需要支付宝公钥和回调地址" },
          { status: 400 },
        );
      }
      const result = await createAlipayOrder(
        {
          appId: paymentConfig.appId,
          privateKey: paymentConfig.privateKey,
          notifyUrl: paymentConfig.notifyUrl,
          gateway: paymentConfig.gateway,
        },
        {
          orderNo,
          amountCny,
          subject: subject?.trim() || "AI 站点充值",
        },
      );
      payUrl = result.payUrl;
      externalOrderNo = result.externalOrderNo;
      rawPayload = JSON.stringify(result.raw);
    } else {
      if (
        !paymentConfig.merchantId ||
        !paymentConfig.certSerial ||
        !paymentConfig.apiV3Key ||
        !paymentConfig.notifyUrl ||
        !paymentConfig.publicKey
      ) {
        return NextResponse.json(
          { error: "微信支付配置不完整，需要商户号、证书序列号、APIv3 Key、平台公钥、回调地址" },
          { status: 400 },
        );
      }

      const result = await createWechatNativeOrder(
        {
          appId: paymentConfig.appId,
          mchId: paymentConfig.merchantId,
          privateKey: paymentConfig.privateKey,
          certSerial: paymentConfig.certSerial,
          apiV3Key: paymentConfig.apiV3Key,
          notifyUrl: paymentConfig.notifyUrl,
          platformPublicKey: paymentConfig.publicKey,
          gateway: paymentConfig.gateway,
        },
        {
          orderNo,
          amountCny,
          description: subject?.trim() || "AI 站点充值",
        },
      );
      payUrl = result.payUrl;
      externalOrderNo = result.externalOrderNo;
      rawPayload = JSON.stringify(result.raw);
    }

    const orderUserId =
      user?.id ||
      userId ||
      (await prisma.user.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } }))?.id;
    if (!orderUserId) {
      return NextResponse.json({ error: "暂无用户可充值，请先注册一个用户账号" }, { status: 400 });
    }

    const order = await prisma.rechargeOrder.create({
      data: {
        userId: orderUserId,
        channel,
        orderNo,
        amountCny,
        payUrl,
        externalOrderNo,
        payPayload: rawPayload,
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("创建订单失败:", error);
    return NextResponse.json({ error: "创建订单失败" }, { status: 500 });
  }
}
