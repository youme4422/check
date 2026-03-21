export async function copyText(value: string) {
  const clipboard = (
    globalThis as typeof globalThis & {
      navigator?: {
        clipboard?: {
          writeText: (text: string) => Promise<void>;
        };
      };
    }
  ).navigator?.clipboard;

  if (!clipboard) {
    return false;
  }

  await clipboard.writeText(value);
  return true;
}
