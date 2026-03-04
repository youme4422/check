export type MessengerChannel = 'line' | 'telegram' | 'both';

export type MessengerLinksPayload = {
  userId: string;
  lineUserId: string;
  telegramChatId: string;
};

export type SendMessagePayload = {
  userId: string;
  channel: MessengerChannel;
  text: string;
};

export type SendMessageResponse = {
  status: 'sent';
  deliveredChannels: MessengerChannel[];
};
