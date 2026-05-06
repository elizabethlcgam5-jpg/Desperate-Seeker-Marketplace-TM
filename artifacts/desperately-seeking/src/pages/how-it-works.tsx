import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  FileText,
  MessageSquare,
  CreditCard,
  Package,
  CheckCircle2,
  ShieldCheck,
  Users,
  Clock,
  Zap,
  MapPin,
  AlertTriangle,
  Star,
} from "lucide-react";

const HOW_IT_WORKS = [
  {
    icon: FileText,
    title: "Buyers Post What They Need",
    body: "Tell the community exactly what you're looking for. Be specific so sellers know if they have it.",
  },
  {
    icon: Users,
    title: "Sellers Respond With Matches",
    body: "Sellers check your post and reply if they have the item. No more digging through old listings — the right items come straight to you.",
  },
  {
    icon: MessageSquare,
    title: "Chat, Ask Questions, and Confirm",
    body: "Buyers and sellers can message each other to confirm details, ask questions, or negotiate before buying.",
  },
  {
    icon: CreditCard,
    title: "Pay Inside the App",
    body: "Once you're ready, the buyer pays through the app. This keeps everything safe and makes sure the sale is recorded.",
  },
  {
    icon: Package,
    title: "Pick Up or Get It Shipped",
    body: "You can meet locally, do a porch pickup, or have the seller ship the item. Whatever works best.",
  },
  {
    icon: CheckCircle2,
    title: "Sale Completed",
    body: "After payment, the seller gets their payout and the buyer gets their item. Easy, clean, and no confusion.",
  },
];

const SELLER_RULES = [
  { title: "Only Respond If You Really Have the Item", body: "Buyers post exactly what they need. Please only reply if you actually have the item and it matches what they're asking for." },
  { title: "Be Honest About Condition", body: "List the real condition — new, like new, good, fair, or needs work. No surprises when the buyer shows up." },
  { title: "Communicate Clearly", body: "Answer questions, send photos if needed, and keep things simple. Good communication makes the sale faster." },
  { title: "Use In-App Payments", body: "All sales should be completed inside the app. This protects both sides and makes sure the sale is recorded properly." },
  { title: "Be On Time for Meet-Ups", body: "If you're doing a local pickup or meet-up, be reliable. Let the buyer know if you're running late or need to reschedule." },
  { title: "No Spam or Fake Listings", body: "Only post real items you actually have. No scams, no fake posts, no misleading photos." },
  { title: "Respect the Buyer", body: "Everyone's here to save time. Be polite, be fair, and keep things simple." },
];

const BUYER_RULES = [
  { title: "Post What You Really Need", body: "Be clear about what you're looking for. The more details you give, the faster sellers can match you with the right item." },
  { title: "Respond to Sellers", body: "If a seller reaches out with something that fits your request, reply back. Even a quick 'No thanks' helps keep things moving." },
  { title: "Ask Questions Before You Buy", body: "Need more photos? Want to confirm the condition? Ask before paying so there are no surprises later." },
  { title: "Pay Inside the App", body: "Always complete your payment through the app. It keeps the transaction safe and makes sure everything is recorded properly." },
  { title: "Be On Time for Pickups", body: "If you're meeting a seller or doing a porch pickup, be reliable. Let them know if you're running late or need to change the time." },
  { title: "No Lowballing or Harassment", body: "Negotiate respectfully. No rude messages, no pressure, no disrespect. Everyone's here to save time, not deal with drama." },
  { title: "Confirm the Sale When You Get the Item", body: "Once you've picked up or received your item, mark the sale as completed so the seller gets their payout." },
];

const WHY_DIFFERENT = [
  { icon: Zap, title: "Buyers Don't Search — They Post", body: "Instead of digging through thousands of listings, buyers simply post what they need. Sellers come to them. It's faster, cleaner, and way less stressful." },
  { icon: CheckCircle2, title: "Sellers Only Respond If They Have It", body: "No random listings. No guessing. Sellers reply only when they actually have the item the buyer wants. It cuts out all the noise." },
  { icon: Clock, title: "No Endless Scrolling", body: "Other marketplaces make you scroll forever. Desperately Seeking flips the script — the right items find you." },
  { icon: CreditCard, title: "Simple, Safe Payments", body: "All payments go through the app. No cash, no Zelle, no \"meet me at the ATM.\" It keeps things safe and makes every sale trackable." },
  { icon: Package, title: "Local or Shipped — Your Choice", body: "Meet up, porch pickup, or shipping. Whatever works best for you. The app supports all of it." },
  { icon: Star, title: "Built Around Real-Life Complaints", body: "We listened to what people hate about other marketplaces — scams, ghosting, endless scrolling, no-shows — and built something better." },
  { icon: Users, title: "Designed to Save Time", body: "Everything about Desperately Seeking is made to be quick, simple, and easy. No drama. No confusion. Just results." },
];

const SAFETY_TIPS = [
  { icon: MapPin, title: "Meet in a Public Place", body: "Choose a well-lit, busy location like a store parking lot, coffee shop, or police station safe zone. Avoid private homes unless you're doing a porch pickup." },
  { icon: Users, title: "Bring Someone With You", body: "If possible, take a friend or family member along. Extra eyes always help." },
  { icon: MessageSquare, title: "Keep Communication Inside the App", body: "Use the in-app chat so everything stays documented. Avoid giving out your phone number unless you're comfortable." },
  { icon: ShieldCheck, title: "Inspect the Item Before You Confirm", body: "Check the item in person before marking the sale as completed. Make sure it matches the description and condition." },
  { icon: CreditCard, title: "Don't Carry Large Amounts of Cash", body: "Payments should be done inside the app. No cash needed, no awkward exchanges." },
  { icon: AlertTriangle, title: "Trust Your Gut", body: "If something feels off, cancel the meetup. Your safety comes first, always." },
  { icon: Package, title: "Porch Pickup? Keep It Simple", body: "For porch pickups, leave the item in a visible spot and confirm payment through the app. No need for face-to-face if you don't want it." },
];

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-10 text-center">
      <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-3">{label}</span>
      <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#0B3954]">{title}</h2>
    </div>
  );
}

function NumberedCard({ number, title, body }: { number: number; title: string; body: string }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-9 h-9 rounded-full bg-[#D4AF37]/20 flex items-center justify-center font-serif font-bold text-[#D4AF37] text-sm mt-0.5">
        {number}
      </div>
      <div>
        <p className="font-semibold text-[#0B3954] mb-1">{title}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function IconCard({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <div className="bg-white rounded-2xl border border-border/60 p-5 shadow-sm flex gap-4">
      <div className="shrink-0 w-10 h-10 rounded-xl bg-[#0B3954]/8 flex items-center justify-center mt-0.5" style={{ background: "rgba(11,57,84,0.07)" }}>
        <Icon className="h-5 w-5 text-[#D4AF37]" />
      </div>
      <div>
        <p className="font-semibold text-[#0B3954] mb-1">{title}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-[#0B3954] text-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-4">The Platform</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-5">How Desperately Seeking Works</h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-2xl mx-auto">
            Desperately Seeking is built to save you time. Instead of scrolling through endless listings, you just post what you need — and sellers come to you. It's simple, fast, and made for people who don't want to waste their day searching.
          </p>
        </div>
      </section>

      {/* How it works — numbered steps */}
      <section className="bg-[#FDF5E6] py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <SectionHeader label="Step by Step" title="How It Works" />
          <div className="grid sm:grid-cols-2 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border/60 p-6 shadow-sm flex gap-4">
                <div className="shrink-0 w-9 h-9 rounded-full bg-[#D4AF37]/20 flex items-center justify-center font-serif font-bold text-[#D4AF37] text-sm mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="font-semibold text-[#0B3954] mb-1">{step.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Different */}
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <SectionHeader label="What Sets Us Apart" title="Why Desperately Seeking Is Different" />
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Desperately Seeking isn't just another marketplace. It's built for people who are tired of wasting time scrolling, searching, and dealing with dead-end listings.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {WHY_DIFFERENT.map((item, i) => (
              <IconCard key={i} icon={item.icon} title={item.title} body={item.body} />
            ))}
          </div>
        </div>
      </section>

      {/* Seller Rules + Buyer Rules side by side on desktop */}
      <section className="bg-[#FDF5E6] py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <SectionHeader label="Community Guidelines" title="Rules & Expectations" />
          <div className="grid md:grid-cols-2 gap-8">
            {/* Seller */}
            <div className="bg-white rounded-2xl border border-border/60 p-7 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#0B3954]/10 flex items-center justify-center">
                  <Star className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0B3954]">Seller Rules</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Desperately Seeking is built to make selling simple. These quick guidelines help keep things smooth, safe, and fair for everyone.
              </p>
              <div className="space-y-5">
                {SELLER_RULES.map((rule, i) => (
                  <NumberedCard key={i} number={i + 1} title={rule.title} body={rule.body} />
                ))}
              </div>
            </div>

            {/* Buyer */}
            <div className="bg-white rounded-2xl border border-border/60 p-7 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#0B3954]/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0B3954]">Buyer Rules</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Desperately Seeking is all about saving time. These quick guidelines help keep things smooth, safe, and easy for everyone.
              </p>
              <div className="space-y-5">
                {BUYER_RULES.map((rule, i) => (
                  <NumberedCard key={i} number={i + 1} title={rule.title} body={rule.body} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <SectionHeader label="Stay Safe" title="Local Pickup Safety Tips" />
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Most people on Desperately Seeking are just regular buyers and sellers trying to save time. Still, it's always smart to stay safe when meeting someone in person.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {SAFETY_TIPS.map((tip, i) => (
              <IconCard key={i} icon={tip.icon} title={tip.title} body={tip.body} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0B3954] py-14 text-center">
        <div className="container mx-auto px-4 max-w-xl">
          <h2 className="font-serif text-3xl font-bold text-white mb-3">Ready to get started?</h2>
          <p className="text-white/70 mb-8">Post your first request free. No scrolling required.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/requests/new">
              <Button size="lg" className="rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 px-8">
                Post What You Need
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10 px-8">
                See Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
