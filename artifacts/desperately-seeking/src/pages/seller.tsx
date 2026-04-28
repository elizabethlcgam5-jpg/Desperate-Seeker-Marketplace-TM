import { Layout } from "@/components/layout";
import { Link } from "wouter";

export default function Seller() {
  return (
    <Layout>
      <div
        className="min-h-screen text-[#1f2933]"
        style={{
          background:
            "radial-gradient(circle at top, #e0ebff 0, #f5f7fb 45%, #f5f5f5 100%)",
        }}
      >
        <div className="max-w-[1100px] mx-auto px-4 py-8 pb-16">

          {/* Hero */}
          <section className="grid gap-8 items-center mb-10 [grid-template-columns:minmax(0,3fr)_minmax(0,2.5fr)] max-[900px]:[grid-template-columns:minmax(0,1fr)]">
            <div>
              <h1 className="text-[2.2rem] leading-tight font-bold mb-3">
                Turn <span className="text-[#1f6feb]">buyer requests</span> into sales — without shouting into the void.
              </h1>
              <p className="text-[#6b7280] text-[0.98rem] mb-5 max-w-[480px]">
                On Desperately Seeking Marketplace, buyers tell you exactly what they're looking for.
                You only raise your hand when you can truly deliver.
              </p>

              <div className="flex flex-wrap gap-2.5 mb-5">
                {["Buyer‑first, not algorithm‑first", "No listing overwhelm", "You respond when it's a fit"].map((label) => (
                  <span
                    key={label}
                    className="text-xs px-2.5 py-1.5 rounded-full border text-[#164ea8]"
                    style={{
                      background: "rgba(31,111,235,0.06)",
                      borderColor: "rgba(31,111,235,0.15)",
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-2.5 items-center mb-2.5">
                <Link href="/login">
                  <button
                    className="rounded-full px-5 py-2.5 text-[0.95rem] font-semibold text-white border-0 cursor-pointer transition-all"
                    style={{
                      background: "#1f6feb",
                      boxShadow: "0 10px 20px rgba(31,111,235,0.35)",
                    }}
                  >
                    Get started as a seller
                  </button>
                </Link>
                <Link href="/browse">
                  <button
                    className="rounded-full px-4 py-2 text-[0.9rem] border cursor-pointer transition-all text-[#6b7280] bg-transparent hover:bg-white"
                    style={{ borderColor: "#e5e7eb" }}
                  >
                    Preview a real buyer request
                  </button>
                </Link>
              </div>

              <p className="text-[0.8rem] text-[#6b7280]">
                <span className="text-[#ffb347] font-semibold">No obligation:</span>{" "}
                You only respond to requests that match what you actually have or can source.
              </p>
            </div>

            {/* Sample buyer request card */}
            <aside
              className="bg-white rounded-[18px] p-[18px] text-[0.85rem] border max-[900px]:order-first"
              style={{
                boxShadow: "0 10px 25px rgba(15,23,42,0.08)",
                borderColor: "rgba(148,163,184,0.3)",
              }}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="font-semibold text-[0.9rem]">Sample buyer request</div>
                <div
                  className="text-[0.7rem] px-2 py-1 rounded-full border"
                  style={{
                    background: "rgba(22,163,74,0.08)",
                    color: "#15803d",
                    borderColor: "rgba(22,163,74,0.25)",
                  }}
                >
                  You could respond
                </div>
              </div>
              <div className="text-[0.75rem] text-[#6b7280] mt-1">"I'm desperately seeking…"</div>
              <p className="my-2.5 text-[0.82rem]">
                A gently used, neutral‑colored glider chair for a small nursery. Must be clean, non‑smoking home,
                and within 25 miles of 60545. Budget under $175.
              </p>
              <div className="grid grid-cols-3 gap-2.5 mb-3">
                {[
                  { label: "Location", value: "60545 + 25 mi" },
                  { label: "Category", value: "Baby & Nursery" },
                  { label: "Budget", value: "< $175" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="px-2.5 py-2 rounded-[10px] border"
                    style={{ background: "#f9fafb", borderColor: "#e5e7eb" }}
                  >
                    <div className="text-[0.7rem] text-[#6b7280] mb-0.5">{m.label}</div>
                    <div className="text-[0.9rem] font-semibold">{m.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center gap-2.5 text-[0.75rem] text-[#6b7280] mt-1">
                <span>Have this (or better)? Send your offer, photos, and price in one reply.</span>
                <span className="whitespace-nowrap">You see the need first.</span>
              </div>
            </aside>
          </section>

          {/* Why sell here */}
          <section className="mb-10">
            <h2 className="text-[1.4rem] font-bold mb-2.5">Why sell on Desperately Seeking Marketplace?</h2>
            <p className="text-[0.9rem] text-[#6b7280] max-w-[520px] mb-5">
              Instead of guessing what might sell, you respond to real, specific needs. Less noise, more "yes."
            </p>
            <div className="grid grid-cols-3 gap-4 max-[700px]:grid-cols-1">
              {[
                {
                  label: "Signal, not noise",
                  title: "Buyers tell you exactly what they want",
                  text: "Every request includes details like size, color, condition, budget, and ZIP code. You're not throwing listings into a void — you're matching to a clear ask.",
                },
                {
                  label: "Respect for your time",
                  title: "Only respond when it's a true fit",
                  text: "No pressure to maintain a giant storefront. You can be a casual declutterer, a side‑hustler, or a full‑time seller — and only engage when a request matches what you have.",
                },
                {
                  label: "Buyer‑first trust",
                  title: "You stand out by being honest and specific",
                  text: "Clear photos, accurate descriptions, and realistic pricing build trust quickly. Buyers see your offer alongside others and choose what truly fits their need.",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="bg-white rounded-[10px] p-3.5 border text-[0.85rem]"
                  style={{
                    borderColor: "#e5e7eb",
                    boxShadow: "0 6px 16px rgba(15,23,42,0.04)",
                  }}
                >
                  <div className="text-[0.75rem] font-semibold text-[#164ea8] mb-1 uppercase tracking-wide">
                    {card.label}
                  </div>
                  <div className="font-semibold mb-1">{card.title}</div>
                  <p className="text-[#6b7280] text-[0.82rem]">{card.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section className="mb-10">
            <h2 className="text-[1.4rem] font-bold mb-2.5">How selling works</h2>
            <p className="text-[0.9rem] text-[#6b7280] max-w-[520px] mb-5">
              Simple, structured, and built around real buyer requests — not endless scrolling and guessing.
            </p>
            <div className="grid grid-cols-3 gap-4 max-[700px]:grid-cols-1">
              {[
                {
                  n: "1",
                  title: "Browse buyer requests",
                  text: "Filter by category, ZIP code radius, budget, and condition. When you see a request you can genuinely fulfill, click into it to view all the details.",
                },
                {
                  n: "2",
                  title: "Submit your offer",
                  text: "Share photos, your price, condition notes, pickup/shipping options, and timing. The buyer sees your offer alongside others and can ask follow‑up questions if needed.",
                },
                {
                  n: "3",
                  title: "Confirm the match & complete the sale",
                  text: "Once the buyer chooses your offer, you coordinate payment and delivery based on the options you've provided. Clear expectations up front mean fewer surprises for both sides.",
                },
              ].map((step) => (
                <div
                  key={step.n}
                  className="bg-white rounded-[10px] p-3.5 border text-[0.85rem]"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  <div
                    className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[0.75rem] font-semibold mb-1.5"
                    style={{
                      background: "rgba(31,111,235,0.08)",
                      color: "#164ea8",
                    }}
                  >
                    {step.n}
                  </div>
                  <div className="font-semibold mb-1">{step.title}</div>
                  <p className="text-[#6b7280] text-[0.82rem]">{step.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section className="mb-10">
            <h2 className="text-[1.4rem] font-bold mb-2.5">Seller pricing & fees</h2>
            <p className="text-[0.9rem] text-[#6b7280] max-w-[520px] mb-5">
              Keep it simple, transparent, and sustainable. You'll always know what you keep from each sale.
            </p>
            <div
              className="bg-white rounded-2xl p-4 border grid gap-5 items-center text-[0.88rem] max-[900px]:grid-cols-1"
              style={{
                borderColor: "#e5e7eb",
                boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
                gridTemplateColumns: "minmax(0,2fr) minmax(0,1.5fr)",
              }}
            >
              <div>
                <div
                  className="inline-flex items-center gap-1.5 text-[0.75rem] px-2.5 py-1 rounded-full mb-1.5"
                  style={{
                    background: "rgba(31,111,235,0.06)",
                    color: "#164ea8",
                  }}
                >
                  Seller‑friendly • No surprise charges
                </div>
                <div className="text-base font-semibold mb-1">
                  You keep the majority of every sale. Platform fees stay small and predictable.
                </div>
                <p className="text-[0.8rem] text-[#6b7280]">
                  Exact fee structure can be adjusted as the marketplace grows, but the philosophy stays the same:
                  buyer‑first, seller‑respecting, and clear.
                </p>
                <ul className="mt-2 text-[0.82rem] text-[#6b7280] space-y-1 list-none">
                  {[
                    "Flat platform fee or small percentage per completed sale",
                    "No fee just to browse or respond to requests",
                    "Optional add‑ons later (boosted visibility, featured responses, etc.)",
                  ].map((item) => (
                    <li key={item} className="before:content-['•_'] before:text-[#1f6feb]">{item}</li>
                  ))}
                </ul>
              </div>
              <div className="text-right max-[900px]:text-left">
                <div className="text-[1.4rem] font-bold text-[#164ea8]">Example: 8–12%</div>
                <div className="text-[0.75rem] text-[#6b7280]">
                  of the final sale price as a platform fee (exact numbers can be finalized with your business plan).
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-10">
            <h2 className="text-[1.4rem] font-bold mb-2.5">Seller FAQ</h2>
            <p className="text-[0.9rem] text-[#6b7280] max-w-[520px] mb-5">
              A few of the questions thoughtful sellers usually ask before they jump in.
            </p>
            <div className="grid grid-cols-2 gap-3.5 text-[0.85rem] max-[700px]:grid-cols-1">
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
                  className="bg-white rounded-[10px] px-3 py-2.5 border"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  <div className="font-semibold mb-1">{item.q}</div>
                  <div className="text-[#6b7280] text-[0.82rem]">{item.a}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section
            className="mt-2.5 px-4 py-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-[0.9rem]"
            style={{
              background: "linear-gradient(135deg, rgba(31,111,235,0.06), rgba(255,179,71,0.08))",
              borderColor: "rgba(148,163,184,0.5)",
            }}
          >
            <div className="max-w-[520px]">
              <strong className="font-semibold">Ready to respond instead of guess?</strong>
              <div className="mt-1">
                Create your seller profile once, then simply watch for buyer requests that feel like a "yes" for you.
                No pressure to be everywhere, all the time.
              </div>
              <div className="text-[0.78rem] text-[#6b7280] mt-1">
                You've already done the hard part: having good items and integrity. This just gives buyers a clear way to
                find you when they need exactly what you have.
              </div>
            </div>
            <Link href="/login">
              <button
                className="rounded-full px-5 py-2.5 text-[0.95rem] font-semibold text-white border-0 cursor-pointer"
                style={{
                  background: "#1f6feb",
                  boxShadow: "0 10px 20px rgba(31,111,235,0.35)",
                }}
              >
                Start my seller profile
              </button>
            </Link>
          </section>

        </div>
      </div>
    </Layout>
  );
}
