import { Layout } from "@/components/layout";
import { useLocation } from "wouter";

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
              Desperately Seeking was created for people who are tired of wasting time scrolling through endless listings. Instead of searching, you simply post what you need — and sellers come to you. It's a faster, cleaner, and more modern way to buy and sell locally.
            </p>
            <p>
              Our goal is simple: make local buying and selling easier, safer, and way less stressful. No more guessing, no more digging, no more dead-end listings. Just real people helping each other find exactly what they're looking for.
            </p>
            <p>
              Whether you're a buyer or a seller, Desperately Seeking keeps things quick, honest, and straightforward. Post it. Match it. Get it done.
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
