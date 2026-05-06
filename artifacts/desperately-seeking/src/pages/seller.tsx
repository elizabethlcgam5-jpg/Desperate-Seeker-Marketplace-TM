import { Layout } from "@/components/layout";
import { useLocation } from "wouter";
import { Check, X, Upload, MessageSquare, CheckCircle, DollarSign } from "lucide-react";

const OTHER_PLATFORMS = [
  "Complicated fees",
  "Hidden charges",
  "Expensive boosts",
  "Forced ads",
  "High percentages",
  "Confusing rules",
];

const HERE_YOU_GET = [
  "A simple 5% fee on completed sales",
  "No listing fees",
  "No shipping fees",
  "No boosts or bumps",
  "No ads",
  "No hidden charges",
];

const FREE_TIER_BULLETS = [
  "Upload your items",
  "See how the marketplace works",
  "Connect with buyers",
  "Experience the platform firsthand",
];

const HOW_IT_WORKS = [
  {
    n: "1",
    Icon: Upload,
    title: "Upload your item",
    text: "Add photos, details, and your price.",
  },
  {
    n: "2",
    Icon: MessageSquare,
    title: "Connect with buyers",
    text: "Buyers can message you directly.",
  },
  {
    n: "3",
    Icon: CheckCircle,
    title: "Complete the sale",
    text: "Local or shipped — whatever works for you.",
  },
  {
    n: "4",
    Icon: DollarSign,
    title: "Get paid",
    text: "You keep the majority of every sale.",
  },
];

export default function Seller() {
  const [_, setLocation] = useLocation();

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-[#0B3954] py-14">
        <div className="container mx-auto px-4 max-w-[760px]">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
            Sell With Confidence
          </h1>
          <p className="text-white/70 text-base max-w-[520px] mb-2">
            Your items. Your earnings. Your space to shine.
          </p>
          <p className="text-white/55 text-sm max-w-[560px] mb-8 leading-relaxed">
            Desperately Seeking is built around one simple truth: without sellers, there is no
            marketplace. You're the heart of this platform — and we treat you that way.
          </p>
          <button
            onClick={() => setLocation("/listings/new")}
            className="rounded-full px-8 py-3 text-[0.95rem] font-semibold bg-[#D4AF37] text-[#0B3954] border-0 cursor-pointer hover:bg-[#c9a430] transition-colors shadow-[0_6px_16px_rgba(212,175,55,0.35)]"
          >
            Start Selling Free
          </button>
        </div>
      </section>

      <div className="bg-background flex-1">
        <div className="container max-w-[760px] mx-auto px-4 py-10 md:py-14 space-y-12">

          {/* Start Selling Free */}
          <section>
            <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="bg-[#0B3954]/5 border-b border-[#e0e0e0] px-6 md:px-8 py-5">
                <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#D4AF37]/15 text-[#0B3954] font-semibold mb-2">
                  Free to start
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#0B3954]">
                  Start Selling Free
                </h2>
                <p className="text-sm text-[#0B3954]/60 mt-1">
                  Every seller begins with 2 free item listings.
                </p>
              </div>
              <div className="px-6 md:px-8 py-6 space-y-5">
                <p className="text-sm text-[#0B3954]/70 leading-relaxed">
                  No subscription. No commitment. No pressure.
                </p>
                <p className="text-sm text-[#0B3954]/70 leading-relaxed">
                  This gives you the chance to:
                </p>
                <ul className="space-y-2.5">
                  {FREE_TIER_BULLETS.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-[#0B3954]/75">
                      <span className="h-5 w-5 rounded-full bg-[#D4AF37]/15 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-[#D4AF37]" strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-[#0B3954]/60 italic">
                  All before deciding if you want to continue.
                </p>
              </div>
            </div>
          </section>

          {/* Unlimited plans */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-[#0B3954] mb-1.5">
              Unlimited Selling Plans
            </h2>
            <p className="text-sm text-muted-foreground max-w-[520px] mb-6">
              After your first 2 active listings, unlock unlimited item posts with a simple, affordable plan.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Monthly */}
              <div className="bg-[#0B3954] rounded-2xl p-6">
                <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-semibold mb-4">
                  Monthly
                </div>
                <div className="font-serif text-3xl font-bold text-white mb-1">$1.99<span className="text-white/50 text-base font-sans font-normal">/month</span></div>
                <ul className="space-y-2 mt-4 mb-6">
                  {["Unlimited item posts", "Respond to all buyer requests", "Full seller features"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                      <Check className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" strokeWidth={3} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setLocation("/listings/new")}
                  className="w-full rounded-full py-2.5 text-sm font-semibold bg-white/10 text-white border border-white/20 cursor-pointer hover:bg-white/20 transition-colors"
                >
                  Get started
                </button>
              </div>
              {/* Annual */}
              <div className="bg-[#D4AF37] rounded-2xl p-6">
                <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#0B3954]/15 text-[#0B3954] font-semibold mb-4">
                  Save 60%
                </div>
                <div className="font-serif text-3xl font-bold text-[#0B3954] mb-1">$29.99<span className="text-[#0B3954]/50 text-base font-sans font-normal">/year</span></div>
                <ul className="space-y-2 mt-4 mb-6">
                  {["Unlimited item posts", "Respond to all buyer requests", "Full seller features"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#0B3954]/80">
                      <Check className="h-3.5 w-3.5 text-[#0B3954] shrink-0" strokeWidth={3} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setLocation("/listings/new")}
                  className="w-full rounded-full py-2.5 text-sm font-semibold bg-[#0B3954] text-white border-0 cursor-pointer hover:bg-[#0a3247] transition-colors"
                >
                  Get started
                </button>
              </div>
            </div>
          </section>

          {/* Why sellers love it here */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-[#0B3954] mb-1.5">
              Why Sellers Love It Here
            </h2>
            <p className="text-sm text-muted-foreground max-w-[520px] mb-6">
              We designed this marketplace around what sellers complain about on other platforms.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* What others do */}
              <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-5">
                <p className="text-xs font-semibold text-[#0B3954]/40 uppercase tracking-widest mb-4">
                  Other platforms
                </p>
                <ul className="space-y-2.5">
                  {OTHER_PLATFORMS.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-[#0B3954]/60">
                      <span className="h-5 w-5 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <X className="h-3 w-3 text-red-400" strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* What we do */}
              <div className="bg-white rounded-xl border border-[#D4AF37]/30 shadow-[0_2px_8px_rgba(212,175,55,0.12)] p-5">
                <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest mb-4">
                  Here, you get
                </p>
                <ul className="space-y-2.5">
                  {HERE_YOU_GET.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-[#0B3954]/75">
                      <span className="h-5 w-5 rounded-full bg-[#D4AF37]/15 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-[#D4AF37]" strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-sm text-center text-[#0B3954]/50 mt-5 leading-relaxed">
              Just a clean, fair system that respects your time and your work.
            </p>
          </section>

          {/* How selling works */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-[#0B3954] mb-1.5">
              How Selling Works
            </h2>
            <p className="text-sm text-muted-foreground max-w-[480px] mb-6">
              Four simple steps from listing to payment.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {HOW_IT_WORKS.map(({ n, Icon, title, text }) => (
                <div
                  key={n}
                  className="bg-white rounded-xl p-5 border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.05)] flex gap-4 items-start"
                >
                  <div className="h-9 w-9 rounded-full bg-[#D4AF37]/15 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-[#0B3954]">{n}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#0B3954] mb-1">{title}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="bg-[#0B3954] rounded-2xl p-8 text-center">
            <h3 className="font-serif text-2xl font-bold text-white mb-2">
              Ready to start selling?
            </h3>
            <p className="text-white/60 text-sm max-w-[440px] mx-auto mb-6 leading-relaxed">
              Join for free. List your first 2 items at no cost. No subscription required until
              you're ready to go unlimited.
            </p>
            <button
              onClick={() => setLocation("/listings/new")}
              className="rounded-full px-8 py-3 text-[0.95rem] font-semibold bg-[#D4AF37] text-[#0B3954] border-0 cursor-pointer hover:bg-[#c9a430] transition-colors shadow-[0_6px_16px_rgba(212,175,55,0.35)]"
            >
              Start Selling Free
            </button>
          </section>

        </div>
      </div>
    </Layout>
  );
}
