import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  useGetCurrentUser,
  useListPricingPlans,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Sparkles, BadgeCheck, Crown, Wallet, ExternalLink, HelpCircle, FileText, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";

const ICONS: Record<string, React.ElementType> = {
  free: Wallet,
  seller_basic: BadgeCheck,
  seller_pro: Sparkles,
  seller_annual: Crown,
};

function formatPrice(cents: number, interval: "month" | "semi" | "year" | "none") {
  if (cents === 0) return { dollars: "Free", suffix: "forever" };
  const dollars = (cents / 100).toFixed(2).replace(".00", "");
  const suffix =
    interval === "year" ? "/year" :
    interval === "semi" ? "/6 months" : "/month";
  return { dollars: `$${dollars}`, suffix };
}

const FAQ = [
  {
    q: "Do you guarantee I'll find what I'm looking for?",
    a: "No. Matches depend on local sellers and availability. We provide tools to help you connect, but outcomes are user-driven.",
  },
  {
    q: "Do I have to pay to list items?",
    a: "No. You can list 1 item for free. Premium members get unlimited listings and responses.",
  },
  {
    q: "Who pays for shipping?",
    a: "The buyer pays for shipping. Sellers set their own shipping price when they choose to offer shipping.",
  },
  {
    q: "Do you charge a fee?",
    a: "Yes. We charge a small 5% fee on the item price only. We do not charge any fee on shipping.",
  },
  {
    q: "Can I use Desperately Seeking without downloading an app?",
    a: "Yes. Desperately Seeking works as a Progressive Web App (PWA), so you can use it in your browser and add it to your home screen without going through an app store.",
  },
  {
    q: "Is my information safe?",
    a: "Yes. We do not sell your personal data. We only use your information to operate and improve the platform. See our Privacy Policy below for more details.",
  },
];

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
      if (isSubscribed) handleManage();
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
      if (url) window.location.href = url;
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
            Fair, simple, and{" "}
            <span className="italic text-[#D4AF37]">affordable.</span>
          </h1>
          <p className="mt-4 text-white/65 text-lg max-w-xl mx-auto">
            Built for everyday buyers and sellers. No surprises, no lock-in.
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
        {/* Plan cards */}
        <div className="mx-auto mt-0 grid max-w-3xl gap-6 md:grid-cols-2">
          {isLoading || !plans
            ? Array.from({ length: 2 }).map((_, i) => (
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
        <div className="mt-12 mx-auto max-w-2xl grid sm:grid-cols-3 gap-6 text-center">
          {[
            { icon: "5%", title: "Simple commission", desc: "We charge a flat 5% on the item price only when you complete a sale. Zero fee on shipping." },
            { icon: "⚡", title: "Cancel anytime", desc: "No lock-in. Cancel or downgrade your subscription whenever you like." },
            { icon: "🎁", title: "Buyers browse free", desc: "Post requests and receive offers from local sellers at no cost, forever." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl bg-white border border-border/60 p-6 shadow-sm">
              <div className="text-3xl mb-3 font-bold text-[#D4AF37]">{item.icon}</div>
              <p className="font-semibold text-[#0B3954] mb-1">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-muted-foreground">
          Payments are securely processed by Stripe. Your card details never touch our servers.
        </p>

        {/* Membership Disclaimer */}
        <div className="mx-auto mt-14 max-w-3xl rounded-2xl bg-[#FDF5E6] border border-[#D4AF37]/25 p-6 md:p-8">
          <div className="flex items-start gap-3 mb-3">
            <FileText className="h-5 w-5 text-[#D4AF37] mt-0.5 shrink-0" />
            <h2 className="font-serif text-xl font-semibold text-[#0B3954]">Membership Disclaimer</h2>
          </div>
          <p className="text-sm text-[#0B3954]/75 leading-relaxed">
            Desperately Seeking provides a platform that connects buyers and sellers. We do not guarantee that a buyer will find a specific item, receive a match, or complete a transaction. Membership fees cover access to platform features, not guaranteed outcomes. All sales, matches, and interactions are user-driven.
          </p>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="font-serif text-2xl font-semibold text-[#0B3954]">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQ.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-2xl border border-border/60 bg-white px-5 shadow-sm data-[state=open]:shadow-md"
              >
                <AccordionTrigger className="text-left text-sm font-medium text-[#0B3954] hover:no-underline py-4">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Terms of Use */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="font-serif text-2xl font-semibold text-[#0B3954]">Terms of Use</h2>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 md:p-8 shadow-sm space-y-4 text-sm text-[#0B3954]/75 leading-relaxed">
            <p>By using Desperately Seeking, you agree to the following:</p>
            <ul className="space-y-2 list-none">
              {[
                "You must be at least 18 years old to use this platform.",
                "Desperately Seeking is a marketplace platform that connects buyers and sellers. We are not a party to any transaction between users.",
                "Buyers and sellers are responsible for verifying item quality, condition, and authenticity.",
                "Desperately Seeking is not responsible for delivery, shipping issues, item condition, or disputes between users.",
                "You agree not to list or request illegal, prohibited, or dangerous items.",
                "Harassment, fraud, scams, or abusive behavior may result in account suspension or removal.",
              ].map((term, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-[#D4AF37] mt-0.5 shrink-0" />
                  <span>{term}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t border-border/50 space-y-3">
              <div>
                <p className="font-semibold text-[#0B3954] mb-1">Fees</p>
                <p>We charge a 5% fee on the item price only. We do not charge any fee on shipping.</p>
              </div>
              <div>
                <p className="font-semibold text-[#0B3954] mb-1">Refunds</p>
                <p>Membership fees are non-refundable. We do not provide refunds based on lack of matches, lack of responses, or unsuccessful searches. All transactions are between buyers and sellers. Any refunds or returns must be handled directly between the parties involved.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="mx-auto mt-10 max-w-3xl mb-10">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="font-serif text-2xl font-semibold text-[#0B3954]">Privacy Policy</h2>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 md:p-8 shadow-sm space-y-5 text-sm text-[#0B3954]/75 leading-relaxed">
            <div>
              <p className="font-semibold text-[#0B3954] mb-2">Information We Collect</p>
              <p className="mb-2">We may collect:</p>
              <ul className="space-y-1 list-none">
                {["Name and email address", "Phone number", "ZIP code or general location", "Listings you create", "Messages you send through the platform", "Basic device and usage information"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-[#0B3954] mb-2">What We Do Not Collect</p>
              <ul className="space-y-1 list-none">
                {["Social Security numbers", "Bank account numbers", "Credit card numbers (payments are handled by third-party processors such as Stripe)"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-[#0B3954] mb-2">How We Use Your Information</p>
              <p className="mb-2">We use your information to:</p>
              <ul className="space-y-1 list-none">
                {["Operate and improve the Desperately Seeking platform", "Match buyers and sellers", "Prevent fraud and abuse", "Communicate important updates about your account or listings"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-[#D4AF37] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-2 border-t border-border/50 space-y-2">
              <p><span className="font-semibold text-[#0B3954]">What We Do Not Do: </span>We do not sell your personal data. We do not share your personal data with advertisers who are not involved in operating the platform.</p>
              <p><span className="font-semibold text-[#0B3954]">Data Security: </span>We take reasonable steps to protect your information, but no system is 100% secure. By using the platform, you accept this risk.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
