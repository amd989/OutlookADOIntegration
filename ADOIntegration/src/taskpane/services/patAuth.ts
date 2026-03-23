export function buildPatAuthHeader(pat: string): string {
  const encoded = btoa(`:${pat}`);
  return `Basic ${encoded}`;
}

export function isPatValid(pat: string): boolean {
  return pat.trim().length > 0;
}
