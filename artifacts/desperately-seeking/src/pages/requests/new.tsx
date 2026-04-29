import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCreateRequest } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PenSquare, Lock, Search, Camera, Sparkles, X as XIcon, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { getApiUrl } from "@/lib/api";

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
  "Collectibles",
  "Other",
];

const STYLES = [
  "Victorian",
  "MCM / Mid-Century Modern",
  "Rustic",
  "Industrial",
  "Bohemian",
  "Art Deco",
  "Scandinavian",
  "Minimalist",
  "Eclectic",
];

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z
    .string()
    .min(20, "Please provide a bit more detail (min 20 characters)")
    .max(2000),
  category: z.string().min(1, "Please select a category"),
  style: z.string().optional(),
  budgetMin: z.coerce.number().optional().or(z.literal("")),
  budgetMax: z.coerce.number().optional().or(z.literal("")),
  lengthIn: z.coerce.number().optional().or(z.literal("")),
  widthIn: z.coerce.number().optional().or(z.literal("")),
  heightIn: z.coerce.number().optional().or(z.literal("")),
  location: z.string().optional(),
  urgency: z.enum(["low", "normal", "high"]).default("normal"),
  tags: z.string().optional(),
  isPrivate: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

export default function NewRequest() {
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createRequest = useCreateRequest();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  async function handlePhotoUpload(file: File) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPhotoPreview(dataUrl);
      setAnalyzing(true);
      try {
        const res = await fetch(getApiUrl("ai/analyze-image"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ imageBase64: dataUrl }),
        });
        if (res.ok) {
          const { description } = await res.json();
          if (description) {
            form.setValue("title", description, { shouldValidate: true });
            if (!form.getValues("description")) {
              form.setValue(
                "description",
                `Looking for an item similar to what's shown in the photo. ${description}. Please share condition, price, and photos.`,
                { shouldValidate: true },
              );
            }
            toast.success("Photo analysed — form pre-filled!");
          }
        } else {
          toast.error("Couldn't analyse photo. Fill in the form manually.");
        }
      } catch {
        toast.error("Couldn't analyse photo. Fill in the form manually.");
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  }

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      style: "",
      budgetMin: "",
      budgetMax: "",
      lengthIn: "",
      widthIn: "",
      heightIn: "",
      location: "",
      urgency: "normal",
      tags: "",
      isPrivate: false,
    },
  });

  function onSubmit(values: FormData) {
    const data = {
      title: values.title,
      description: values.description,
      category: values.category,
      urgency: values.urgency,
      isPrivate: values.isPrivate,
      ...(values.style && { style: values.style }),
      ...(values.budgetMin && { budgetMin: Number(values.budgetMin) }),
      ...(values.budgetMax && { budgetMax: Number(values.budgetMax) }),
      ...(values.lengthIn && { lengthIn: Number(values.lengthIn) }),
      ...(values.widthIn && { widthIn: Number(values.widthIn) }),
      ...(values.heightIn && { heightIn: Number(values.heightIn) }),
      ...(values.location && { location: values.location }),
      ...(values.tags && {
        tags: values.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    };

    createRequest.mutate(
      { data },
      {
        onSuccess: (response) => {
          queryClient.invalidateQueries();
          toast.success("Request posted successfully!");
          setLocation(`/requests/${response.id}`);
        },
        onError: () => {
          toast.error("Failed to post request. Please try again.");
        },
      },
    );
  }

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#0B3954] mb-4">
            <Search className="h-7 w-7 text-[#D4AF37]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#0B3954] mb-2">
            Write a Wanted Ad
          </h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Describe what you're looking for in plain language. Sellers will come to you with their best offers.
          </p>
        </div>

        <div className="bg-white border border-[#0B3954]/10 rounded-2xl p-6 md:p-8 shadow-md">
          {/* Photo search banner */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhotoUpload(file);
              e.target.value = "";
            }}
          />
          {photoPreview ? (
            <div className="mb-6 flex items-start gap-3 bg-[#0B3954]/4 border border-[#0B3954]/12 rounded-xl p-3">
              <div className="relative shrink-0">
                <img
                  src={photoPreview}
                  alt="Uploaded"
                  className="h-16 w-16 rounded-lg object-cover border border-[#0B3954]/15"
                />
                {analyzing && (
                  <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {analyzing ? (
                  <div className="flex items-center gap-2 text-sm text-[#0B3954]">
                    <Sparkles className="h-4 w-4 text-[#D4AF37] animate-pulse" />
                    Analysing your photo…
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-[#0B3954]">
                    <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                    <span className="font-medium">Form pre-filled from photo</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Edit the fields below as needed.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPhotoPreview(null);
                  form.setValue("title", "");
                  form.setValue("description", "");
                }}
                className="text-[#0B3954]/40 hover:text-[#0B3954] transition-colors"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full mb-6 flex items-center gap-3 px-4 py-3 border border-dashed border-[#0B3954]/20 rounded-xl hover:border-[#0B3954]/40 hover:bg-[#0B3954]/3 transition-colors group text-left"
            >
              <div className="h-8 w-8 rounded-lg bg-[#D4AF37]/15 flex items-center justify-center group-hover:bg-[#D4AF37]/25 transition-colors shrink-0">
                <Camera className="h-4 w-4 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0B3954]">
                  Have a photo? Let AI fill this in for you
                </p>
                <p className="text-xs text-muted-foreground">
                  Upload a picture and we'll identify the item and pre-fill the form.
                </p>
              </div>
              <Sparkles className="h-4 w-4 text-[#D4AF37]/60 ml-auto shrink-0" />
            </button>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-[#0B3954]">
                      What are you looking for? *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. A vintage espresso machine in working condition"
                        className="text-base rounded-xl border-[#0B3954]/20 h-12"
                        {...field}
                      />
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
                    <FormLabel className="text-base font-semibold text-[#0B3954]">
                      The Details *
                    </FormLabel>
                    <FormDescription>
                      Preferred brands, acceptable condition, deal-breakers, and
                      any other specifics.
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="I'm hoping to find a mid-century lever espresso machine. Doesn't have to be perfect cosmetically, but needs to hold pressure..."
                        className="min-h-[130px] resize-y text-base rounded-xl border-[#0B3954]/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category + Style */}
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
                            <SelectValue placeholder="Choose a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
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
                            <SelectValue placeholder="Any style (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STYLES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              {/* Budget */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="budgetMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B3954]">Min Budget ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          className="rounded-xl border-[#0B3954]/20"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budgetMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B3954]">Max Budget ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="500"
                          className="rounded-xl border-[#0B3954]/20"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Dimensions */}
              <div>
                <p className="text-sm font-semibold text-[#0B3954] mb-2">
                  Dimensions (inches, optional)
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {(["lengthIn", "widthIn", "heightIn"] as const).map((f, i) => (
                    <FormField
                      key={f}
                      control={form.control}
                      name={f}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">
                            {["Length ″", "Width ″", "Height ″"][i]}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              className="rounded-xl border-[#0B3954]/20"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Urgency + Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="urgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B3954]">How soon do you need it?</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-[#0B3954]/20">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">No rush (whenever)</SelectItem>
                          <SelectItem value="normal">Normal (next few weeks)</SelectItem>
                          <SelectItem value="high">Urgent (ASAP)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B3954]">Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. San Francisco, CA or Anywhere"
                          className="rounded-xl border-[#0B3954]/20"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B3954]">Tags</FormLabel>
                    <FormDescription>
                      Comma-separated keywords (e.g. vintage, walnut, 1960s)
                    </FormDescription>
                    <FormControl>
                      <Input
                        placeholder="tag1, tag2, tag3"
                        className="rounded-xl border-[#0B3954]/20"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Private listing toggle */}
              <FormField
                control={form.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-start gap-4 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-4">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5"
                        />
                      </FormControl>
                      <div>
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-[#D4AF37]" />
                          <FormLabel className="text-sm font-semibold text-[#0B3954] cursor-pointer">
                            Private listing
                          </FormLabel>
                          <Badge className="text-[10px] bg-[#D4AF37]/15 text-[#6b530f] border-[#D4AF37]/30 rounded-full px-2">
                            Sellers only
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          Only subscribed sellers can see this request. Your name and
                          contact details stay hidden from non-subscribers.
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
                  onClick={() => setLocation("/")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="rounded-full px-8 bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 transition-transform hover:-translate-y-0.5"
                  disabled={createRequest.isPending}
                >
                  <PenSquare className="mr-2 h-4 w-4" />
                  {createRequest.isPending ? "Posting..." : "Post Wanted Ad"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
