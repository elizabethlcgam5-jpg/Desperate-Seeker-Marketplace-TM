import { Layout } from "@/components/layout";
import {
  useListRequests,
  useGetCurrentUser,
  useListMyListings,
  useDeleteRequest,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardList,
  ShoppingBag,
  RefreshCw,
  Pencil,
  Trash2,
  Plus,
  MapPin,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

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

function statusBadge(status: string) {
  const map: Record<string, string> = {
    open: "bg-emerald-100 text-emerald-800 border-emerald-200",
    active: "bg-emerald-100 text-emerald-800 border-emerald-200",
    fulfilled: "bg-[#0B3954]/10 text-[#0B3954] border-[#0B3954]/20",
    sold: "bg-[#0B3954]/10 text-[#0B3954] border-[#0B3954]/20",
    closed: "bg-muted text-muted-foreground border-border",
  };
  return map[status] ?? "bg-muted text-muted-foreground border-border";
}

export default function MyPosts() {
  const [, setLocation] = useLocation();
  const { data: currentUser, isLoading: userLoading } = useGetCurrentUser();
  const qc = useQueryClient();

  const { data: requests, isLoading: requestsLoading } = useListRequests(
    { buyerId: currentUser?.id },
    { query: { enabled: !!currentUser?.id } },
  );
  const { data: listings, isLoading: listingsLoading } = useListMyListings({
    query: { enabled: !!currentUser },
  });

  const deleteRequest = useDeleteRequest();
  const [repostingId, setRepostingId] = useState<string | null>(null);
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null);
  const [editListing, setEditListing] = useState<any | null>(null);

  const handleDeleteRequest = (requestId: string) => {
    deleteRequest.mutate(
      { requestId },
      {
        onSuccess: () => {
          toast.success("Request deleted.");
          qc.invalidateQueries();
        },
        onError: () => toast.error("Couldn't delete that request. Try again."),
      },
    );
  };

  const handleRepostRequest = async (requestId: string) => {
    setRepostingId(requestId);
    try {
      const res = await fetch(getApiUrl(`requests/${requestId}/repost`), {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to repost");
      toast.success("Request reposted! InstantMatch is scanning for matches.");
      qc.invalidateQueries();
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't repost. Try again.");
    } finally {
      setRepostingId(null);
    }
  };

  const handleRepostListing = async (listingId: string) => {
    setRepostingId(listingId);
    try {
      const res = await fetch(getApiUrl(`listings/${listingId}/repost`), {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to repost");
      toast.success("Item relisted! InstantMatch is scanning for buyers.");
      qc.invalidateQueries();
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't relist. Try again.");
    } finally {
      setRepostingId(null);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    setDeletingListingId(listingId);
    try {
      const res = await fetch(getApiUrl(`listings/${listingId}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to delete");
      toast.success("Item deleted.");
      qc.invalidateQueries();
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't delete that item. Try again.");
    } finally {
      setDeletingListingId(null);
    }
  };

  const handleSaveListing = async () => {
    if (!editListing) return;
    try {
      const res = await fetch(getApiUrl(`listings/${editListing.id}`), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editListing.title,
          description: editListing.description,
          category: editListing.category,
          condition: editListing.condition,
          availability: editListing.availability,
          zipCode: editListing.zipCode,
          brandName: editListing.brandName ?? "",
          price: Number(editListing.price),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to save");
      toast.success("Item updated.");
      setEditListing(null);
      qc.invalidateQueries();
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't save changes. Try again.");
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

  if (!currentUser) {
    return (
      <Layout>
        <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="font-serif text-2xl text-[#0B3954]">Sign in to see your posts</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your requests and items for sale all live here.
          </p>
          <Button
            className="mt-5 rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0"
            onClick={() => setLocation("/login")}
          >
            Sign In
          </Button>
        </div>
      </Layout>
    );
  }

  const myRequests = requests ?? [];
  const myListings = listings ?? [];

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-10 md:px-8">
        <div className="mb-6">
          <h1 className="font-serif text-3xl text-[#0B3954]">My Posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything you&apos;ve posted — your requests and your items for sale.
          </p>
        </div>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="rounded-full">
            <TabsTrigger value="requests" className="rounded-full gap-1.5">
              <ClipboardList className="h-4 w-4" />
              Requests
              <Badge variant="secondary" className="ml-1">{myRequests.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="items" className="rounded-full gap-1.5">
              <ShoppingBag className="h-4 w-4" />
              Items for Sale
              <Badge variant="secondary" className="ml-1">{myListings.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Requests tab */}
          <TabsContent value="requests" className="mt-6">
            <div className="mb-4 flex justify-end">
              <Button
                size="sm"
                className="rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 gap-1.5"
                onClick={() => setLocation("/requests/new")}
              >
                <Plus className="h-4 w-4" /> New Request
              </Button>
            </div>
            {requestsLoading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-36 rounded-2xl" />
                ))}
              </div>
            ) : myRequests.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-white p-10 text-center shadow-sm">
                <ClipboardList className="mx-auto h-9 w-9 text-[#D4AF37]/40 mb-3" />
                <p className="font-serif text-[#0B3954]">No requests yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Post what you&apos;re looking for and let sellers come to you.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {myRequests.map((req: any) => (
                  <div
                    key={req.id}
                    className="rounded-2xl bg-white border border-border/60 p-5 shadow-sm flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/requests/${req.id}`} className="min-w-0 flex-1">
                        <p className="font-semibold text-[#0B3954] truncate hover:underline">
                          {req.title}
                        </p>
                      </Link>
                      <Badge variant="outline" className={`text-[10px] capitalize ${statusBadge(req.status)}`}>
                        {req.status}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-[10px] capitalize">{req.category}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Posted {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                    </p>
                    <div className="mt-auto pt-4 flex gap-2">
                      <Link href={`/requests/${req.id}/edit`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full rounded-full border-[#0B3954]/30 text-[#0B3954] hover:bg-[#0B3954]/5 text-xs font-semibold gap-1.5"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={repostingId === req.id}
                        onClick={() => handleRepostRequest(req.id)}
                        className="flex-1 rounded-full border-[#D4AF37]/40 text-[#0B3954] hover:bg-[#D4AF37]/10 text-xs font-semibold gap-1.5"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${repostingId === req.id ? "animate-spin" : ""}`} />
                        Repost
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/5 text-xs font-semibold"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this request?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This permanently removes your request and any offers sellers have
                              made on it. This can&apos;t be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDeleteRequest(req.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Items tab */}
          <TabsContent value="items" className="mt-6">
            <div className="mb-4 flex justify-end">
              <Button
                size="sm"
                className="rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 gap-1.5"
                onClick={() => setLocation("/listings/new")}
              >
                <Plus className="h-4 w-4" /> New Listing
              </Button>
            </div>
            {listingsLoading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-44 rounded-2xl" />
                ))}
              </div>
            ) : myListings.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-white p-10 text-center shadow-sm">
                <ShoppingBag className="mx-auto h-9 w-9 text-[#D4AF37]/40 mb-3" />
                <p className="font-serif text-[#0B3954]">No items for sale</p>
                <p className="text-sm text-muted-foreground mt-1">
                  List an item to appear in the marketplace.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {myListings.map((listing: any) => (
                  <div
                    key={listing.id}
                    className="rounded-2xl bg-white border border-border/60 p-5 shadow-sm flex flex-col"
                  >
                    {listing.imageUrl && (
                      <div className="mb-3 h-32 w-full overflow-hidden rounded-xl bg-muted">
                        <img src={listing.imageUrl} alt={listing.title} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-[#0B3954] truncate min-w-0 flex-1">{listing.title}</p>
                      <p className="font-serif text-lg font-bold text-[#0B3954] shrink-0">
                        ${Number(listing.price).toFixed(0)}
                      </p>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-[10px] capitalize">{listing.category}</Badge>
                      <Badge variant="outline" className={`text-[10px] capitalize ${statusBadge(listing.status)}`}>
                        {listing.status}
                      </Badge>
                      {listing.availability && (
                        <Badge variant="outline" className="text-[10px] flex items-center gap-0.5">
                          {listing.availability === "local_pickup" ? (
                            <MapPin className="h-2.5 w-2.5" />
                          ) : (
                            <Truck className="h-2.5 w-2.5" />
                          )}
                          {AVAILABILITY.find((a) => a.value === listing.availability)?.label ?? listing.availability}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-auto pt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditListing({ ...listing })}
                        className="flex-1 rounded-full border-[#0B3954]/30 text-[#0B3954] hover:bg-[#0B3954]/5 text-xs font-semibold gap-1.5"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={repostingId === listing.id}
                        onClick={() => handleRepostListing(listing.id)}
                        className="flex-1 rounded-full border-[#D4AF37]/40 text-[#0B3954] hover:bg-[#D4AF37]/10 text-xs font-semibold gap-1.5"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${repostingId === listing.id ? "animate-spin" : ""}`} />
                        Relist
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deletingListingId === listing.id}
                            className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/5 text-xs font-semibold"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This permanently removes your listing from the marketplace. This
                              can&apos;t be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDeleteListing(listing.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit listing dialog */}
      <Dialog open={!!editListing} onOpenChange={(o) => !o && setEditListing(null)}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-[#0B3954]">Edit Item</DialogTitle>
            <DialogDescription>Update your listing details below.</DialogDescription>
          </DialogHeader>
          {editListing && (
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0B3954]">Title</label>
                <Input
                  value={editListing.title}
                  onChange={(e) => setEditListing({ ...editListing, title: e.target.value })}
                  className="rounded-xl border-[#0B3954]/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0B3954]">Description</label>
                <Textarea
                  value={editListing.description}
                  onChange={(e) => setEditListing({ ...editListing, description: e.target.value })}
                  className="rounded-xl border-[#0B3954]/20 resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0B3954]">Price ($)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editListing.price}
                    onChange={(e) => setEditListing({ ...editListing, price: e.target.value })}
                    className="rounded-xl border-[#0B3954]/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0B3954]">ZIP Code</label>
                  <Input
                    value={editListing.zipCode ?? ""}
                    onChange={(e) => setEditListing({ ...editListing, zipCode: e.target.value })}
                    className="rounded-xl border-[#0B3954]/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0B3954]">Category</label>
                  <Select
                    value={editListing.category}
                    onValueChange={(v) => setEditListing({ ...editListing, category: v })}
                  >
                    <SelectTrigger className="rounded-xl border-[#0B3954]/20">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0B3954]">Condition</label>
                  <Select
                    value={editListing.condition ?? "good"}
                    onValueChange={(v) => setEditListing({ ...editListing, condition: v })}
                  >
                    <SelectTrigger className="rounded-xl border-[#0B3954]/20">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#0B3954]">Delivery</label>
                <Select
                  value={editListing.availability ?? "local_pickup"}
                  onValueChange={(v) => setEditListing({ ...editListing, availability: v })}
                >
                  <SelectTrigger className="rounded-xl border-[#0B3954]/20">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABILITY.map((a) => (
                      <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setEditListing(null)}>
              Cancel
            </Button>
            <Button
              className="rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0"
              onClick={handleSaveListing}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
