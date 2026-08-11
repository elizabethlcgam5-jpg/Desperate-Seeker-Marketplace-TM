import express, { type Express, type ErrorRequestHandler } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { WebhookHandlers } from "./webhookHandlers";
import router from "./routes";
import { logger } from "./lib/logger";

const appUrl = process.env.APP_URL;

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// ── CRITICAL: Register Stripe webhook BEFORE express.json() ──────────────────
// The webhook handler needs the raw Buffer body, not parsed JSON.
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      return res.status(400).json({ error: "Missing stripe-signature header" });
    }

    const sig = Array.isArray(signature) ? signature[0] : signature;

    try {
      await WebhookHandlers.processWebhook(req.body as Buffer, sig);
      return res.status(200).json({ received: true });
    } catch (err: any) {
      logger.error({ err }, "Stripe webhook error");
      return res.status(400).json({ error: "Webhook processing failed" });
    }
  },
);

// ── Apply remaining middleware ───────────────────────────────────────────────
app.use(appUrl ? cors({ origin: appUrl, credentials: true }) : cors());
app.use(cookieParser());
// 15mb covers the client's 10MB photo guard once base64-encoded (~1.37x).
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

app.use("/api", router);

// Unmatched /api routes return JSON (not Express's default HTML 404), keeping the
// "every API response is JSON" guarantee consistent for clients.
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "not_found", message: "That endpoint does not exist." });
});

// ── JSON error handler ───────────────────────────────────────────────────────
// MUST be last. Guarantees every API error returns JSON, never Express's default
// HTML page. A non-JSON error body makes the browser throw a cryptic
// "The string did not match the expected pattern." SyntaxError when the client
// calls res.json() (Safari/WebKit) — masking the real cause.
const jsonErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  req.log?.error({ err }, "Unhandled API error");

  if (err?.name === "ZodError") {
    res.status(400).json({
      error: "validation_error",
      message: "Some fields are missing or invalid. Please check the form and try again.",
      details: err.issues,
    });
    return;
  }

  if (err?.type === "entity.too.large" || err?.status === 413) {
    res.status(413).json({
      error: "payload_too_large",
      message: "That photo is too large. Please use an image under 10MB.",
    });
    return;
  }

  const status = typeof err?.status === "number" ? err.status : 500;
  res.status(status).json({
    error: "server_error",
    message: "Something went wrong on our end. Please try again.",
  });
};

app.use(jsonErrorHandler);

export default app;
