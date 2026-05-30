import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Phone, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";

export default function VerifyPhone() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(getApiUrl("auth/phone-status"), {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        setConfigured(Boolean(data.verificationConfigured));
        if (data.phoneVerified) setAlreadyVerified(true);
        if (data.phoneNumber) setPhone(data.phoneNumber);
      } catch {
        // ignore — page still usable
      }
    })();
  }, []);

  async function sendCode() {
    if (!phone.trim()) {
      toast.error("Please enter your phone number.");
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
        throw new Error(data.error ?? "Couldn't send the code.");
      }
      if (data.phoneNumber) setPhone(data.phoneNumber);
      setStep("code");
      toast.success("Verification code sent! Check your texts.");
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't send the code. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    if (!code.trim()) {
      toast.error("Please enter the code you received.");
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
          toast.error("That code is incorrect or expired.");
          return;
        }
        throw new Error(data.error ?? "Couldn't verify the code.");
      }
      setAlreadyVerified(true);
      qc.invalidateQueries();
      toast.success("Phone verified! You can now post items.");
      setTimeout(() => navigate("/listings/new"), 1200);
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
          {alreadyVerified ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-[#0B3954]">
                Phone Verified
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Your phone number is verified. You're all set to post items.
              </p>
              <Button
                className="mt-6 w-full bg-[#0B3954] font-bold text-white hover:bg-[#0B3954]/90"
                onClick={() => navigate("/listings/new")}
              >
                Post an Item
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0B3954]/8">
                  <ShieldCheck className="h-7 w-7 text-[#D4AF37]" />
                </div>
                <h1 className="font-serif text-2xl font-bold text-[#0B3954]">
                  Verify Your Phone
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  We text a one-time code to confirm your number before you post
                  items. This keeps the marketplace trustworthy.
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
                      Phone number
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
                    onClick={sendCode}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Send Code"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#0B3954]">
                      Enter the 6-digit code sent to {phone}
                    </label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="123456"
                      maxLength={10}
                      className="text-center text-lg tracking-[0.3em]"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && verifyCode()}
                    />
                  </div>
                  <Button
                    className="w-full bg-[#0B3954] font-bold text-white hover:bg-[#0B3954]/90"
                    onClick={verifyCode}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Verify & Continue"
                    )}
                  </Button>
                  <button
                    type="button"
                    className="w-full text-center text-sm text-slate-500 hover:text-[#0B3954]"
                    onClick={() => setStep("phone")}
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
