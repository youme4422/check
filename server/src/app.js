import express from 'express';

import { env } from './config/env.js';
import { messagesRouter } from './routes/messages.js';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', messagesRouter);

app.listen(env.port, () => {
  console.log(`Check messenger server listening on http://localhost:${env.port}`);
});
