import { Layout } from "@/components/layout";
import { Check, X } from "lucide-react";
import { useLocation } from "wouter";

const SUBSCRIPTION_FEATURES = [
  "Unlimited item posts",
  "Respond to all buyer requests",
  "Full seller features",
];

const HOW_DIFFERENT = [
  "No listing fees",
  "No shipping fees",
  "No boosts or bumps",
  "No ads",
  "No hidden charges",
];

export default function Pricing() {
  const [_, setLocation] = useLocation();

  return (
    <Layout>
      <section className="bg-[#0B3954] py-14">
        <div className="container mx-auto px-4 max-w-[760px]">
          <p className="text-[#D4AF37] font-semibold uppercase tracking-widest text-xs mb-3">
            Seller Pricing
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
            Honest pricing.{" "}
            <span className="italic text-[#D4AF37]">No surprises.</span>
          </h1>
          <p className="text-white/70 text-lg max-w-[540px]">
            At Desperately Seeking, we keep pricing simple and easy to understand. No bumps, no ads, no hidden fees.
          </p>
        </div>
      </section>

      <div className="bg-background">
        <div className="container max-w-[760px] mx-auto px-4 py-12 md:py-16 space-y-8">

          {/* Start Free */}
          <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-6 md:p-8">
            <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#D4AF37]/15 text-[#0B3954] font-semibold mb-4">
              Free to start
            </div>
            <h2 className="font-serif text-2xl font-semibold text-[#0B3954] mb-2">Start Free</h2>
            <p className="text-[#0B3954]/70 text-sm leading-relaxed mb-1">
              Browse for free.
            </p>
            <p className="text-[#0B3954]/65 text-sm leading-relaxed">
              Sellers can post one or two items for free, or choose a plan that works.
            </p>
          </div>

          {/* What We Charge */}
          <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-6 md:p-8 space-y-6">
            <h2 className="font-serif text-2xl font-semibold text-[#0B3954]">What We Charge</h2>

            {/* 5% fee */}
            <div className="flex items-start gap-3">
              <span className="h-5 w-5 rounded-full bg-[#D4AF37]/15 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="h-3 w-3 text-[#D4AF37]" strokeWidth={3} />
              </span>
              <span className="text-sm text-[#0B3954]/80 leading-relaxed">
                <span className="font-semibold text-[#0B3954]">5% platform fee</span> on completed sales.
              </span>
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Monthly */}
              <div className="rounded-xl border border-[#e0e0e0] p-5">
                <div className="font-serif text-2xl font-bold text-[#0B3954] mb-0.5">
                  $1.99<span className="text-base font-sans font-normal text-[#0B3954]/50">/month</span>
                </div>
                <p className="text-xs text-[#0B3954]/50 mb-4">Seller subscription</p>
                <ul className="space-y-2">
                  {SUBSCRIPTION_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#0B3954]/70">
                      <Check className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" strokeWidth={3} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Annual */}
              <div className="rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/5 p-5">
                <div className="font-serif text-2xl font-bold text-[#0B3954] mb-0.5">
                  $29.99<span className="text-base font-sans font-normal text-[#0B3954]/50">/year</span>
                </div>
                <p className="text-xs text-[#0B3954]/50 mb-4">Seller subscription · <span className="text-[#D4AF37] font-semibold">Save 60%</span></p>
                <ul className="space-y-2">
                  {SUBSCRIPTION_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#0B3954]/70">
                      <Check className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" strokeWidth={3} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-sm font-semibold text-[#0B3954]">That's it. No surprises.</p>
          </div>

          {/* How We're Different */}
          <div className="bg-[#0B3954] rounded-2xl p-6 md:p-8">
            <h2 className="font-serif text-2xl font-semibold text-white mb-2">How We're Different</h2>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Most marketplaces stack multiple fees on sellers —
              shipping fees, boosted listings, ads, subscriptions, and high percentage cuts.
              <br /><br />
              We don't do that.
            </p>
            <ul className="space-y-3">
              {HOW_DIFFERENT.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/80">
                  <span className="h-5 w-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <X className="h-3 w-3 text-red-400" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center pt-2">
            <button
              onClick={() => setLocation("/listings/new")}
              className="rounded-full px-8 py-3 text-sm font-bold bg-[#D4AF37] text-[#0B3954] hover:bg-[#c9a430] transition-colors cursor-pointer shadow-[0_6px_16px_rgba(212,175,55,0.35)]"
            >
              Start selling — it's free to list
            </button>
            <p className="mt-3 text-xs text-muted-foreground">
              Payments processed securely by Stripe. Your card details never touch our servers.
            </p>
          </div>

        </div>
      </div>
    </Layout>
  );
}
