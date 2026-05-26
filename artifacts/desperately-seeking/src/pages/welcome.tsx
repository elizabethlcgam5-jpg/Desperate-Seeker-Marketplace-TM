import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { ArrowRight, ShoppingBag, Store, Shield } from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: ShoppingBag,
    title: "Post what you need",
    text: "Tell us what you're looking for and let sellers come to you. No endless scrolling required.",
  },
  {
    icon: Store,
    title: "Sell with confidence",
    text: "List your first item free. Connect with real buyers in your area and make sales on your terms.",
  },
  {
    icon: Shield,
    title: "Safe & simple",
    text: "Secure in-app payments, buyer protection, and a community built on trust.",
  },
];

export default function Welcome() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-[#0B3954] py-16 md:py-24 text-center">
        <div className="container mx-auto px-4 max-w-[680px]">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-4">
            Welcome
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
            Welcome to<br />Desperately Seeking™
          </h1>
          <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-[520px] mx-auto mb-10">
            The buyer-first local marketplace where you post what you need and sellers come straight to you. No more hunting — just help.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/requests/new">
              <button className="rounded-full px-7 py-3 text-sm font-bold bg-[#D4AF37] text-[#0B3954] hover:bg-[#c9a430] transition-colors shadow-[0_6px_16px_rgba(212,175,55,0.35)] inline-flex items-center gap-2">
                Post What You Need
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link href="/browse">
              <button className="rounded-full px-7 py-3 text-sm font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/20">
                Browse the Marketplace
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Intro message */}
      <section className="bg-[#FDF5E6] py-14 md:py-20">
        <div className="container mx-auto px-4 max-w-[680px] text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#0B3954] mb-4">
            We built this for you.
          </h2>
          <p className="text-[#0B3954]/70 text-base leading-relaxed max-w-[520px] mx-auto mb-3">
            Desperately Seeking™ started with a simple idea: buying and selling locally should be easy, safe, and actually fun. Whether you're searching for something special or clearing out your closet, this is your place.
          </p>
          <p className="text-[#0B3954]/60 text-sm leading-relaxed max-w-[480px] mx-auto">
            Buyers post what they need. Sellers show up with what they have. Everyone wins.
          </p>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-background py-14 md:py-20">
        <div className="container mx-auto px-4 max-w-[760px]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-[#e0e0e0] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] text-center"
              >
                <div className="h-12 w-12 rounded-full bg-[#D4AF37]/15 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <h3 className="font-serif font-semibold text-[#0B3954] mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="bg-[#0B3954] py-12 text-center">
        <div className="container mx-auto px-4 max-w-[560px]">
          <p className="font-serif text-xl font-semibold text-white mb-2">Ready to get started?</p>
          <p className="text-white/60 text-sm mb-6">It's free to join and free to browse.</p>
          <Link href="/pricing">
            <button className="rounded-full px-8 py-3 text-sm font-bold bg-[#D4AF37] text-[#0B3954] hover:bg-[#c9a430] transition-colors shadow-[0_6px_16px_rgba(212,175,55,0.35)]">
              See How It Works
            </button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
