export const MAX_SOURCE_MATERIAL_CHARS = 3000;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function truncateSourceMaterial(text: string): { text: string; truncated: boolean } {
  const trimmed = text.trim();
  if (trimmed.length <= MAX_SOURCE_MATERIAL_CHARS) return { text: trimmed, truncated: false };
  return { text: trimmed.slice(0, MAX_SOURCE_MATERIAL_CHARS), truncated: true };
}
