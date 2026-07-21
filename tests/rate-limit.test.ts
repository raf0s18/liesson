import { describe, expect, it } from "vitest";
import { enforceRateLimit, type KvRateClient } from "@/lib/rate-limit";

function memoryKv(clock: () => number): KvRateClient {
  const sorted = new Map<string, Array<{ score: number; member: string }>>();
  const strings = new Map<string, number>();
  const expiry = new Map<string, number>();
  const clearExpired = (key: string) => { if ((expiry.get(key) ?? Infinity) <= clock()) { strings.delete(key); sorted.delete(key); expiry.delete(key); } };
  return {
    zadd: async (key: string, value: { score: number; member: string }) => { clearExpired(key); sorted.set(key, [...(sorted.get(key) ?? []), value]); return 1; },
    zcard: async (key: string) => { clearExpired(key); return (sorted.get(key) ?? []).length; },
    zremrangebyscore: async (key: string, min: number, max: number) => { clearExpired(key); const items = sorted.get(key) ?? []; const kept = items.filter((item) => item.score < min || item.score > max); sorted.set(key, kept); return items.length - kept.length; },
    expire: async (key: string, seconds: number) => { expiry.set(key, clock() + seconds * 1000); return 1; },
    incr: async (key: string) => { clearExpired(key); const next = (strings.get(key) ?? 0) + 1; strings.set(key, next); return next; },
  } as unknown as KvRateClient;
}

const request = new Request("https://liesson.test/api/lesson", { headers: { "x-forwarded-for": "203.0.113.7" } });

describe("KV rate limiting", () => {
  it("allows an under-limit visitor", async () => {
    let now = 0; const client = memoryKv(() => now);
    await expect(enforceRateLimit(request, client, now)).resolves.toEqual({ allowed: true });
  });

  it("blocks an at-limit visitor before the sixth request", async () => {
    let now = 0; const client = memoryKv(() => now);
    for (let i = 0; i < 5; i += 1) await expect(enforceRateLimit(request, client, now)).resolves.toEqual({ allowed: true });
    await expect(enforceRateLimit(request, client, now)).resolves.toEqual({ allowed: false, reason: "visitor" });
  });

  it("allows the visitor again after the rolling window expires", async () => {
    let now = 0; const client = memoryKv(() => now);
    for (let i = 0; i < 5; i += 1) await enforceRateLimit(request, client, now);
    now = 60 * 60 * 1000 + 1;
    await expect(enforceRateLimit(request, client, now)).resolves.toEqual({ allowed: true });
  });
});
