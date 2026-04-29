import { Layout } from "@/components/layout";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    q: "What is Desperately Seeking?",
    a: "A buyer-first marketplace where buyers post what they need and sellers respond with offers.",
  },
  {
    q: "How do I post a request?",
    a: 'Tap "Post What You Need," describe the item, add photos (optional), and submit.',
  },
  {
    q: "How do sellers get notified?",
    a: "Sellers receive instant Match Alerts when a buyer posts something they offer.",
  },
  {
    q: "Is it free to use?",
    a: "Yes. Everyone can join for free. Sellers get 2 free listings before choosing a subscription.",
  },
  {
    q: "Why is there a 5% platform fee?",
    a: "This small fee keeps the marketplace running, supports safety features, and helps us build new tools.",
  },
  {
    q: "How does shipping work?",
    a: "Sellers can offer local pickup or shipping. Shipping uses real carrier rates based on weight and distance.",
  },
  {
    q: "Do I need an account?",
    a: "Yes. A simple email sign-in helps you track your listings, messages, and subscription.",
  },
  {
    q: "What's the difference between monthly and yearly Premium?",
    a: "Monthly is great for casual sellers. Yearly saves over 60% and includes priority support and early access to new features.",
  },
  {
    q: "Is Desperately Seeking safe?",
    a: "We use secure messaging, email verification, and community guidelines to keep buyers and sellers safe.",
  },
];

export default function FAQ() {
  return (
    <Layout>
      <section className="bg-[#0B3954] py-12">
        <div className="container mx-auto px-4 max-w-[760px]">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-white/70 text-base max-w-[520px]">
            Everything you need to know about Desperately Seeking.
          </p>
        </div>
      </section>

      <div className="bg-background flex-1">
        <div className="container max-w-[760px] mx-auto px-4 py-10 md:py-14">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="font-serif text-2xl font-semibold text-[#0B3954]">Common Questions</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-xl border border-[#e0e0e0] bg-white px-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] data-[state=open]:shadow-md"
              >
                <AccordionTrigger className="text-left text-sm font-medium text-[#0B3954] hover:no-underline py-4">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="mt-10 text-sm text-muted-foreground text-center">
            Still have questions?{" "}
            <a href="/contact" className="text-[#0B3954] underline underline-offset-2 hover:text-[#D4AF37] transition-colors">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
