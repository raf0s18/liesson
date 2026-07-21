import crypto from "node:crypto";
import { kv } from "@vercel/kv";

const VISITOR_LIMIT = 10; // 2 calls (generate + adjudicate) per full try — allows 5 full tries per visitor per hour
const GLOBAL_LIMIT = 150;
const HOUR_MS = 60 * 60 * 1000;
const DAY_SECONDS = 24 * 60 * 60;

export type KvRateClient = Pick<typeof kv, "zadd" | "zcard" | "zremrangebyscore" | "expire" | "incr">;
export type RateLimitResult = { allowed: boolean; reason?: "visitor" | "global" | "unavailable" };

const keyPart = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

export function visitorId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || request.headers.get("cf-connecting-ip");
  if (ip) return `ip:${ip}`;
  const cookie = request.headers.get("cookie")?.match(/(?:^|;\s*)liesson_lesson=([^;]+)/)?.[1];
  return cookie ? `session:${cookie}` : "anonymous:unidentified";
}

export async function enforceRateLimit(request: Request, client: KvRateClient = kv, now = Date.now()): Promise<RateLimitResult> {
  try {
    const visitorKey = `liesson:rate:visitor:${keyPart(visitorId(request))}`;
    await client.zremrangebyscore(visitorKey, 0, now - HOUR_MS);
    if (await client.zcard(visitorKey) >= VISITOR_LIMIT) return { allowed: false, reason: "visitor" };

    const globalKey = "liesson:rate:global:model-calls";
    const total = await client.incr(globalKey);
    if (total === 1) await client.expire(globalKey, DAY_SECONDS);
    if (total > GLOBAL_LIMIT) return { allowed: false, reason: "global" };

    await client.zadd(visitorKey, { score: now, member: crypto.randomUUID() });
    await client.expire(visitorKey, Math.ceil(HOUR_MS / 1000));
    return { allowed: true };
  } catch {
    return { allowed: false, reason: "unavailable" };
  }
}

export const demoLimitResponse = () => ({ error: "demo_limit_reached", message: "This demo has hit its usage limit for now — please try again in a bit." });
