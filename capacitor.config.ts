import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kathastories.lore',
  appName: 'Weev',
  // Placeholder shell — only shown if the live site can't load. The app actually
  // loads server.url below, so every web deploy is instantly live for installed
  // users (no APK re-distribution). Native plugins still work via the bridge.
  webDir: 'capacitor-shell',
  server: {
    url: 'https://lore-next-wine.vercel.app',
    androidScheme: 'https',
  },
};

export default config;
