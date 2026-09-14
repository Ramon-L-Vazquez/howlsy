import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Allow Howlsy's development client to load Next.js development
   * resources when testing the application from another device on the
   * same local network.
   *
   * Without this entry, Next.js blocks development resources requested
   * through the computer's LAN address. The HTML can still render on a
   * phone, but React cannot fully hydrate, leaving interactive controls
   * such as buttons disabled or unresponsive.
   *
   * This setting affects the development environment only. Production
   * deployments will use their normal application origin.
   */
  allowedDevOrigins: ["192.168.1.127"],
};

export default nextConfig;