import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useSearch } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MicButton } from "@/components/mic-button";
import { RequestCard } from "@/components/request-card";
import {
  useListListings,
  useListRequests,
  useGetCurrentUser,
  type Listing,
  type RequestSummary,
} from "@workspace/api-client-react";
import {
  MapPin,
  Search,
  Tag,
  X,
  Star,
  Camera,
  Loader2,
  ShoppingCart,
  Inbox,
  ArrowDownWideNarrow,
} from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";

const CATEGORIES = [
  "All",
  "Furniture",
  "Electronics",
  "Cameras",
  "Bikes",
  "Kitchen",
  "Clothing",
  "Books & Media",
  "Home & Garden",
  "Tools",
  "Collectibles",
  "Art & Collectibles",
  "Jewelry & Watches",
  "Musical Instruments",
  "Outdoor & Sports",
  "Toys & Games",
  "Other",
];

type FeedFilter = "all" | "requests" | "listings";
type SortOrder = "newest" | "oldest";

function ListingCard({
  listing,
  onBuy,
  buyLoading,
}: {
  listing: Listing;
  onBuy?: () => void;
  buyLoading?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-all flex flex-col ${
        listing.isFeatured
          ? "border-[#D4AF37] shadow-md ring-1 ring-[#D4AF37]/20 hover:-translate-y-0.5"
          : "border-border/60 shadow-sm"
      }`}
    >
      <Link href={`/listings/${listing.id}`} className="block">
        {listing.imageUrl ? (
          <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {listing.isFeatured && (
              <div className="absolute top-2 left-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D4AF37] px-2.5 py-1 text-[10px] font-bold text-[#0B3954] shadow-sm">
                  <Star className="h-3 w-3 fill-[#0B3954]" />
                  Featured
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-[4/3] bg-[#0B3954]/10 flex items-center justify-center relative">
            <Tag className="h-10 w-10 text-[#0B3954]/30" />
            {listing.isFeatured && (
              <div className="absolute top-2 left-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#D4AF37] px-2.5 py-1 text-[10px] font-bold text-[#0B3954] shadow-sm">
                  <Star className="h-3 w-3 fill-[#0B3954]" />
                  Featured
                </span>
              </div>
            )}
          </div>
        )}
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/listings/${listing.id}`} className="block">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-[#0B3954]">
              For Sale
            </span>
            <Badge
              variant="outline"
              className="text-[10px] border-[#0B3954]/15 text-[#0B3954] rounded-full capitalize"
            >
              {listing.category}
            </Badge>
          </div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-serif font-semibold text-[#0B3954] leading-snug line-clamp-2 hover:underline">
              {listing.title}
            </h3>
            <span className="text-[#D4AF37] font-bold font-serif text-lg shrink-0">
              ${listing.price.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
            {listing.description}
          </p>
        </Link>
        <div className="flex items-center justify-between mt-auto">
          <Badge
            variant="outline"
            className="text-xs border-[#0B3954]/15 text-[#0B3954] rounded-full"
          >
            {listing.category}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {listing.zipCode}
          </span>
        </div>
        {listing.sellerName && (
          <p className="mt-2 text-xs text-muted-foreground">
            by{" "}
            <span className={listing.isFeatured ? "text-[#D4AF37] font-medium" : ""}>
              {listing.sellerName}
            </span>
            {listing.isFeatured && (
              <span className="ml-1 text-[10px] font-medium text-[#D4AF37]">✓ Verified</span>
            )}
          </p>
        )}
        {!listing.isAvailable ? (
          <div className="mt-3 text-center text-xs font-medium text-red-500 bg-red-50 rounded-full py-1">
            Sold
          </div>
        ) : onBuy ? (
          <>
            <button
              onClick={onBuy}
              disabled={buyLoading}
              className="mt-3 w-full flex items-center justify-center gap-2 rounded-full py-2 text-xs font-bold bg-[#D4AF37] text-[#0B3954] hover:bg-[#c9a430] disabled:opacity-60 transition-colors cursor-pointer border-0"
            >
              {buyLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ShoppingCart className="h-3.5 w-3.5" />
              )}
              {buyLoading ? "Loading…" : "Buy Now"}
            </button>
            <Link
              href={`/listings/${listing.id}`}
              className="mt-2 block text-center text-xs font-semibold text-[#0B3954]/70 hover:text-[#D4AF37] transition-colors"
            >
              or Make an Offer
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
}

type FeedItem =
  | { kind: "request"; id: string; createdAt: string; request: RequestSummary }
  | { kind: "listing"; id: string; createdAt: string; listing: Listing };

export default function Browse() {
  const search = useSearch();

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [zipInput, setZipInput] = useState("");
  const [activeZip, setActiveZip] = useState("");
  const [showNearby, setShowNearby] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Sync filters from URL query params (?filter=requests&category=Furniture&q=…).
  // Deterministic: when a param is absent, reset that piece of state to its default
  // so navigating from /browse?filter=requests back to /browse clears the filter.
  useEffect(() => {
    const params = new URLSearchParams(search);
    const f = params.get("filter");
    setFeedFilter(f === "requests" || f === "listings" ? f : "all");
    setActiveCategory(params.get("category") ?? "All");
    const q = params.get("q") ?? "";
    setSearchInput(q);
    setSearchQuery(q);
  }, [search]);

  const { data: user } = useGetCurrentUser();

  const { data: listings, isLoading: listingsLoading } = useListListings({
    zip: activeZip || undefined,
  });
  const { data: requests, isLoading: requestsLoading } = useListRequests({
    status: "open",
  });

  const isLoading = listingsLoading || requestsLoading;

  async function handleBuy(listingId: string) {
    if (!user) {
      toast.error("Sign in to buy this item.");
      return;
    }
    setBuyingId(listingId);
    try {
      const res = await fetch(getApiUrl(`stripe/buy-listing/${listingId}`), {
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
      setBuyingId(null);
    }
  }

  function applySearch(value?: string) {
    setSearchQuery((value ?? searchInput).trim());
  }

  function applyZip(value?: string) {
    const next = (value ?? zipInput).trim();
    setZipInput(next);
    setActiveZip(next);
  }

  function clearZip() {
    setZipInput("");
    setActiveZip("");
  }

  function toggleNearby() {
    if (activeZip) {
      clearZip();
      setShowNearby(false);
    } else {
      setShowNearby((s) => !s);
    }
  }

  async function handlePhotoSearch(file: File) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPhotoPreview(dataUrl);
      setAnalyzingPhoto(true);
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
            setSearchInput(description);
            setSearchQuery(description);
            toast.success("Found it! Showing matches for your photo.");
          }
        } else {
          toast.error("Couldn't identify item. Try browsing categories.");
        }
      } catch {
        toast.error("Couldn't identify item. Try browsing categories.");
      } finally {
        setAnalyzingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  }

  function clearPhotoSearch() {
    setPhotoPreview(null);
    setSearchInput("");
    setSearchQuery("");
  }

  const matchesCategory = (cat: string) =>
    activeCategory === "All" ||
    cat.toLowerCase() === activeCategory.toLowerCase();

  const matchesSearch = (hay: string) => {
    if (!searchQuery) return true;
    const words = searchQuery
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length >= 3);
    if (words.length === 0) return true;
    const h = hay.toLowerCase();
    return words.some((w) => h.includes(w));
  };

  const feedItems = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];

    if (feedFilter !== "listings") {
      for (const r of requests ?? []) {
        if (!matchesCategory(r.category)) continue;
        if (!matchesSearch(`${r.title} ${r.description} ${r.category}`)) continue;
        if (activeZip && !(r.location ?? "").toLowerCase().includes(activeZip.toLowerCase()))
          continue;
        items.push({
          kind: "request",
          id: r.id,
          createdAt: r.createdAt,
          request: r,
        });
      }
    }

    if (feedFilter !== "requests") {
      for (const l of listings ?? []) {
        if (!matchesCategory(l.category)) continue;
        if (!matchesSearch(`${l.title} ${l.description} ${l.category}`)) continue;
        items.push({
          kind: "listing",
          id: l.id,
          createdAt: l.createdAt,
          listing: l,
        });
      }
    }

    items.sort((a, b) => {
      const diff =
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sortOrder === "newest" ? diff : -diff;
    });

    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    listings,
    requests,
    feedFilter,
    activeCategory,
    searchQuery,
    activeZip,
    sortOrder,
  ]);

  const requestCount = feedItems.filter((i) => i.kind === "request").length;
  const listingCount = feedItems.filter((i) => i.kind === "listing").length;
  const featuredCount = feedItems.filter(
    (i) => i.kind === "listing" && i.listing.isFeatured,
  ).length;

  const FILTER_TABS: { value: FeedFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "requests", label: "Buyer Requests" },
    { value: "listings", label: "Seller Listings" },
  ];

  return (
    <Layout>
      {/* Hidden photo input */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handlePhotoSearch(file);
          e.target.value = "";
        }}
      />

      {/* Header */}
      <section className="bg-[#0B3954] py-10">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2">
            Browse Marketplace
          </h1>
          <p className="text-white/70 mb-6">
            Everything in one place — what buyers are looking for and what sellers
            have for sale.
          </p>

          {/* Search bar: text + photo + go */}
          <div className="flex gap-2 max-w-2xl flex-wrap">
            <div className="flex flex-1 min-w-52 items-center gap-2 bg-white rounded-xl px-3 py-2.5 shadow-sm">
              <Search className="h-4 w-4 text-[#0B3954]/30 shrink-0" />
              <input
                className="flex-1 text-sm text-[#0B3954] placeholder:text-[#0B3954]/35 bg-transparent focus:outline-none min-w-0"
                placeholder="Search requests & listings…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applySearch()}
              />
              <MicButton
                title="Search by voice"
                className="h-7 w-7"
                onResult={(text) => {
                  setSearchInput(text);
                  applySearch(text);
                }}
              />
            </div>
            <button
              onClick={() => photoInputRef.current?.click()}
              title="Search by photo"
              className={`rounded-xl px-3 flex items-center justify-center border transition-colors ${
                photoPreview
                  ? "bg-[#D4AF37] border-[#D4AF37]"
                  : "bg-white/10 border-white/20 text-white/70 hover:border-[#D4AF37]/60 hover:bg-white/15"
              }`}
            >
              {analyzingPhoto ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : photoPreview ? (
                <img src={photoPreview} alt="" className="h-6 w-6 object-cover rounded-lg" />
              ) : (
                <Camera className="h-5 w-5" />
              )}
            </button>
            <Button
              onClick={() => applySearch()}
              className="bg-[#D4AF37] text-[#0B3954] hover:bg-[#c9a430] font-bold border-0"
            >
              Search
            </Button>
          </div>

          {/* Photo search status line */}
          {photoPreview && (
            <div className="mt-3 flex items-center gap-1.5">
              <span className="text-[#D4AF37] text-xs font-bold">✓</span>
              <span className="text-[11px] text-white/60">
                Searching by photo — exact &amp; similar matches shown
              </span>
              <button onClick={clearPhotoSearch} className="ml-1 text-white/40 hover:text-white">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 max-w-5xl py-8">
        {/* Unified quick-filter bar: All / Buyer Requests / Seller Listings / Nearby / Newest */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFeedFilter(tab.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                feedFilter === tab.value
                  ? "bg-[#0B3954] text-white border-[#0B3954]"
                  : "bg-white text-[#0B3954]/70 border-[#0B3954]/20 hover:text-[#0B3954] hover:border-[#0B3954]/50"
              }`}
            >
              {tab.label}
            </button>
          ))}

          <span className="mx-1 h-6 w-px bg-[#0B3954]/15" aria-hidden />

          {/* Nearby — reveals the ZIP input; active when a ZIP is applied */}
          <button
            onClick={toggleNearby}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeZip || showNearby
                ? "bg-[#0B3954] text-white border-[#0B3954]"
                : "bg-white text-[#0B3954]/70 border-[#0B3954]/20 hover:text-[#0B3954] hover:border-[#0B3954]/50"
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            {activeZip ? `Nearby: ${activeZip}` : "Nearby"}
            {activeZip && <X className="h-3.5 w-3.5" />}
          </button>

          {/* Newest — toggles sort newest/oldest */}
          <button
            onClick={() =>
              setSortOrder((s) => (s === "newest" ? "oldest" : "newest"))
            }
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border bg-white text-[#0B3954] border-[#0B3954]/20 hover:border-[#0B3954]/50 transition-colors"
          >
            <ArrowDownWideNarrow className="h-3.5 w-3.5" />
            {sortOrder === "newest" ? "Newest" : "Oldest"}
          </button>
        </div>

        {/* Nearby ZIP input — revealed by the Nearby chip */}
        {(showNearby || activeZip) && (
          <div className="mb-4 flex items-center gap-2 bg-white border border-[#0B3954]/20 rounded-xl px-3 py-2 w-fit">
            <MapPin className="h-4 w-4 text-[#D4AF37] shrink-0" />
            <input
              autoFocus
              className="w-32 text-sm text-[#0B3954] placeholder:text-[#0B3954]/35 bg-transparent focus:outline-none"
              placeholder="Enter ZIP code"
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyZip()}
            />
            <button
              onClick={() => applyZip()}
              className="text-xs font-bold text-[#0B3954] hover:text-[#D4AF37]"
            >
              Go
            </button>
            {activeZip && (
              <button onClick={clearZip} className="text-[#0B3954]/40 hover:text-[#0B3954]">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeCategory === cat
                  ? "bg-[#0B3954] text-white border-[#0B3954]"
                  : "bg-white text-[#0B3954] border-[#0B3954]/20 hover:border-[#0B3954]/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!isLoading && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {feedItems.length} result{feedItems.length !== 1 ? "s" : ""}
              {feedFilter === "all" && ` · ${requestCount} requests, ${listingCount} listings`}
              {activeCategory !== "All" && ` in ${activeCategory}`}
              {searchQuery && ` matching "${searchQuery}"`}
              {activeZip && ` near ${activeZip}`}
            </p>
            {featuredCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-[#D4AF37] font-medium">
                <Star className="h-3.5 w-3.5 fill-[#D4AF37]" />
                {featuredCount} featured
              </div>
            )}
          </div>
        )}

        {/* Unified grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))
          ) : feedItems.length === 0 ? (
            <div className="col-span-full py-16 text-center">
              <Inbox className="h-12 w-12 text-[#0B3954]/20 mx-auto mb-3" />
              <p className="font-serif text-lg font-medium text-[#0B3954] mb-1">
                Nothing found
              </p>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Nothing matches your search. Try different keywords or categories."
                  : activeZip
                  ? `Nothing near ${activeZip} in that category yet.`
                  : "No items here yet — check back soon."}
              </p>
            </div>
          ) : (
            feedItems.map((item) =>
              item.kind === "request" ? (
                <RequestCard key={`r-${item.id}`} request={item.request} />
              ) : (
                <ListingCard
                  key={`l-${item.id}`}
                  listing={item.listing}
                  onBuy={
                    user && item.listing.sellerId !== user.id
                      ? () => handleBuy(item.listing.id)
                      : undefined
                  }
                  buyLoading={buyingId === item.listing.id}
                />
              ),
            )
          )}
        </div>
      </div>
    </Layout>
  );
}
