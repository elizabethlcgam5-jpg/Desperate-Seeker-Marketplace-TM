import { Link } from "wouter";
import { UserSwitcher } from "./user-switcher";
import { Button } from "@/components/ui/button";
import { PenSquare, MessageSquare, Search, User } from "lucide-react";
import { useGetCurrentUser } from "@workspace/api-client-react";

export function Header() {
  const { data: user } = useGetCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Search className="h-6 w-6 text-primary" />
          <span className="hidden font-serif text-xl font-bold tracking-tight sm:inline-block">
            Desperately Seeking
          </span>
        </Link>
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground">
            Browse
          </Link>
          <Link href="/requests/new" className="transition-colors hover:text-foreground/80 text-foreground">
            Post Request
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/messages">
                <Button variant="ghost" size="icon" className="relative">
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </Link>
              <UserSwitcher />
            </>
          ) : (
            <UserSwitcher />
          )}
        </div>
      </div>
    </header>
  );
}
