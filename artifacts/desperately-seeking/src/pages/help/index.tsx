import { Layout } from "@/components/layout";
import { Link } from "wouter";
import {
  Zap,
  ShieldCheck,
  Users,
  Star,
  MapPin,
  CreditCard,
  ArrowRight,
} from "lucide-react";

const SECTIONS = [
  {
    href: "/help/how-it-works",
    icon: Zap,
    label: "How It Works",
    desc: "Step-by-step walkthrough of the buyer-first marketplace — from posting a request to completing the sale.",
    color: "bg-[#0B3954]/8",
  },
  {
    href: "/help/seller-rules",
    icon: Star,
    label: "Seller Rules & Expectations",
    desc: "Everything sellers need to know to respond correctly, communicate well, and close sales smoothly.",
    color: "bg-[#D4AF37]/10",
  },
  {
    href: "/help/buyer-rules",
    icon: Users,
    label: "Buyer Rules & Expectations",
    desc: "Guidelines for buyers on how to post clear requests, respond to sellers, and complete purchases safely.",
    color: "bg-emerald-50",
  },
  {
    href: "/help/why-different",
    icon: ShieldCheck,
    label: "Why Desperately Seeking™ Is Different",
    desc: "What sets this platform apart from every other marketplace — and why that matters for you.",
    color: "bg-purple-50",
  },
  {
    href: "/help/safety-tips",
    icon: MapPin,
    label: "Local Pickup Safety Tips",
    desc: "Simple, practical tips for staying safe when meeting buyers or sellers in person.",
    color: "bg-rose-50",
  },
  {
    href: "/help/safety-payments",
    icon: CreditCard,
    label: "Safety & Payments",
    desc: "How payments work, what protections apply, and what to know about cash sales.",
    color: "bg-amber-50",
  },
];

export default function HelpCenter() {
  return (
    <Layout>
      <section className="bg-[#0B3954] text-white py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-4">Support</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-xl mx-auto">
            Everything you need to know about using Desperately Seeking™ — for buyers, sellers, and everyone in between.
          </p>
        </div>
      </section>

      <section className="bg-[#FDF5E6] py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="grid sm:grid-cols-2 gap-5">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <Link key={s.href} href={s.href} className="group block">
                  <div className="h-full bg-white rounded-2xl border border-border/60 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center mb-4`}>
                      <Icon className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <h2 className="font-serif text-lg font-bold text-[#0B3954] mb-2 group-hover:text-[#D4AF37] transition-colors">
                      {s.label}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{s.desc}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B3954]/60 group-hover:text-[#D4AF37] transition-colors">
                      Read more <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
