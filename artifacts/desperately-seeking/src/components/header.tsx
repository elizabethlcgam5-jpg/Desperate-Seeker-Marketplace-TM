import { Link } from "wouter";
import { UserSwitcher } from "./user-switcher";
import { TierBadge } from "./tier-badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Search, Sparkles, BarChart3 } from "lucide-react";
import { useGetCurrentUser } from "@workspace/api-client-react";

export function Header() {
  const { data: user } = useGetCurrentUser();
  const isSubscribed =
    user && user.subscriptionTier && user.subscriptionTier !== "free";
  const isPro =
    user &&
    (user.subscriptionTier === "seller_pro" ||
      user.subscriptionTier === "seller_annual");

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
          <Link href="/pricing" className="transition-colors hover:text-foreground/80 text-foreground">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center space-x-3">
          {user && !isSubscribed && (
            <Link href="/pricing" className="hidden sm:block">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Upgrade
              </Button>
            </Link>
          )}
          {user && isSubscribed && (
            <Link href="/pricing" className="hidden sm:block">
              <TierBadge tier={user.subscriptionTier} />
            </Link>
          )}
          {isPro && (
            <Link href="/me/analytics">
              <Button variant="ghost" size="icon" title="Seller analytics">
                <BarChart3 className="h-5 w-5" />
              </Button>
            </Link>
          )}
          {user && (
            <Link href="/messages">
              <Button variant="ghost" size="icon" className="relative">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <UserSwitcher />
        </div>
      </div>
    </header>
  );
}
