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
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row md:py-0 md:h-16">
          <p className="text-center text-sm leading-loose md:text-left">
            <span className="font-serif font-medium text-white/80">Desperately Seeking</span>{" "}
            &copy; {new Date().getFullYear()}. The buyer-first marketplace.
          </p>
          <nav className="flex gap-5 text-sm">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/requests/new" className="hover:text-white transition-colors">Post a Request</Link>
          </nav>
        </div>
      </footer>
      <FeedbackWidget />
    </div>
  );
}
