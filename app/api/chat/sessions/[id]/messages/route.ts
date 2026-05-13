import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await context.params;
  const session = await prisma.chatSession.findFirst({
    where: { id, userId: user.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "会话不存在" }, { status: 404 });
  }

  const messages = session.messages.map((item) => ({
    id: item.id,
    role:
      item.role === "USER"
        ? ("user" as const)
        : item.role === "ASSISTANT"
          ? ("assistant" as const)
          : ("system" as const),
    parts: [{ type: "text", text: item.content }],
  }));

  return NextResponse.json({
    session: { id: session.id, title: session.title, updatedAt: session.updatedAt },
    messages,
  });
}
