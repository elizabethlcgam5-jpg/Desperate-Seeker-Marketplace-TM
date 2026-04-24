import { ReactNode } from "react";
import { Header } from "./header";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background font-sans">
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      <footer className="py-6 md:px-8 md:py-0 border-t bg-muted/40">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Desperately Seeking &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
