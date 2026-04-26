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
  Lock,
  Target,
  Receipt,
  DollarSign,
  ShoppingBag,
  Inbox,
  PlusCircle,
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
        <div className="container mx-auto max-w-3xl px-4 py-16">
          <Card className="border-[#D4AF37]/30 bg-gradient-to-br from-[#FDF5E6] to-white rounded-2xl">
            <CardContent className="p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/15">
                <Lock className="h-7 w-7 text-[#D4AF37]" />
              </div>
              <h1 className="mb-2 font-serif text-3xl text-[#0B3954]">Seller Dashboard</h1>
              <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                Unlock the seller dashboard to see live buyer requests, get match alerts, and manage your inventory — starting at $7.99/month.
              </p>
              <Link href="/pricing">
                <Button className="bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 rounded-full gap-2 px-8">
                  <Sparkles className="h-4 w-4" />
                  Unlock Seller Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
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
