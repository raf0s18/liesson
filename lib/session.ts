import crypto from "crypto";
import { cookies } from "next/headers";
import { lessonSchema, type FullLesson } from "./schemas";

const COOKIE = "liesson_lesson";
const key = () => crypto.createHash("sha256").update(process.env.LESSON_COOKIE_SECRET || process.env.OPENAI_API_KEY || "development-only-secret").digest();

function encrypt(value: string) {
  const iv = crypto.randomBytes(12); const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const content = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]); const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, content]).toString("base64url");
}
function decrypt(value: string) {
  const data = Buffer.from(value, "base64url"); const iv = data.subarray(0, 12); const tag = data.subarray(12, 28); const content = data.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), iv); decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(content), decipher.final()]).toString("utf8");
}
export async function saveLesson(lesson: FullLesson) {
  const store = await cookies();
  store.set(COOKIE, encrypt(JSON.stringify(lesson)), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 30, path: "/" });
}
export async function getLesson(): Promise<FullLesson | null> {
  try { const value = (await cookies()).get(COOKIE)?.value; return value ? lessonSchema.parse(JSON.parse(decrypt(value))) : null; } catch { return null; }
}
export async function clearLesson() { (await cookies()).delete(COOKIE); }
