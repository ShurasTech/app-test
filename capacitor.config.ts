import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'tech.shuras.apptest',
  appName: 'app-test',
  // Capacitor bundles the built web assets (dist/) into the native project —
  // the same UI/logic from Epic 1 is reused as-is (NFR4), no duplication.
  webDir: 'dist',
};

export default config;
