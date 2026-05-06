import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Users, MessageSquare, ShieldCheck, CreditCard, AlertTriangle, Package } from "lucide-react";

const TIPS = [
  { icon: MapPin, title: "Meet in a Public Place", body: "Choose a well-lit, busy location like a store parking lot, coffee shop, or police station safe zone. Avoid private homes unless you're doing a porch pickup." },
  { icon: Users, title: "Bring Someone With You", body: "If possible, take a friend or family member along. Extra eyes always help." },
  { icon: MessageSquare, title: "Keep Communication Inside the App", body: "Use the in-app chat so everything stays documented. Avoid giving out your phone number unless you're comfortable." },
  { icon: ShieldCheck, title: "Inspect the Item Before You Confirm", body: "Check the item in person before marking the sale as completed. Make sure it matches the description and condition." },
  { icon: CreditCard, title: "Don't Carry Large Amounts of Cash", body: "Payments should be done inside the app. No cash needed, no awkward exchanges." },
  { icon: AlertTriangle, title: "Trust Your Gut", body: "If something feels off, cancel the meetup. Your safety comes first, always." },
  { icon: Package, title: "Porch Pickup? Keep It Simple", body: "For porch pickups, leave the item in a visible spot and confirm payment through the app. No need for face-to-face if you don't want it." },
];

export default function HelpSafetyTips() {
  return (
    <Layout>
      <section className="bg-[#0B3954] text-white py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <Link href="/help" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Help Center
          </Link>
          <span className="block text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-3">Stay Safe</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Local Pickup Safety Tips</h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
            Most people on Desperately Seeking are just regular buyers and sellers trying to save time. Still, it's always smart to stay safe when meeting someone in person. Here are a few simple tips to keep things smooth and stress-free.
          </p>
        </div>
      </section>

      <section className="bg-[#FDF5E6] py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <div className="space-y-4">
            {TIPS.map((tip, i) => {
              const Icon = tip.icon;
              return (
                <div key={i} className="bg-white rounded-2xl border border-border/60 p-6 shadow-sm flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5" style={{ background: "rgba(11,57,84,0.07)" }}>
                    <Icon className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0B3954] mb-1">{tip.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tip.body}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
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
