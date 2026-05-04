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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useGetCurrentUser,
  useListMyListings,
} from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useLocation } from "wouter";
import {
  Plus,
  Tag,
  CheckCircle2,
  Star,
  Package,
  Truck,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const CATEGORIES = [
  "Furniture",
  "Baby Items",
  "Tools",
  "Electronics",
  "Clothing",
  "Home Decor",
  "Appliances",
  "Outdoor",
  "Toys",
  "Miscellaneous",
];

const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "needs_repair", label: "Needs Repair" },
];

const AVAILABILITY = [
  { value: "local_pickup", label: "Local Pickup" },
  { value: "shipping", label: "Shipping" },
  { value: "both", label: "Both" },
];

const createListingSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().min(5, "Description is required"),
  category: z.string().min(1, "Category is required"),
  brandName: z.string().optional(),
  condition: z.string().min(1, "Condition is required"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  availability: z.string().min(1, "Availability is required"),
  shippingPrice: z.coerce.number().optional(),
  zipCode: z.string().min(5, "ZIP code is required"),
});

type CreateListingData = z.infer<typeof createListingSchema>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function conditionLabel(value: string) {
  return CONDITIONS.find((c) => c.value === value)?.label ?? value;
}

function availabilityLabel(value: string) {
  return AVAILABILITY.find((a) => a.value === value)?.label ?? value;
}

export default function MyListingsPage() {
  const [_, setLocation] = useLocation();
  const { data: user, isLoading: userLoading } = useGetCurrentUser();
  const isSeller = user && user.subscriptionTier && user.subscriptionTier !== "free";
  const qc = useQueryClient();

  const { data: listings, isLoading: listingsLoading } = useListMyListings({
    query: { enabled: !!user },
  });

  const [soldDialogId, setSoldDialogId] = useState<string | null>(null);
  const [salePrice, setSalePrice] = useState("");
  const [soldNotes, setSoldNotes] = useState("");
  const [markingLoading, setMarkingLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [repostingId, setRepostingId] = useState<string | null>(null);

  const handleRepost = async (listingId: string) => {
    setRepostingId(listingId);
    try {
      const res = await fetch(getApiUrl(`listings/${listingId}/repost`), {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to repost");
      toast.success("Listing reposted! InstantMatch is scanning for buyers.");
      qc.invalidateQueries();
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't repost. Try again.");
    } finally {
      setRepostingId(null);
    }
  };

  const activeListings = listings?.filter((l) => l.status === "active") ?? [];
  const soldListings = listings?.filter((l) => l.status === "sold") ?? [];

  const form = useForm<CreateListingData>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      brandName: "",
      condition: "",
      price: undefined,
      availability: "",
      shippingPrice: undefined,
      zipCode: "",
    },
  });

  const watchAvailability = form.watch("availability");
  const showShipping = watchAvailability === "shipping" || watchAvailability === "both";

  const handleCreateListing = async (data: CreateListingData) => {
    setCreateLoading(true);
    try {
      const res = await fetch(getApiUrl("listings"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          category: data.category,
          brandName: data.brandName || "",
          condition: data.condition,
          price: data.price,
          availability: data.availability,
          shippingPrice: showShipping ? (data.shippingPrice ?? null) : null,
          zipCode: data.zipCode,
          imageUrl: "",
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to create listing");
      toast.success("Listing created!");
      setShowCreateDialog(false);
      form.reset();
      qc.invalidateQueries();
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't create listing. Try again.");
    } finally {
      setCreateLoading(false);
    }
  };

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
      toast.success(`Marked as sold! 5% commission ($${(price * 0.05).toFixed(2)}) recorded.`);
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
          <Button
            className="bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 rounded-full gap-1.5"
            onClick={() => setLocation("/listings/new")}
          >
            <Plus className="h-4 w-4" />
            New Listing
          </Button>
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
                  <Button
                    size="sm"
                    className="rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0"
                    onClick={() => setLocation("/listings/new")}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Post a Listing
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {activeListings.map((listing: any) => (
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
                          <div className="flex flex-wrap gap-1.5 mb-1.5">
                            <Badge variant="secondary" className="text-[10px] capitalize">
                              {listing.category}
                            </Badge>
                            {listing.condition && (
                              <Badge variant="outline" className="text-[10px]">
                                {conditionLabel(listing.condition)}
                              </Badge>
                            )}
                            {listing.availability && (
                              <Badge variant="outline" className="text-[10px] flex items-center gap-0.5">
                                {listing.availability === "local_pickup" ? (
                                  <MapPin className="h-2.5 w-2.5" />
                                ) : (
                                  <Truck className="h-2.5 w-2.5" />
                                )}
                                {availabilityLabel(listing.availability)}
                              </Badge>
                            )}
                          </div>
                          {listing.brandName && (
                            <p className="text-xs text-muted-foreground">{listing.brandName}</p>
                          )}
                        </div>
                        <p className="font-serif text-lg font-bold text-[#0B3954] shrink-0">
                          ${Number(listing.price).toFixed(0)}
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
                            setSalePrice(Number(listing.price).toFixed(2));
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
                  {soldListings.map((listing: any) => (
                    <div
                      key={listing.id}
                      className="rounded-2xl bg-white border border-border/40 p-5 shadow-sm opacity-80"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#0B3954] truncate">{listing.title}</p>
                          <Badge variant="secondary" className="text-[10px] capitalize mt-1">
                            {listing.category}
                          </Badge>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-serif text-lg font-bold text-[#0B3954]">
                            ${Number(listing.price).toFixed(0)}
                          </p>
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] mt-1">
                            Sold
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{formatDate(listing.createdAt)}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full border-[#0B3954]/30 text-[#0B3954] text-xs hover:bg-[#0B3954]/5 font-semibold gap-1.5"
                          disabled={repostingId === listing.id}
                          onClick={() => handleRepost(listing.id)}
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${repostingId === listing.id ? "animate-spin" : ""}`} />
                          {repostingId === listing.id ? "Reposting…" : "Relist"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Create Listing Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(o) => { setShowCreateDialog(o); if (!o) form.reset(); }}>
        <DialogContent className="sm:max-w-[520px] rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-[#0B3954]">Create a New Listing</DialogTitle>
            <DialogDescription>
              Fill in the details below. Your listing will appear in the marketplace immediately.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateListing)} className="space-y-4 pt-2">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B3954]">Item Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Vintage wooden dresser" className="rounded-xl border-[#0B3954]/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B3954]">Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the item — size, color, any wear or damage..."
                        className="rounded-xl border-[#0B3954]/20 resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category + Brand */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B3954]">Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-[#0B3954]/20">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brandName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B3954]">Brand Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" className="rounded-xl border-[#0B3954]/20" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Condition */}
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B3954]">Condition *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-[#0B3954]/20">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONDITIONS.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price + ZIP */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B3954]">Price ($) *</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" placeholder="0.00" className="rounded-xl border-[#0B3954]/20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B3954]">ZIP Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 90210" maxLength={10} className="rounded-xl border-[#0B3954]/20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Availability */}
              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B3954]">Availability *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-[#0B3954]/20">
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AVAILABILITY.map((a) => (
                          <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    {field.value && (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {field.value === "local_pickup" && "Buyer picks up the item from you."}
                        {field.value === "shipping" && "You ship the item. Buyer pays your shipping price."}
                        {field.value === "both" && "Buyer can choose local pickup or shipping."}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              {/* Shipping Price — conditional */}
              {showShipping && (
                <FormField
                  control={form.control}
                  name="shippingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B3954]">Shipping Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" placeholder="e.g. 12.00" className="rounded-xl border-[#0B3954]/20" {...field} />
                      </FormControl>
                      <p className="text-[11px] text-muted-foreground">No fee is charged on shipping — only on the item price.</p>
                    </FormItem>
                  )}
                />
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={() => { setShowCreateDialog(false); form.reset(); }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0"
                >
                  {createLoading ? "Creating…" : "Create Listing"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Mark as Sold dialog */}
      <Dialog open={!!soldDialogId} onOpenChange={(o) => !o && setSoldDialogId(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-[#0B3954]">Mark as Sold</DialogTitle>
            <DialogDescription>
              Enter the final sale price. A 5% commission (
              {salePrice ? `$${(parseFloat(salePrice) * 0.05).toFixed(2)}` : "$0.00"}
              ) will be recorded automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="salePrice" className="text-sm font-medium">Final Sale Price ($)</Label>
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
                  Commission: ${(parseFloat(salePrice) * 0.05).toFixed(2)} (5%)
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="soldNotes" className="text-sm font-medium">Notes (optional)</Label>
              <Input
                id="soldNotes"
                placeholder="e.g. Sold via direct message"
                value={soldNotes}
                onChange={(e) => setSoldNotes(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setSoldDialogId(null)}>
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

    </Layout>
  );
}
