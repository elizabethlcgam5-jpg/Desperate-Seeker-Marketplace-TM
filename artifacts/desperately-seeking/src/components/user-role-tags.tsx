import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ShoppingBag, Store, Star } from "lucide-react";

type BuyerVariant = "buyer" | "new_buyer" | "verified_buyer";
type SellerVariant = "seller" | "new_seller" | "verified_seller" | "top_seller";

interface BuyerTagProps {
  variant?: BuyerVariant;
}

interface SellerTagProps {
  variant?: SellerVariant;
  isSubscriber?: boolean;
}

const BUYER_CONFIGS: Record<BuyerVariant, { label: string; tooltip: string; className: string }> = {
  buyer: {
    label: "Buyer",
    tooltip: "This member is an active buyer in the community.",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  new_buyer: {
    label: "New Buyer",
    tooltip: "Just getting started — welcome to the community! 👋",
    className: "bg-green-50 text-green-700 border border-green-200",
  },
  verified_buyer: {
    label: "Verified Buyer",
    tooltip: "Trusted buyer with a track record of completed purchases. ✅",
    className: "bg-blue-100 text-blue-800 border border-blue-300",
  },
};

const SELLER_CONFIGS: Record<SellerVariant, { label: string; tooltip: string; className: string; icon?: string }> = {
  seller: {
    label: "Seller",
    tooltip: "This member is an active seller. They've agreed to our Seller Rules and are ready to make a deal.",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  new_seller: {
    label: "New Seller",
    tooltip: "Just started selling — check out their listings! 🛍️",
    className: "bg-orange-50 text-orange-700 border border-orange-200",
  },
  verified_seller: {
    label: "Verified Seller",
    tooltip: "Experienced seller with great reviews. ⭐",
    className: "bg-amber-100 text-amber-800 border border-amber-300",
  },
  top_seller: {
    label: "Top Seller",
    tooltip: "One of our most active and trusted sellers in the community. 🏆",
    className: "bg-[#D4AF37]/15 text-[#6b530f] border border-[#D4AF37]/50",
  },
};

function TagPill({ label, tooltip, className, icon }: { label: string; tooltip: string; className: string; icon?: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`inline-flex items-center gap-1 rounded-full text-xs font-semibold px-2.5 py-0.5 cursor-default select-none ${className}`}>
          {icon}
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px] text-center text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

export function BuyerTag({ variant = "buyer" }: BuyerTagProps) {
  const config = BUYER_CONFIGS[variant];
  return (
    <TagPill
      label={config.label}
      tooltip={config.tooltip}
      className={config.className}
      icon={<ShoppingBag className="h-3 w-3 shrink-0" />}
    />
  );
}

export function SellerTag({ variant = "seller", isSubscriber }: SellerTagProps) {
  const config = SELLER_CONFIGS[variant];
  return (
    <TagPill
      label={config.label}
      tooltip={config.tooltip}
      className={config.className}
      icon={<Store className="h-3 w-3 shrink-0" />}
    />
  );
}

export function ProSellerBadge() {
  return (
    <TagPill
      label="⭐ Pro Seller"
      tooltip="This seller has an active subscription and access to exclusive selling features."
      className="bg-[#D4AF37] text-[#0B3954] border border-[#c9a430] shadow-sm"
    />
  );
}

interface UserRoleTagsProps {
  subscriptionTier?: string | null;
  requestCount?: number;
  listingCount?: number;
  className?: string;
}

export function UserRoleTags({ subscriptionTier, requestCount = 0, listingCount = 0, className = "" }: UserRoleTagsProps) {
  const isSeller = subscriptionTier && subscriptionTier !== "free";
  const isProSeller = subscriptionTier === "seller_annual";

  const buyerVariant: BuyerVariant = requestCount === 0 ? "new_buyer" : requestCount >= 5 ? "verified_buyer" : "buyer";

  let sellerVariant: SellerVariant = "new_seller";
  if (listingCount >= 10) sellerVariant = "top_seller";
  else if (listingCount >= 3) sellerVariant = "verified_seller";
  else if (listingCount >= 1) sellerVariant = "seller";

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      <BuyerTag variant={buyerVariant} />
      {isSeller && <SellerTag variant={sellerVariant} />}
      {isProSeller && <ProSellerBadge />}
    </div>
  );
}
