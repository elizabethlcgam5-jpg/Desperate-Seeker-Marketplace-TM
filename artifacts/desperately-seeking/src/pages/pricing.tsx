import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useGetCurrentUser,
  useListPricingPlans,
  useSubscribeCurrentUser,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Sparkles, BadgeCheck, Crown, Wallet } from "lucide-react";
import { toast } from "sonner";

const ICONS = {
  free: Wallet,
  seller_basic: BadgeCheck,
  seller_pro: Sparkles,
  seller_annual: Crown,
} as const;

function formatPrice(cents: number, interval: "month" | "year" | "none") {
  if (cents === 0) return { dollars: "Free", suffix: "forever" };
  const dollars = (cents / 100).toFixed(2);
  return {
    dollars: `$${dollars}`,
    suffix: interval === "year" ? "/year" : "/month",
  };
}

export default function Pricing() {
  const { data: plans, isLoading } = useListPricingPlans();
  const { data: currentUser } = useGetCurrentUser();
  const subscribe = useSubscribeCurrentUser();
  const qc = useQueryClient();

  const handleSelect = (
    tier: "free" | "seller_basic" | "seller_pro" | "seller_annual",
    name: string,
  ) => {
    subscribe.mutate(
      { data: { tier } },
      {
        onSuccess: () => {
          qc.invalidateQueries();
          toast.success(
            tier === "free"
              ? "You're back on the free plan."
              : `You're now on ${name}!`,
          );
        },
        onError: () => toast.error("Couldn't update your plan. Try again."),
      },
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="outline"
            className="mb-4 border-primary/30 bg-primary/5 text-primary"
          >
            Pricing
          </Badge>
          <h1 className="font-serif text-4xl font-bold tracking-tight md:text-5xl">
            Buyers post free.{" "}
            <span className="italic text-primary">Sellers go pro.</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Pick the plan that fits how often you respond to buyer requests.
            Cancel anytime, no fees on accepted deals.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          {isLoading || !plans
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="h-96 animate-pulse" />
              ))
            : plans.map((plan) => {
                const price = formatPrice(plan.priceCents, plan.interval);
                const Icon = ICONS[plan.tier];
                const isCurrent = currentUser?.subscriptionTier === plan.tier;
                const isAnnual = plan.tier === "seller_annual";
                return (
                  <Card
                    key={plan.tier}
                    className={`relative flex flex-col ${
                      plan.highlight
                        ? "border-primary shadow-lg ring-1 ring-primary/20"
                        : ""
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground shadow">
                          Most popular
                        </Badge>
                      </div>
                    )}
                    {isAnnual && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-amber-500 text-white shadow">
                          Launch deal
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-md ${
                            plan.tier === "free"
                              ? "bg-muted text-muted-foreground"
                              : isAnnual
                                ? "bg-amber-100 text-amber-700"
                                : plan.highlight
                                  ? "bg-primary/10 text-primary"
                                  : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-semibold">{plan.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {plan.tagline}
                      </p>
                      <div className="pt-2">
                        <span className="font-serif text-4xl font-bold">
                          {price.dollars}
                        </span>
                        <span className="ml-1 text-sm text-muted-foreground">
                          {price.suffix}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                      <ul className="flex-1 space-y-2.5">
                        {plan.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="mt-6 w-full"
                        variant={plan.highlight ? "default" : "outline"}
                        disabled={isCurrent || subscribe.isPending}
                        onClick={() => handleSelect(plan.tier, plan.name)}
                      >
                        {isCurrent
                          ? "Current plan"
                          : plan.tier === "free"
                            ? "Switch to free"
                            : "Choose this plan"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-foreground">
          This is a demo — selecting a plan updates your account immediately
          without a real payment. In production, checkout would route through
          your payment provider.
        </p>
      </div>
    </Layout>
  );
}
