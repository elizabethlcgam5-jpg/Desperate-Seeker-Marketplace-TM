import { Layout } from "@/components/layout";
import { Mail } from "lucide-react";

export default function Contact() {
  return (
    <Layout>
      <section className="bg-[#0B3954] py-12">
        <div className="container mx-auto px-4 max-w-[760px]">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
            Contact Us
          </h1>
          <p className="text-white/70 text-base max-w-[520px]">
            We'd love to hear from you.
          </p>
        </div>
      </section>

      <div className="bg-background flex-1">
        <div className="container max-w-[760px] mx-auto px-4 py-10 md:py-14">
          <div className="bg-white rounded-xl border border-[#e0e0e0] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-8 md:p-12 text-center">
            <div className="h-14 w-14 rounded-full bg-[#0B3954]/8 flex items-center justify-center mx-auto mb-5">
              <Mail className="h-7 w-7 text-[#0B3954]" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-[#0B3954] mb-2">
              Business email coming soon
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Our contact details will be listed here once we have a dedicated business email set up. Check back soon.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
