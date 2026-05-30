import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { withCurrentUser, requireCurrentUser } from "../lib/session";
import {
  isTwilioConfigured,
  sendVerification,
  checkVerification,
  lookupLineType,
} from "../lib/twilioVerify";

const router: IRouter = Router();

// Per-user cooldown between SMS sends to limit Twilio cost abuse once activated.
const SEND_COOLDOWN_MS = 30_000;
const lastSendByUser = new Map<string, number>();

function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim();
  // Accept E.164 (+15551234567). Allow a bare 10-digit US number → prefix +1.
  if (/^\+[1-9]\d{6,14}$/.test(trimmed)) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

// Current phone-verification status for the logged-in user.
router.get("/auth/phone-status", withCurrentUser, async (req, res) => {
  const userId = req.currentUserId!;
  const [user] = await db
    .select({
      phoneNumber: usersTable.phoneNumber,
      phoneVerified: usersTable.phoneVerified,
    })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  res.json({
    phoneNumber: user?.phoneNumber ?? null,
    phoneVerified: user?.phoneVerified ?? false,
    verificationConfigured: isTwilioConfigured(),
  });
});

// Send an SMS verification code to the provided phone number.
router.post("/auth/send-phone-code", requireCurrentUser, async (req, res) => {
  const userId = req.currentUserId!;
  const { phoneNumber } = (req.body ?? {}) as { phoneNumber?: string };

  if (!phoneNumber) {
    res.status(400).json({ error: "Phone number is required." });
    return;
  }

  const normalized = normalizePhone(phoneNumber);
  if (!normalized) {
    res.status(400).json({ error: "Please enter a valid phone number." });
    return;
  }

  if (!isTwilioConfigured()) {
    res.status(503).json({
      error: "verification_unavailable",
      message: "SMS verification is not configured yet. Please try again later.",
    });
    return;
  }

  const last = lastSendByUser.get(userId);
  if (last && Date.now() - last < SEND_COOLDOWN_MS) {
    const retryAfter = Math.ceil((SEND_COOLDOWN_MS - (Date.now() - last)) / 1000);
    res.status(429).json({
      error: "too_many_requests",
      message: `Please wait ${retryAfter}s before requesting another code.`,
    });
    return;
  }

  // Only allow real mobile numbers — block VoIP / landline via Twilio Lookup.
  const lineType = await lookupLineType(normalized);
  if (!lineType.allowed) {
    res.status(400).json({
      error: "unsupported_number",
      message:
        lineType.error === "invalid_number"
          ? "That doesn't look like a valid phone number."
          : "Please use a real mobile number. VoIP and landline numbers aren't accepted.",
    });
    return;
  }

  lastSendByUser.set(userId, Date.now());

  const result = await sendVerification(normalized);
  if (!result.success) {
    res.status(502).json({ error: result.error ?? "Failed to send code." });
    return;
  }

  // Store the (still-unverified) phone number so verify-phone can match it.
  await db
    .update(usersTable)
    .set({ phoneNumber: normalized, phoneVerified: false })
    .where(eq(usersTable.id, userId));

  res.json({ sent: true, phoneNumber: normalized });
});

// Check the SMS code and mark the user's phone as verified.
router.post("/auth/verify-phone", requireCurrentUser, async (req, res) => {
  const userId = req.currentUserId!;
  const { phoneNumber, code } = (req.body ?? {}) as {
    phoneNumber?: string;
    code?: string;
  };

  if (!phoneNumber || !code) {
    res.status(400).json({ error: "Phone number and code are required." });
    return;
  }

  const normalized = normalizePhone(phoneNumber);
  if (!normalized) {
    res.status(400).json({ error: "Please enter a valid phone number." });
    return;
  }

  if (!isTwilioConfigured()) {
    res.status(503).json({
      error: "verification_unavailable",
      message: "SMS verification is not configured yet. Please try again later.",
    });
    return;
  }

  const result = await checkVerification(normalized, code.trim());
  if (result.error) {
    res.status(502).json({ error: result.error });
    return;
  }
  if (!result.approved) {
    res.status(400).json({ error: "invalid_code", message: "That code is incorrect or expired." });
    return;
  }

  await db
    .update(usersTable)
    .set({ phoneNumber: normalized, phoneVerified: true })
    .where(eq(usersTable.id, userId));

  res.json({ verified: true, phoneNumber: normalized });
});

export default router;
