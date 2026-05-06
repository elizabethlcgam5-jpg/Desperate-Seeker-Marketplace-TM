import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const RULES = [
  { title: "Only Respond If You Really Have the Item", body: "Buyers post exactly what they need. Please only reply if you actually have the item and it matches what they're asking for." },
  { title: "Be Honest About Condition", body: "List the real condition — new, like new, good, fair, or needs work. No surprises when the buyer shows up." },
  { title: "Communicate Clearly", body: "Answer questions, send photos if needed, and keep things simple. Good communication makes the sale faster." },
  { title: "Use In-App Payments", body: "All sales should be completed inside the app. This protects both sides and makes sure the sale is recorded properly." },
  { title: "Be On Time for Meet-Ups", body: "If you're doing a local pickup or meet-up, be reliable. Let the buyer know if you're running late or need to reschedule." },
  { title: "No Spam or Fake Listings", body: "Only post real items you actually have. No scams, no fake posts, no misleading photos." },
  { title: "Respect the Buyer", body: "Everyone's here to save time. Be polite, be fair, and keep things simple." },
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
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Seller Rules & Expectations</h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
            Desperately Seeking is built to make selling simple. These quick guidelines help keep things smooth, safe, and fair for everyone using the app.
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
            <Link href="/listings/new">
              <Button className="rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 px-8">
                Post a Listing
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
