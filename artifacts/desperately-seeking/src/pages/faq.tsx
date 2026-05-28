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
    q: "What does the subscription include?",
    a: "With a subscription, you can list unlimited items, get a Seller badge on your profile, and access exclusive features like promoted listings.",
  },
  {
    q: "How much does it cost?",
    a: "You can subscribe for just $1.99/month or save 37% with our yearly plan at $14.99/year. Cancel anytime.",
  },
  {
    q: "Can I try it before I subscribe?",
    a: "Yes! You can browse and buy for free. When you're ready to start selling, choose the plan that works best for you.",
  },
  {
    q: "How do I cancel?",
    a: "You can cancel anytime from your Desperately Seeking™ account settings. Your subscription will stay active until the end of your current billing period.",
  },
  {
    q: "Is my payment info safe?",
    a: "Absolutely. All payments are processed securely through your app store — we never store your payment details.",
  },
  {
    q: "What is Local Pickup?",
    a: "Local Pickup lets you arrange to meet a buyer in person to hand off your item.",
  },
  {
    q: "What is Porch Pickup?",
    a: "Porch Pickup lets you leave an item on your porch for the buyer to grab — no need to be home.",
  },
  {
    q: "Can I pay inside the app?",
    a: "Yes! Send and receive payments right in the app using our secure in-app payment system.",
  },
  {
    q: "What are Buyer and Seller tags?",
    a: "Tags show on profiles so everyone knows how active someone is. They help build trust.",
  },
  {
    q: "What are Chat Safety Options?",
    a: "They let you report, block, or flag a user directly from your conversation.",
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
            Everything you need to know about Desperately Seeking™.
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
