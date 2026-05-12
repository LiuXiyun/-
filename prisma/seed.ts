import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const hasOpenAI = await prisma.modelProviderKey.findFirst({
    where: { name: "OpenAI 默认" },
  });

  if (!hasOpenAI) {
    await prisma.modelProviderKey.create({
      data: {
        name: "OpenAI 默认",
        provider: "OPENAI",
        encryptedKey: "PLEASE_REPLACE_WITH_REAL_KEY",
        enabled: false,
        note: "示例数据，启用前请在后台更新真实 Key。",
      },
    });
  }
}

main()
  .catch((error) => {
    console.error("Seed 失败:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
