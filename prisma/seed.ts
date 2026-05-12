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

  const plans = [
    {
      name: "体验包",
      slug: "starter",
      priceCny: 19.9,
      creditsCny: 25,
      description: "适合个人体验和小规模测试",
    },
    {
      name: "开发者包",
      slug: "pro",
      priceCny: 99,
      creditsCny: 130,
      description: "适合持续开发和中等流量项目",
    },
    {
      name: "团队包",
      slug: "team",
      priceCny: 299,
      creditsCny: 420,
      description: "适合团队协作和高频调用场景",
    },
  ] as const;

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
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
