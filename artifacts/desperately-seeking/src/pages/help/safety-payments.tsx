import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, ShieldCheck, Banknote, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const QA = [
  {
    icon: CreditCard,
    q: "Why Paying Through the App Is Safer",
    a: "When buyers pay through the app, the sale is automatically recorded. This gives both sides a clear digital receipt, timestamps, and a verified payment trail. It also allows us to step in if something goes wrong and helps keep the marketplace safe and accountable.",
  },
  {
    icon: Banknote,
    q: "Are Cash Sales Allowed?",
    a: "Yes. Buyers and sellers can still use cash for local or porch pickups if they prefer.",
  },
  {
    icon: AlertTriangle,
    q: "Are Cash Sales Protected?",
    a: "Cash sales are allowed, but they aren't covered by our in-app protections. Because the payment happens outside the app, we can't verify the exchange or help resolve payment-related issues.",
  },
  {
    icon: ShieldCheck,
    q: "What Are In-App Protections?",
    a: null,
    list: [
      "A recorded payment",
      "A digital receipt",
      "A clear sale history",
      "Verified buyer and seller accounts",
      "The ability to block or report users",
      "A safer, trackable transaction for both sides",
    ],
    note: "These protections only apply when the buyer pays through the app.",
  },
  {
    icon: CheckCircle2,
    q: "Should I Still Mark a Cash Sale as Sold?",
    a: "Yes. Marking an item as sold keeps your listings organized and helps your account stay accurate, even if the payment was made in person.",
  },
];

export default function HelpSafetyPayments() {
  return (
    <Layout>
      <section className="bg-[#0B3954] text-white py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <Link href="/help" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Help Center
          </Link>
          <span className="block text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-3">Payments</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Safety &amp; Payments</h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
            How payments work, what protections apply, and what to know about cash sales.
          </p>
        </div>
      </section>

      <section className="bg-[#FDF5E6] py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <Accordion type="single" collapsible className="space-y-3">
            {QA.map((item, i) => {
              const Icon = item.icon;
              return (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="rounded-2xl border border-border/60 bg-white px-6 shadow-sm data-[state=open]:shadow-md"
                >
                  <AccordionTrigger className="text-left font-semibold text-[#0B3954] hover:no-underline py-5 gap-3">
                    <span className="flex items-center gap-3">
                      <span className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(11,57,84,0.07)" }}>
                        <Icon className="h-4 w-4 text-[#D4AF37]" />
                      </span>
                      {item.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-5 leading-relaxed pl-12">
                    {item.a && <p>{item.a}</p>}
                    {item.list && (
                      <>
                        <ul className="mt-2 space-y-1.5">
                          {item.list.map((point, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                              {point}
                            </li>
                          ))}
                        </ul>
                        {item.note && (
                          <p className="mt-3 text-[#0B3954]/70 italic">{item.note}</p>
                        )}
                      </>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

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
