import { randomBytes } from "crypto";
import { PrismaClient, Prisma } from "@prisma/client";

type UserFinder = PrismaClient | Prisma.TransactionClient;

function randomInviteCode() {
  return randomBytes(4).toString("hex").toUpperCase();
}

export async function createUniqueInviteCode(client: UserFinder) {
  for (let i = 0; i < 10; i += 1) {
    const candidate = randomInviteCode();
    const exists = await client.user.findUnique({
      where: { inviteCode: candidate },
      select: { id: true },
    });
    if (!exists) {
      return candidate;
    }
  }
  return `${randomInviteCode()}${Date.now().toString().slice(-4)}`;
}
