import * as Clipboard from 'expo-clipboard';

export async function copyText(value: string) {
  try {
    await Clipboard.setStringAsync(value);
    const verify = await Clipboard.getStringAsync();
    if (verify === value) {
      return true;
    }
  } catch {
    // Fall through to web clipboard fallback.
  }

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

  try {
    await clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}
