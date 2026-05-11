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
    a: "A simple, buyer-first marketplace where you post what you need, and sellers come to you.",
  },
  {
    q: "How does it work?",
    a: "You post what you're looking for. Sellers nearby see your request and respond if they have it.",
  },
  {
    q: "Is it free to use?",
    a: "Yes. Browsing and posting requests are always free for buyers.",
  },
  {
    q: "How much does it cost to sell?",
    a: "Sellers can post two items for free. After that, you can choose a monthly or yearly plan if you want to keep selling.",
  },
  {
    q: "Is 5% really the only fee?",
    a: "Yes. Most marketplaces charge 10–20% plus extra fees. We keep it simple with one small 5% fee on completed sales — no surprises.",
  },
  {
    q: "Why do sellers pay a subscription after two items?",
    a: "It keeps the platform clean, reduces spam, and makes sure real sellers get real buyers.",
  },
  {
    q: "Do buyers pay anything?",
    a: "No. Buyers only pay for the items they choose to buy.",
  },
  {
    q: "How do I post what I need?",
    a: "Tap Post What You Need, add a photo or description, and you're done.",
  },
  {
    q: "How do I start selling?",
    a: "Tap Start Selling, upload your item, and post it. Your first two listings are free.",
  },
  {
    q: "What is InstantMatch?",
    a: "InstantMatch notifies buyers the moment you post an item that matches their request. You can turn it on or off anytime.",
  },
  {
    q: "Do I have to meet in person?",
    a: "Most people choose local pickup, but you can arrange whatever works best for both sides.",
  },
  {
    q: "Is Desperately Seeking safe?",
    a: "Yes. We encourage meeting in public places, checking profiles, and trusting your instincts.",
  },
  {
    q: "Can I delete my posts?",
    a: "Yes. You can remove any request or item at any time from your profile.",
  },
  {
    q: "What if I can't find what I need?",
    a: "Post a request — sellers will come to you.",
  },
  {
    q: "What if I don't get any responses?",
    a: "Try adding a photo or more details. Sometimes sellers need a little more info.",
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
