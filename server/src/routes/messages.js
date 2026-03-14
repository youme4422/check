import { Router } from 'express';

import { dispatchMessage } from '../services/message.service.js';
import { saveMessengerLinks } from '../store/userStore.js';

export const messagesRouter = Router();

messagesRouter.post('/users/:userId/messenger-links', (req, res) => {
  const userId = req.params.userId?.trim();
  const lineUserId = String(req.body?.lineUserId || '').trim();
  const telegramChatId = String(req.body?.telegramChatId || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const whatsappTo = String(req.body?.whatsappTo || '').trim();

  if (!userId) {
    res.status(400).json({ error: 'userId is required.' });
    return;
  }

  if (!lineUserId && !telegramChatId && !email && !whatsappTo) {
    res.status(400).json({ error: 'At least one recipient is required.' });
    return;
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'email format is invalid.' });
    return;
  }

  if (whatsappTo && !/^\+?[1-9]\d{7,14}$/.test(whatsappTo)) {
    res.status(400).json({ error: 'whatsappTo format is invalid.' });
    return;
  }

  const saved = saveMessengerLinks(userId, { lineUserId, telegramChatId, email, whatsappTo });

  res.json({
    status: 'saved',
    user: saved,
  });
});

messagesRouter.post('/messages/send', async (req, res) => {
  const userId = String(req.body?.userId || '').trim();
  const channel = String(req.body?.channel || '').trim();
  const channels = Array.isArray(req.body?.channels)
    ? req.body.channels.map((item) => String(item || '').trim()).filter(Boolean)
    : [];
  const text = String(req.body?.text || '').trim();

  if (!userId) {
    res.status(400).json({ error: 'userId is required.' });
    return;
  }

  const validSingle = ['line', 'telegram', 'email', 'whatsapp', 'both', 'telegram_email', 'line_whatsapp'];
  const validMulti = ['line', 'telegram', 'email', 'whatsapp'];

  if (!channel && channels.length === 0) {
    res.status(400).json({ error: 'channel or channels is required.' });
    return;
  }

  if (channel && !validSingle.includes(channel)) {
    res.status(400).json({ error: 'channel must be line, telegram, email, whatsapp, both, telegram_email, or line_whatsapp.' });
    return;
  }

  if (channels.length > 0 && channels.some((item) => !validMulti.includes(item))) {
    res.status(400).json({ error: 'channels must only include line, telegram, email, or whatsapp.' });
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
      channels,
      text,
    });

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Message dispatch failed.';
    res.status(400).json({ error: message });
  }
});
