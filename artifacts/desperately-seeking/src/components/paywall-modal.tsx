import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: string;
}

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
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="bg-[#0B3954] px-8 py-7 text-white">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-white text-left leading-snug mb-1">
              {reason ?? "You've reached your free listing limit."}
            </DialogTitle>
            <DialogDescription className="text-white/70 text-left text-sm leading-relaxed">
              Upgrade to keep selling without limits.
            </DialogDescription>
          </DialogHeader>
          <p className="text-white/55 text-xs mt-3 leading-relaxed">
            Subscribers can list as many items as they want — plus get a Seller badge, priority support, and more.
          </p>
        </div>

        {/* Plans */}
        <div className="p-6 space-y-3">
          {/* Monthly */}
          <div className="rounded-2xl border border-border/60 bg-white p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-[#0B3954]">Monthly</p>
              <p className="text-2xl font-serif font-bold text-[#0B3954]">$1.99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
            </div>
            <Button
              className="shrink-0 rounded-full bg-[#0B3954] text-white hover:bg-[#0B3954]/90 border-0 text-sm px-5"
              onClick={() => handleCheckout("seller_basic")}
              disabled={!!loading}
            >
              {loading === "monthly" ? "Redirecting…" : "Start for $1.99/month"}
            </Button>
          </div>

          {/* Yearly — featured */}
          <div className="rounded-2xl border-2 border-[#D4AF37] bg-[#0B3954] p-5 relative">
            <div className="absolute -top-3 left-4">
              <Badge className="bg-[#D4AF37] text-[#0B3954] font-bold text-xs shadow-sm">
                Best Value – Save 37% 🎉
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-4 mt-1">
              <div>
                <p className="font-semibold text-white">Yearly</p>
                <p className="text-2xl font-serif font-bold text-[#D4AF37]">$14.99<span className="text-sm font-normal text-white/55">/year</span></p>
              </div>
              <Button
                className="shrink-0 rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 text-sm px-5"
                onClick={() => handleCheckout("seller_annual")}
                disabled={!!loading}
              >
                {loading === "annual" ? "Redirecting…" : "Get the Best Deal – $14.99/year"}
              </Button>
            </div>
          </div>

          {/* What's included */}
          <ul className="px-1 space-y-1.5 pt-1">
            {[
              "Unlimited item listings",
              "Seller badge on your profile",
              "Priority support",
              "Exclusive seller features",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 space-y-3 text-center">
          <p className="text-[11px] text-muted-foreground">
            Cancel anytime. Billed through your app store.
          </p>
          <div className="flex items-center justify-center gap-6">
            <button
              className="text-xs text-muted-foreground hover:text-[#0B3954] transition-colors underline underline-offset-2"
              onClick={() => onOpenChange(false)}
            >
              Maybe Later
            </button>
            <button
              className="text-xs text-muted-foreground hover:text-[#0B3954] transition-colors underline underline-offset-2"
              onClick={() => toast.info("Contact support to restore a previous purchase.")}
            >
              Restore Purchase
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
