import { Layout } from "@/components/layout";
import {
  useGetUser,
  useGetCurrentUser,
  useUpdateCurrentUser,
  useSubscribeCurrentUser,
} from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, Edit, Sparkles, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { RequestCard } from "@/components/request-card";
import { TierBadge } from "@/components/tier-badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  location: z.string().optional(),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export default function UserProfile() {
  const { id } = useParams();
  const { data: currentUser } = useGetCurrentUser();
  const userId = id || currentUser?.id;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const updateCurrentUser = useUpdateCurrentUser();
  const subscribe = useSubscribeCurrentUser();
  
  const { data: profile, isLoading } = useGetUser(userId as string, {
    query: { enabled: !!userId },
  });

  const isMe = currentUser?.id === userId;

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.user?.name || "",
      bio: profile?.user?.bio || "",
      location: profile?.user?.location || "",
      avatarUrl: profile?.user?.avatarUrl || "",
    },
  });

  // Update form defaults when profile loads
  if (profile?.user && form.getValues("name") === "") {
    form.reset({
      name: profile.user.name,
      bio: profile.user.bio || "",
      location: profile.user.location || "",
      avatarUrl: profile.user.avatarUrl || "",
    });
  }

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    updateCurrentUser.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast.success("Profile updated successfully");
          setIsEditDialogOpen(false);
          queryClient.invalidateQueries();
        },
        onError: () => {
          toast.error("Failed to update profile");
        }
      }
    );
  };

  if (isLoading || !profile) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center gap-6 mb-12">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const { user, requestCount, responseCount, acceptedCount, recentRequests } = profile;

  return (
    <Layout>
      <div className="bg-muted/20 border-b">
        <div className="container max-w-4xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-lg">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-3xl font-serif font-bold">{user.name}</h1>
                  <TierBadge tier={user.subscriptionTier} />
                </div>
                <p className="text-muted-foreground font-medium">@{user.handle}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
                  {user.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {user.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {format(new Date(user.joinedAt), "MMM yyyy")}
                  </div>
                </div>
              </div>
            </div>
            
            {isMe && (
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="avatarUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Avatar URL</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={updateCurrentUser.isPending}>
                          {updateCurrentUser.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {user.bio && (
            <p className="mt-8 text-lg max-w-2xl leading-relaxed text-foreground/80">
              {user.bio}
            </p>
          )}

          <div className="grid grid-cols-3 gap-4 mt-10 max-w-2xl">
            <div className="bg-card border rounded-xl p-4 text-center shadow-sm">
              <div className="text-3xl font-serif font-bold text-primary mb-1">{requestCount}</div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Requests</div>
            </div>
            <div className="bg-card border rounded-xl p-4 text-center shadow-sm">
              <div className="text-3xl font-serif font-bold text-foreground mb-1">{responseCount}</div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Offers Made</div>
            </div>
            <div className="bg-card border rounded-xl p-4 text-center shadow-sm">
              <div className="text-3xl font-serif font-bold text-secondary mb-1">{acceptedCount}</div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Matches</div>
            </div>
          </div>
        </div>
      </div>

      {isMe && <div className="container max-w-4xl mx-auto px-4 pt-12"><SubscriptionPanel
        tier={user.subscriptionTier}
        renewsAt={user.subscriptionRenewsAt}
        onCancel={() =>
          subscribe.mutate(
            { data: { tier: "free" } },
            {
              onSuccess: () => {
                queryClient.invalidateQueries();
                toast.success("You're back on the free plan.");
              },
              onError: () => toast.error("Couldn't cancel right now."),
            },
          )
        }
        cancelling={subscribe.isPending}
      /></div>}

      <div className="container max-w-4xl mx-auto px-4 pt-12">
        <h2 className="text-2xl font-serif font-bold mb-6">Recent Requests</h2>
        {recentRequests && recentRequests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recentRequests.map(req => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
            <p className="text-muted-foreground">{isMe ? "You haven't" : `${user.name} hasn't`} posted any requests yet.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

const TIER_LABELS: Record<string, { name: string; price: string; cycle: string }> = {
  free: { name: "Free Buyer", price: "$0", cycle: "no card on file" },
  seller_basic: { name: "Seller Basic", price: "$4.99", cycle: "billed monthly" },
  seller_pro: { name: "Seller Pro", price: "$9.99", cycle: "billed monthly" },
  seller_annual: { name: "Seller Annual", price: "$19.99", cycle: "billed yearly" },
};

function SubscriptionPanel({
  tier,
  renewsAt,
  onCancel,
  cancelling,
}: {
  tier: string | null | undefined;
  renewsAt: Date | string | null | undefined;
  onCancel: () => void;
  cancelling: boolean;
}) {
  const t = (tier || "free") as keyof typeof TIER_LABELS;
  const label = TIER_LABELS[t] || TIER_LABELS.free;
  const isPaid = t !== "free";
  const renews = renewsAt ? new Date(renewsAt) : null;

  return (
    <section className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-serif font-bold">My Subscription</h2>
            <TierBadge tier={(tier as never) ?? "free"} />
          </div>
          <p className="text-sm text-muted-foreground">
            You're on the <span className="font-medium text-foreground">{label.name}</span> plan
            {" — "}
            <span>{label.price}</span>{" "}
            <span className="text-muted-foreground">{label.cycle}</span>
            {isPaid && renews && (
              <>
                . Renews on{" "}
                <span className="font-medium text-foreground">
                  {format(renews, "MMM d, yyyy")}
                </span>
                .
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isPaid ? (
            <>
              <Link href="/pricing">
                <Button variant="outline" className="gap-1.5">
                  Change plan
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="text-muted-foreground hover:text-destructive">
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You'll lose your seller perks immediately and switch back to
                      the free buyer plan. You can resubscribe anytime.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep subscription</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onCancel}
                      disabled={cancelling}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {cancelling ? "Cancelling..." : "Yes, cancel"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <Link href="/pricing">
              <Button className="gap-1.5">
                <Sparkles className="h-4 w-4" />
                Upgrade to seller
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
