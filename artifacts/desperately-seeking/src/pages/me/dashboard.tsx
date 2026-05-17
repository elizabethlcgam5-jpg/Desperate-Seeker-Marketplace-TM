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
  Landmark,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { useListMyCommissions } from "@workspace/api-client-react";
import { useState, useEffect } from "react";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";

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

  const [connectStatus, setConnectStatus] = useState<{
    connected: boolean;
    onboardingComplete: boolean;
  } | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const [instantMatch, setInstantMatch] = useState<boolean | null>(null);
  const [instantMatchLoading, setInstantMatchLoading] = useState(false);

  useEffect(() => {
    if (!isSeller) return;
    fetch(getApiUrl("stripe/connect/status"), { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setConnectStatus(d))
      .catch(() => {});
  }, [isSeller]);

  useEffect(() => {
    if (user) setInstantMatch((user as any).instantMatch ?? false);
  }, [user]);

  const handleConnectOnboard = async () => {
    setConnectLoading(true);
    try {
      const res = await fetch(getApiUrl("stripe/connect/onboard"), {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast.error(data.error ?? "Could not start bank onboarding.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setConnectLoading(false);
    }
  };

  const handleInstantMatchToggle = async () => {
    if (instantMatchLoading) return;
    const next = !instantMatch;
    setInstantMatch(next);
    setInstantMatchLoading(true);
    try {
      const res = await fetch(getApiUrl("me/instant-match"), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      const data = await res.json();
      setInstantMatch(data.instantMatch);
      toast.success(data.instantMatch ? "InstantMatch turned on." : "InstantMatch turned off.");
    } catch {
      setInstantMatch(!next);
      toast.error("Couldn't update InstantMatch. Please try again.");
    } finally {
      setInstantMatchLoading(false);
    }
  };

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
                  $14.99/year
                  <span className="text-xs opacity-75">(Save 37%)</span>
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
              </div>
            </div>
          </div>
        </section>

        {/* Stripe Connect — bank account */}
        {connectStatus !== null && (
          <section className="mb-10">
            {connectStatus.onboardingComplete ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Landmark className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-emerald-800 text-sm">Bank account connected</p>
                  <p className="text-xs text-emerald-700/70 mt-0.5">
                    Buyers can pay you directly online. 95% goes to you, 5% platform fee.
                  </p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 shrink-0">
                  Active
                </Badge>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#FDF5E6] p-6 flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="h-12 w-12 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center shrink-0">
                  <Landmark className="h-6 w-6 text-[#D4AF37]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-serif font-semibold text-[#0B3954]">Connect your bank account</p>
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      <AlertCircle className="h-3 w-3" /> Recommended
                    </span>
                  </div>
                  <p className="text-sm text-[#0B3954]/65 leading-relaxed">
                    Let buyers pay for your listings directly online. Stripe handles the payout — 95% goes to you, 5% platform fee. Setup takes 2 minutes.
                  </p>
                </div>
                <Button
                  onClick={handleConnectOnboard}
                  disabled={connectLoading}
                  className="bg-[#0B3954] text-white hover:bg-[#0B3954]/90 border-0 rounded-full gap-2 shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                  {connectLoading ? "Loading…" : "Connect Bank"}
                </Button>
              </div>
            )}
          </section>
        )}

        {/* InstantMatch toggle */}
        {instantMatch !== null && (
          <section className="mb-10">
            <div
              className={`rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors ${
                instantMatch
                  ? "border-[#0B3954]/20 bg-[#0B3954]/5"
                  : "border-border bg-white"
              }`}
            >
              <div
                className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                  instantMatch ? "bg-[#0B3954]/10" : "bg-muted"
                }`}
              >
                <Zap className={`h-5 w-5 ${instantMatch ? "text-[#0B3954]" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-serif font-semibold text-[#0B3954]">InstantMatch</p>
                  {instantMatch && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#0B3954]/10 text-[#0B3954] border border-[#0B3954]/15 font-medium">
                      <Zap className="h-3 w-3" /> On
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#0B3954]/60 leading-relaxed">
                  {instantMatch
                    ? "You'll get instant alerts when a buyer posts a request that matches your listings — and buyers with InstantMatch on will be notified when you list something new."
                    : "Turn on to get real-time alerts when a buyer posts a request matching your listings, and let buyers find your new listings the moment they go live."}
                </p>
              </div>
              <button
                onClick={handleInstantMatchToggle}
                disabled={instantMatchLoading}
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 transition-colors focus:outline-none disabled:opacity-60 cursor-pointer ${
                  instantMatch
                    ? "bg-[#0B3954] border-[#0B3954]"
                    : "bg-muted border-border"
                }`}
                aria-label="Toggle InstantMatch"
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    instantMatch ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </section>
        )}

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

        {/* Manage Subscription */}
        <section className="mb-10">
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-lg font-semibold text-[#0B3954] mb-1">Manage Subscription</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Update your billing details, switch plans, or cancel your subscription anytime — no questions asked.
            </p>
            <Button
              variant="outline"
              className="rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-sm"
              onClick={async () => {
                try {
                  const res = await fetch(getApiUrl("stripe/portal"), {
                    method: "POST",
                    credentials: "include",
                  });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                  else toast.error("Could not open billing portal. Please try again.");
                } catch {
                  toast.error("Something went wrong. Please try again.");
                }
              }}
            >
              Cancel Subscription
            </Button>
          </div>
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
