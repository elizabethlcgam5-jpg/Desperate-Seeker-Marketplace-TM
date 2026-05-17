import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, MapPin, AlertTriangle } from "lucide-react";

export default function HelpSafetyPayments() {
  return (
    <Layout>
      <section className="bg-[#0B3954] text-white py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <Link href="/help" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Help Center
          </Link>
          <span className="block text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-3">Payments & Safety</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Your safety comes first.</h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
            We've built tools to help you buy and sell with confidence.
          </p>
        </div>
      </section>

      <section className="bg-[#FDF5E6] py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl space-y-5">

          {/* Safe, Secure Payments */}
          <div className="bg-white rounded-2xl border border-border/60 p-6 shadow-sm flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5" style={{ background: "rgba(11,57,84,0.07)" }}>
              <ShieldCheck className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="font-semibold text-[#0B3954] mb-2">Safe, Secure Payments</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pay and get paid directly in the app. Our in-app payment system is encrypted and secure — no cash required, no third-party apps needed. Both buyers and sellers are protected on every transaction.
              </p>
            </div>
          </div>

          {/* Smart Meetup Tips */}
          <div className="bg-white rounded-2xl border border-border/60 p-6 shadow-sm flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5" style={{ background: "rgba(11,57,84,0.07)" }}>
              <MapPin className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="font-semibold text-[#0B3954] mb-3">Smart Meetup Tips</p>
              <ul className="space-y-2">
                {[
                  "Always meet in a public, well-lit place.",
                  "Bring a friend if you can.",
                  "Let someone know where you're going.",
                  "Trust your gut — if something feels off, don't go.",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* See Something? Say Something. */}
          <div className="bg-white rounded-2xl border border-border/60 p-6 shadow-sm flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5" style={{ background: "rgba(11,57,84,0.07)" }}>
              <AlertTriangle className="h-5 w-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="font-semibold text-[#0B3954] mb-2">See Something? Say Something.</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If a listing or user feels suspicious, you can report it right from the app. Our team reviews every report and takes action quickly.
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center text-center">
            <Link href="/help/safety-tips">
              <Button className="rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 px-8">
                Learn More About Safety
              </Button>
            </Link>
            <Link href="/help">
              <Button variant="outline" className="rounded-full border-[#0B3954]/20 text-[#0B3954] px-8">
                Back to Help Center
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
