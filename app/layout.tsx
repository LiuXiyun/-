import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 聚合平台",
  description: "多模型 + 支付 + 用量统计后台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
