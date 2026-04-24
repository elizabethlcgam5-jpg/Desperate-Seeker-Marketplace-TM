import { Badge } from "@/components/ui/badge";
import { Sparkles, BadgeCheck, Crown } from "lucide-react";

type Tier = "free" | "seller_basic" | "seller_pro" | "seller_annual";

export function TierBadge({
  tier,
  size = "sm",
}: {
  tier: Tier | null | undefined;
  size?: "sm" | "xs";
}) {
  if (!tier || tier === "free") return null;

  const config: Record<
    Exclude<Tier, "free">,
    { label: string; className: string; Icon: typeof Sparkles }
  > = {
    seller_basic: {
      label: "Verified",
      className:
        "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-50",
      Icon: BadgeCheck,
    },
    seller_pro: {
      label: "Pro Seller",
      className:
        "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-50",
      Icon: Sparkles,
    },
    seller_annual: {
      label: "Pro · Annual",
      className:
        "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-50",
      Icon: Crown,
    },
  };

  const c = config[tier];
  return (
    <Badge
      variant="outline"
      className={`${c.className} gap-1 ${size === "xs" ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-xs"}`}
    >
      <c.Icon className={size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {c.label}
    </Badge>
  );
}
