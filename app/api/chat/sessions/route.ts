import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const sessions = await prisma.chatSession.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          content: true,
          createdAt: true,
        },
      },
    },
  });

  return NextResponse.json({
    sessions: sessions.map((item) => ({
      id: item.id,
      title: item.title,
      updatedAt: item.updatedAt,
      preview: item.messages[0]?.content || "",
    })),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { title }: { title?: string } = await request.json().catch(() => ({ title: "" }));
  const session = await prisma.chatSession.create({
    data: {
      userId: user.id,
      title: title?.trim() || "新对话",
    },
  });

  return NextResponse.json({ session });
}
