type Tier = "free" | "seller_basic" | "seller_pro" | "seller_annual";

interface TierBadgeProps {
  tier?: Tier | null;
  size?: "xs" | "sm" | "md";
}

const TIERS: Record<Exclude<Tier, "free">, { label: string; className: string }> = {
  seller_basic: {
    label: "Verified Seller",
    className: "bg-[#D4AF37]/15 text-[#6b530f] border border-[#D4AF37]/50",
  },
  seller_pro: {
    label: "Pro Seller",
    className: "bg-[#0B3954]/10 text-[#0B3954] border border-[#0B3954]/25",
  },
  seller_annual: {
    label: "Pro · Annual",
    className: "bg-[#D4AF37] text-[#0B3954] border border-[#c9a430] shadow-sm",
  },
};

export function TierBadge({ tier, size = "sm" }: TierBadgeProps) {
  if (!tier || tier === "free") return null;
  const config = TIERS[tier];
  if (!config) return null;

  const sizeClass =
    size === "xs"
      ? "text-[10px] px-1.5 py-0 gap-0.5"
      : size === "sm"
        ? "text-xs px-2 py-0.5 gap-1"
        : "text-sm px-3 py-1 gap-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold leading-none ${sizeClass} ${config.className}`}
    >
      <GoldStarburst size={size} />
      {config.label}
    </span>
  );
}

function GoldStarburst({ size }: { size: "xs" | "sm" | "md" }) {
  const sz = size === "xs" ? 10 : size === "sm" ? 12 : 14;
  return (
    <svg
      width={sz}
      height={sz}
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0"
      aria-hidden="true"
    >
      <path
        d="M8 1L9.8 5.8L14.5 4.5L11.2 8L14.5 11.5L9.8 10.2L8 15L6.2 10.2L1.5 11.5L4.8 8L1.5 4.5L6.2 5.8Z"
        fill="#D4AF37"
        stroke="#c9a430"
        strokeWidth="0.4"
      />
      <circle cx="8" cy="8" r="2.5" fill="white" />
      <path d="M6.8 8.1L7.7 9.1L9.4 6.9" stroke="#0B3954" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
