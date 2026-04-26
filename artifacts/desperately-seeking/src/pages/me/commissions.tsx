import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetCurrentUser,
  useListMyCommissions,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import {
  Receipt,
  DollarSign,
  Lock,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CommissionsPage() {
  const { data: user, isLoading: userLoading } = useGetCurrentUser();
  const isSeller =
    user && user.subscriptionTier && user.subscriptionTier !== "free";

  const { data: commissions, isLoading: commLoading } = useListMyCommissions({
    query: { enabled: !!isSeller },
  });

  if (userLoading) {
    return (
      <Layout>
        <div className="container mx-auto max-w-3xl px-4 py-10">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
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
              <h1 className="mb-2 font-serif text-3xl text-[#0B3954]">
                Commission History
              </h1>
              <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                Upgrade to Premium to start responding to buyers, close sales,
                and track your commission history.
              </p>
              <Link href="/pricing">
                <Button className="bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 rounded-full gap-2 px-8">
                  <Sparkles className="h-4 w-4" />
                  Upgrade to Premium
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const totalCommission =
    commissions?.reduce((sum, c) => sum + c.commissionAmount, 0) ?? 0;
  const totalSales =
    commissions?.reduce((sum, c) => sum + c.salePrice, 0) ?? 0;
  const pendingCount =
    commissions?.filter((c) => c.status === "pending").length ?? 0;

  return (
    <Layout>
      <div className="container mx-auto max-w-3xl px-4 py-10 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-[#0B3954]">
            Commission History
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A flat 5% commission is charged on each completed sale.
          </p>
        </div>

        {/* Stats row */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Sales",
              value: `$${totalSales.toFixed(2)}`,
              icon: TrendingUp,
            },
            {
              label: "Total Commission",
              value: `$${totalCommission.toFixed(2)}`,
              icon: DollarSign,
            },
            {
              label: "Pending",
              value: `${pendingCount} sale${pendingCount !== 1 ? "s" : ""}`,
              icon: Clock,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm text-center"
            >
              <stat.icon className="mx-auto mb-1.5 h-5 w-5 text-[#D4AF37]" />
              <p className="font-serif text-xl font-bold text-[#0B3954]">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Commission explanation banner */}
        <div className="mb-6 rounded-2xl border border-[#D4AF37]/30 bg-[#FDF5E6] px-5 py-4">
          <div className="flex items-start gap-3">
            <Receipt className="mt-0.5 h-5 w-5 shrink-0 text-[#D4AF37]" />
            <p className="text-sm text-[#0B3954]">
              <span className="font-semibold">How it works:</span> When you mark
              a listing as sold, we automatically record a 5% commission on the
              final sale price. Commissions are collected at the end of each
              billing period. Subscription fees are separate.
            </p>
          </div>
        </div>

        {/* Commission list */}
        {commLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : !commissions || commissions.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white p-12 text-center shadow-sm">
            <Receipt className="mx-auto h-10 w-10 text-[#D4AF37]/40 mb-3" />
            <p className="font-serif text-[#0B3954]">No commissions yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              When you mark a listing as sold, your commission will appear here.
            </p>
            <Link href="/browse">
              <Button
                size="sm"
                className="rounded-full bg-[#0B3954] text-white hover:bg-[#0B3954]/90 border-0"
              >
                Browse listings
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {commissions.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#0B3954] truncate">
                      {c.listingTitle ?? "Listing"}
                    </p>
                    {c.notes && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {c.notes}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(c.createdAt)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-serif text-lg font-bold text-[#0B3954]">
                      ${c.commissionAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      5% of ${c.salePrice.toFixed(2)}
                    </p>
                    <Badge
                      className={`mt-1.5 text-[10px] px-2 py-0 ${
                        c.status === "paid"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-[#D4AF37]/10 text-[#6b530f] border-[#D4AF37]/20"
                      }`}
                      variant="outline"
                    >
                      {c.status === "paid" ? (
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                      ) : (
                        <Clock className="mr-1 h-3 w-3" />
                      )}
                      {c.status === "paid" ? "Paid" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Questions about your commissions?{" "}
          <a
            href="mailto:support@desperatelyseeking.com"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Contact support
          </a>
        </p>
      </div>
    </Layout>
  );
}
