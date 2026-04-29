import { Layout } from "@/components/layout";
import { Check } from "lucide-react";
import { useLocation } from "wouter";

const MISSION_ITEMS = [
  "Sellers keep more of their earnings",
  "Buyers find what they need quickly",
  "Everyone feels safe and supported",
];

export default function About() {
  const [_, setLocation] = useLocation();

  return (
    <Layout>
      <section className="bg-[#0B3954] py-12">
        <div className="container mx-auto px-4 max-w-[760px]">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
            About Desperately Seeking
          </h1>
          <p className="text-white/70 text-base max-w-[520px]">
            A buyer-first, seller-friendly marketplace built for real people.
          </p>
        </div>
      </section>

      <div className="bg-background flex-1">
        <div className="container max-w-[760px] mx-auto px-4 py-10 md:py-14 space-y-8">

          <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-6 md:p-8 space-y-5 text-sm text-[#0B3954]/75 leading-relaxed">
            <p>
              Desperately Seeking is a buyer-first, seller-friendly marketplace built for real people who want a simple, safe, and affordable way to buy and sell locally.
            </p>
            <p>
              We believe selling shouldn't be complicated — or expensive. That's why we charge a flat 5% fee, with no ads, no bumps, and no hidden costs.
            </p>

            <div>
              <p className="font-semibold text-[#0B3954] mb-3">Our mission is to create a marketplace where:</p>
              <ul className="space-y-2">
                {MISSION_ITEMS.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#D4AF37] mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p>
              Whether you're decluttering, reselling, or searching for something specific, Desperately Seeking makes the process easy, transparent, and fair.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setLocation("/browse")}
              className="rounded-full px-6 py-2.5 text-sm font-semibold bg-[#D4AF37] text-[#0B3954] border-0 cursor-pointer hover:bg-[#c9a430] transition-colors"
            >
              Browse requests
            </button>
            <button
              onClick={() => setLocation("/contact")}
              className="rounded-full px-6 py-2.5 text-sm font-semibold border border-[#0B3954]/20 text-[#0B3954] bg-white cursor-pointer hover:bg-[#0B3954]/5 transition-colors"
            >
              Contact us
            </button>
          </div>

        </div>
      </div>
    </Layout>
  );
}
