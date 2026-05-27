import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  HandCoins,
  MessageCircle,
  MapPin,
  Tag,
  ArrowLeft,
  Loader2,
  Star,
} from "lucide-react";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";

type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  zipCode: string;
  brandName: string;
  condition: string;
  availability: string;
  status: string;
  isAvailable: boolean;
  isFeatured: boolean;
  sellerId: string | null;
  sellerName: string | null;
  createdAt: string;
};

export default function ListingDetail() {
  const [, params] = useRoute("/listings/:id");
  const id = params?.id;
  const { data: user } = useGetCurrentUser();

  const { data: listing, isLoading } = useQuery<Listing>({
    queryKey: ["listing", id],
    queryFn: async () => {
      const res = await fetch(getApiUrl(`listings/${id}`), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Listing not found");
      return res.json();
    },
    enabled: !!id,
  });

  const [buying, setBuying] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerNote, setOfferNote] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isOwnListing = !!user && !!listing && listing.sellerId === user.id;

  async function handleBuy() {
    if (!user) {
      toast.error("Sign in to buy this item.");
      return;
    }
    if (!listing) return;
    setBuying(true);
    try {
      const res = await fetch(getApiUrl(`stripe/buy-listing/${listing.id}`), {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't start checkout.");
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBuying(false);
    }
  }

  async function handleSubmitOffer() {
    if (!user) {
      toast.error("Sign in to make an offer.");
      return;
    }
    if (!listing) return;
    const amount = Number(offerAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid offer amount.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(getApiUrl(`listings/${listing.id}/offer`), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, note: offerNote }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't send offer.");
        return;
      }
      toast.success("Offer sent to seller!");
      setOfferOpen(false);
      setOfferAmount("");
      setOfferNote("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSendMessage() {
    if (!user) {
      toast.error("Sign in to message the seller.");
      return;
    }
    if (!listing) return;
    if (!messageBody.trim()) {
      toast.error("Type a message first.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(getApiUrl(`listings/${listing.id}/message`), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: messageBody }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't send message.");
        return;
      }
      toast.success("Message sent to seller!");
      setMessageOpen(false);
      setMessageBody("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 md:px-8 max-w-5xl py-8">
          <Skeleton className="h-96 rounded-2xl mb-6" />
          <Skeleton className="h-10 w-2/3 mb-2" />
          <Skeleton className="h-6 w-1/3" />
        </div>
      </Layout>
    );
  }

  if (!listing) {
    return (
      <Layout>
        <div className="container mx-auto px-4 md:px-8 max-w-3xl py-16 text-center">
          <Tag className="h-12 w-12 text-[#0B3954]/20 mx-auto mb-3" />
          <h1 className="font-serif text-2xl font-bold text-[#0B3954] mb-2">
            Listing not found
          </h1>
          <p className="text-muted-foreground mb-6">
            This listing may have been sold or removed.
          </p>
          <Link href="/browse">
            <Button className="bg-[#0B3954] text-white hover:bg-[#0B3954]/90">
              Back to Browse
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-8 max-w-5xl py-8">
        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-sm text-[#0B3954]/70 hover:text-[#0B3954] mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Browse
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-white rounded-2xl border border-border/60 overflow-hidden shadow-sm">
            {listing.imageUrl ? (
              <div className="aspect-square bg-gray-100">
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div className="aspect-square bg-[#0B3954]/10 flex items-center justify-center">
                <Tag className="h-16 w-16 text-[#0B3954]/30" />
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-[#0B3954]">
                For Sale
              </span>
              <Badge
                variant="outline"
                className="text-xs border-[#0B3954]/15 text-[#0B3954] rounded-full capitalize"
              >
                {listing.category}
              </Badge>
              {listing.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D4AF37]/20 px-2 py-0.5 text-[10px] font-bold text-[#0B3954]">
                  <Star className="h-3 w-3 fill-[#D4AF37] text-[#D4AF37]" />
                  Featured
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#0B3954] mb-3">
              {listing.title}
            </h1>

            <p className="text-[#D4AF37] font-bold font-serif text-3xl mb-4">
              ${listing.price.toLocaleString()}
            </p>

            <p className="text-base text-muted-foreground mb-5 leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </p>

            <div className="flex flex-col gap-2 text-sm text-[#0B3954]/80 mb-6 bg-[#FDF5E6]/50 rounded-xl p-4 border border-[#D4AF37]/20">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#0B3954]/50" />
                <span>ZIP {listing.zipCode}</span>
              </div>
              {listing.condition && (
                <div className="capitalize">
                  <strong className="text-[#0B3954]">Condition:</strong>{" "}
                  {listing.condition}
                </div>
              )}
              {listing.brandName && (
                <div>
                  <strong className="text-[#0B3954]">Brand:</strong>{" "}
                  {listing.brandName}
                </div>
              )}
              <div>
                <strong className="text-[#0B3954]">Pickup:</strong>{" "}
                {listing.availability === "porch_pickup"
                  ? "Porch Pickup"
                  : listing.availability === "ships"
                  ? "Ships"
                  : "Local Pickup"}
              </div>
              {listing.sellerName && (
                <div>
                  <strong className="text-[#0B3954]">Seller:</strong>{" "}
                  {listing.sellerName}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!listing.isAvailable ? (
              <div className="text-center bg-red-50 text-red-600 font-semibold rounded-xl py-3">
                This item has been sold
              </div>
            ) : isOwnListing ? (
              <div className="text-center bg-[#0B3954]/5 text-[#0B3954] rounded-xl py-3 text-sm">
                This is your listing
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleBuy}
                  disabled={buying}
                  className="w-full bg-[#D4AF37] text-[#0B3954] hover:bg-[#c9a430] font-bold border-0 rounded-full py-6 text-base"
                >
                  {buying ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ShoppingCart className="h-4 w-4 mr-2" />
                  )}
                  Buy Now — ${listing.price.toLocaleString()}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setOfferOpen(true)}
                    variant="outline"
                    className="border-[#0B3954]/30 text-[#0B3954] hover:bg-[#0B3954]/5 rounded-full py-6"
                  >
                    <HandCoins className="h-4 w-4 mr-2" />
                    Make an Offer
                  </Button>
                  <Button
                    onClick={() => setMessageOpen(true)}
                    variant="outline"
                    className="border-[#0B3954]/30 text-[#0B3954] hover:bg-[#0B3954]/5 rounded-full py-6"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message Seller
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Make an Offer Dialog */}
      <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-[#0B3954]">
              Make an Offer
            </DialogTitle>
            <DialogDescription>
              Submit your best offer to the seller. They'll be notified and can
              accept, counter, or decline.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#0B3954] mb-1.5 block">
                Your offer (USD)
              </label>
              <Input
                type="number"
                min="1"
                placeholder={`Listed at $${listing.price}`}
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#0B3954] mb-1.5 block">
                Message (optional)
              </label>
              <Textarea
                placeholder="Tell the seller why you're a great buyer…"
                value={offerNote}
                onChange={(e) => setOfferNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOfferOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitOffer}
              disabled={submitting}
              className="bg-[#D4AF37] text-[#0B3954] hover:bg-[#c9a430] font-bold"
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Seller Dialog */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-[#0B3954]">
              Message {listing.sellerName ?? "Seller"}
            </DialogTitle>
            <DialogDescription>
              Ask a question about "{listing.title}". The seller will be
              notified.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Textarea
              placeholder="Hi! Is this still available? Can you tell me more about…"
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              rows={5}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMessageOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={submitting}
              className="bg-[#0B3954] text-white hover:bg-[#0B3954]/90"
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
