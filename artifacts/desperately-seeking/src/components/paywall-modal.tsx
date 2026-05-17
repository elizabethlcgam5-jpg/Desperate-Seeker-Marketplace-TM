import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, X } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: string;
}

const MONTHLY_FEATURES = [
  "Unlimited listings",
  "Message buyers and sellers",
  "Safe in-app payments",
  "Cancel anytime",
];

const ANNUAL_FEATURES = [
  "Everything in Monthly",
  "One simple payment for the whole year",
  "Our lowest price for unlimited posting",
];

export function PaywallModal({ open, onOpenChange, reason }: PaywallModalProps) {
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null);

  const handleCheckout = async (tier: "seller_basic" | "seller_annual") => {
    const key = tier === "seller_basic" ? "monthly" : "annual";
    setLoading(key);
    try {
      const res = await fetch(getApiUrl("stripe/checkout"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Checkout failed");
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't start checkout. Try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden rounded-2xl">
        {/* Header band */}
        <div className="bg-[#0B3954] px-8 py-7 text-white">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-[#D4AF37]" />
              <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 text-xs">
                Premium Feature
              </Badge>
            </div>
            <DialogTitle className="font-serif text-2xl text-white text-left">
              {reason ?? "Pick the plan that works for you."}
            </DialogTitle>
            <DialogDescription className="text-white/65 text-left mt-1">
              Sell more, stress less — upgrade anytime.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Plans */}
        <div className="p-6 grid sm:grid-cols-2 gap-4">

          {/* Monthly */}
          <div className="rounded-2xl border border-[#e0e0e0] bg-white p-5 flex flex-col">
            <p className="font-semibold font-serif text-[#0B3954] mb-1">Monthly</p>
            <p className="font-serif text-3xl font-bold text-[#0B3954] mb-0.5">$1.99</p>
            <p className="text-muted-foreground text-xs mb-4">per month · Great for getting started.</p>
            <ul className="space-y-1.5 mb-5 flex-1">
              {MONTHLY_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-1.5 text-xs text-foreground/70">
                  <Check className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#D4AF37]" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full bg-[#0B3954] text-white font-semibold hover:bg-[#0B3954]/90 border-0 rounded-full"
              onClick={() => handleCheckout("seller_basic")}
              disabled={!!loading}
            >
              {loading === "monthly" ? "Redirecting…" : "Start Monthly Plan"}
            </Button>
            <p className="text-center text-[10px] text-muted-foreground mt-2">Cancel anytime. No questions asked.</p>
          </div>

          {/* Annual — Featured */}
          <div className="rounded-2xl border border-[#D4AF37] bg-[#0B3954] p-5 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-[#D4AF37] text-[#0B3954] font-bold text-xs shadow-sm whitespace-nowrap">
                Best Value – Save 37%
              </Badge>
            </div>
            <p className="font-semibold font-serif text-white mb-1 mt-2">Yearly</p>
            <p className="font-serif text-3xl font-bold text-[#D4AF37] mb-0.5">$14.99</p>
            <p className="text-white/55 text-xs mb-4">per year · Our best deal.</p>
            <ul className="space-y-1.5 mb-5 flex-1">
              {ANNUAL_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-1.5 text-xs text-white/80">
                  <Check className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#D4AF37]" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 rounded-full"
              onClick={() => handleCheckout("seller_annual")}
              disabled={!!loading}
            >
              {loading === "annual" ? "Redirecting…" : "Start Yearly Plan – Best Value"}
            </Button>
            <p className="text-center text-[10px] text-white/50 mt-2">Cancel anytime. No questions asked.</p>
          </div>
        </div>

        {/* Free tier reminder */}
        <div className="px-6 pb-5">
          <div className="rounded-xl bg-muted/50 p-3 flex items-start gap-3 text-sm text-muted-foreground">
            <X className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              <strong className="text-foreground">Free plan:</strong>{" "}
              Browse the marketplace, post items, and respond to up to 2 buyers — no subscription needed.
            </span>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Payments secured by Stripe. Cancel anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
