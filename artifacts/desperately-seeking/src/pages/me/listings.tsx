import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGetCurrentUser,
  useListMyListings,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import {
  Plus,
  Lock,
  Sparkles,
  Tag,
  CheckCircle2,
  Star,
  DollarSign,
  Package,
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { PaywallModal } from "@/components/paywall-modal";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MyListingsPage() {
  const { data: user, isLoading: userLoading } = useGetCurrentUser();
  const isSeller =
    user && user.subscriptionTier && user.subscriptionTier !== "free";
  const qc = useQueryClient();

  const { data: listings, isLoading: listingsLoading } = useListMyListings({
    query: { enabled: !!user },
  });

  const [soldDialogId, setSoldDialogId] = useState<string | null>(null);
  const [salePrice, setSalePrice] = useState("");
  const [soldNotes, setSoldNotes] = useState("");
  const [markingLoading, setMarkingLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const activeListings = listings?.filter((l) => l.status === "active") ?? [];
  const soldListings = listings?.filter((l) => l.status === "sold") ?? [];

  const handleMarkSold = async () => {
    if (!soldDialogId) return;
    const price = parseFloat(salePrice);
    if (!price || price <= 0) {
      toast.error("Please enter a valid sale price.");
      return;
    }
    setMarkingLoading(true);
    try {
      const res = await fetch(getApiUrl(`listings/${soldDialogId}/sold`), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salePrice: price, notes: soldNotes || null }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      toast.success(
        `Marked as sold! 5% commission ($${(price * 0.05).toFixed(2)}) recorded.`,
      );
      setSoldDialogId(null);
      setSalePrice("");
      setSoldNotes("");
      qc.invalidateQueries();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to mark as sold.");
    } finally {
      setMarkingLoading(false);
    }
  };

  if (userLoading) {
    return (
      <Layout>
        <div className="container mx-auto max-w-4xl px-4 py-10">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-10 md:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-[#0B3954]">My Listings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your active listings and track sold items.
            </p>
          </div>
          {isSeller ? (
            <Link href="/requests/new">
              <Button className="bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 rounded-full gap-1.5">
                <Plus className="h-4 w-4" />
                New Listing
              </Button>
            </Link>
          ) : (
            <Button
              className="bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 rounded-full gap-1.5"
              onClick={() => setShowPaywall(true)}
            >
              <Plus className="h-4 w-4" />
              New Listing
            </Button>
          )}
        </div>

        {listingsLoading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            {/* Active Listings */}
            <section className="mb-10">
              <div className="mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-[#D4AF37]" />
                <h2 className="font-serif text-xl font-semibold text-[#0B3954]">
                  Active Listings
                </h2>
                <Badge variant="secondary" className="ml-1">
                  {activeListings.length}
                </Badge>
              </div>

              {activeListings.length === 0 ? (
                <div className="rounded-2xl border border-dashed bg-white p-10 text-center shadow-sm">
                  <Package className="mx-auto h-9 w-9 text-[#D4AF37]/40 mb-3" />
                  <p className="font-serif text-[#0B3954]">No active listings</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Create your first listing to appear in the marketplace.
                  </p>
                  {isSeller ? (
                    <Link href="/browse">
                      <Button
                        size="sm"
                        className="rounded-full bg-[#0B3954] text-white hover:bg-[#0B3954]/90 border-0"
                      >
                        Browse Marketplace
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="sm"
                      className="rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0"
                      onClick={() => setShowPaywall(true)}
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                      Upgrade to List Items
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {activeListings.map((listing) => (
                    <div
                      key={listing.id}
                      className={`rounded-2xl bg-white border p-5 shadow-sm ${
                        listing.isFeatured
                          ? "border-[#D4AF37] ring-1 ring-[#D4AF37]/20"
                          : "border-border/60"
                      }`}
                    >
                      {listing.imageUrl && (
                        <div className="mb-3 h-32 w-full overflow-hidden rounded-xl bg-muted">
                          <img
                            src={listing.imageUrl}
                            alt={listing.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            {listing.isFeatured && (
                              <Star className="h-3.5 w-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                            )}
                            <p className="font-semibold text-[#0B3954] truncate">
                              {listing.title}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-[10px] capitalize">
                            {listing.category}
                          </Badge>
                        </div>
                        <p className="font-serif text-lg font-bold text-[#0B3954] shrink-0">
                          ${listing.price.toFixed(0)}
                        </p>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                        {listing.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Listed {formatDate(listing.createdAt)}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full border-[#D4AF37]/40 text-[#0B3954] text-xs hover:bg-[#D4AF37]/10"
                          onClick={() => {
                            setSoldDialogId(listing.id);
                            setSalePrice(listing.price.toFixed(2));
                          }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Mark as Sold
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Sold Listings */}
            {soldListings.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <h2 className="font-serif text-xl font-semibold text-[#0B3954]">
                    Sold Listings
                  </h2>
                  <Badge variant="secondary" className="ml-1">
                    {soldListings.length}
                  </Badge>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {soldListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="rounded-2xl bg-white border border-border/40 p-5 shadow-sm opacity-70"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#0B3954] truncate">
                            {listing.title}
                          </p>
                          <Badge variant="secondary" className="text-[10px] capitalize mt-1">
                            {listing.category}
                          </Badge>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-serif text-lg font-bold text-[#0B3954]">
                            ${listing.price.toFixed(0)}
                          </p>
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] mt-1">
                            Sold
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(listing.createdAt)}
                        </p>
                        <Link href="/me/commissions">
                          <button className="text-xs text-[#D4AF37] underline underline-offset-2 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            View commission
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Mark as Sold dialog */}
      <Dialog
        open={!!soldDialogId}
        onOpenChange={(o) => !o && setSoldDialogId(null)}
      >
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-[#0B3954]">
              Mark as Sold
            </DialogTitle>
            <DialogDescription>
              Enter the final sale price. A 5% commission (
              {salePrice
                ? `$${(parseFloat(salePrice) * 0.05).toFixed(2)}`
                : "$0.00"}
              ) will be recorded automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="salePrice" className="text-sm font-medium">
                Final Sale Price ($)
              </Label>
              <Input
                id="salePrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="mt-1.5"
              />
              {salePrice && parseFloat(salePrice) > 0 && (
                <p className="mt-1.5 text-xs text-[#D4AF37] font-medium">
                  Commission: $
                  {(parseFloat(salePrice) * 0.05).toFixed(2)} (5%)
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="soldNotes" className="text-sm font-medium">
                Notes (optional)
              </Label>
              <Input
                id="soldNotes"
                placeholder="e.g. Sold via direct message"
                value={soldNotes}
                onChange={(e) => setSoldNotes(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => setSoldDialogId(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0"
                onClick={handleMarkSold}
                disabled={markingLoading}
              >
                {markingLoading ? "Saving…" : "Confirm Sale"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PaywallModal
        open={showPaywall}
        onOpenChange={setShowPaywall}
        reason="Upgrade to post and manage listings"
      />
    </Layout>
  );
}
