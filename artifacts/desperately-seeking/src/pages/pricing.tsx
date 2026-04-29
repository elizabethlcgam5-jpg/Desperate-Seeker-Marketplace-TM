import { Layout } from "@/components/layout";
import { Check, X } from "lucide-react";
import { useLocation } from "wouter";

const WHAT_YOU_NEVER_PAY = [
  "Listing fees",
  "Shipping fees",
  "Boosts or bumps",
  "Ads",
  "Monthly subscriptions",
];

const WHY_5_PERCENT = [
  "Secure payments",
  "Platform maintenance",
  "Fraud protection",
  "Customer support",
];

const HOW_DIFFERENT = [
  "No shipping fees",
  "No bumps or boosts",
  "No ads",
  "No subscriptions",
  "No hidden charges",
  "Just 5% when your item sells",
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
            Simple. Fair.{" "}
            <span className="italic text-[#D4AF37]">Only 5%.</span>
          </h1>
          <p className="text-white/70 text-lg max-w-[540px]">
            At Desperately Seeking, we keep pricing honest and easy. You keep 95% of every sale — no bumps, no ads, no hidden fees.
          </p>
        </div>
      </section>

      <div className="bg-background">
        <div className="container max-w-[760px] mx-auto px-4 py-12 md:py-16 space-y-12">

          {/* Our Fee */}
          <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-6 md:p-8">
            <h2 className="font-serif text-2xl font-semibold text-[#0B3954] mb-2">Our Fee</h2>
            <p className="text-[#0B3954]/70 text-sm leading-relaxed mb-6">
              Flat 5% per completed sale. That's it. No listing fees. No subscriptions. No shipping fees.
            </p>

            <div className="rounded-xl bg-[#FDF5E6] border border-[#D4AF37]/25 p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-4">Example</p>
              {[
                { label: "Item sells for", value: "$40" },
                { label: "Our fee", value: "$2", sub: true },
                { label: "You keep", value: "$38", bold: true },
              ].map((row) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between text-sm ${
                    row.bold
                      ? "font-bold text-[#0B3954] pt-3 border-t border-[#D4AF37]/25"
                      : row.sub
                        ? "text-[#0B3954]/60"
                        : "text-[#0B3954]/75"
                  }`}
                >
                  <span>{row.label}</span>
                  <span className={row.bold ? "text-[#D4AF37] text-base" : ""}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* How We're Different */}
          <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-6 md:p-8">
            <h2 className="font-serif text-2xl font-semibold text-[#0B3954] mb-2">How We're Different</h2>
            <p className="text-[#0B3954]/70 text-sm leading-relaxed mb-6">
              Most marketplaces charge multiple fees — shipping fees, boosted listings, ads, subscriptions, and high seller percentages. We don't.
            </p>
            <ul className="space-y-3">
              {HOW_DIFFERENT.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-[#0B3954]/80">
                  <Check className="h-4 w-4 text-[#D4AF37] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Why 5% */}
          <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-6 md:p-8">
            <h2 className="font-serif text-2xl font-semibold text-[#0B3954] mb-2">Why 5%?</h2>
            <p className="text-[#0B3954]/70 text-sm leading-relaxed mb-6">
              Because selling shouldn't feel expensive. Our 5% fee covers:
            </p>
            <ul className="space-y-3">
              {WHY_5_PERCENT.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-[#0B3954]/80">
                  <Check className="h-4 w-4 text-[#D4AF37] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-[#0B3954]/60 italic">
              We keep it simple so you can keep more of your money.
            </p>
          </div>

          {/* What You'll Never Pay */}
          <div className="bg-[#0B3954] rounded-2xl p-6 md:p-8">
            <h2 className="font-serif text-2xl font-semibold text-white mb-2">What You'll Never Pay</h2>
            <ul className="mt-5 space-y-3">
              {WHAT_YOU_NEVER_PAY.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/75">
                  <X className="h-4 w-4 text-red-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-[#D4AF37] font-semibold">
              Just 5% when your item sells.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center pt-2">
            <button
              onClick={() => setLocation("/listings/new")}
              className="rounded-full px-8 py-3 text-sm font-bold bg-[#D4AF37] text-[#0B3954] hover:bg-[#c9a430] transition-colors cursor-pointer"
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
