import { Layout } from "@/components/layout";
import { useLocation } from "wouter";
import { Tag, Clock, ShieldCheck, Search, MessageSquare, CheckCircle, DollarSign, HelpCircle } from "lucide-react";

export default function Seller() {
  const [_, setLocation] = useLocation();

  return (
    <Layout>
      {/* Navy header banner — matches buyer pages */}
      <section className="bg-[#0B3954] py-12">
        <div className="container mx-auto px-4 max-w-[860px]">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
            Why sell on Desperately Seeking Marketplace?
          </h1>
          <p className="text-white/70 text-base max-w-[540px] mb-7">
            Instead of guessing what might sell, you respond to real, specific needs. Less noise, more "yes."
          </p>
          <button
            onClick={() => setLocation("/listings/new")}
            className="rounded-full px-7 py-3 text-[0.95rem] font-semibold bg-[#D4AF37] text-[#0B3954] border-0 cursor-pointer hover:bg-[#c9a430] transition-colors shadow-[0_6px_16px_rgba(212,175,55,0.35)]"
          >
            Get started as a seller
          </button>
        </div>
      </section>

      {/* Cream content area */}
      <div className="bg-background flex-1">
        <div className="container max-w-[860px] mx-auto px-4 py-10 md:py-14 space-y-14">

          {/* Why sell — 3 benefit cards */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  Icon: Tag,
                  label: "Signal, not noise",
                  title: "Buyers tell you exactly what they want",
                  text: "Every request includes details like size, color, condition, budget, and ZIP code. You're not throwing listings into a void — you're matching to a clear ask.",
                },
                {
                  Icon: Clock,
                  label: "Respect for your time",
                  title: "Only respond when it's a true fit",
                  text: "No pressure to maintain a giant storefront. You can be a casual declutterer, a side‑hustler, or a full‑time seller — and only engage when a request matches what you have.",
                },
                {
                  Icon: ShieldCheck,
                  label: "Buyer‑first trust",
                  title: "You stand out by being honest and specific",
                  text: "Clear photos, accurate descriptions, and realistic pricing build trust quickly. Buyers see your offer alongside others and choose what truly fits their need.",
                },
              ].map(({ Icon, label, title, text }) => (
                <div
                  key={label}
                  className="bg-white rounded-xl p-5 border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                >
                  <div className="h-9 w-9 rounded-full bg-[#0B3954]/8 flex items-center justify-center mb-3">
                    <Icon className="h-4 w-4 text-[#0B3954]" />
                  </div>
                  <div className="text-[0.7rem] font-semibold text-[#D4AF37] uppercase tracking-widest mb-1">
                    {label}
                  </div>
                  <div className="font-semibold text-[#0B3954] mb-1.5">{title}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How selling works */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-[#0B3954] mb-1.5">How selling works</h2>
            <p className="text-sm text-muted-foreground max-w-[480px] mb-6">
              Simple, structured, and built around real buyer requests — not endless scrolling and guessing.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  n: "1",
                  Icon: Search,
                  title: "Browse buyer requests",
                  text: "Filter by category, ZIP code radius, budget, and condition. When you see a request you can genuinely fulfill, click into it to view all the details.",
                },
                {
                  n: "2",
                  Icon: MessageSquare,
                  title: "Submit your offer",
                  text: "Share photos, your price, condition notes, pickup/shipping options, and timing. The buyer sees your offer alongside others and can ask follow‑up questions if needed.",
                },
                {
                  n: "3",
                  Icon: CheckCircle,
                  title: "Confirm the match & complete the sale",
                  text: "Once the buyer chooses your offer, you coordinate payment and delivery based on the options you've provided. Clear expectations up front mean fewer surprises for both sides.",
                },
              ].map(({ n, Icon, title, text }) => (
                <div
                  key={n}
                  className="bg-white rounded-xl p-5 border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                >
                  <div className="h-8 w-8 rounded-full bg-[#D4AF37]/15 flex items-center justify-center mb-3">
                    <span className="text-sm font-bold text-[#0B3954]">{n}</span>
                  </div>
                  <div className="font-semibold text-[#0B3954] mb-1.5">{title}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Seller pricing & fees */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-[#0B3954] mb-1.5">Seller pricing & fees</h2>
            <p className="text-sm text-muted-foreground max-w-[480px] mb-6">
              Keep it simple, transparent, and sustainable. You'll always know what you keep from each sale.
            </p>

            <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start gap-8">
                <div className="flex-1">
                  <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#0B3954]/6 text-[#0B3954] font-semibold mb-3">
                    <DollarSign className="h-3 w-3" />
                    Seller‑friendly · No surprise charges
                  </span>
                  <p className="font-semibold text-[#0B3954] mb-1">
                    You keep the majority of every sale. Platform fees stay small and predictable.
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Exact fee structure can be adjusted as the marketplace grows, but the philosophy stays the same:
                    buyer‑first, seller‑respecting, and clear.
                  </p>
                  <ul className="space-y-2">
                    {[
                      "Flat platform fee or small percentage per completed sale",
                      "No fee just to browse or respond to requests",
                      "Optional add‑ons later (boosted visibility, featured responses, etc.)",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="h-5 w-5 rounded-full bg-[#D4AF37]/15 flex items-center justify-center shrink-0 text-[#D4AF37] text-xs font-bold mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:text-right shrink-0">
                  <div className="text-3xl font-bold text-[#0B3954]">8–12%</div>
                  <div className="text-sm text-muted-foreground max-w-[200px] md:ml-auto mt-1">
                    of the final sale price as a platform fee (exact numbers can be finalized with your business plan).
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Seller FAQ */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-[#0B3954] mb-1.5">Seller FAQ</h2>
            <p className="text-sm text-muted-foreground max-w-[480px] mb-6">
              A few of the questions thoughtful sellers usually ask before they jump in.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  q: "Do I have to list everything I own?",
                  a: "No. You don't maintain a giant storefront here. You simply respond when a buyer's request matches something you already have or can reasonably source.",
                },
                {
                  q: "How do buyers find me?",
                  a: 'Buyers don\'t search for you by name — they post what they\'re "desperately seeking." You show up when your offer fits their request, not because you gamed an algorithm.',
                },
                {
                  q: "What about safety and meet‑ups?",
                  a: "You can specify local pickup, public meet‑up, or shipping only. Clear expectations in your offer help buyers choose what feels safe and realistic for them.",
                },
                {
                  q: "Can I be both a buyer and a seller?",
                  a: 'Absolutely. Many people will declutter one day and be "desperately seeking" the next. You can switch roles as your life and needs change.',
                },
              ].map((item) => (
                <div
                  key={item.q}
                  className="bg-white rounded-xl p-5 border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                >
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-[#0B3954] mb-1">{item.q}</div>
                      <div className="text-sm text-muted-foreground leading-relaxed">{item.a}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="bg-[#0B3954] rounded-2xl p-8 text-center">
            <h3 className="font-serif text-2xl font-bold text-white mb-2">
              Ready to respond instead of guess?
            </h3>
            <p className="text-white/70 text-sm max-w-[440px] mx-auto mb-2">
              Create your seller profile once, then simply watch for buyer requests that feel like a "yes" for you.
              No pressure to be everywhere, all the time.
            </p>
            <p className="text-white/50 text-xs max-w-[440px] mx-auto mb-6">
              You've already done the hard part: having good items and integrity. This just gives buyers a clear way to
              find you when they need exactly what you have.
            </p>
            <button
              onClick={() => setLocation("/listings/new")}
              className="rounded-full px-8 py-3 text-[0.95rem] font-semibold bg-[#D4AF37] text-[#0B3954] border-0 cursor-pointer hover:bg-[#c9a430] transition-colors shadow-[0_6px_16px_rgba(212,175,55,0.35)]"
            >
              Get started as a seller
            </button>
          </section>

        </div>
      </div>
    </Layout>
  );
}
