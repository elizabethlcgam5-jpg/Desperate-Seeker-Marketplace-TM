import { Layout } from "@/components/layout";
import { useLocation } from "wouter";

export default function About() {
  const [_, setLocation] = useLocation();

  return (
    <Layout>
      <section className="bg-[#0B3954] py-12">
        <div className="container mx-auto px-4 max-w-[760px]">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
            Our Story
          </h1>
          <p className="text-white/70 text-base max-w-[520px]">
            How Desperately Seeking™ came to be — and why we built it differently.
          </p>
        </div>
      </section>

      <div className="bg-background flex-1">
        <div className="container max-w-[760px] mx-auto px-4 py-10 md:py-14 space-y-8">

          <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-6 md:p-8 space-y-5 text-sm text-[#0B3954]/75 leading-relaxed">
            <p>
              Desperately Seeking™ started with a simple idea: people shouldn't have to waste time searching for the things they need. After years of using marketplaces that felt overwhelming and outdated, we wanted something better — something built around real life and real people.
            </p>
            <p>
              We noticed the same problem everywhere. Too much scrolling. Too many dead-end listings. Too many messages that went nowhere. So we flipped the process. Instead of searching, buyers post what they need and let the right sellers come to them.
            </p>
            <p>
              Desperately Seeking™ was created to make buying and selling feel easier, faster, and more human. It's a place where people can help each other find what they're looking for without all the frustration.
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
