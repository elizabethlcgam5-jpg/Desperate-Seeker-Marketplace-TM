import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { PackagePlus, Truck, Lock } from "lucide-react";
import { useRef, useState } from "react";

const FREE_LISTING_LIMIT = 2;
const freeListingsUsed = 2;

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
});

type FormData = z.infer<typeof formSchema>;

export default function NewListing() {
  const [_, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [limitOpen, setLimitOpen] = useState(freeListingsUsed >= FREE_LISTING_LIMIT);

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

  function onSubmit(_values: FormData) {
    toast.success("Item submitted successfully!");
    setLocation("/me/listings");
  }

  return (
    <Layout>
      {/* Free listing limit popup */}
      <Dialog open={limitOpen} onOpenChange={setLimitOpen}>
        <DialogContent className="max-w-sm rounded-2xl text-center px-6 py-8">
          <div className="flex justify-center mb-3">
            <div className="h-14 w-14 rounded-full bg-[#0B3954]/8 flex items-center justify-center">
              <Lock className="h-7 w-7 text-[#0B3954]" />
            </div>
          </div>
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold text-[#0B3954] leading-snug">
              You've Reached Your Free Posting Limit
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              You've posted {FREE_LISTING_LIMIT} free items. To continue selling, choose a plan below.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-3">
            <Button
              className="w-full rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 h-11"
              onClick={() => setLocation("/pricing")}
            >
              Monthly Plan — $1.99 / month
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-full border-[#0B3954]/25 text-[#0B3954] hover:bg-[#0B3954]/5 h-11"
              onClick={() => setLocation("/pricing")}
            >
              Yearly Plan — $29.99
              <span className="ml-1.5 text-xs text-[#D4AF37] font-semibold">Save 60%</span>
            </Button>
            <button
              className="w-full text-xs text-muted-foreground hover:text-[#0B3954] transition-colors pt-1"
              onClick={() => { setLimitOpen(false); setLocation("/me/listings"); }}
            >
              Maybe later — view my listings
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="container max-w-3xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#0B3954] mb-4">
            <PackagePlus className="h-7 w-7 text-[#D4AF37]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#0B3954] mb-2">
            I'm Selling
          </h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            List what you have. Buyers who need it will find you.
          </p>
        </div>

        <div className="bg-white border border-[#0B3954]/10 rounded-2xl p-6 md:p-8 shadow-md">
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
                        className="rounded-xl border-[#0B3954]/20 h-11"
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
                      <FormLabel className="text-[#0B3954]">Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-[#0B3954]/20">
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
                      <FormLabel className="text-[#0B3954]">Condition *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-[#0B3954]/20">
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
                      <FormLabel className="text-[#0B3954]">Color *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Walnut Brown"
                          className="rounded-xl border-[#0B3954]/20 h-11"
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
                          className="rounded-xl border-[#0B3954]/20 h-11"
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
                        className="min-h-[120px] resize-y rounded-xl border-[#0B3954]/20"
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
                      <FormLabel className="text-[#0B3954]">Price ($) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          className="rounded-xl border-[#0B3954]/20 h-11"
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
                      <FormLabel className="text-[#0B3954]">ZIP Code *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your ZIP code"
                          maxLength={10}
                          className="rounded-xl border-[#0B3954]/20 h-11"
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
                    <FormLabel className="text-[#0B3954]">Delivery Options *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-[#0B3954]/20">
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
                        className="rounded-xl border-[#0B3954]/20 h-10"
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
                        <SelectTrigger className="rounded-xl border-[#0B3954]/20 h-10">
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
                        <SelectTrigger className="rounded-xl border-[#0B3954]/20 h-10">
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
                  className="rounded-full px-8 bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 transition-transform hover:-translate-y-0.5"
                >
                  <PackagePlus className="mr-2 h-4 w-4" />
                  Submit Item
                </Button>
              </div>

            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
