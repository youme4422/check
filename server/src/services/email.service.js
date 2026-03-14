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

export async function sendEmailMessage({ to, text }) {
  const client = getTransporter();

  await client.sendMail({
    from: env.smtpFrom,
    to,
    subject: 'TaeB missed check-in alert',
    text,
  });

  return { channel: 'email' };
}
