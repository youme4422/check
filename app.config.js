const appJson = require('./app.json');

module.exports = ({ config }) => {
  const base = config?.expo ?? appJson.expo;
  const nextExtra = {
    ...(base.extra || {}),
    messengerServerBaseUrl: String(process.env.EXPO_PUBLIC_MESSENGER_SERVER_BASE_URL || '').trim(),
    messengerServerApiKey: String(process.env.EXPO_PUBLIC_MESSENGER_SERVER_API_KEY || '').trim(),
  };

  return {
    ...base,
    extra: nextExtra,
  };
};
