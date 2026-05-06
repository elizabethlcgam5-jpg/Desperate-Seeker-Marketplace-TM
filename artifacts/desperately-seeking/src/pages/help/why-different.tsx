import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, CheckCircle2, Clock, CreditCard, Package, Star, Users } from "lucide-react";

const POINTS = [
  { icon: Zap, title: "Buyers Don't Search — They Post", body: "Instead of digging through thousands of listings, buyers simply post what they need. Sellers come to them. It's faster, cleaner, and way less stressful." },
  { icon: CheckCircle2, title: "Sellers Only Respond If They Have It", body: "No random listings. No guessing. Sellers reply only when they actually have the item the buyer wants. It cuts out all the noise." },
  { icon: Clock, title: "No Endless Scrolling", body: "Other marketplaces make you scroll forever. Desperately Seeking flips the script — the right items find you." },
  { icon: CreditCard, title: "Simple, Safe Payments", body: "All payments go through the app. No cash, no Zelle, no 'meet me at the ATM.' It keeps things safe and makes every sale trackable." },
  { icon: Package, title: "Local or Shipped — Your Choice", body: "Meet up, porch pickup, or shipping. Whatever works best for you. The app supports all of it." },
  { icon: Star, title: "Built Around Real-Life Complaints", body: "We listened to what people hate about other marketplaces — scams, ghosting, endless scrolling, no-shows — and built something better." },
  { icon: Users, title: "Designed to Save Time", body: "Everything about Desperately Seeking is made to be quick, simple, and easy. No drama. No confusion. Just results." },
];

export default function HelpWhyDifferent() {
  return (
    <Layout>
      <section className="bg-[#0B3954] text-white py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <Link href="/help" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Help Center
          </Link>
          <span className="block text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-3">What Sets Us Apart</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Why Desperately Seeking Is Different</h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
            Desperately Seeking isn't just another marketplace. It's built for people who are tired of wasting time scrolling, searching, and dealing with dead-end listings.
          </p>
        </div>
      </section>

      <section className="bg-[#FDF5E6] py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <div className="space-y-4">
            {POINTS.map((point, i) => {
              const Icon = point.icon;
              return (
                <div key={i} className="bg-white rounded-2xl border border-border/60 p-6 shadow-sm flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5" style={{ background: "rgba(11,57,84,0.07)" }}>
                    <Icon className="h-5 w-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#0B3954] mb-1">{point.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{point.body}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-3 justify-center text-center">
            <Link href="/requests/new">
              <Button className="rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 px-8">
                Try It Yourself
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
