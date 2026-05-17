import { Link } from "wouter";
import { Sparkles, Zap, BarChart2, MessageSquare, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

type NudgeVariant =
  | "listing_limit"
  | "response_limit"
  | "messaging"
  | "analytics"
  | "feature";

interface UpgradeNudgeProps {
  variant: NudgeVariant;
  className?: string;
}

const NUDGES: Record<
  NudgeVariant,
  { icon: React.ElementType; headline: string; body: string; cta: string }
> = {
  listing_limit: {
    icon: Package,
    headline: "You've used both free listings.",
    body: "Upgrade to keep selling — unlimited listings for just $1.99/month.",
    cta: "Upgrade to keep selling",
  },
  response_limit: {
    icon: Zap,
    headline: "You've used your 2 free responses.",
    body: "Upgrade to reply to every buyer request. Sellers who upgrade get matched faster.",
    cta: "Unlock unlimited responses",
  },
  messaging: {
    icon: MessageSquare,
    headline: "Messaging buyers requires a subscription.",
    body: "Upgrade to send and receive messages directly with buyers — $1.99/month.",
    cta: "Start messaging buyers",
  },
  analytics: {
    icon: BarChart2,
    headline: "See how your listings are performing.",
    body: "View buyer interest, acceptance rates, and top categories. Available on Premium.",
    cta: "Upgrade to see analytics",
  },
  feature: {
    icon: Sparkles,
    headline: "This feature is available to Premium sellers.",
    body: "Upgrade anytime for unlimited posting and a smoother selling experience.",
    cta: "See plans",
  },
};

export function UpgradeNudge({ variant, className = "" }: UpgradeNudgeProps) {
  const nudge = NUDGES[variant];
  const Icon = nudge.icon;

  return (
    <div
      className={`rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#0B3954] to-[#0d4a6b] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm ${className}`}
    >
      <div className="shrink-0 w-10 h-10 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center">
        <Icon className="h-5 w-5 text-[#D4AF37]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm">{nudge.headline}</p>
        <p className="text-white/65 text-xs mt-0.5 leading-relaxed">{nudge.body}</p>
      </div>
      <Link href="/pricing" className="shrink-0">
        <Button
          size="sm"
          className="rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 whitespace-nowrap text-xs px-4"
        >
          {nudge.cta}
        </Button>
      </Link>
    </div>
  );
}
