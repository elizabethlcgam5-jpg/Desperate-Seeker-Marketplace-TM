import { Layout } from "@/components/layout";
import { Check } from "lucide-react";
import { useLocation } from "wouter";

const MONTHLY_FEATURES = [
  "Unlimited listings",
  "Message buyers and sellers",
  "Safe in-app payments",
  "Cancel anytime",
];

const ANNUAL_FEATURES = [
  "Everything in Monthly",
  "One simple payment for the whole year",
  "Our lowest price for unlimited posting",
];

export default function Pricing() {
  const [_, setLocation] = useLocation();

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-[#0B3954] py-14">
        <div className="container mx-auto px-4 max-w-[760px]">
          <p className="text-[#D4AF37] font-semibold uppercase tracking-widest text-xs mb-3">
            Pricing
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
            Honest pricing.{" "}
            <span className="italic text-[#D4AF37]">No surprises.</span>
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-lg">
            Everyone starts with 2 free listings. Upgrade anytime for unlimited posting and a smoother selling experience.
          </p>
        </div>
      </section>

      <div className="bg-background">
        <div className="container max-w-[760px] mx-auto px-4 py-12 md:py-16 space-y-6">

          {/* Plan cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Premium Monthly */}
            <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-6 flex flex-col">
              <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#0B3954]/8 text-[#0B3954] font-semibold mb-4 w-fit">
                Premium Monthly
              </div>
              <div className="font-serif text-3xl font-bold text-[#0B3954] mb-1">
                $1.99<span className="text-base font-sans font-normal text-[#0B3954]/50">/month</span>
              </div>
              <p className="text-sm text-[#0B3954]/60 mb-5">Perfect if you want flexibility.</p>
              <ul className="space-y-2.5 flex-1">
                {MONTHLY_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#0B3954]/75">
                    <Check className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" strokeWidth={3} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setLocation("/listings/new")}
                className="mt-6 w-full rounded-full py-2.5 text-sm font-semibold border border-[#0B3954]/20 text-[#0B3954] hover:bg-[#0B3954]/5 transition-colors cursor-pointer"
              >
                Get started
              </button>
            </div>

            {/* Premium Yearly */}
            <div className="bg-[#0B3954] rounded-2xl border border-[#0B3954] shadow-[0_6px_20px_rgba(11,57,84,0.25)] p-6 flex flex-col">
              <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-semibold mb-4 w-fit">
                Premium Yearly
              </div>
              <div className="font-serif text-3xl font-bold text-white mb-1">
                $14.99<span className="text-base font-sans font-normal text-white/50">/year</span>
              </div>
              <p className="text-sm text-white/60 mb-5">
                Best value —{" "}
                <span className="text-[#D4AF37] font-semibold">save 37%</span>
              </p>
              <ul className="space-y-2.5 flex-1">
                {ANNUAL_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/80">
                    <Check className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" strokeWidth={3} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setLocation("/listings/new")}
                className="mt-6 w-full rounded-full py-2.5 text-sm font-bold bg-[#D4AF37] text-[#0B3954] hover:bg-[#c9a430] transition-colors cursor-pointer shadow-[0_4px_12px_rgba(212,175,55,0.35)]"
              >
                Get the best deal
              </button>
            </div>
          </div>

          {/* 5% Fee */}
          <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-6 md:p-7">
            <div className="flex items-start gap-3">
              <span className="h-5 w-5 rounded-full bg-[#D4AF37]/15 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="h-3 w-3 text-[#D4AF37]" strokeWidth={3} />
              </span>
              <div>
                <p className="font-semibold text-[#0B3954] text-sm mb-1">Simple 5% Fee on Completed Sales</p>
                <p className="text-sm text-[#0B3954]/65 leading-relaxed">Only when the buyer pays through the app.</p>
                <p className="text-sm text-[#0B3954]/65 leading-relaxed">Cash sales are allowed but not covered by in-app protections.</p>
              </div>
            </div>
          </div>

          {/* Always Free to Browse */}
          <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-6 md:p-7">
            <div className="flex items-start gap-3">
              <span className="h-5 w-5 rounded-full bg-[#D4AF37]/15 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="h-3 w-3 text-[#D4AF37]" strokeWidth={3} />
              </span>
              <div>
                <p className="font-semibold text-[#0B3954] text-sm mb-1">Always Free to Browse</p>
                <p className="text-sm text-[#0B3954]/65 leading-relaxed">Buyers and sellers can browse the marketplace for free.</p>
                <p className="text-sm text-[#0B3954]/65 leading-relaxed mt-1">You'll only need an account when you want to message, post, or respond — so your conversations and sales can be saved to your profile.</p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-muted-foreground pt-2">
            Payments processed securely by Stripe. Your card details never touch our servers.
          </p>

        </div>
      </div>
    </Layout>
  );
}
