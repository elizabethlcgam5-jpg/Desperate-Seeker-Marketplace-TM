import { Layout } from "@/components/layout";
import { FileText } from "lucide-react";

const TERMS = [
  { n: "1", title: "Marketplace Use", body: "Desperately Seeking™ connects buyers and sellers. We do not own or inspect items listed on the platform." },
  { n: "2", title: "User Accounts", body: "Users must provide accurate information and are responsible for maintaining the security of their account." },
  { n: "3", title: "Listings and Requests", body: "Buyers may post requests for items. Sellers may respond with offers. All communication must remain respectful and lawful." },
  { n: "4", title: "Payments", body: "Payments are processed securely through third-party providers. A 5% platform fee applies to completed sales." },
  { n: "5", title: "Shipping", body: "Sellers may offer local pickup or shipping. Shipping costs are based on real carrier rates." },
  { n: "6", title: "Prohibited Items", body: "Illegal, dangerous, counterfeit, or restricted items are not allowed." },
  { n: "7", title: "Liability", body: "Desperately Seeking™ is not responsible for item quality, delivery issues, or disputes between users." },
  { n: "8", title: "Account Suspension", body: "We may suspend or remove accounts that violate our policies." },
  { n: "9", title: "Changes to Terms", body: "We may update these terms at any time. Continued use of the platform means you accept the updated terms." },
];

export default function Terms() {
  return (
    <Layout>
      <section className="bg-[#0B3954] py-12">
        <div className="container mx-auto px-4 max-w-[760px]">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
            Terms of Use
          </h1>
          <p className="text-white/70 text-base max-w-[520px]">
            By using Desperately Seeking™, you agree to the following terms.
          </p>
        </div>
      </section>

      <div className="bg-background flex-1">
        <div className="container max-w-[760px] mx-auto px-4 py-10 md:py-14">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="font-serif text-2xl font-semibold text-[#0B3954]">Terms of Use</h2>
          </div>

          <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-6 md:p-8 space-y-5 text-sm text-[#0B3954]/75 leading-relaxed">
            <p>Welcome to Desperately Seeking™. By using our platform, you agree to the following terms:</p>

            {TERMS.map((item) => (
              <div key={item.n} className="flex gap-3">
                <span className="flex-shrink-0 font-bold text-[#D4AF37]">{item.n}.</span>
                <div>
                  <span className="font-semibold text-[#0B3954]">{item.title} — </span>
                  {item.body}
                </div>
              </div>
            ))}

            <p className="pt-4 border-t border-[#e0e0e0] text-[#0B3954]/60">
              If you have questions, contact us at{" "}
              <a href="/contact" className="text-[#0B3954] underline underline-offset-2 hover:text-[#D4AF37] transition-colors">
                our contact page
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
