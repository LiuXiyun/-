type Bucket = {
  count: number;
  resetAt: number;
};

declare global {
  var __rateLimitBuckets: Map<string, Bucket> | undefined;
}

function getBuckets() {
  if (!global.__rateLimitBuckets) {
    global.__rateLimitBuckets = new Map<string, Bucket>();
  }
  return global.__rateLimitBuckets;
}

export function checkRateLimit(params: { key: string; limit: number; windowMs: number }) {
  const now = Date.now();
  const buckets = getBuckets();
  const current = buckets.get(params.key);

  if (!current || current.resetAt <= now) {
    buckets.set(params.key, { count: 1, resetAt: now + params.windowMs });
    return { allowed: true, remaining: params.limit - 1, retryAfterMs: params.windowMs };
  }

  if (current.count >= params.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, current.resetAt - now),
    };
  }

  current.count += 1;
  buckets.set(params.key, current);
  return {
    allowed: true,
    remaining: params.limit - current.count,
    retryAfterMs: Math.max(0, current.resetAt - now),
  };
}
