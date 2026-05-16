const buckets = new Map();

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

export function isRateLimited(request, { limit, windowMs }) {
  const ip = getClientIp(request);
  const key = `${ip}:${limit}:${windowMs}`;
  const now = Date.now();

  let bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  if (bucket.count >= limit) return true;

  bucket.count += 1;
  return false;
}
