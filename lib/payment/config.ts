import { PaymentChannel } from "@prisma/client";
import { decryptText } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

export async function getEnabledPaymentConfig(channel: PaymentChannel) {
  const config = await prisma.paymentConfig.findUnique({ where: { channel } });
  if (!config || !config.enabled) {
    throw new Error(`${channel} 未启用`);
  }

  return {
    ...config,
    privateKey: decryptText(config.encryptedKey),
    apiV3Key: config.encryptedApiV3Key ? decryptText(config.encryptedApiV3Key) : "",
  };
}
