import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TierBadge } from "@/components/tier-badge";
import { UpgradeNudge } from "@/components/upgrade-nudge";
import {
  useGetCurrentUser,
  useGetSellerAnalytics,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { Eye, TrendingUp, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const PRO_TIERS = new Set(["seller_pro", "seller_annual"]);

export default function Analytics() {
  const { data: user, isLoading: userLoading } = useGetCurrentUser();
  const isPro = !!user && PRO_TIERS.has(user.subscriptionTier ?? "");

  const { data: analytics, isLoading } = useGetSellerAnalytics({
    query: { enabled: isPro },
  });

  if (userLoading) {
    return (
      <Layout>
        <div className="container mx-auto max-w-5xl px-4 py-10 md:px-8">
          <Skeleton className="h-10 w-64" />
        </div>
      </Layout>
    );
  }

  if (!isPro) {
    return (
      <Layout>
        <div className="container mx-auto max-w-3xl px-4 py-16 md:px-8 space-y-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#0B3954] mb-1">Analytics</h1>
            <p className="text-sm text-muted-foreground">See how your listings are performing.</p>
          </div>
          <UpgradeNudge variant="analytics" />
          <div className="rounded-2xl border border-border/60 bg-white p-8 text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-[#0B3954]/5 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-[#D4AF37]" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-[#0B3954] mb-2">Upgrade to unlock analytics</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              View buyer interest, acceptance rates, and your best-performing categories.
              Available on Premium.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-5xl px-4 py-10 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-3xl">Seller analytics</h1>
              {user && <TierBadge tier={user.subscriptionTier} />}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              How your offers are performing across all requests.
            </p>
          </div>
        </div>

        {isLoading || !analytics ? (
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard
                label="Total offers"
                value={analytics.totalOffers}
                icon={<TrendingUp className="h-4 w-4" />}
              />
              <StatCard
                label="Total views"
                value={analytics.totalViews}
                hint={`${analytics.avgViewsPerOffer.toFixed(1)} avg / offer`}
                icon={<Eye className="h-4 w-4" />}
              />
              <StatCard
                label="Accepted"
                value={analytics.accepted}
                hint={`${analytics.declined} declined`}
                icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              />
              <StatCard
                label="Acceptance rate"
                value={`${Math.round(analytics.acceptanceRate * 100)}%`}
                hint={`${analytics.pending} still pending`}
                icon={<Clock className="h-4 w-4" />}
              />
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Recent offers</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {analytics.recentOffers.length === 0 ? (
                  <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                    You haven't sent any offers yet. Browse open requests and
                    make your first one.
                  </div>
                ) : (
                  <div className="divide-y">
                    {analytics.recentOffers.map((offer) => (
                      <Link
                        key={offer.id}
                        href={`/requests/${offer.requestId}`}
                        className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-muted/40"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">
                            {offer.requestTitle}
                          </div>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            ${offer.price.toFixed(0)} ·{" "}
                            {formatDistanceToNow(new Date(offer.createdAt), {
                              addSuffix: true,
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                            <Eye className="h-3.5 w-3.5" />
                            {offer.viewCount}
                          </span>
                          <StatusBadge status={offer.status} />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
          <span>{label}</span>
          {icon}
        </div>
        <div className="mt-2 font-serif text-3xl">{value}</div>
        {hint && (
          <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "accepted")
    return (
      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
        Accepted
      </Badge>
    );
  if (status === "declined")
    return <Badge variant="secondary">Declined</Badge>;
  return (
    <Badge variant="outline" className="text-muted-foreground">
      Pending
    </Badge>
  );
}
