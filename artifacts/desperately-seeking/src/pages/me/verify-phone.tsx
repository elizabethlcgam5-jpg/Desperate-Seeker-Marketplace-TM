import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Phone, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";

const RESEND_SECONDS = 30;
const CODE_LENGTH = 6;

type Step = "phone" | "code" | "success";

export default function VerifyPhone() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [resendIn, setResendIn] = useState(0);
  const [expired, setExpired] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(getApiUrl("auth/phone-status"), {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        setConfigured(Boolean(data.verificationConfigured));
        if (data.phoneVerified) setStep("success");
        if (data.phoneNumber) setPhone(data.phoneNumber);
      } catch {
        // ignore — page still usable
      }
    })();
  }, []);

  // Resend countdown — text updates every second, re-enables at 0.
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const code = digits.join("");

  const focusInput = useCallback((i: number) => {
    inputsRef.current[i]?.focus();
    inputsRef.current[i]?.select();
  }, []);

  function handleDigitChange(index: number, raw: string) {
    const value = raw.replace(/\D/g, "");
    setExpired(false);
    if (value.length > 1) {
      // Paste / multi-char: distribute across boxes from this index.
      const next = [...digits];
      const chars = value.slice(0, CODE_LENGTH - index).split("");
      chars.forEach((c, k) => {
        next[index + k] = c;
      });
      setDigits(next);
      const lastFilled = Math.min(index + chars.length, CODE_LENGTH - 1);
      focusInput(lastFilled);
      return;
    }
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < CODE_LENGTH - 1) focusInput(index + 1);
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1);
    }
  }

  async function sendCode(isResend = false) {
    if (!phone.trim()) {
      toast.error("Please enter your mobile number.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(getApiUrl("auth/send-phone-code"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "verification_unavailable") {
          setConfigured(false);
          toast.error("SMS verification isn't available yet. Please check back soon.");
          return;
        }
        if (data.error === "unsupported_number") {
          toast.error(data.message ?? "Please use a real mobile number.");
          return;
        }
        if (data.error === "too_many_requests") {
          toast.error(data.message ?? "Please wait before requesting another code.");
          return;
        }
        throw new Error(data.message ?? data.error ?? "Couldn't send the code.");
      }
      if (data.phoneNumber) setPhone(data.phoneNumber);
      setDigits(Array(CODE_LENGTH).fill(""));
      setExpired(false);
      setStep("code");
      setResendIn(RESEND_SECONDS);
      toast.success(
        isResend ? "A new code is on its way." : "Verification code sent! Check your texts.",
      );
      setTimeout(() => focusInput(0), 50);
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't send the code. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    if (code.length < CODE_LENGTH) {
      toast.error("Please enter the full 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(getApiUrl("auth/verify-phone"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "invalid_code") {
          setExpired(true);
          setDigits(Array(CODE_LENGTH).fill(""));
          focusInput(0);
          return;
        }
        throw new Error(data.message ?? data.error ?? "Couldn't verify the code.");
      }
      qc.invalidateQueries();
      setStep("success");
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't verify the code. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-2xl bg-white p-8 shadow-xl shadow-[#0B3954]/10">
          {step === "success" ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-[#0B3954]">
                Phone Number Verified
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Your phone number has been successfully verified. You can now post
                items for sale on Desperately Seeking™.
              </p>
              <Button
                className="mt-6 w-full bg-[#0B3954] font-bold text-white hover:bg-[#0B3954]/90"
                onClick={() => navigate("/listings/new")}
              >
                Continue
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0B3954]/8">
                  <ShieldCheck className="h-7 w-7 text-[#D4AF37]" />
                </div>
                <h1 className="font-serif text-2xl font-bold text-[#0B3954]">
                  {step === "phone" ? "Verify Your Phone Number" : "Enter Verification Code"}
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  {step === "phone"
                    ? "We're sending a verification code to your mobile number. Message and data rates may apply."
                    : "We sent a 6-digit code to your phone number. Enter it below to continue."}
                </p>
              </div>

              {!configured && (
                <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  SMS verification isn't switched on yet. Please check back soon.
                </div>
              )}

              {step === "phone" ? (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#0B3954]">
                      Mobile number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="tel"
                        inputMode="tel"
                        placeholder="(555) 123-4567"
                        className="pl-9"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendCode()}
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full bg-[#0B3954] font-bold text-white hover:bg-[#0B3954]/90"
                    onClick={() => sendCode()}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Code"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div
                    className="flex justify-center gap-2"
                    onPaste={(e) => {
                      const text = e.clipboardData.getData("text");
                      if (/\d/.test(text)) {
                        e.preventDefault();
                        handleDigitChange(0, text);
                      }
                    }}
                  >
                    {digits.map((d, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          inputsRef.current[i] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onFocus={(e) => e.target.select()}
                        className="h-14 w-12 rounded-xl border border-slate-200 bg-white text-center text-2xl font-bold text-[#0B3954] outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
                      />
                    ))}
                  </div>

                  {expired && (
                    <p className="text-center text-sm font-medium text-red-600">
                      This code has expired. Tap "Resend Code" to get a new one.
                    </p>
                  )}

                  <Button
                    className="w-full bg-[#0B3954] font-bold text-white hover:bg-[#0B3954]/90"
                    onClick={verifyCode}
                    disabled={loading || code.length < CODE_LENGTH}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full text-[#0B3954] hover:bg-[#0B3954]/5"
                    onClick={() => sendCode(true)}
                    disabled={loading || resendIn > 0}
                  >
                    {resendIn > 0 ? `Resend Code (${resendIn}s)` : "Resend Code"}
                  </Button>

                  <button
                    type="button"
                    className="w-full text-center text-sm text-slate-500 hover:text-[#0B3954]"
                    onClick={() => {
                      setStep("phone");
                      setExpired(false);
                    }}
                  >
                    Use a different number
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
