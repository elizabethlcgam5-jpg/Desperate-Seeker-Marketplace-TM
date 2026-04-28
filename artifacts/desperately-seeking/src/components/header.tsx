import { Link, useLocation } from "wouter";
import { UserSwitcher } from "./user-switcher";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  Search,
  Sparkles,
  BarChart3,
  Package,
  Receipt,
  Inbox,
  ShoppingBag,
  PenSquare,
  LogIn,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";

export function Header() {
  const { data: user } = useGetCurrentUser();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const isSubscribed = user && user.subscriptionTier && user.subscriptionTier !== "free";
  const isPro = user && (user.subscriptionTier === "seller_pro" || user.subscriptionTier === "seller_annual");
  const isAuthenticated = user && (user as any).email;

  const handleLogout = async () => {
    try {
      await fetch(getApiUrl("auth/logout"), { method: "POST", credentials: "include" });
      await qc.invalidateQueries();
      toast.success("Signed out successfully.");
      setLocation("/");
    } catch {
      toast.error("Couldn't sign out. Try again.");
    }
  };

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
          <Link href="/buyer-requests" className="text-white/80 transition-colors hover:text-white hidden sm:block">
            Requests
          </Link>
          <Link href="/requests/new" className="text-white/80 transition-colors hover:text-white hidden md:block">
            Post Request
          </Link>
          <Link href="/seller" className="text-white/80 transition-colors hover:text-white hidden md:block">
            Sell
          </Link>
          <Link href="/pricing" className="text-white/80 transition-colors hover:text-white hidden md:block">
            Pricing
          </Link>
          {isSubscribed && (
            <Link href="/me/dashboard" className="text-white/80 transition-colors hover:text-white hidden lg:block">
              Dashboard
            </Link>
          )}
        </nav>
        <div className="flex items-center space-x-1">
          <Link href="/requests/new" className="hidden sm:block mr-1">
            <Button
              size="sm"
              className="gap-1.5 bg-[#D4AF37] text-[#0B3954] font-semibold hover:bg-[#c9a430] border-0 rounded-full"
            >
              <PenSquare className="h-3.5 w-3.5" />
              Post What You Need
            </Button>
          </Link>
          {user && !isSubscribed && (
            <Link href="/pricing" className="hidden lg:block mr-1">
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-white/80 hover:text-white hover:bg-white/10"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Upgrade
              </Button>
            </Link>
          )}

          {/* Buyer Requests inbox */}
          <Link href="/buyer-requests">
            <Button
              variant="ghost"
              size="icon"
              title="Buyer Request Inbox"
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <Inbox className="h-5 w-5" />
            </Button>
          </Link>

          {/* My Listings */}
          {user && (
            <Link href="/me/listings">
              <Button
                variant="ghost"
                size="icon"
                title="My Listings"
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <ShoppingBag className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {isSubscribed && (
            <Link href="/me/inventory">
              <Button
                variant="ghost"
                size="icon"
                title="My Inventory"
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <Package className="h-5 w-5" />
              </Button>
            </Link>
          )}
          {isSubscribed && (
            <Link href="/me/commissions">
              <Button
                variant="ghost"
                size="icon"
                title="Commissions"
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <Receipt className="h-5 w-5" />
              </Button>
            </Link>
          )}
          {isPro && (
            <Link href="/me/analytics">
              <Button
                variant="ghost"
                size="icon"
                title="Seller analytics"
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <BarChart3 className="h-5 w-5" />
              </Button>
            </Link>
          )}
          {user && (
            <Link href="/messages">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white/80 hover:text-white hover:bg-white/10"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            </Link>
          )}
          {/* Auth controls */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50">
                  <Avatar className="h-8 w-8 border-2 border-[#D4AF37]/30 cursor-pointer hover:border-[#D4AF37] transition-colors">
                    <AvatarImage src={user?.avatarUrl ?? ""} alt={user?.name ?? ""} />
                    <AvatarFallback className="bg-[#D4AF37]/20 text-[#D4AF37] text-sm font-bold">
                      {user?.name?.charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-2xl shadow-xl">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <p className="font-semibold text-[#0B3954]">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{(user as any)?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/me/dashboard" className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    My Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/me/listings" className="cursor-pointer">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    My Listings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1.5 ml-1">
              <Link href="/login">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="sm"
                  className="bg-[#D4AF37] text-[#0B3954] font-semibold hover:bg-[#c9a430] border-0 rounded-full"
                  onClick={() => {}}
                >
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
