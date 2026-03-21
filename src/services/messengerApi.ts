import { MESSENGER_SERVER_API_KEY, MESSENGER_SERVER_BASE_URL } from '../config/appConfig';

type Channel = 'line' | 'telegram' | 'email';

type LinkRecipientsArgs = {
  accountId: string;
  lineUserId: string;
  telegramChatId: string;
  email: string;
};

type SendDeadmanAlertArgs = {
  accountId: string;
  channels: Channel[];
  text: string;
};

type CreateLinkCodeArgs = {
  accountId: string;
  channel: 'line' | 'telegram';
};

type LinkCodeResponse = {
  code: string;
  expiresAt: number;
  expiresInSeconds: number;
};

type MessengerLinksResponse = {
  lineUserId: string;
  telegramChatId: string;
  email: string;
};

export function isMessengerServerConfigured() {
  return Boolean(MESSENGER_SERVER_BASE_URL.trim() && MESSENGER_SERVER_API_KEY.trim());
}

function buildAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-api-key': MESSENGER_SERVER_API_KEY,
  };
}

export async function linkRecipients(args: LinkRecipientsArgs) {
  const baseUrl = MESSENGER_SERVER_BASE_URL.trim();
  if (!baseUrl) {
    throw new Error('Messenger server URL is not configured.');
  }

  const response = await fetch(`${baseUrl}/api/users/${encodeURIComponent(args.accountId)}/messenger-links`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      lineUserId: args.lineUserId,
      telegramChatId: args.telegramChatId,
      email: args.email,
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
    headers: buildAuthHeaders(),
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

export async function createMessengerLinkCode(args: CreateLinkCodeArgs): Promise<LinkCodeResponse> {
  const baseUrl = MESSENGER_SERVER_BASE_URL.trim();
  if (!baseUrl) {
    throw new Error('Messenger server URL is not configured.');
  }

  const response = await fetch(`${baseUrl}/api/users/${encodeURIComponent(args.accountId)}/link-codes`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      channel: args.channel,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Link code API failed: ${response.status}`);
  }

  const payload = (await response.json()) as { code?: string; expiresAt?: number; expiresInSeconds?: number };
  if (!payload.code || typeof payload.expiresAt !== 'number' || typeof payload.expiresInSeconds !== 'number') {
    throw new Error('Invalid link code response.');
  }

  return {
    code: payload.code,
    expiresAt: payload.expiresAt,
    expiresInSeconds: payload.expiresInSeconds,
  };
}

export async function getMessengerLinks(accountId: string): Promise<MessengerLinksResponse> {
  const baseUrl = MESSENGER_SERVER_BASE_URL.trim();
  if (!baseUrl) {
    throw new Error('Messenger server URL is not configured.');
  }

  const response = await fetch(`${baseUrl}/api/users/${encodeURIComponent(accountId)}/messenger-links`, {
    method: 'GET',
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Get links API failed: ${response.status}`);
  }

  const payload = (await response.json()) as Partial<MessengerLinksResponse>;
  return {
    lineUserId: String(payload.lineUserId || '').trim(),
    telegramChatId: String(payload.telegramChatId || '').trim(),
    email: String(payload.email || '').trim().toLowerCase(),
  };
}
