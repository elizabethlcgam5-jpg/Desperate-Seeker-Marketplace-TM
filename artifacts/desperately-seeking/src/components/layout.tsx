import { ReactNode } from "react";
import { Header } from "./header";
import { FeedbackWidget } from "./feedback-widget";
import { Link } from "wouter";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background font-sans">
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      <footer className="border-t bg-[#0B3954] text-white/60">
        <div className="container mx-auto px-4 py-10 md:py-12">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div className="max-w-xs">
              <p className="font-serif text-lg font-semibold text-white mb-2">Desperately Seeking</p>
              <p className="text-sm leading-relaxed">
                Post what you need. Help comes to you. The buyer-first local marketplace.
              </p>
              <p className="text-xs mt-4">&copy; {new Date().getFullYear()} Desperately Seeking. All rights reserved.</p>
            </div>
            <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            </nav>
          </div>
        </div>
      </footer>
      <FeedbackWidget />
    </div>
  );
}
