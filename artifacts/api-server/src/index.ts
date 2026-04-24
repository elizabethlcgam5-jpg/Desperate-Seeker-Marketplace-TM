import { runMigrations } from "stripe-replit-sync";
import { getStripeSync } from "./stripeClient";
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

/**
 * Initialise Stripe schema, webhooks, and backfill on startup.
 * Runs in the background — never blocks server startup.
 */
async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logger.warn("DATABASE_URL missing — skipping Stripe init");
    return;
  }

  try {
    logger.info("Initialising Stripe schema...");
    await runMigrations({ databaseUrl, schema: "stripe" });
    logger.info("Stripe schema ready");
  } catch (err) {
    logger.error({ err }, "Stripe schema migration failed");
  }

  try {
    const stripeSync = await getStripeSync();
    const webhookBaseUrl = `https://${process.env.REPLIT_DOMAINS?.split(",")[0]}`;
    await stripeSync.findOrCreateManagedWebhook(
      `${webhookBaseUrl}/api/stripe/webhook`,
    );
    logger.info("Stripe webhook configured");
  } catch (err) {
    logger.warn({ err }, "Stripe webhook setup failed (will retry on next startup)");
  }

  try {
    const stripeSync = await getStripeSync();
    stripeSync
      .syncBackfill()
      .then(() => logger.info("Stripe backfill complete"))
      .catch((err: unknown) => logger.error({ err }, "Stripe backfill error"));
  } catch (err) {
    logger.warn({ err }, "Stripe backfill could not start");
  }
}

// Kick off Stripe init in the background — server starts regardless
initStripe().catch((err) => logger.error({ err }, "Unexpected Stripe init error"));

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});
