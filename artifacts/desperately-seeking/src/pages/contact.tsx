import { Layout } from "@/components/layout";
import { Mail, MessageCircle, Clock } from "lucide-react";

export default function Contact() {
  return (
    <Layout>
      <section className="bg-[#0B3954] py-12">
        <div className="container mx-auto px-4 max-w-[760px]">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
            Contact Us
          </h1>
          <p className="text-white/70 text-base max-w-[520px]">
            We'd love to hear from you. Reach out any time.
          </p>
        </div>
      </section>

      <div className="bg-background flex-1">
        <div className="container max-w-[760px] mx-auto px-4 py-10 md:py-14 space-y-6">

          {/* Primary contact card */}
          <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-8 md:p-10 text-center">
            <div className="h-14 w-14 rounded-full bg-[#D4AF37]/15 flex items-center justify-center mx-auto mb-5">
              <Mail className="h-7 w-7 text-[#D4AF37]" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-[#0B3954] mb-2">
              Get in Touch
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6 leading-relaxed">
              Have a question, a problem, or just want to say hello? Send us an email and we'll get back to you as soon as possible.
            </p>
            <a
              href="mailto:support@desperatelyseekingmarketplace.com"
              className="inline-flex items-center gap-2 rounded-full bg-[#0B3954] text-white font-semibold px-7 py-3 text-sm hover:bg-[#0B3954]/90 transition-colors shadow-[0_4px_12px_rgba(11,57,84,0.25)]"
            >
              <Mail className="h-4 w-4" />
              support@desperatelyseekingmarketplace.com
            </a>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-[#e0e0e0] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="h-10 w-10 rounded-full bg-[#0B3954]/8 flex items-center justify-center mb-4">
                <Clock className="h-5 w-5 text-[#0B3954]" />
              </div>
              <h3 className="font-semibold text-[#0B3954] mb-1">Response Time</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We typically reply within 24 hours on business days.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#e0e0e0] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="h-10 w-10 rounded-full bg-[#0B3954]/8 flex items-center justify-center mb-4">
                <MessageCircle className="h-5 w-5 text-[#0B3954]" />
              </div>
              <h3 className="font-semibold text-[#0B3954] mb-1">What to Include</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your account email and a short description of your question or issue helps us help you faster.
              </p>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
