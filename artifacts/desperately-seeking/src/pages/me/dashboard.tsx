import { Layout } from "@/components/layout";
import { RequestCard } from "@/components/request-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetCurrentUser,
  useGetInventoryMatches,
  useGetProspectingFeed,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import {
  Sparkles,
  Zap,
  TrendingUp,
  Package,
  Target,
  Receipt,
  DollarSign,
  ShoppingBag,
  Inbox,
  PlusCircle,
  CheckCircle2,
  Bell,
  MessageCircle,
  BadgeCheck,
  Crown,
  Truck,
  ArrowRight,
} from "lucide-react";
import { useListMyCommissions } from "@workspace/api-client-react";

export default function SellerDashboard() {
  const { data: user, isLoading: userLoading } = useGetCurrentUser();
  const isSeller = user && user.subscriptionTier && user.subscriptionTier !== "free";

  const { data: matches, isLoading: matchLoading } = useGetInventoryMatches({
    query: { enabled: !!isSeller },
  });
  const { data: feed, isLoading: feedLoading } = useGetProspectingFeed({
    query: { enabled: !!isSeller },
  });
  const { data: commissions } = useListMyCommissions({
    query: { enabled: !!isSeller },
  });

  if (userLoading) {
    return (
      <Layout>
        <div className="container mx-auto max-w-5xl px-4 py-10">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
        </div>
      </Layout>
    );
  }

  if (!isSeller) {
    return (
      <Layout>
        {/* Welcome hero */}
        <div className="bg-[#0B3954] py-12">
          <div className="container mx-auto max-w-4xl px-4 md:px-8">
            <h1 className="font-serif text-3xl font-bold text-white md:text-4xl">
              Welcome, Seller!
            </h1>
            <p className="mt-3 max-w-2xl text-white/70 text-base leading-relaxed">
              Desperately Seeking gives each seller <span className="text-[#D4AF37] font-semibold">2 free active listings</span> to get started.
              After that, upgrade to Premium for unlimited listings and full marketplace tools.
            </p>
          </div>
        </div>

        <div className="container mx-auto max-w-4xl px-4 py-10 md:px-8 space-y-10">

          {/* Free listings counter */}
          <div className="rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#FDF5E6] to-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1">
              <h2 className="font-serif text-xl font-semibold text-[#0B3954] mb-1">Your Free Listings</h2>
              <div className="flex flex-col gap-1 text-sm text-[#0B3954]/70">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#D4AF37] shrink-0" />
                  Free listings remaining: <span className="font-bold text-[#0B3954]">2</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#D4AF37] shrink-0" />
                  Free responses to buyer requests: Unlimited for your first 2 items
                </div>
              </div>
            </div>
            <Link href="/listings/new">
              <Button className="rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 gap-2 px-6">
                <PlusCircle className="h-4 w-4" />
                Add a New Listing
              </Button>
            </Link>
          </div>

          {/* How it works */}
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#0B3954] mb-5">How It Works for Sellers</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { n: "1", icon: ShoppingBag, text: "Buyers post requests for what they need." },
                { n: "2", icon: Bell, text: "You receive instant Match Alerts when a buyer's request matches what you're selling." },
                { n: "3", icon: MessageCircle, text: "Respond with your offer and message the buyer." },
                { n: "4", icon: Truck, text: "Complete the sale locally or ship using real carrier rates." },
              ].map((step) => (
                <div key={step.n} className="flex items-start gap-4 rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0B3954] text-white text-sm font-bold">
                    {step.n}
                  </div>
                  <div className="flex items-start gap-2 pt-1">
                    <step.icon className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <p className="text-sm text-[#0B3954]/80">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Premium upgrade */}
          <div className="rounded-2xl border-2 border-[#D4AF37] bg-[#0B3954] text-white p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-5 w-5 text-[#D4AF37]" />
              <h2 className="font-serif text-xl font-semibold">Premium Benefits</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5 mb-6">
              {[
                "Unlimited listings",
                "Unlimited responses to buyer requests",
                "Unlimited messaging",
                "Automatic Match Alerts",
                "Priority matching",
                "Verified Seller badge",
                "Access to shipping tools",
                "Only a 5% platform fee",
              ].map((f) => (
                <div key={f} className="flex items-start gap-2 text-sm text-white/85">
                  <BadgeCheck className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  {f}
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/15">
              <Link href="/pricing" className="flex-1">
                <Button className="w-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 rounded-full gap-2">
                  <Sparkles className="h-4 w-4" />
                  $1.99/month
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing" className="flex-1">
                <Button variant="outline" className="w-full border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-full gap-2">
                  $29.99/year
                  <span className="text-xs opacity-75">(Save 60%)</span>
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-5xl px-4 py-10 md:px-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl text-[#0B3954]">Seller Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back, {user.name}. Here's what's happening in your market today.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <Link href="/listings/new">
              <Button size="sm" className="rounded-full bg-[#D4AF37] text-[#0B3954] font-semibold hover:bg-[#c9a430] border-0 gap-1.5">
                <PlusCircle className="h-4 w-4" />
                New Listing
              </Button>
            </Link>
            <Link href="/buyer-requests">
              <Button variant="outline" size="sm" className="rounded-full border-[#0B3954]/20 text-[#0B3954] gap-1.5">
                <Inbox className="h-4 w-4" />
                Buyer Requests
              </Button>
            </Link>
            <Link href="/me/listings">
              <Button variant="outline" size="sm" className="rounded-full border-[#0B3954]/20 text-[#0B3954] gap-1.5">
                <ShoppingBag className="h-4 w-4" />
                My Listings
              </Button>
            </Link>
            <Link href="/me/inventory">
              <Button variant="outline" size="sm" className="rounded-full border-[#0B3954]/20 text-[#0B3954] gap-1.5">
                <Package className="h-4 w-4" />
                Inventory
              </Button>
            </Link>
          </div>
        </div>

        {/* Commission Summary */}
        <section className="mb-10">
          <div className="rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#FDF5E6] to-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/15">
                  <Receipt className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-semibold text-[#0B3954]">
                    Commission Model
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground max-w-md">
                    Desperately Seeking charges a simple{" "}
                    <span className="font-semibold text-[#0B3954]">5% commission</span>{" "}
                    on completed sales. Posting is always free. Upgrade to Premium to
                    respond to buyer requests and match instantly.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {commissions && commissions.length > 0 ? (
                  <>
                    <div className="flex items-center gap-1.5 text-2xl font-bold font-serif text-[#0B3954]">
                      <DollarSign className="h-5 w-5 text-[#D4AF37]" />
                      {commissions
                        .reduce((sum, c) => sum + c.commissionAmount, 0)
                        .toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      total commission across {commissions.length} sale{commissions.length !== 1 ? "s" : ""}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No sales recorded yet</p>
                )}
                <Link href="/me/commissions">
                  <button className="mt-2 text-xs text-[#D4AF37] underline underline-offset-2 hover:text-[#c9a430]">
                    View commission history →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Inventory Matches */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="font-serif text-xl font-semibold text-[#0B3954]">
              Inventory Matches
            </h2>
            <span className="text-xs text-muted-foreground">
              — buyer requests that match what you have in stock
            </span>
          </div>

          {matchLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
            </div>
          ) : !matches || matches.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-white p-10 text-center shadow-sm">
              <Package className="mx-auto h-9 w-9 text-[#D4AF37]/50 mb-3" />
              <p className="font-serif text-[#0B3954]">No matches yet</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Add items to your inventory and we'll match them against open buyer requests.
              </p>
              <Link href="/me/inventory">
                <Button size="sm" className="rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0">
                  Quick-List an Item
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {matches.slice(0, 6).map((m) => (
                <Link key={`${m.inventoryItem.id}-${m.request.id}`} href={`/requests/${m.request.id}`} className="block">
                  <div className="rounded-2xl bg-white border border-[#D4AF37]/30 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Your item</p>
                        <p className="font-semibold text-[#0B3954] truncate">{m.inventoryItem.title}</p>
                      </div>
                      <MatchScore score={m.score} />
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">matches →</div>
                    <p className="font-serif font-semibold text-[#0B3954] line-clamp-1">{m.request.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Budget: {m.request.budgetMin && m.request.budgetMax
                        ? `$${m.request.budgetMin} – $${m.request.budgetMax}`
                        : m.request.budgetMax
                          ? `Up to $${m.request.budgetMax}`
                          : "Open"}
                      {" · "}{m.request.location || "Anywhere"}
                    </p>
                    {m.matchReasons.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {m.matchReasons.map((r) => (
                          <span key={r} className="rounded-full bg-[#D4AF37]/10 px-2 py-0.5 text-[10px] text-[#6b530f] border border-[#D4AF37]/20">
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Prospecting Feed */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="font-serif text-xl font-semibold text-[#0B3954]">
              Live Buyer Feed
            </h2>
            <span className="text-xs text-muted-foreground">
              — 20 most recent open requests
            </span>
          </div>

          {feedLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
            </div>
          ) : !feed || feed.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-white p-10 text-center shadow-sm">
              <TrendingUp className="mx-auto h-9 w-9 text-[#D4AF37]/50 mb-3" />
              <p className="font-serif text-[#0B3954]">No open requests right now</p>
              <p className="text-sm text-muted-foreground mt-1">Check back soon — new buyers post every day.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {feed.map((req) => (
                <RequestCard key={req.id} request={req} />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

function MatchScore({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : score >= 60
        ? "bg-[#D4AF37]/15 text-[#6b530f] border-[#D4AF37]/30"
        : "bg-muted text-muted-foreground border-border";

  return (
    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${color}`}>
      {score}% match
    </span>
  );
}
