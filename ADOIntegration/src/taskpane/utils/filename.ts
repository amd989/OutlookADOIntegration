const INVALID_FILENAME_CHARS = /[<>:"/\\|?*\x00-\x1f]/g;

export function sanitizeFilename(subject: string): string {
  const sanitized = subject.replace(INVALID_FILENAME_CHARS, "").trim();
  return sanitized || "email";
}
