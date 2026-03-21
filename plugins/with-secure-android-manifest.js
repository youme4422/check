const { withAndroidManifest } = require('expo/config-plugins');

function withSecureAndroidManifest(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults?.manifest;
    const app = manifest?.application?.[0];

    if (app && app.$) {
      app.$['android:allowBackup'] = 'false';
      app.$['android:fullBackupContent'] = 'false';
    }

    return config;
  });
}

module.exports = withSecureAndroidManifest;
