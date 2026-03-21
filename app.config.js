const appJson = require('./app.json');

const expo = appJson.expo || {};
const extra = expo.extra || {};

module.exports = () => ({
  ...appJson,
  expo: {
    ...expo,
    extra: {
      ...extra,
      messengerServerBaseUrl: process.env.EXPO_PUBLIC_MESSENGER_SERVER_BASE_URL || '',
      messengerServerApiKey: process.env.EXPO_PUBLIC_MESSENGER_SERVER_API_KEY || '',
      lineOfficialAccountId: process.env.EXPO_PUBLIC_LINE_OFFICIAL_ACCOUNT_ID || '',
    },
  },
});
