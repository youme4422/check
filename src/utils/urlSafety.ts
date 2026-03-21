export function isAllowedExternalUrl(url: string, allowedProtocols: string[]) {
  const trimmed = url.trim();

  if (!trimmed) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return allowedProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
}
