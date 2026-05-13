import { redirect } from "next/navigation";

/** 官网不提供网页聊天；旧 /chat 链接回到首页。 */
export default function ChatDeprecatedPage() {
  redirect("/");
}
