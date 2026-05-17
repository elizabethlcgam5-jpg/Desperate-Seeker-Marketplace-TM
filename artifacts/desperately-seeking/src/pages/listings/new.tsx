import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { PackagePlus, Truck, Lock, Package, Tag, CheckCircle2, MapPin, Trash2, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useRef, useState, useEffect } from "react";
import { useListMyListings, useGetCurrentUser } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/api";

const FREE_LISTING_LIMIT = 2;

const CATEGORIES = [
  "Furniture",
  "Clothing",
  "Electronics",
  "Baby & Kids",
  "Home Goods",
  "Other",
];

const CONDITIONS = ["New", "Like New", "Good", "Fair"];

const DELIVERY_OPTIONS = ["Local Pickup", "Meet-Up", "Shipping Available"];

const PACKAGE_SIZES = ["Small", "Medium", "Large"];

const CARRIERS = ["USPS", "UPS", "FedEx"];

const SHIPPING_RATES: Record<string, Record<string, number>> = {
  USPS: { Small: 5.99, Medium: 10.49, Large: 16.99 },
  UPS:  { Small: 7.49, Medium: 12.99, Large: 19.99 },
  FedEx: { Small: 6.99, Medium: 11.99, Large: 18.49 },
};

const formSchema = z.object({
  itemName: z.string().min(2, "Item name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  condition: z.string().min(1, "Please select a condition"),
  color: z.string().min(1, "Please enter a color"),
  brand: z.string().optional(),
  description: z.string().min(10, "Please provide at least 10 characters"),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  zipCode: z.string().min(5, "Please enter a valid ZIP code"),
  deliveryOption: z.string().min(1, "Please select a delivery option"),
  instantMatchOn: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

const CONDITIONS_MAP: Record<string, string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
  needs_repair: "Needs Repair",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function NewListing() {
  const [_, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [limitOpen, setLimitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: user } = useGetCurrentUser();
  const { data: listings } = useListMyListings({ query: { enabled: !!user } });

  const activeListings = listings?.filter((l: any) => l.status === "active") ?? [];
  const soldListings = listings?.filter((l: any) => l.status === "sold") ?? [];
  const freeListingsUsed = listings?.length ?? 0;

  // Show the subscription popup once we know the user has hit their free limit
  useEffect(() => {
    if (listings !== undefined && freeListingsUsed >= FREE_LISTING_LIMIT) {
      setLimitOpen(true);
    }
  }, [listings]);

  const [shippingWeight, setShippingWeight] = useState("");
  const [packageSize, setPackageSize] = useState("Small");
  const [carrier, setCarrier] = useState("USPS");
  const [estimatedShipping, setEstimatedShipping] = useState<number | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemName: "",
      category: "",
      condition: "",
      color: "",
      brand: "",
      description: "",
      price: 0,
      zipCode: "",
      deliveryOption: "",
      instantMatchOn: false,
    },
  });

  const deliveryOption = useWatch({ control: form.control, name: "deliveryOption" });
  const showShipping = deliveryOption === "Shipping Available";

  function calculateShipping() {
    if (!shippingWeight || Number(shippingWeight) <= 0) {
      toast.error("Please enter a valid package weight.");
      return;
    }
    const base = SHIPPING_RATES[carrier]?.[packageSize] ?? 0;
    const weightSurcharge = Math.max(0, (Number(shippingWeight) - 1) * 0.75);
    setEstimatedShipping(parseFloat((base + weightSurcharge).toFixed(2)));
  }

  async function onSubmit(values: FormData) {
    if (!user) {
      toast.error("Please sign in to post an item.");
      return;
    }
    setSubmitting(true);
    try {
      const availabilityMap: Record<string, string> = {
        "Local Pickup": "local_pickup",
        "Meet-Up": "local_pickup",
        "Shipping Available": "shipping",
      };
      const conditionMap: Record<string, string> = {
        "New": "new",
        "Like New": "like_new",
        "Good": "good",
        "Fair": "fair",
      };

      const res = await fetch(getApiUrl("listings"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.itemName,
          description: values.description,
          category: values.category,
          brandName: values.brand ?? "",
          condition: conditionMap[values.condition] ?? "good",
          price: values.price,
          availability: availabilityMap[values.deliveryOption] ?? "local_pickup",
          shippingPrice: showShipping && estimatedShipping != null ? estimatedShipping : null,
          zipCode: values.zipCode,
          imageUrl: "",
          instantMatchOn: values.instantMatchOn,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to post item");
      }
      toast.success("Item posted successfully!");
      form.reset();
      if (fileInputRef.current) fileInputRef.current.value = "";
      setEstimatedShipping(null);
      setShippingWeight("");
      qc.invalidateQueries();
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't post item. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteItem(listingId: string) {
    setDeletingId(listingId);
    try {
      const res = await fetch(getApiUrl(`listings/${listingId}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to delete item");
      }
      toast.success("Item deleted.");
      qc.invalidateQueries();
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't delete item.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Layout>
      {/* Subscription popup */}
      <Dialog open={limitOpen} onOpenChange={setLimitOpen}>
        <DialogContent className="max-w-sm rounded-2xl text-center px-6 py-8">
          <div className="flex justify-center mb-3">
            <div className="h-14 w-14 rounded-full bg-[#0B3954]/8 flex items-center justify-center">
              <Lock className="h-7 w-7 text-[#0B3954]" />
            </div>
          </div>
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold text-[#0B3954] leading-snug">
              Unlock Unlimited Selling
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Choose a plan to continue posting items:
            </DialogDescription>
          </DialogHeader>
          <ul className="mt-4 space-y-2 text-left">
            {[
              "Unlimited item posts",
              "Unlimited responses",
              "Priority matching",
              "Verified Seller badge",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-[#0B3954]">
                <span className="h-5 w-5 rounded-full bg-[#D4AF37]/15 flex items-center justify-center shrink-0 text-[#D4AF37] text-xs font-bold">✓</span>
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-3">
            <Button
              className="w-full rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 h-11"
              onClick={() => setLocation("/pricing")}
            >
              Monthly — $1.99
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full border-[#0B3954]/25 text-[#0B3954] hover:bg-[#0B3954]/5 h-11"
              onClick={() => setLocation("/pricing")}
            >
              Yearly — $14.99
              <span className="ml-1.5 text-xs text-[#D4AF37] font-semibold">Save 37%</span>
            </Button>
            <button
              className="w-full text-xs text-muted-foreground hover:text-[#0B3954] transition-colors pt-1"
              onClick={() => setLimitOpen(false)}
            >
              Start selling now — use my free listings first
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Navy header banner — matches buyer pages */}
      <section className="bg-[#0B3954] py-10">
        <div className="container mx-auto px-4 md:px-8 max-w-[800px]">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2">
            Sell an Item
          </h1>
          <p className="text-white/70">
            List what you have. Buyers who need it will find you.
          </p>
        </div>
      </section>

      {/* Cream content area — matches buyer pages */}
      <div className="bg-background flex-1">
      <div className="container max-w-[800px] mx-auto px-4 py-8 md:py-12">

        {/* Mini seller flow */}
        <div className="flex items-center gap-2 mb-6 text-xs text-[#0B3954]/60 flex-wrap">
          <span className="flex items-center gap-1.5 font-semibold text-[#0B3954]">
            <span className="h-5 w-5 rounded-full bg-[#D4AF37] text-[#0B3954] flex items-center justify-center font-bold text-[10px]">1</span>
            List your item
          </span>
          <span className="text-[#0B3954]/30">→</span>
          <span className="flex items-center gap-1.5">
            <span className="h-5 w-5 rounded-full bg-[#0B3954]/10 text-[#0B3954] flex items-center justify-center font-bold text-[10px]">2</span>
            Buyers find you
          </span>
          <span className="text-[#0B3954]/30">→</span>
          <span className="flex items-center gap-1.5">
            <span className="h-5 w-5 rounded-full bg-[#0B3954]/10 text-[#0B3954] flex items-center justify-center font-bold text-[10px]">3</span>
            Mark as Sold in My Listings
          </span>
        </div>

        <div className="bg-white border border-[#e0e0e0] rounded-[12px] p-6 md:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Item Name */}
              <FormField
                control={form.control}
                name="itemName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-[#0B3954]">
                      Item Name *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="What are you selling?"
                        className="rounded-[8px] border-[#b0c4de] bg-white h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category + Condition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-[#0B3954]">Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-[8px] border-[#b0c4de] bg-white">
                            <SelectValue placeholder="Select a category" />
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
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-[#0B3954]">Condition *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-[8px] border-[#b0c4de] bg-white">
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CONDITIONS.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Color + Brand */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-[#0B3954]">Color *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Walnut Brown"
                          className="rounded-[8px] border-[#b0c4de] bg-white h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B3954]">
                        Brand <span className="text-muted-foreground font-normal">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. IKEA, Levi's"
                          className="rounded-[8px] border-[#b0c4de] bg-white h-11"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-[#0B3954]">
                      Description *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the item — condition details, dimensions, any flaws, reason for selling..."
                        className="min-h-[90px] resize-y rounded-[8px] border-[#b0c4de] bg-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price + ZIP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-[#0B3954]">Price ($) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          className="rounded-[8px] border-[#b0c4de] bg-white h-11"
                          {...field}
                        />
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
                      <FormLabel className="font-semibold text-[#0B3954]">ZIP Code *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your ZIP code"
                          maxLength={10}
                          className="rounded-[8px] border-[#b0c4de] bg-white h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Delivery Options */}
              <FormField
                control={form.control}
                name="deliveryOption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-[#0B3954]">Delivery Options *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-[8px] border-[#b0c4de] bg-white">
                          <SelectValue placeholder="How can buyers get it?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DELIVERY_OPTIONS.map((o) => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Shipping Details — shown only when Shipping Available is selected */}
              {showShipping && (
                <div className="rounded-xl border border-[#0B3954]/15 bg-[#f8fafc] p-5 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="h-4 w-4 text-[#0B3954]" />
                    <h3 className="text-sm font-semibold text-[#0B3954]">Shipping Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Weight */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[#0B3954]">
                        Package Weight (lbs)
                      </label>
                      <Input
                        type="number"
                        min={0}
                        step={0.1}
                        placeholder="Weight"
                        value={shippingWeight}
                        onChange={(e) => {
                          setShippingWeight(e.target.value);
                          setEstimatedShipping(null);
                        }}
                        className="rounded-[8px] border-[#b0c4de] bg-white h-10"
                      />
                    </div>

                    {/* Package Size */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[#0B3954]">
                        Package Size
                      </label>
                      <Select
                        value={packageSize}
                        onValueChange={(v) => {
                          setPackageSize(v);
                          setEstimatedShipping(null);
                        }}
                      >
                        <SelectTrigger className="rounded-[8px] border-[#b0c4de] bg-white h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PACKAGE_SIZES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Carrier */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[#0B3954]">
                        Shipping Carrier
                      </label>
                      <Select
                        value={carrier}
                        onValueChange={(v) => {
                          setCarrier(v);
                          setEstimatedShipping(null);
                        }}
                      >
                        <SelectTrigger className="rounded-[8px] border-[#b0c4de] bg-white h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CARRIERS.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full border-[#0B3954]/30 text-[#0B3954] hover:bg-[#0B3954]/5"
                      onClick={calculateShipping}
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Calculate Shipping
                    </Button>
                    {estimatedShipping !== null && (
                      <p className="text-sm font-semibold text-[#0B3954]">
                        Estimated Shipping:{" "}
                        <span className="text-[#D4AF37]">${estimatedShipping.toFixed(2)}</span>
                      </p>
                    )}
                    {estimatedShipping === null && shippingWeight === "" && (
                      <p className="text-sm text-muted-foreground">
                        Estimated Shipping: $0.00
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Upload Photos */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0B3954]">
                  Upload Photos
                </label>
                <div
                  className="border-2 border-dashed border-[#0B3954]/20 rounded-xl p-6 text-center cursor-pointer hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/5 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <p className="text-sm text-muted-foreground">
                    Click to upload photos — multiple allowed
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, WEBP up to 10MB each
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const count = e.target.files?.length ?? 0;
                      if (count > 0) {
                        toast.success(`${count} photo${count > 1 ? "s" : ""} selected`);
                      }
                    }}
                  />
                </div>
              </div>

              {/* InstantMatch toggle */}
              <FormField
                control={form.control}
                name="instantMatchOn"
                render={({ field }) => (
                  <FormItem>
                    <div className={`flex items-start gap-4 rounded-xl border p-4 transition-colors ${field.value ? "border-[#0B3954]/20 bg-[#0B3954]/5" : "border-border bg-white"}`}>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5"
                        />
                      </FormControl>
                      <div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[#0B3954]" />
                          <FormLabel className="text-sm font-semibold text-[#0B3954] cursor-pointer">
                            InstantMatch
                          </FormLabel>
                          {field.value && (
                            <Badge className="text-[10px] bg-[#0B3954]/10 text-[#0B3954] border-[#0B3954]/20 rounded-full px-2">
                              On
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          Notify buyers the moment you post — if their open request matches this listing.
                        </p>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <div className="pt-4 border-t border-[#0B3954]/10 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full text-[#0B3954]"
                  onClick={() => setLocation("/seller")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="w-full rounded-[8px] bg-[#0366d6] text-white font-semibold text-[17px] hover:bg-[#024ea4] border-0 py-[14px] transition-colors duration-200 disabled:opacity-60"
                >
                  {submitting ? "Posting…" : "Post Item"}
                </Button>
              </div>

            </form>
          </Form>
        </div>

        {/* Your Posted Items */}
        {user && (
          <div className="mt-12">
            <div className="mb-6 flex items-center gap-2">
              <Tag className="h-5 w-5 text-[#D4AF37]" />
              <h2 className="font-serif text-2xl font-semibold text-[#0B3954]">
                Your Posted Items
              </h2>
              {activeListings.length > 0 && (
                <Badge variant="secondary" className="ml-1">{activeListings.length} active</Badge>
              )}
            </div>

            {activeListings.length === 0 && soldListings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#0B3954]/20 bg-white p-10 text-center shadow-sm">
                <Package className="mx-auto h-9 w-9 text-[#D4AF37]/40 mb-3" />
                <p className="font-serif text-[#0B3954]">No items posted yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Fill in the form above to post your first item.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {activeListings.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#0B3954]/60 uppercase tracking-wide mb-3">Active</h3>
                    <div className="flex flex-col gap-5">
                      {activeListings.map((listing: any) => (
                        <div
                          key={listing.id}
                          className="rounded-[10px] bg-[#fafafa] p-[15px] shadow-[0_2px_5px_rgba(0,0,0,0.05)]"
                        >
                          {listing.imageUrl && (
                            <img
                              src={listing.imageUrl}
                              alt={listing.title}
                              className="w-full max-h-[220px] object-cover rounded-xl mb-3"
                            />
                          )}
                          <h3 className="font-semibold text-[#0B3954] text-base mt-2 mb-1">{listing.title}</h3>
                          <div className="space-y-[4px] text-sm text-gray-700">
                            <p><span className="font-semibold">Category:</span> {listing.category}</p>
                            {listing.condition && (
                              <p><span className="font-semibold">Condition:</span> {CONDITIONS_MAP[listing.condition] ?? listing.condition}</p>
                            )}
                            {listing.brandName && (
                              <p><span className="font-semibold">Brand:</span> {listing.brandName}</p>
                            )}
                            <p><span className="font-semibold">Description:</span> {listing.description}</p>
                            <p><span className="font-semibold">Price:</span> ${Number(listing.price).toFixed(2)}</p>
                            <p><span className="font-semibold">ZIP:</span> {listing.zipCode}</p>
                            {listing.availability && (
                              <p><span className="font-semibold">Delivery:</span> {listing.availability === "local_pickup" ? "Local Pickup" : listing.availability === "shipping" ? "Shipping" : "Local Pickup & Shipping"}</p>
                            )}
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">Listed {formatDate(listing.createdAt)}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={deletingId === listing.id}
                              className="rounded-md bg-[#cc0000] text-white hover:bg-[#a30000] h-8 px-3 text-xs font-medium"
                              onClick={() => deleteItem(listing.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              {deletingId === listing.id ? "Deleting…" : "Delete"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {soldListings.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#0B3954]/60 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Sold
                    </h3>
                    <div className="flex flex-col gap-5">
                      {soldListings.map((listing: any) => (
                        <div
                          key={listing.id}
                          className="rounded-[10px] bg-[#fafafa] p-[15px] shadow-[0_2px_5px_rgba(0,0,0,0.05)] opacity-70"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-[#0B3954] text-base">{listing.title}</h3>
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] shrink-0">Sold</Badge>
                          </div>
                          <div className="mt-2 space-y-[4px] text-sm text-gray-700">
                            <p><span className="font-semibold">Category:</span> {listing.category}</p>
                            <p><span className="font-semibold">Price:</span> ${Number(listing.price).toFixed(2)}</p>
                          </div>
                          <p className="mt-3 text-xs text-muted-foreground">{formatDate(listing.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
}
