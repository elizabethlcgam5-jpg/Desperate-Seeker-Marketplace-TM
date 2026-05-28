import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Ban, ShieldAlert, Lock, Heart } from "lucide-react";

const SECTIONS = [
  {
    icon: ShieldAlert,
    title: "Illegal or Dangerous Items",
    items: [
      "Firearms, guns, or gun parts",
      "Ammunition or explosives",
      "Weapons intended to harm (switchblades, brass knuckles, etc.)",
      "Illegal drugs or controlled substances",
      "Drug paraphernalia",
      "Hazardous materials or chemicals",
    ],
  },
  {
    icon: Ban,
    title: "Stolen or Unauthorized Goods",
    items: [
      "Stolen items of any kind",
      "Items you do not own or do not have permission to sell",
      "Counterfeit or replica products",
      "Fake designer items",
    ],
  },
  {
    icon: Lock,
    title: "Adult or Restricted Content",
    items: [
      "Adult products or explicit materials",
      "Sexual services or content",
      "Items meant for adult use only",
    ],
  },
  {
    icon: Heart,
    title: "Safety & Community Protection",
    items: [
      "Items that promote violence or hate",
      "Items recalled for safety reasons",
      "Items that violate U.S. law or local regulations",
    ],
  },
];

export default function HelpProhibitedItems() {
  return (
    <Layout>
      <section className="bg-[#0B3954] text-white py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <Link
            href="/help"
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Help Center
          </Link>
          <span className="block text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-3">
            Community Standards
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Prohibited Items
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
            To keep our community safe, legal, and welcoming for everyone, the
            following items are not allowed on Desperately Seeking™. Listings
            that include these items will be removed.
          </p>
        </div>
      </section>

      <section className="bg-[#FDF5E6] py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <div className="space-y-6">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="bg-white rounded-2xl border border-border/60 p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-[#D4AF37]" />
                    </div>
                    <h2 className="font-serif text-xl font-bold text-[#0B3954]">
                      {s.title}
                    </h2>
                  </div>
                  <ul className="space-y-2 pl-2">
                    {s.items.map((item) => (
                      <li
                        key={item}
                        className="text-sm text-[#0B3954]/80 leading-relaxed flex gap-2"
                      >
                        <span className="text-[#D4AF37] font-bold mt-0.5">
                          •
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-8 bg-[#0B3954]/5 border border-[#0B3954]/10 rounded-2xl p-6 text-center">
            <p className="text-sm text-[#0B3954]/80 leading-relaxed">
              If a prohibited item is posted, it will be removed. Repeated
              violations may result in account suspension. Our goal is to keep
              Desperately Seeking™ safe, friendly, and trustworthy for
              everyone.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center text-center">
            <Link href="/help">
              <Button
                variant="outline"
                className="rounded-full border-[#0B3954]/20 text-[#0B3954] px-8"
              >
                Back to Help Center
              </Button>
            </Link>
            <Link href="/contact">
              <Button className="rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 px-8">
                Report a Listing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
