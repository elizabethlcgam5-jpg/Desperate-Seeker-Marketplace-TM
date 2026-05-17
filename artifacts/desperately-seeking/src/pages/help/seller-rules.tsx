import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const RULES = [
  "Only list items you actually own and are ready to sell.",
  "Be honest — describe your items accurately, including any flaws or damage.",
  "Price your items fairly and update listings when items sell.",
  "Respond to buyers in a timely manner. A little communication goes a long way.",
  "Honor your commitments — if you agree to a sale, follow through.",
  "No prohibited items. See our full list of restricted items in the Help Center.",
  "Keep it friendly. Treat every buyer the way you'd want to be treated.",
];

export default function HelpSellerRules() {
  return (
    <Layout>
      <section className="bg-[#0B3954] text-white py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <Link href="/help" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Help Center
          </Link>
          <span className="block text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-3">For Sellers</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">A few simple rules to keep our community great.</h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
            We want buying and selling here to feel safe, fair, and fun for everyone. Here's what we ask of all sellers:
          </p>
        </div>
      </section>

      <section className="bg-[#FDF5E6] py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <div className="space-y-4">
            {RULES.map((rule, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border/60 p-6 shadow-sm flex gap-4">
                <div className="shrink-0 w-9 h-9 rounded-full bg-[#D4AF37]/15 flex items-center justify-center font-serif font-bold text-[#D4AF37] text-sm mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-[#0B3954]/80 leading-relaxed self-center">{rule}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm text-center text-muted-foreground leading-relaxed">
            Sellers who repeatedly violate these rules may have their listings removed or their account suspended. Thanks for being a great community member!
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center text-center">
            <Link href="/listings/new">
              <Button className="rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 px-8">
                Got It, Let's Sell!
              </Button>
            </Link>
            <Link href="/help">
              <Button variant="outline" className="rounded-full border-[#0B3954]/20 text-[#0B3954] px-8">
                Back to Help Center
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
