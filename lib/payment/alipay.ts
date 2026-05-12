import { createSign, createVerify } from "crypto";
import { normalizePem, toTwoDecimals } from "@/lib/payment/shared";

type AlipayConfig = {
  appId: string;
  privateKey: string;
  notifyUrl?: string | null;
  gateway?: string | null;
};

type AlipayPrecreateArgs = {
  orderNo: string;
  amountCny: number;
  subject: string;
};

function createSignContent(params: Record<string, string>) {
  return Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
}

function rsa2Sign(content: string, privateKey: string) {
  const signer = createSign("RSA-SHA256");
  signer.update(content, "utf8");
  signer.end();
  return signer.sign(normalizePem(privateKey), "base64");
}

export function verifyAlipaySignature(
  payload: Record<string, string>,
  signature: string,
  publicKey: string,
) {
  const verify = createVerify("RSA-SHA256");
  verify.update(createSignContent(payload), "utf8");
  verify.end();
  return verify.verify(normalizePem(publicKey), signature, "base64");
}

export async function createAlipayOrder(config: AlipayConfig, args: AlipayPrecreateArgs) {
  const params: Record<string, string> = {
    app_id: config.appId,
    method: "alipay.trade.precreate",
    format: "JSON",
    charset: "utf-8",
    sign_type: "RSA2",
    timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
    version: "1.0",
    biz_content: JSON.stringify({
      out_trade_no: args.orderNo,
      total_amount: toTwoDecimals(args.amountCny),
      subject: args.subject,
      timeout_express: "30m",
    }),
  };

  if (config.notifyUrl) {
    params.notify_url = config.notifyUrl;
  }

  const sign = rsa2Sign(createSignContent(params), config.privateKey);
  const body = new URLSearchParams({ ...params, sign });

  const gateway = config.gateway || "https://openapi.alipay.com/gateway.do";
  const response = await fetch(gateway, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const result = (await response.json()) as {
    alipay_trade_precreate_response?: {
      code: string;
      msg?: string;
      sub_msg?: string;
      out_trade_no?: string;
      qr_code?: string;
    };
  };

  const payload = result.alipay_trade_precreate_response;
  if (!payload || payload.code !== "10000" || !payload.qr_code) {
    throw new Error(payload?.sub_msg || payload?.msg || "支付宝下单失败");
  }

  return {
    payUrl: payload.qr_code,
    externalOrderNo: payload.out_trade_no ?? args.orderNo,
    raw: result,
  };
}
