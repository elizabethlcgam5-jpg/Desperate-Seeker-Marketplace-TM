import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.desperatelyseeking.app",
  appName: "Desperately Seeking",
  webDir: "dist/public",
  server: {
    androidScheme: "https",
  },
  android: {
    allowMixedContent: true,
    backgroundColor: "#0B3954",
    webContentsDebuggingEnabled: false,
  },
};

export default config;
