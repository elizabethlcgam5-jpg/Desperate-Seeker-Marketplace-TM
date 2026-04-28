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
import { Check, Sparkles, BadgeCheck, Crown, Wallet, ExternalLink, HelpCircle, FileText, ShieldCheck, Truck, Heart } from "lucide-react";
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
    q: "What is Desperately Seeking?",
    a: "A buyer-first marketplace where buyers post what they need and sellers respond with offers.",
  },
  {
    q: "How do I post a request?",
    a: "Tap \"Post What You Need,\" describe the item, add photos (optional), and submit.",
  },
  {
    q: "How do sellers get notified?",
    a: "Sellers receive instant Match Alerts when a buyer posts something they offer.",
  },
  {
    q: "Is it free to use?",
    a: "Yes. Everyone can join for free. Sellers get 2 free listings before choosing a subscription.",
  },
  {
    q: "Why is there a 5% platform fee?",
    a: "This small fee keeps the marketplace running, supports safety features, and helps us build new tools.",
  },
  {
    q: "How does shipping work?",
    a: "Sellers can offer local pickup or shipping. Shipping uses real carrier rates based on weight and distance.",
  },
  {
    q: "Do I need an account?",
    a: "Yes. A simple email sign-in helps you track your listings, messages, and subscription.",
  },
  {
    q: "What's the difference between monthly and yearly Premium?",
    a: "Monthly is great for casual sellers. Yearly saves over 60% and includes priority support and early access to new features.",
  },
  {
    q: "Is Desperately Seeking safe?",
    a: "We use secure messaging, email verification, and community guidelines to keep buyers and sellers safe.",
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
            Desperately Seeking is free to join. Every seller gets 2 free listings. After that, choose the plan that fits your needs.
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

        {/* Shipping */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <Truck className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="font-serif text-2xl font-semibold text-[#0B3954]">Shipping</h2>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 md:p-8 shadow-sm space-y-3 text-sm text-[#0B3954]/75 leading-relaxed">
            {[
              "Sellers can offer local pickup, shipping, or both.",
              "Shipping uses real carrier rates based on weight and distance.",
              "No inflated fees or hidden markups.",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <Check className="h-4 w-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
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
          <div className="rounded-2xl border border-border/60 bg-white p-6 md:p-8 shadow-sm space-y-5 text-sm text-[#0B3954]/75 leading-relaxed">
            <p>Welcome to Desperately Seeking. By using our platform, you agree to the following terms:</p>
            {[
              { n: "1", title: "Marketplace Use", body: "Desperately Seeking connects buyers and sellers. We do not own or inspect items listed on the platform." },
              { n: "2", title: "User Accounts", body: "Users must provide accurate information and are responsible for maintaining the security of their account." },
              { n: "3", title: "Listings and Requests", body: "Buyers may post requests for items. Sellers may respond with offers. All communication must remain respectful and lawful." },
              { n: "4", title: "Payments", body: "Payments are processed securely through third-party providers. A 5% platform fee applies to completed sales." },
              { n: "5", title: "Shipping", body: "Sellers may offer local pickup or shipping. Shipping costs are based on real carrier rates." },
              { n: "6", title: "Prohibited Items", body: "Illegal, dangerous, counterfeit, or restricted items are not allowed." },
              { n: "7", title: "Liability", body: "Desperately Seeking is not responsible for item quality, delivery issues, or disputes between users." },
              { n: "8", title: "Account Suspension", body: "We may suspend or remove accounts that violate our policies." },
              { n: "9", title: "Changes to Terms", body: "We may update these terms at any time. Continued use of the platform means you accept the updated terms." },
            ].map((item) => (
              <div key={item.n} className="flex gap-3">
                <span className="flex-shrink-0 font-bold text-[#D4AF37]">{item.n}.</span>
                <div>
                  <span className="font-semibold text-[#0B3954]">{item.title} — </span>
                  {item.body}
                </div>
              </div>
            ))}
            <p className="pt-3 border-t border-border/50 text-[#0B3954]/60">
              If you have questions, contact us at{" "}
              <a href="mailto:support@desperatelyseeking.app" className="text-[#0B3954] underline underline-offset-2 hover:text-[#D4AF37] transition-colors">
                support@desperatelyseeking.app
              </a>
            </p>
          </div>
        </div>

        {/* About */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="font-serif text-2xl font-semibold text-[#0B3954]">About Desperately Seeking</h2>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 md:p-8 shadow-sm space-y-5 text-sm text-[#0B3954]/75 leading-relaxed">
            <p>
              Desperately Seeking was built for real people with real needs. Instead of scrolling through endless listings, buyers simply post what they're looking for — and sellers come to them. It's faster, simpler, and built for local communities.
            </p>
            <p>
              Our mission is to make buying and selling easier, safer, and more efficient. Whether you're decluttering, searching for something specific, or supporting small sellers, Desperately Seeking gives you a smarter way to connect.
            </p>
            <div>
              <p className="font-semibold text-[#0B3954] mb-3">We believe in:</p>
              <ul className="space-y-2">
                {[
                  "Buyer-first design",
                  "Local community support",
                  "Fair pricing for sellers",
                  "No boosted posts or ads",
                  "Real shipping rates with no markups",
                  "Tools built for everyday people, not big box stores",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#D4AF37] mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="pt-2 border-t border-border/50 italic text-[#0B3954]/60">
              Thank you for being part of our growing marketplace.
            </p>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="mx-auto mt-10 max-w-3xl mb-10">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="font-serif text-2xl font-semibold text-[#0B3954]">Privacy Policy</h2>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 md:p-8 shadow-sm space-y-5 text-sm text-[#0B3954]/75 leading-relaxed">
            <p>Your privacy matters to us. This policy explains how Desperately Seeking collects and uses your information.</p>
            {[
              {
                n: "1", title: "Information We Collect",
                items: [
                  "Email address for account login",
                  "Listings, requests, and messages you create",
                  "Basic device and usage data to improve the platform",
                ],
              },
              {
                n: "2", title: "How We Use Your Information",
                items: [
                  "To create and manage your account",
                  "To match buyers and sellers",
                  "To send notifications and updates",
                  "To improve marketplace safety and performance",
                ],
              },
              {
                n: "3", title: "Sharing Your Information",
                intro: "We do not sell your data. We only share information with:",
                items: [
                  "Payment processors (for subscriptions and sales)",
                  "Shipping carriers (when shipping is used)",
                ],
              },
            ].map((section) => (
              <div key={section.n}>
                <p className="font-semibold text-[#0B3954] mb-2">
                  {section.n}. {section.title}
                </p>
                {section.intro && <p className="mb-2 text-[#0B3954]/70">{section.intro}</p>}
                <ul className="space-y-1.5">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#D4AF37] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="space-y-3 pt-1">
              {[
                { n: "4", title: "Data Security", body: "We use secure systems to protect your information. No system is 100% secure, but we take reasonable steps to safeguard your data." },
                { n: "5", title: "Your Choices", body: "You may update or delete your account at any time." },
              ].map((item) => (
                <div key={item.n}>
                  <span className="font-semibold text-[#0B3954]">{item.n}. {item.title} — </span>
                  {item.body}
                </div>
              ))}
            </div>
            <p className="pt-3 border-t border-border/50 text-[#0B3954]/60">
              For privacy questions, email{" "}
              <a href="mailto:privacy@desperatelyseeking.app" className="text-[#0B3954] underline underline-offset-2 hover:text-[#D4AF37] transition-colors">
                privacy@desperatelyseeking.app
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
