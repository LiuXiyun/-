import { createDecipheriv, createSign, createVerify, randomBytes } from "crypto";
import { cnyToFen, normalizePem } from "@/lib/payment/shared";

type WechatConfig = {
  appId: string;
  mchId: string;
  privateKey: string;
  certSerial: string;
  apiV3Key: string;
  notifyUrl: string;
  platformPublicKey: string;
  gateway?: string | null;
};

type WechatNativeOrderArgs = {
  orderNo: string;
  amountCny: number;
  description: string;
};

function signMessage(message: string, privateKey: string) {
  const signer = createSign("RSA-SHA256");
  signer.update(message, "utf8");
  signer.end();
  return signer.sign(normalizePem(privateKey), "base64");
}

function verifyMessage(message: string, signature: string, publicKey: string) {
  const verifier = createVerify("RSA-SHA256");
  verifier.update(message, "utf8");
  verifier.end();
  return verifier.verify(normalizePem(publicKey), signature, "base64");
}

function buildAuthorization(
  mchId: string,
  serialNo: string,
  privateKey: string,
  method: string,
  urlPath: string,
  body: string,
) {
  const nonceStr = randomBytes(16).toString("hex");
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const message = `${method}\n${urlPath}\n${timestamp}\n${nonceStr}\n${body}\n`;
  const signature = signMessage(message, privateKey);
  return `WECHATPAY2-SHA256-RSA2048 mchid="${mchId}",nonce_str="${nonceStr}",timestamp="${timestamp}",serial_no="${serialNo}",signature="${signature}"`;
}

export async function createWechatNativeOrder(config: WechatConfig, args: WechatNativeOrderArgs) {
  const endpoint = "/v3/pay/transactions/native";
  const payload = JSON.stringify({
    appid: config.appId,
    mchid: config.mchId,
    description: args.description,
    out_trade_no: args.orderNo,
    notify_url: config.notifyUrl,
    amount: {
      total: cnyToFen(args.amountCny),
      currency: "CNY",
    },
  });

  const authorization = buildAuthorization(
    config.mchId,
    config.certSerial,
    config.privateKey,
    "POST",
    endpoint,
    payload,
  );

  const gateway = config.gateway || "https://api.mch.weixin.qq.com";
  const response = await fetch(`${gateway}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "ai-gateway-platform",
    },
    body: payload,
  });

  const result = (await response.json()) as {
    code_url?: string;
    message?: string;
  };

  if (!response.ok || !result.code_url) {
    throw new Error(result.message || "微信下单失败");
  }

  return {
    payUrl: result.code_url,
    externalOrderNo: args.orderNo,
    raw: result,
  };
}

type WechatNotificationResource = {
  algorithm: "AEAD_AES_256_GCM";
  ciphertext: string;
  nonce: string;
  associated_data: string;
};

type WechatNotificationBody = {
  id: string;
  create_time: string;
  event_type: string;
  resource_type: string;
  summary: string;
  resource: WechatNotificationResource;
};

export function parseWechatNotification(
  rawBody: string,
  headers: {
    timestamp: string;
    nonce: string;
    signature: string;
  },
  config: Pick<WechatConfig, "apiV3Key" | "platformPublicKey">,
) {
  const message = `${headers.timestamp}\n${headers.nonce}\n${rawBody}\n`;
  const verified = verifyMessage(message, headers.signature, config.platformPublicKey);
  if (!verified) {
    throw new Error("微信回调签名校验失败");
  }

  const body = JSON.parse(rawBody) as WechatNotificationBody;
  const resource = body.resource;
  if (config.apiV3Key.length !== 32) {
    throw new Error("微信 APIv3 Key 长度必须是 32 位");
  }
  const cipherData = Buffer.from(resource.ciphertext, "base64");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    Buffer.from(config.apiV3Key, "utf8"),
    Buffer.from(resource.nonce, "utf8"),
  );
  decipher.setAuthTag(cipherData.subarray(-16));
  decipher.setAAD(Buffer.from(resource.associated_data, "utf8"));

  const encryptedData = cipherData.subarray(0, cipherData.length - 16);
  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]).toString("utf8");

  return JSON.parse(decrypted) as {
    out_trade_no: string;
    transaction_id: string;
    trade_state: string;
  };
}
