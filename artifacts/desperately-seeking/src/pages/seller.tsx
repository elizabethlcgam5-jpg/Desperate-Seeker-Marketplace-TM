import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  CheckCircle2,
  Bell,
  MessageCircle,
  ShoppingBag,
  Truck,
  Crown,
  BadgeCheck,
  Sparkles,
  ArrowRight,
  PlusCircle,
} from "lucide-react";

const HOW_IT_WORKS = [
  { n: "1", icon: ShoppingBag, text: "Buyers post requests for what they need." },
  { n: "2", icon: Bell, text: "You receive instant Match Alerts when a buyer's request matches what you're selling." },
  { n: "3", icon: MessageCircle, text: "Respond with your offer and message the buyer." },
  { n: "4", icon: Truck, text: "Complete the sale locally or ship using real carrier rates." },
];

const PREMIUM_FEATURES = [
  "Unlimited listings",
  "Unlimited responses to buyer requests",
  "Unlimited messaging",
  "Automatic Match Alerts",
  "Priority matching",
  "Verified Seller badge",
  "Access to shipping tools",
  "Only a 5% platform fee",
];

export default function Seller() {
  return (
    <Layout>
      {/* Hero */}
      <div className="bg-[#0B3954] py-16">
        <div className="container mx-auto max-w-4xl px-4 md:px-8 text-center">
          <Badge className="mb-4 border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#D4AF37]">
            For Sellers
          </Badge>
          <h1 className="font-serif text-4xl font-bold text-white md:text-5xl">
            Welcome, Seller!
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-white/70 text-lg leading-relaxed">
            Desperately Seeking gives each seller{" "}
            <span className="text-[#D4AF37] font-semibold">2 free active listings</span> to get
            started. After that, upgrade to Premium for unlimited listings and full marketplace tools.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/listings/new">
              <Button className="rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 gap-2 px-8 h-11">
                <PlusCircle className="h-4 w-4" />
                Post a Listing
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10 px-8 h-11">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-12 md:px-8 space-y-12">

        {/* Free listings */}
        <div className="rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#FDF5E6] to-white p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex-1">
            <h2 className="font-serif text-xl font-semibold text-[#0B3954] mb-3">Your Free Listings</h2>
            <div className="flex flex-col gap-2 text-sm text-[#0B3954]/70">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#D4AF37] shrink-0" />
                Free listings remaining: <span className="font-bold text-[#0B3954]">2</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#D4AF37] shrink-0" />
                Free responses to buyer requests: Unlimited for your first 2 items
              </div>
            </div>
          </div>
          <Link href="/listings/new">
            <Button className="rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 gap-2 px-6">
              <PlusCircle className="h-4 w-4" />
              Add a New Listing
            </Button>
          </Link>
        </div>

        {/* How it works */}
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#0B3954] mb-6">How It Works for Sellers</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.n} className="flex items-start gap-4 rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0B3954] text-white text-sm font-bold">
                  {step.n}
                </div>
                <div className="flex items-start gap-2 pt-1">
                  <step.icon className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <p className="text-sm text-[#0B3954]/80">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium card */}
        <div className="rounded-2xl border-2 border-[#D4AF37] bg-[#0B3954] text-white p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-5">
            <Crown className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="font-serif text-xl font-semibold">Premium Benefits</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5 mb-6">
            {PREMIUM_FEATURES.map((f) => (
              <div key={f} className="flex items-start gap-2 text-sm text-white/85">
                <BadgeCheck className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                {f}
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-white/15">
            <Link href="/pricing" className="flex-1">
              <Button className="w-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 rounded-full gap-2 h-11">
                <Sparkles className="h-4 w-4" />
                $1.99/month
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing" className="flex-1">
              <Button variant="outline" className="w-full border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-full gap-2 h-11">
                $29.99/year
                <span className="text-xs opacity-75">(Save 60%)</span>
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </Layout>
  );
}
