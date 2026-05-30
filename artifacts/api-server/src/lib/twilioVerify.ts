const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

const BASE_URL = "https://verify.twilio.com/v2";

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
