import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Lock,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";

type EscrowState = "idle" | "pending" | "held" | "buyer_confirmed" | "error";
type BuyerSubView = "held" | "confirm" | "dispute" | "dispute_submitted";

const DISPUTE_OPTIONS = [
  "I never received the item",
  "The item doesn't match the description",
  "The item was damaged",
  "I was charged the wrong amount",
  "Other",
];

interface EscrowPanelProps {
  role: "buyer" | "seller";
  price: number;
  sellerName?: string;
  buyerName?: string;
  compact?: boolean;
}

export function EscrowPanel({ role, price, sellerName, buyerName, compact = false }: EscrowPanelProps) {
  const [escrowState, setEscrowState] = useState<EscrowState>("idle");
  const [buyerSubView, setBuyerSubView] = useState<BuyerSubView>("held");
  const [selectedDispute, setSelectedDispute] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handlePay = () => {
    setPayOpen(false);
    setEscrowState("pending");
    setTimeout(() => {
      setEscrowState("held");
      setBuyerSubView("held");
    }, 1400);
  };

  const handleConfirmReceipt = () => {
    setConfirming(true);
    setTimeout(() => {
      setConfirming(false);
      setEscrowState("buyer_confirmed");
    }, 1200);
  };

  const handleSubmitDispute = () => {
    if (!selectedDispute) return;
    setBuyerSubView("dispute_submitted");
  };

  /* ── Buyer view ── */
  const BuyerPanel = () => {
    if (escrowState === "idle") {
      return (
        <div className={`${compact ? "flex items-center gap-3" : "flex items-center justify-between gap-4 px-4 py-3 border-t bg-[#0B3954]/3"}`}>
          {!compact && (
            <div className="flex items-center gap-2 text-sm text-[#0B3954]/70">
              <Shield className="h-4 w-4 text-[#D4AF37] shrink-0" />
              <span>Ready to pay? Funds are held safely until you confirm you've received the item.</span>
            </div>
          )}
          <Button
            size={compact ? "sm" : "default"}
            className={`shrink-0 rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 gap-2 ${compact ? "text-xs px-4" : ""}`}
            onClick={() => setPayOpen(true)}
          >
            <CreditCard className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
            Pay in App
          </Button>
        </div>
      );
    }

    if (escrowState === "pending") {
      return (
        <div className="flex items-center gap-3 px-4 py-3 border-t bg-[#0B3954]/3 text-sm text-[#0B3954]/70">
          <Loader2 className="h-4 w-4 animate-spin text-[#D4AF37] shrink-0" />
          <span>Processing your payment…</span>
        </div>
      );
    }

    if (escrowState === "held") {
      // "held" state — show heading then sub-view
      if (buyerSubView === "held") {
        return (
          <div className="px-4 py-3 border-t bg-[#0B3954]/3 space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#D4AF37] shrink-0" />
              <span className="text-sm font-semibold text-[#0B3954]">Payment sent — your money is protected. 🔒</span>
            </div>
            <p className="text-xs text-[#0B3954]/60 pl-6">
              Your payment is being held securely until you confirm you've received your item. You're in control.
            </p>
            <div className="flex items-center justify-between pl-6">
              <Badge className="bg-[#D4AF37]/15 text-[#6b530f] border border-[#D4AF37]/50 text-xs">
                Payment Held in Escrow
              </Badge>
              <button
                className="text-xs text-[#0B3954] underline underline-offset-2 hover:text-[#D4AF37] transition-colors"
                onClick={() => setBuyerSubView("confirm")}
              >
                Confirm receipt →
              </button>
            </div>
            <p className="text-[10px] text-[#0B3954]/40 pl-6">
              Funds will be released to the seller once you confirm receipt.
            </p>
          </div>
        );
      }

      if (buyerSubView === "confirm") {
        return (
          <div className="px-4 py-3 border-t bg-[#0B3954]/3 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#D4AF37] shrink-0" />
              <span className="text-sm font-semibold text-[#0B3954]">Did everything go smoothly? ✅</span>
            </div>
            <p className="text-xs text-[#0B3954]/60 pl-6 leading-relaxed">
              Tap below to release payment to your seller and close this transaction. Only confirm if you've actually received your item.
            </p>
            <div className="flex gap-2 pl-6 pt-1">
              <Button
                size="sm"
                className="rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 gap-1.5 text-xs"
                onClick={handleConfirmReceipt}
                disabled={confirming}
              >
                {confirming ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                {confirming ? "Releasing…" : "Yes, Release Payment"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full border-destructive/40 text-destructive text-xs"
                onClick={() => setBuyerSubView("dispute")}
              >
                No, I Have a Problem
              </Button>
            </div>
          </div>
        );
      }

      if (buyerSubView === "dispute") {
        return (
          <div className="px-4 py-3 border-t bg-rose-50/60 space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span className="text-sm font-semibold text-rose-800">Tell us what happened.</span>
            </div>
            <p className="text-xs text-rose-700/70 pl-6 leading-relaxed">
              We're here to help. Describe the issue and our team will review the transaction.
            </p>
            <div className="pl-6 space-y-1.5 pt-1">
              {DISPUTE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedDispute(opt)}
                  className={`w-full text-left rounded-lg border px-3 py-2 text-xs transition-colors ${
                    selectedDispute === opt
                      ? "border-rose-400 bg-rose-100 text-rose-800 font-medium"
                      : "border-border/60 text-muted-foreground hover:border-rose-300"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pl-6 pt-1">
              <Button
                size="sm"
                className="rounded-full bg-rose-600 text-white hover:bg-rose-700 border-0 text-xs"
                onClick={handleSubmitDispute}
                disabled={!selectedDispute}
              >
                Submit Dispute
              </Button>
              <button
                className="text-xs text-muted-foreground hover:text-[#0B3954] transition-colors"
                onClick={() => setBuyerSubView("confirm")}
              >
                Go back
              </button>
            </div>
          </div>
        );
      }

      if (buyerSubView === "dispute_submitted") {
        return (
          <div className="px-4 py-3 border-t bg-amber-50/60 space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600 shrink-0" />
              <span className="text-sm font-semibold text-amber-800">Your dispute has been submitted.</span>
            </div>
            <p className="text-xs text-amber-700/70 pl-6 leading-relaxed">
              We'll follow up within 24 hours. Payment will remain on hold during the review.
            </p>
          </div>
        );
      }
    }

    if (escrowState === "buyer_confirmed") {
      return (
        <div className="flex items-center gap-3 px-4 py-3 border-t bg-emerald-50/60">
          <span className="text-lg leading-none" aria-hidden>🎉</span>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Payment released to seller!</p>
            <p className="text-xs text-emerald-700/70">This transaction is now complete.</p>
          </div>
          <Badge className="ml-auto shrink-0 bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-medium">
            Complete
          </Badge>
        </div>
      );
    }

    if (escrowState === "error") {
      return (
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t bg-rose-50/60">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-rose-800">Something went wrong with your payment.</p>
              <p className="text-xs text-rose-700/70">Please try again or contact support.</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 rounded-full border-rose-300 text-rose-700 hover:bg-rose-50 text-xs"
            onClick={() => setEscrowState("idle")}
          >
            Try again
          </Button>
        </div>
      );
    }

    return null;
  };

  /* ── Seller view ── */
  const SellerPanel = () => {
    if (escrowState === "idle") {
      return (
        <div className="flex items-center gap-3 px-4 py-3 border-t bg-[#0B3954]/3 text-sm text-[#0B3954]/60">
          <Clock className="h-4 w-4 text-[#D4AF37] shrink-0" />
          <span>Waiting for {buyerName ?? "the buyer"} to pay through the app.</span>
        </div>
      );
    }

    if (escrowState === "pending") {
      return (
        <div className="flex items-center gap-3 px-4 py-3 border-t bg-[#0B3954]/3 text-sm text-[#0B3954]/70">
          <Loader2 className="h-4 w-4 animate-spin text-[#D4AF37] shrink-0" />
          <span>Processing payment…</span>
        </div>
      );
    }

    if (escrowState === "held") {
      return (
        <div className="px-4 py-3 border-t bg-[#0B3954]/3 space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#D4AF37] shrink-0" />
            <span className="text-sm font-semibold text-[#0B3954]">Payment received — almost yours! ⏳</span>
          </div>
          <p className="text-xs text-[#0B3954]/60 pl-6 leading-relaxed">
            The buyer's payment is being held securely. Once they confirm receipt it'll be released straight to your account.
          </p>
          <div className="pl-6">
            <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-xs">
              Funds Pending Release
            </Badge>
          </div>
        </div>
      );
    }

    if (escrowState === "buyer_confirmed") {
      return (
        <div className="px-4 py-3 border-t bg-emerald-50/60 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none" aria-hidden>🎉</span>
            <span className="text-sm font-semibold text-emerald-800">You've been paid!</span>
          </div>
          <p className="text-xs text-emerald-700/70 pl-7 leading-relaxed">
            The funds from this transaction have been released to your account. Payments typically appear within 1–3 business days.
          </p>
          <Badge className="ml-7 bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-medium">
            💸 Payout Sent
          </Badge>
        </div>
      );
    }

    if (escrowState === "error") {
      return (
        <div className="flex items-center gap-3 px-4 py-3 border-t bg-rose-50/60 text-sm">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span className="text-rose-800">There was a payment issue. Support has been notified.</span>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {role === "buyer" ? <BuyerPanel /> : <SellerPanel />}

      {/* Payment modal */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden rounded-2xl">
          <div className="bg-[#0B3954] px-7 py-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-[#D4AF37]" />
              <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 text-xs">
                Protected Payment
              </Badge>
            </div>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-white text-left leading-snug">
                Complete Your Purchase
              </DialogTitle>
              <DialogDescription className="text-white/65 text-left mt-1 text-sm leading-relaxed">
                Your payment is protected. Funds are only released to the seller once you confirm you've received your item.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-7 py-5 space-y-4">
            {price > 0 && (
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Item price</span>
                  <span className="font-medium">${price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform fee (5%)</span>
                  <span className="font-medium">${(price * 0.05).toFixed(2)}</span>
                </div>
                <div className="border-t border-border/60 pt-2 flex justify-between font-semibold text-base">
                  <span className="text-[#0B3954]">Total</span>
                  <span className="text-[#0B3954]">${(price * 1.05).toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {[
                { icon: Lock, text: "Payment held safely until you confirm receipt" },
                { icon: Shield, text: "Dispute protection if the item doesn't arrive" },
                { icon: CreditCard, text: "Secured by Stripe — bank-level encryption" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            <Button
              className="w-full rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 h-11 gap-2"
              onClick={handlePay}
            >
              <Lock className="h-4 w-4" />
              {price > 0 ? `Pay $${(price * 1.05).toFixed(2)} Securely` : "Pay Securely"}
            </Button>

            <p className="text-center text-[10px] text-muted-foreground">
              Funds released only after you confirm receipt.{" "}
              <Link href="/help/safety-payments" className="underline hover:text-[#0B3954]">
                How does this work?
              </Link>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
