const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

const BASE_URL = "https://verify.twilio.com/v2";
const LOOKUP_URL = "https://lookups.twilio.com/v2";

export function isTwilioConfigured(): boolean {
  return Boolean(ACCOUNT_SID && AUTH_TOKEN && VERIFY_SERVICE_SID);
}

function authHeader(): string {
  const token = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64");
  return `Basic ${token}`;
}

async function postForm(
  path: string,
  params: Record<string, string>,
): Promise<{ ok: boolean; status: number; body: any }> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params).toString(),
  });
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { ok: res.ok, status: res.status, body };
}

// Twilio Lookup (Line Type Intelligence) — block VoIP / landline so only real
// mobile numbers can verify. Fails OPEN on Lookup errors so transient API
// issues never hard-block a legitimate user.
export async function lookupLineType(
  phoneNumber: string,
): Promise<{ allowed: boolean; type?: string; error?: string }> {
  try {
    const res = await fetch(
      `${LOOKUP_URL}/PhoneNumbers/${encodeURIComponent(
        phoneNumber,
      )}?Fields=line_type_intelligence`,
      { headers: { Authorization: authHeader() } },
    );
    if (!res.ok) {
      if (res.status === 404) {
        return { allowed: false, error: "invalid_number" };
      }
      // Unknown Lookup failure → fail open (don't block legitimate users).
      return { allowed: true };
    }
    const body: any = await res.json();
    const type: string | undefined = body?.line_type_intelligence?.type;
    if (!type) return { allowed: true };
    const blocked = new Set(["voip", "nonFixedVoip", "fixedVoip", "landline"]);
    return { allowed: !blocked.has(type), type };
  } catch {
    // Network error → fail open.
    return { allowed: true };
  }
}

export async function sendVerification(
  phoneNumber: string,
): Promise<{ success: boolean; error?: string }> {
  const result = await postForm(`/Services/${VERIFY_SERVICE_SID}/Verifications`, {
    To: phoneNumber,
    Channel: "sms",
  });
  if (!result.ok) {
    return {
      success: false,
      error: result.body?.message ?? "Failed to send verification code.",
    };
  }
  return { success: true };
}

export async function checkVerification(
  phoneNumber: string,
  code: string,
): Promise<{ approved: boolean; error?: string }> {
  const result = await postForm(`/Services/${VERIFY_SERVICE_SID}/VerificationCheck`, {
    To: phoneNumber,
    Code: code,
  });
  if (!result.ok) {
    return {
      approved: false,
      error: result.body?.message ?? "Could not verify the code.",
    };
  }
  return { approved: result.body?.status === "approved" };
}
