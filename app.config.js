const appJson = require('./app.json');
const fs = require('fs');
const os = require('os');
const path = require('path');

function findLocalIpv4() {
  const nets = os.networkInterfaces();
  for (const list of Object.values(nets)) {
    if (!Array.isArray(list)) continue;
    for (const addr of list) {
      if (addr && addr.family === 'IPv4' && !addr.internal) {
        return addr.address;
      }
    }
  }
  return '';
}

function readServerApiKeyFromDotEnv() {
  try {
    const envPath = path.join(__dirname, 'server', '.env');
    const raw = fs.readFileSync(envPath, 'utf8');
    const line = raw.split(/\r?\n/).find((v) => v.startsWith('SERVER_API_KEY='));
    if (!line) return '';
    return String(line.slice('SERVER_API_KEY='.length)).trim();
  } catch {
    return '';
  }
}

module.exports = ({ config }) => {
  const base = config?.expo ?? appJson.expo;
  const isEasBuild = Boolean(process.env.EAS_BUILD);
  const lifecycle = String(process.env.npm_lifecycle_event || '').toLowerCase();
  const argv = process.argv.join(' ').toLowerCase();
  const isExpoStart = lifecycle.includes('start') || argv.includes(' expo ') && argv.includes(' start');
  const isProductionLikeBuild = !isExpoStart;
  const explicitBaseUrl = String(
    process.env.EXPO_PUBLIC_MESSENGER_SERVER_BASE_URL || process.env.MESSENGER_SERVER_BASE_URL || ''
  ).trim();
  const explicitApiKey = String(
    process.env.EXPO_PUBLIC_MESSENGER_SERVER_API_KEY || process.env.MESSENGER_SERVER_API_KEY || ''
  ).trim();

  let fallbackBaseUrl = '';
  let fallbackApiKey = '';

  // Local Expo Go convenience: auto-wire to local backend if explicit env vars are not set.
  if (!isEasBuild && isExpoStart && (!explicitBaseUrl || !explicitApiKey)) {
    const ip = findLocalIpv4();
    if (ip) {
      fallbackBaseUrl = `http://${ip}:4000`;
    }
    fallbackApiKey = readServerApiKeyFromDotEnv();
  }

  const resolvedBaseUrl = explicitBaseUrl || fallbackBaseUrl;
  const resolvedApiKey = explicitApiKey || fallbackApiKey;

  // Guardrail for Play/EAS/local release builds: do not ship without server config.
  if (isProductionLikeBuild) {
    if (!resolvedBaseUrl || !resolvedApiKey) {
      throw new Error(
        'Missing production messenger config. Set EXPO_PUBLIC_MESSENGER_SERVER_BASE_URL and EXPO_PUBLIC_MESSENGER_SERVER_API_KEY before building.'
      );
    }
    if (!/^https:\/\//i.test(resolvedBaseUrl)) {
      throw new Error('EXPO_PUBLIC_MESSENGER_SERVER_BASE_URL must use https:// for production builds.');
    }
  }

  const nextExtra = {
    ...(base.extra || {}),
    messengerServerBaseUrl: resolvedBaseUrl,
    messengerServerApiKey: resolvedApiKey,
  };

  return {
    ...base,
    extra: nextExtra,
  };
};
