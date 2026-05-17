import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UpgradeNudge } from "@/components/upgrade-nudge";
import { Input } from "@/components/ui/input";
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
  useListInventoryItems,
  useCreateInventoryItem,
  useDeleteInventoryItem,
} from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link } from "wouter";
import { Package, Plus, Trash2, Sparkles } from "lucide-react";

const CATEGORIES = [
  "Antique Furniture",
  "Vintage Streetwear",
  "Mid-Century Furniture",
  "Cameras & Photography",
  "Books & Media",
  "Jewelry & Watches",
  "Tech & Electronics",
  "Art & Decor",
  "Bikes & Sporting Goods",
  "Musical Instruments",
  "Other",
];

const STYLES = [
  "Victorian", "MCM / Mid-Century Modern", "Rustic", "Industrial",
  "Bohemian", "Art Deco", "Scandinavian", "Minimalist", "Eclectic",
];

const schema = z.object({
  title: z.string().min(2, "Title is required"),
  category: z.string().min(1, "Category is required"),
  style: z.string().optional(),
  description: z.string().optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  lengthIn: z.coerce.number().optional(),
  widthIn: z.coerce.number().optional(),
  heightIn: z.coerce.number().optional(),
  condition: z.enum(["new", "like_new", "good", "fair", "used"]).optional(),
});

type FormData = z.infer<typeof schema>;

export default function Inventory() {
  const { data: user } = useGetCurrentUser();
  const { data: items, isLoading } = useListInventoryItems();
  const createItem = useCreateInventoryItem();
  const deleteItem = useDeleteInventoryItem();
  const qc = useQueryClient();

  const isSeller = user && user.subscriptionTier && user.subscriptionTier !== "free";

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", category: "", style: "", description: "" },
  });

  const onSubmit = (data: FormData) => {
    createItem.mutate(
      { data },
      {
        onSuccess: () => {
          qc.invalidateQueries();
          toast.success("Item added to inventory!");
          form.reset();
        },
        onError: () => toast.error("Couldn't add item. Try again."),
      },
    );
  };

  if (!isSeller) {
    return (
      <Layout>
        <div className="container mx-auto max-w-3xl px-4 py-16 md:px-8 space-y-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#0B3954] mb-1">My Inventory</h1>
            <p className="text-sm text-muted-foreground">Quick-list items and get matched with buyers automatically.</p>
          </div>
          <UpgradeNudge variant="feature" />
          <div className="rounded-2xl border border-border/60 bg-white p-8 text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-[#0B3954]/5 flex items-center justify-center">
              <Package className="h-7 w-7 text-[#D4AF37]" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-[#0B3954] mb-2">Inventory is a seller feature</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              List items in your storage and get matched with buyers looking for exactly what you have — even before you've decided to sell.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-5xl px-4 py-10 md:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Package className="h-6 w-6 text-[#D4AF37]" />
            <h1 className="font-serif text-3xl text-[#0B3954]">My Inventory</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Quick-list items you have in storage. We'll match them against open buyer requests automatically.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Quick-List Form */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl border-[#0B3954]/15 shadow-md sticky top-24">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-lg text-[#0B3954] flex items-center gap-2">
                  <Plus className="h-4 w-4 text-[#D4AF37]" />
                  Quick-List an Item
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B3954]">What is it? *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Queen Anne dining table" className="rounded-xl border-[#0B3954]/20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B3954]">Category *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl border-[#0B3954]/20">
                                <SelectValue placeholder="Choose a category" />
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
                      name="style"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B3954]">Style</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? ""}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl border-[#0B3954]/20">
                                <SelectValue placeholder="Style (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {STYLES.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="priceMin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0B3954]">Price from ($)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" className="rounded-xl border-[#0B3954]/20" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="priceMax"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#0B3954]">Price to ($)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="500" className="rounded-xl border-[#0B3954]/20" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(["lengthIn", "widthIn", "heightIn"] as const).map((f, i) => (
                        <FormField
                          key={f}
                          control={form.control}
                          name={f}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-[#0B3954]">{["L″", "W″", "H″"][i]}</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0" className="rounded-xl border-[#0B3954]/20 text-sm" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B3954]">Condition</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? ""}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl border-[#0B3954]/20">
                                <SelectValue placeholder="Condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["new", "like_new", "good", "fair", "used"].map((c) => (
                                <SelectItem key={c} value={c} className="capitalize">{c.replace("_", " ")}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B3954]">Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Any extra details..." className="rounded-xl border-[#0B3954]/20 resize-none" rows={2} {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={createItem.isPending}
                      className="w-full rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0"
                    >
                      {createItem.isPending ? "Adding..." : "Add to Inventory"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Inventory list */}
          <div className="lg:col-span-3 space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))
            ) : !items || items.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-white p-12 text-center shadow-sm">
                <Package className="mx-auto h-10 w-10 text-[#D4AF37]/50 mb-3" />
                <p className="font-serif text-lg text-[#0B3954]">Nothing in your inventory yet</p>
                <p className="text-sm text-muted-foreground mt-1">Add items with the Quick-List form to start getting matched.</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="rounded-2xl bg-white border border-[#0B3954]/10 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <Badge className="rounded-full text-xs bg-[#0B3954]/8 text-[#0B3954] border-[#0B3954]/15 capitalize">
                          {item.category}
                        </Badge>
                        {item.style && (
                          <Badge className="rounded-full text-xs bg-[#D4AF37]/12 text-[#6b530f] border-[#D4AF37]/30 italic">
                            {item.style}
                          </Badge>
                        )}
                        <Badge className="rounded-full text-xs capitalize" variant="outline">
                          {item.condition.replace("_", " ")}
                        </Badge>
                      </div>
                      <h3 className="font-serif font-semibold text-[#0B3954]">{item.title}</h3>
                      {(item.priceMin || item.priceMax) && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {item.priceMin && item.priceMax
                            ? `$${item.priceMin} – $${item.priceMax}`
                            : item.priceMin
                              ? `From $${item.priceMin}`
                              : `Up to $${item.priceMax}`}
                          {(item.lengthIn || item.widthIn) && (
                            <span className="ml-2 text-[#D4AF37]">
                              {item.lengthIn}″ × {item.widthIn}″
                            </span>
                          )}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        deleteItem.mutate(
                          { itemId: item.id },
                          {
                            onSuccess: () => { qc.invalidateQueries(); toast.success("Item removed."); },
                          },
                        )
                      }
                      className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
