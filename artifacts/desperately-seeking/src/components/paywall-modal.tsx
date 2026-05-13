import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, X } from "lucide-react";
import { Link } from "wouter";
import { getApiUrl } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: string;
}

const MONTHLY_FEATURES = [
  "Unlimited responses",
  "Unlimited messaging",
  "Automatic Match Alerts",
  "Priority matching",
  "Verified Seller badge",
  "5% platform fee on successful sales",
  "No shipping fees, ever",
];

const ANNUAL_FEATURES = [
  "Everything in Premium",
  "Best value for frequent sellers",
  "Priority support",
  "Early access to new features",
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
              {reason ?? "Upgrade to respond to buyers"}
            </DialogTitle>
            <DialogDescription className="text-white/65 text-left mt-1">
              Free sellers can post items and view requests, but responding and messaging require a Premium subscription.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Plans */}
        <div className="p-6 grid sm:grid-cols-2 gap-4">
          {/* Monthly */}
          <div className="rounded-2xl border border-[#D4AF37] bg-[#0B3954] p-5 text-white relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-[#D4AF37] text-[#0B3954] font-bold text-xs shadow-sm">
                Most Popular
              </Badge>
            </div>
            <div className="flex items-center gap-2 mb-1 mt-1">
              <Sparkles className="h-4 w-4 text-[#D4AF37]" />
              <p className="font-semibold font-serif">Premium</p>
            </div>
            <p className="font-serif text-3xl font-bold text-[#D4AF37] mb-1">$1.99</p>
            <p className="text-white/60 text-xs mb-4">per month</p>
            <ul className="space-y-1.5 mb-5">
              {MONTHLY_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-1.5 text-xs text-white/80">
                  <Check className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#D4AF37]" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 rounded-full"
              onClick={() => handleCheckout("seller_basic")}
              disabled={!!loading}
            >
              {loading === "monthly" ? "Redirecting…" : "Get Premium"}
            </Button>
            <p className="text-center text-[10px] text-white/50 mt-2">Cancel anytime. No questions asked.</p>
          </div>

          {/* Annual */}
          <div className="rounded-2xl border border-border bg-white p-5 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-emerald-600 text-white font-bold text-xs shadow-sm">
                Best Value
              </Badge>
            </div>
            <div className="flex items-center gap-2 mb-1 mt-1">
              <Crown className="h-4 w-4 text-emerald-600" />
              <p className="font-semibold font-serif text-[#0B3954]">Premium Yearly</p>
            </div>
            <p className="font-serif text-3xl font-bold text-[#0B3954] mb-1">$29.99</p>
            <p className="text-muted-foreground text-xs mb-4">per year · save 60%</p>
            <ul className="space-y-1.5 mb-5">
              {ANNUAL_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-1.5 text-xs text-foreground/70">
                  <Check className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-600" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full bg-[#0B3954] text-white hover:bg-[#0B3954]/90 border-0 rounded-full"
              onClick={() => handleCheckout("seller_annual")}
              disabled={!!loading}
            >
              {loading === "annual" ? "Redirecting…" : "Get Premium Yearly"}
            </Button>
            <p className="text-center text-[10px] text-muted-foreground mt-2">Cancel anytime. No questions asked.</p>
          </div>
        </div>

        {/* Free tier reminder */}
        <div className="px-6 pb-5">
          <div className="rounded-xl bg-muted/50 p-3 flex items-start justify-between gap-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <X className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                <strong className="text-foreground">Free plan:</strong>{" "}
                Post items, view requests, browse marketplace. Cannot respond or message buyers.
              </span>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Payments secured by Stripe. Cancel anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
