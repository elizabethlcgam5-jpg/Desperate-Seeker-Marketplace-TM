import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const RULES = [
  { title: "Post What You Really Need", body: "Be clear about what you're looking for. The more details you give, the faster sellers can match you with the right item." },
  { title: "Respond to Sellers", body: "If a seller reaches out with something that fits your request, reply back. Even a quick 'No thanks' helps keep things moving." },
  { title: "Ask Questions Before You Buy", body: "Need more photos? Want to confirm the condition? Ask before paying so there are no surprises later." },
  { title: "Pay Inside the App", body: "Once you're ready, the buyer pays through the app. This keeps everything safe and ensures the payment is recorded." },
  { title: "Be On Time for Pickups", body: "If you're meeting a seller or doing a porch pickup, be reliable. Let them know if you're running late or need to change the time." },
  { title: "No Lowballing or Harassment", body: "Negotiate respectfully. No rude messages, no pressure, no disrespect. Everyone's here to save time, not deal with drama." },
  { title: "Confirm the Sale When You Get the Item", body: "Once you've picked up or received your item, mark the sale as completed so the seller gets their payout." },
];

export default function HelpBuyerRules() {
  return (
    <Layout>
      <section className="bg-[#0B3954] text-white py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <Link href="/help" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Help Center
          </Link>
          <span className="block text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-3">For Buyers</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Buyer Rules & Expectations</h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
            Desperately Seeking is all about saving time. These quick guidelines help keep things smooth, safe, and easy for everyone using the app.
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
                <div>
                  <p className="font-semibold text-[#0B3954] mb-1">{rule.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{rule.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-3 justify-center text-center">
            <Link href="/requests/new">
              <Button className="rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 px-8">
                Post a Request
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
