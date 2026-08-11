function removeTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Public URL used for browser redirects and Stripe webhooks. */
export function getAppUrl(): string {
  const configuredUrl = process.env.APP_URL;
  if (configuredUrl) return removeTrailingSlash(configuredUrl);

  const replitDomain = process.env.REPLIT_DOMAINS?.split(",")[0];
  if (replitDomain) return `https://${replitDomain}`;

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  throw new Error("APP_URL must be set to the public frontend URL.");
}
