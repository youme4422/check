import nodemailer from 'nodemailer';

import { env } from '../config/env.js';

let transporter = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (!env.smtpHost || !env.smtpUser || !env.smtpPass || !env.smtpFrom) {
    throw new Error('SMTP settings are missing.');
  }

  transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });

  return transporter;
}

async function sendWithResend({ to, text }) {
  if (!env.resendApiKey || !env.resendFromEmail) {
    throw new Error('RESEND_API_KEY or RESEND_FROM_EMAIL is missing.');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.resendFromEmail,
      to: [to],
      subject: 'TaeB missed check-in alert',
      text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend send failed: ${detail || response.status}`);
  }
}

export async function sendEmailMessage({ to, text }) {
  if (env.resendApiKey && env.resendFromEmail) {
    await sendWithResend({ to, text });
    return { channel: 'email' };
  }

  const client = getTransporter();
  await client.sendMail({
    from: env.smtpFrom,
    to,
    subject: 'TaeB missed check-in alert',
    text,
  });

  return { channel: 'email' };
}
