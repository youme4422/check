import { getMessengerLinks } from '../store/userStore.js';
import { sendLineMessage } from './line.service.js';
import { sendTelegramMessage } from './telegram.service.js';

export async function dispatchMessage({ userId, channel, text }) {
  const links = getMessengerLinks(userId);

  if (!links) {
    throw new Error('No linked messenger IDs were found for this user.');
  }

  const tasks = [];
  const deliveredChannels = [];

  if (channel === 'line' || channel === 'both') {
    if (!links.lineUserId) {
      throw new Error('The user has no linked LINE ID.');
    }

    tasks.push(
      sendLineMessage({
        to: links.lineUserId,
        text,
      }).then(() => {
        deliveredChannels.push('line');
      })
    );
  }

  if (channel === 'telegram' || channel === 'both') {
    if (!links.telegramChatId) {
      throw new Error('The user has no linked Telegram chat ID.');
    }

    tasks.push(
      sendTelegramMessage({
        chatId: links.telegramChatId,
        text,
      }).then(() => {
        deliveredChannels.push('telegram');
      })
    );
  }

  await Promise.all(tasks);

  return {
    status: 'sent',
    deliveredChannels,
  };
}
