import { Router } from 'express';

import { dispatchMessage } from '../services/message.service.js';
import { saveMessengerLinks } from '../store/userStore.js';

export const messagesRouter = Router();

messagesRouter.post('/users/:userId/messenger-links', (req, res) => {
  const userId = req.params.userId?.trim();
  const lineUserId = String(req.body?.lineUserId || '').trim();
  const telegramChatId = String(req.body?.telegramChatId || '').trim();

  if (!userId) {
    res.status(400).json({ error: 'userId is required.' });
    return;
  }

  if (!lineUserId && !telegramChatId) {
    res.status(400).json({ error: 'At least one messenger ID is required.' });
    return;
  }

  const saved = saveMessengerLinks(userId, { lineUserId, telegramChatId });

  res.json({
    status: 'saved',
    user: saved,
  });
});

messagesRouter.post('/messages/send', async (req, res) => {
  const userId = String(req.body?.userId || '').trim();
  const channel = String(req.body?.channel || '').trim();
  const text = String(req.body?.text || '').trim();

  if (!userId) {
    res.status(400).json({ error: 'userId is required.' });
    return;
  }

  if (!['line', 'telegram', 'both'].includes(channel)) {
    res.status(400).json({ error: 'channel must be line, telegram, or both.' });
    return;
  }

  if (!text) {
    res.status(400).json({ error: 'text is required.' });
    return;
  }

  try {
    const result = await dispatchMessage({
      userId,
      channel,
      text,
    });

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Message dispatch failed.';
    res.status(400).json({ error: message });
  }
});
