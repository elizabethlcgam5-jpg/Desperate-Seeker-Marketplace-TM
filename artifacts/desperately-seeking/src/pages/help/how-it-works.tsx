import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Users, MessageSquare, CreditCard, Package, CheckCircle2 } from "lucide-react";

const STEPS = [
  { icon: FileText, title: "Buyers Post What They Need", body: "Tell the community exactly what you're looking for. Be specific so sellers know if they have it." },
  { icon: Users, title: "Sellers Respond With Matches", body: "Sellers check your post and reply if they have the item. No more digging through old listings — the right items come straight to you." },
  { icon: MessageSquare, title: "Chat, Ask Questions, and Confirm", body: "Buyers and sellers can message each other to confirm details, ask questions, or negotiate before buying." },
  { icon: CreditCard, title: "Pay Inside the App", body: "Once you're ready, the buyer pays through the app. This keeps everything safe and ensures the payment is recorded." },
  { icon: Package, title: "Pick Up or Get It Shipped", body: "You can meet locally, do a porch pickup, or have the seller ship the item. Whatever works best." },
  { icon: CheckCircle2, title: "Sale Completed", body: "After payment, the seller gets their payout and the buyer gets their item. Easy, clean, and no confusion." },
];

export default function HelpHowItWorks() {
  return (
    <Layout>
      <section className="bg-[#0B3954] text-white py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <Link href="/help" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Help Center
          </Link>
          <span className="block text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-3">Step by Step</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">How Desperately Seeking™ Works</h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
            Desperately Seeking™ is built to save you time. Instead of scrolling through endless listings, you just post what you need — and sellers come to you. It's simple, fast, and made for people who don't want to waste their day searching.
          </p>
        </div>
      </section>

      <section className="bg-[#FDF5E6] py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <div className="space-y-5">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="bg-white rounded-2xl border border-border/60 p-6 shadow-sm flex gap-5">
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/15 flex items-center justify-center font-serif font-bold text-[#D4AF37]">
                      {i + 1}
                    </div>
                    {i < STEPS.length - 1 && <div className="w-px flex-1 bg-border/60 min-h-[24px]" />}
                  </div>
                  <div className="pb-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className="h-4 w-4 text-[#D4AF37]" />
                      <p className="font-semibold text-[#0B3954]">{step.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link href="/requests/new">
              <Button className="rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 px-8">
                Post What You Need
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
