module.exports = ({ config }) => ({
  ...config,
  plugins: Array.from(new Set([...(config.plugins || []), 'expo-font', 'expo-image'])),
  extra: {
    ...(config.extra || {}),
    messengerServerBaseUrl:
      process.env.EXPO_PUBLIC_MESSENGER_SERVER_BASE_URL || config.extra?.messengerServerBaseUrl || '',
    lineOfficialAccountId:
      process.env.EXPO_PUBLIC_LINE_OFFICIAL_ACCOUNT_ID || config.extra?.lineOfficialAccountId || '',
    telegramBotUsername:
      process.env.EXPO_PUBLIC_TELEGRAM_BOT_USERNAME || config.extra?.telegramBotUsername || '',
  },
});
