import { Layout } from "@/components/layout";
import { useGetUser, useListRequests, useGetCurrentUser, useUpdateCurrentUser } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, Edit } from "lucide-react";
import { format } from "date-fns";
import { RequestCard } from "@/components/request-card";
import { Button } from "@/components/ui/button";
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
                <h1 className="text-3xl font-serif font-bold">{user.name}</h1>
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

      <div className="container max-w-4xl mx-auto px-4 py-12">
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
