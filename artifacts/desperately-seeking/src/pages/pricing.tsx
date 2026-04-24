import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useGetCurrentUser,
  useListPricingPlans,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Sparkles, BadgeCheck, Crown, Wallet, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";

const ICONS = {
  free: Wallet,
  seller_basic: BadgeCheck,
  seller_pro: Sparkles,
  seller_annual: Crown,
} as const;

function formatPrice(cents: number, interval: "month" | "semi" | "year" | "none") {
  if (cents === 0) return { dollars: "Free", suffix: "forever" };
  const dollars = (cents / 100).toFixed(2).replace(".00", "");
  const suffix =
    interval === "year" ? "/year" :
    interval === "semi" ? "/6 months" : "/month";
  return { dollars: `$${dollars}`, suffix };
}

export default function Pricing() {
  const { data: plans, isLoading } = useListPricingPlans();
  const { data: currentUser } = useGetCurrentUser();
  const qc = useQueryClient();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const isSubscribed =
    currentUser?.subscriptionTier &&
    currentUser.subscriptionTier !== "free";

  const handleSelect = async (
    tier: "free" | "seller_basic" | "seller_pro" | "seller_annual",
    name: string,
  ) => {
    if (tier === "free") {
      // Open billing portal to cancel — only if user has an active subscription
      if (isSubscribed) {
        handleManage();
      }
      return;
    }

    setLoadingTier(tier);
    try {
      const res = await fetch(getApiUrl("stripe/checkout"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Checkout failed");
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't start checkout. Try again.");
    } finally {
      setLoadingTier(null);
    }
  };

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch(getApiUrl("stripe/portal"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Could not open billing portal");
      }

      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't open billing portal. Try again.");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero band */}
      <div className="bg-[#0B3954] py-14">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <Badge className="mb-4 border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#D4AF37]">
            Pricing
          </Badge>
          <h1 className="font-serif text-4xl font-bold text-white md:text-5xl">
            Buyers post{" "}
            <span className="italic text-[#D4AF37]">free forever.</span>
            <br />
            Sellers unlock the marketplace.
          </h1>
          <p className="mt-4 text-white/65 text-lg max-w-xl mx-auto">
            Browse open requests, list your inventory, message buyers, and close deals — all for less than a coffee a week.
          </p>
          {isSubscribed && (
            <Button
              variant="outline"
              className="mt-6 border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10"
              onClick={handleManage}
              disabled={portalLoading}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {portalLoading ? "Opening portal…" : "Manage Subscription"}
            </Button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-14 md:px-8">
        <div className="mx-auto mt-0 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          {isLoading || !plans
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="h-96 animate-pulse rounded-2xl" />
              ))
            : plans.map((plan) => {
                const price = formatPrice(plan.priceCents, plan.interval as any);
                const Icon = ICONS[plan.tier];
                const isCurrent = currentUser?.subscriptionTier === plan.tier;
                const isAnnual = plan.tier === "seller_annual";
                const isHighlighted = plan.highlight;
                const isPending = loadingTier === plan.tier;

                return (
                  <Card
                    key={plan.tier}
                    className={`relative flex flex-col rounded-2xl transition-shadow ${
                      isHighlighted
                        ? "border-[#D4AF37] shadow-xl ring-2 ring-[#D4AF37]/25 bg-[#0B3954] text-white"
                        : "border-border shadow-sm hover:shadow-md bg-white"
                    }`}
                  >
                    {isHighlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-[#D4AF37] text-[#0B3954] font-bold shadow-sm">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    {isAnnual && !isHighlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-emerald-600 text-white font-bold shadow-sm">
                          Best value
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="space-y-3 pb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            isHighlighted
                              ? "bg-[#D4AF37]/20 text-[#D4AF37]"
                              : plan.tier === "free"
                                ? "bg-muted text-muted-foreground"
                                : isAnnual
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-[#0B3954]/8 text-[#0B3954]"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className={`text-lg font-semibold font-serif ${isHighlighted ? "text-white" : "text-[#0B3954]"}`}>
                          {plan.name}
                        </h3>
                      </div>
                      <p className={`text-sm ${isHighlighted ? "text-white/65" : "text-muted-foreground"}`}>
                        {plan.tagline}
                      </p>
                      <div className="pt-2">
                        <span className={`font-serif text-4xl font-bold ${isHighlighted ? "text-[#D4AF37]" : "text-[#0B3954]"}`}>
                          {price.dollars}
                        </span>
                        <span className={`ml-1.5 text-sm ${isHighlighted ? "text-white/60" : "text-muted-foreground"}`}>
                          {price.suffix}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col pt-4">
                      <ul className="flex-1 space-y-2.5">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm">
                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#D4AF37]" />
                            <span className={isHighlighted ? "text-white/85" : "text-foreground/80"}>{f}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`mt-6 w-full rounded-full font-semibold transition-transform hover:-translate-y-0.5 ${
                          isHighlighted
                            ? "bg-[#D4AF37] text-[#0B3954] hover:bg-[#c9a430] border-0"
                            : isCurrent
                              ? "border-[#0B3954]/20"
                              : plan.tier === "free"
                                ? "border-[#0B3954]/20 text-[#0B3954]"
                                : "bg-[#0B3954] text-white hover:bg-[#0B3954]/90 border-0"
                        }`}
                        variant={isHighlighted || (!isCurrent && plan.tier !== "free") ? "default" : "outline"}
                        disabled={isCurrent || isPending || !!loadingTier}
                        onClick={() => handleSelect(plan.tier, plan.name)}
                      >
                        {isCurrent
                          ? "✓ Current plan"
                          : isPending
                            ? "Redirecting…"
                            : plan.tier === "free"
                              ? "Downgrade to free"
                              : `Get ${plan.name}`}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        {/* Trust bar */}
        <div className="mt-14 mx-auto max-w-2xl grid sm:grid-cols-3 gap-6 text-center">
          {[
            { icon: "🔒", title: "No transaction fees", desc: "Keep 100% of every deal you close with buyers." },
            { icon: "⚡", title: "Cancel anytime", desc: "No lock-in. Cancel or downgrade whenever you like." },
            { icon: "🎁", title: "Buyers always free", desc: "Post as many requests as you want, forever, for free." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl bg-white border border-border/60 p-6 shadow-sm">
              <div className="text-3xl mb-3">{item.icon}</div>
              <p className="font-semibold text-[#0B3954] mb-1">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
          Payments are securely processed by Stripe. Your card details never touch our servers.
        </p>
      </div>
    </Layout>
  );
}
