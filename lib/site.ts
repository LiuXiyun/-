export const siteConfig = {
  name: "极智 AI 编程助手",
  shortName: "极智AI",
  description:
    "为中国开发者打造的 AI 智能编程助手：代码生成、调试优化与团队协作。配套营销官网、用户账户、支付与运营后台。",
  domain: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  keywords: [
    "AI编程助手",
    "智能写代码",
    "代码生成",
    "调试优化",
    "开发者工具",
    "AI辅助开发",
    "中文编程助手",
    "支付宝充值",
    "微信支付",
    "运营后台",
  ],
};

export const geoCities = [
  { slug: "beijing", name: "北京" },
  { slug: "shanghai", name: "上海" },
  { slug: "guangzhou", name: "广州" },
  { slug: "shenzhen", name: "深圳" },
  { slug: "hangzhou", name: "杭州" },
  { slug: "chengdu", name: "成都" },
] as const;
