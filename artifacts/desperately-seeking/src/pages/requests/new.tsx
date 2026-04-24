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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCreateRequest } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PenSquare } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Please provide a bit more detail (min 20 characters)").max(2000),
  category: z.string().min(1, "Please select a category"),
  budgetMin: z.coerce.number().optional().or(z.literal("")),
  budgetMax: z.coerce.number().optional().or(z.literal("")),
  location: z.string().optional(),
  urgency: z.enum(["low", "normal", "high"]).default("normal"),
  tags: z.string().optional(),
});

export default function NewRequest() {
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createRequest = useCreateRequest();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      budgetMin: "",
      budgetMax: "",
      location: "",
      urgency: "normal",
      tags: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const data = {
      title: values.title,
      description: values.description,
      category: values.category,
      urgency: values.urgency,
      ...(values.budgetMin && { budgetMin: Number(values.budgetMin) }),
      ...(values.budgetMax && { budgetMax: Number(values.budgetMax) }),
      ...(values.location && { location: values.location }),
      ...(values.tags && { tags: values.tags.split(",").map((t) => t.trim()).filter(Boolean) }),
    };

    createRequest.mutate(
      { data },
      {
        onSuccess: (response) => {
          queryClient.invalidateQueries();
          toast.success("Request posted successfully!");
          setLocation(`/requests/${response.id}`);
        },
        onError: (error) => {
          toast.error("Failed to post request. Please try again.");
          console.error(error);
        },
      }
    );
  }

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 text-primary rounded-2xl mb-4">
            <PenSquare className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Write a Wanted Ad</h1>
          <p className="text-muted-foreground text-lg">
            Describe what you're looking for in plain language. Sellers will come to you with their best offers.
          </p>
        </div>

        <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">What are you looking for?</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. A vintage espresso machine, working condition" className="text-lg py-6" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">The Details</FormLabel>
                    <FormDescription>
                      Share the specifics: preferred brands, acceptable wear and tear, absolute must-haves.
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="I'm hoping to find a mid-century lever espresso machine. Doesn't have to be perfect cosmetically, but needs to hold pressure and work reliably..." 
                        className="min-h-[150px] resize-y text-base" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="furniture">Furniture</SelectItem>
                          <SelectItem value="clothing">Clothing</SelectItem>
                          <SelectItem value="home">Home & Garden</SelectItem>
                          <SelectItem value="hobbies">Hobbies & Craft</SelectItem>
                          <SelectItem value="collectibles">Collectibles</SelectItem>
                          <SelectItem value="vehicles">Vehicles</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="urgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How soon do you need it?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select urgency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">No rush (whenever)</SelectItem>
                          <SelectItem value="normal">Normal (next few weeks)</SelectItem>
                          <SelectItem value="high">Urgent (need it ASAP)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="budgetMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Budget ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="budgetMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Budget ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="500" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. San Francisco, CA or Anywhere" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (Optional)</FormLabel>
                    <FormDescription>Comma separated keywords (e.g. vintage, coffee, lever)</FormDescription>
                    <FormControl>
                      <Input placeholder="tag1, tag2, tag3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-6 border-t flex justify-end gap-4">
                <Button type="button" variant="ghost" onClick={() => setLocation("/")}>
                  Cancel
                </Button>
                <Button type="submit" size="lg" className="rounded-full px-8" disabled={createRequest.isPending}>
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
