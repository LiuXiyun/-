-- AlterTable
ALTER TABLE "PaymentConfig" ADD COLUMN "certSerial" TEXT;
ALTER TABLE "PaymentConfig" ADD COLUMN "encryptedApiV3Key" TEXT;
ALTER TABLE "PaymentConfig" ADD COLUMN "gateway" TEXT;

-- AlterTable
ALTER TABLE "RechargeOrder" ADD COLUMN "paidAt" DATETIME;
ALTER TABLE "RechargeOrder" ADD COLUMN "payPayload" TEXT;
