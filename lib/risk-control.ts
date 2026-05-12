const BLOCKED_PATTERNS = [
  /制作炸弹|爆炸物|枪支改装|毒品合成/i,
  /银行卡盗刷|破解支付|洗钱教程/i,
  /绕过风控|撞库|社工库/i,
];

export function assessPromptRisk(text: string) {
  if (!text.trim()) {
    return { blocked: false, reason: "" };
  }
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      return { blocked: true, reason: "命中风控词，当前内容不可处理" };
    }
  }
  return { blocked: false, reason: "" };
}

export function validateRechargeAmount(amountCny: number) {
  if (amountCny < 1) {
    return { valid: false, reason: "充值金额不能低于 1 元" };
  }
  if (amountCny > 5000) {
    return { valid: false, reason: "单笔充值不能超过 5000 元" };
  }
  return { valid: true, reason: "" };
}
