import { Layout } from "@/components/layout";
import { ShieldCheck } from "lucide-react";

export default function Privacy() {
  return (
    <Layout>
      <section className="bg-[#0B3954] py-12">
        <div className="container mx-auto px-4 max-w-[760px]">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
            Privacy Policy
          </h1>
          <p className="text-white/70 text-base max-w-[520px]">
            Your privacy matters to us. Here's how we collect and use your information.
          </p>
        </div>
      </section>

      <div className="bg-background flex-1">
        <div className="container max-w-[760px] mx-auto px-4 py-10 md:py-14">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="font-serif text-2xl font-semibold text-[#0B3954]">Privacy Policy</h2>
          </div>

          <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-6 md:p-8 space-y-6 text-sm text-[#0B3954]/75 leading-relaxed">
            <p>Your privacy matters to us. This policy explains how Desperately Seeking™ collects and uses your information.</p>

            <div>
              <p className="font-semibold text-[#0B3954] mb-2">1. Information We Collect</p>
              <ul className="space-y-1.5">
                {[
                  "Email address for account login",
                  "Listings, requests, and messages you create",
                  "Basic device and usage data to improve the platform",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#D4AF37] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-semibold text-[#0B3954] mb-2">2. How We Use Your Information</p>
              <ul className="space-y-1.5">
                {[
                  "To create and manage your account",
                  "To match buyers and sellers",
                  "To send notifications and updates",
                  "To improve marketplace safety and performance",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#D4AF37] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-semibold text-[#0B3954] mb-2">3. Sharing Your Information</p>
              <p className="mb-2">We do not sell your data. We only share information with:</p>
              <ul className="space-y-1.5">
                {[
                  "Payment processors (for subscriptions and sales)",
                  "Shipping carriers (when shipping is used)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#D4AF37] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="font-semibold text-[#0B3954]">4. Data Security — </span>
              We use secure systems to protect your information. No system is 100% secure, but we take reasonable steps to safeguard your data.
            </div>

            <div>
              <span className="font-semibold text-[#0B3954]">5. Your Choices — </span>
              You may update or delete your account at any time.
            </div>

            <p className="pt-4 border-t border-[#e0e0e0] text-[#0B3954]/60">
              For privacy questions, visit our{" "}
              <a href="/contact" className="text-[#0B3954] underline underline-offset-2 hover:text-[#D4AF37] transition-colors">
                contact page
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
