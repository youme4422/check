import { MESSENGER_SERVER_BASE_URL } from '../config/appConfig';

type Channel = 'line' | 'telegram' | 'email' | 'whatsapp';

type LinkRecipientsArgs = {
  accountId: string;
  lineUserId: string;
  telegramChatId: string;
  email: string;
  whatsappTo: string;
};

type SendDeadmanAlertArgs = {
  accountId: string;
  channels: Channel[];
  text: string;
};

export function isMessengerServerConfigured() {
  return Boolean(MESSENGER_SERVER_BASE_URL.trim());
}

export async function linkRecipients(args: LinkRecipientsArgs) {
  const baseUrl = MESSENGER_SERVER_BASE_URL.trim();
  if (!baseUrl) {
    throw new Error('Messenger server URL is not configured.');
  }

  const response = await fetch(`${baseUrl}/api/users/${encodeURIComponent(args.accountId)}/messenger-links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      lineUserId: args.lineUserId,
      telegramChatId: args.telegramChatId,
      email: args.email,
      whatsappTo: args.whatsappTo,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Link API failed: ${response.status}`);
  }
}

export async function sendDeadmanAlert(args: SendDeadmanAlertArgs) {
  const baseUrl = MESSENGER_SERVER_BASE_URL.trim();
  if (!baseUrl) {
    throw new Error('Messenger server URL is not configured.');
  }

  const response = await fetch(`${baseUrl}/api/messages/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: args.accountId,
      channels: args.channels,
      text: args.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Send API failed: ${response.status}`);
  }
}
