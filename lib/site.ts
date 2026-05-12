export const siteConfig = {
  name: "极智 AI 中转站",
  shortName: "极智AI",
  description:
    "中文 AI 模型聚合平台：一站接入 OpenAI、Claude、Gemini，支持支付宝/微信支付，后台实时查看 Token 消耗与成本。",
  domain: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  keywords: [
    "AI中转站",
    "大模型聚合",
    "OpenAI中转",
    "Claude API",
    "Gemini API",
    "支付宝充值AI",
    "微信支付AI",
    "AI key消耗统计",
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
