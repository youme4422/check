import { API_BASE_URL } from '../../../config/appConfig';
import type {
  MessengerLinksPayload,
  SendMessagePayload,
  SendMessageResponse,
} from '../types';

export async function syncMessengerLinks(payload: MessengerLinksPayload) {
  await request(`/api/users/${encodeURIComponent(payload.userId)}/messenger-links`, {
    method: 'POST',
    body: JSON.stringify({
      lineUserId: payload.lineUserId,
      telegramChatId: payload.telegramChatId,
    }),
  });
}

export async function sendMessengerMessage(payload: SendMessagePayload) {
  return request<SendMessageResponse>('/api/messages/send', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  const data = (await response.json().catch(() => null)) as T | { error?: string } | null;

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data && data.error
        ? data.error
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return (data ?? {}) as T;
}
