const users = new Map();

export function saveMessengerLinks(userId, links) {
  const nextUser = {
    userId,
    lineUserId: links.lineUserId || '',
    telegramChatId: links.telegramChatId || '',
  };

  users.set(userId, nextUser);

  return nextUser;
}

export function getMessengerLinks(userId) {
  return users.get(userId) || null;
}
