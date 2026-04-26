import { Link } from "wouter";
import { UserSwitcher } from "./user-switcher";
import { Button } from "@/components/ui/button";
import { MessageSquare, Search, Sparkles, BarChart3, Package } from "lucide-react";
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
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B3954] text-white">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Search className="h-5 w-5 text-[#D4AF37]" />
          <span className="hidden font-serif text-xl font-bold tracking-tight text-white sm:inline-block">
            Desperately Seeking
          </span>
        </Link>
        <nav className="flex flex-1 items-center space-x-5 text-sm font-medium">
          <Link href="/browse" className="text-white/80 transition-colors hover:text-white">
            Browse
          </Link>
          <Link href="/requests/new" className="text-white/80 transition-colors hover:text-white">
            Post Request
          </Link>
          <Link href="/pricing" className="text-white/80 transition-colors hover:text-white">
            Pricing
          </Link>
          {isSubscribed && (
            <Link href="/me/dashboard" className="text-white/80 transition-colors hover:text-white">
              Dashboard
            </Link>
          )}
        </nav>
        <div className="flex items-center space-x-2">
          {user && !isSubscribed && (
            <Link href="/pricing" className="hidden sm:block">
              <Button
                size="sm"
                className="gap-1.5 bg-[#D4AF37] text-[#0B3954] font-semibold hover:bg-[#c9a430] border-0"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Upgrade
              </Button>
            </Link>
          )}
          {isSubscribed && (
            <Link href="/me/inventory">
              <Button variant="ghost" size="icon" title="My Inventory" className="text-white/80 hover:text-white hover:bg-white/10">
                <Package className="h-5 w-5" />
              </Button>
            </Link>
          )}
          {isPro && (
            <Link href="/me/analytics">
              <Button variant="ghost" size="icon" title="Seller analytics" className="text-white/80 hover:text-white hover:bg-white/10">
                <BarChart3 className="h-5 w-5" />
              </Button>
            </Link>
          )}
          {user && (
            <Link href="/messages">
              <Button variant="ghost" size="icon" className="relative text-white/80 hover:text-white hover:bg-white/10">
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
