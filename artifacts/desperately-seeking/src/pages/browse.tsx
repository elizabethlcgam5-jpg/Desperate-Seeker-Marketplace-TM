import { useState } from "react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useListListings } from "@workspace/api-client-react";
import { MapPin, Search, Tag, X, Star } from "lucide-react";

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
  "Other",
];

function ListingCard({
  listing,
}: {
  listing: {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    zipCode: string;
    status: string;
    isAvailable: boolean;
    isFeatured: boolean;
    sellerName?: string | null;
    createdAt: string;
  };
}) {
  return (
    <div
      className={`bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-all flex flex-col ${
        listing.isFeatured
          ? "border-[#D4AF37] shadow-md ring-1 ring-[#D4AF37]/20 hover:-translate-y-0.5"
          : "border-border/60 shadow-sm"
      }`}
    >
      {listing.imageUrl ? (
        <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${listing.id}/400/300`;
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
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-serif font-semibold text-[#0B3954] leading-snug line-clamp-2">
            {listing.title}
          </h3>
          <span className="text-[#D4AF37] font-bold font-serif text-lg shrink-0">
            ${listing.price.toLocaleString()}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
          {listing.description}
        </p>
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
        {!listing.isAvailable && (
          <div className="mt-2 text-center text-xs font-medium text-red-500 bg-red-50 rounded-full py-1">
            Sold
          </div>
        )}
      </div>
    </div>
  );
}

export default function Browse() {
  const [zipInput, setZipInput] = useState("");
  const [activeZip, setActiveZip] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: listings, isLoading } = useListListings({
    zip: activeZip || undefined,
    category: activeCategory === "All" ? undefined : activeCategory,
  });

  function applyZip() {
    setActiveZip(zipInput.trim());
  }

  function clearZip() {
    setZipInput("");
    setActiveZip("");
  }

  const featuredCount = listings?.filter((l) => l.isFeatured).length ?? 0;

  return (
    <Layout>
      {/* Header */}
      <section className="bg-[#0B3954] py-10">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2">
            Browse Listings
          </h1>
          <p className="text-white/70 mb-6">
            Find what you're looking for — filter by location or category.
          </p>

          {/* ZIP filter */}
          <div className="flex gap-2 max-w-sm">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                placeholder="Enter ZIP code"
                value={zipInput}
                onChange={(e) => setZipInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyZip()}
                maxLength={5}
                className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/20"
              />
            </div>
            <Button
              onClick={applyZip}
              disabled={!zipInput}
              className="bg-[#D4AF37] text-[#0B3954] hover:bg-[#c9a430] font-semibold border-0"
            >
              <Search className="h-4 w-4 mr-1" /> Find Near Me
            </Button>
            {activeZip && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearZip}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {activeZip && (
            <p className="text-white/60 text-sm mt-2">
              Showing listings near ZIP{" "}
              <strong className="text-white">{activeZip}</strong> — exact
              matches first, then nearby area.
            </p>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 max-w-5xl py-8">
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
        {!isLoading && listings && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {listings.length} listing{listings.length !== 1 ? "s" : ""} found
              {activeCategory !== "All" && ` in ${activeCategory}`}
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

        {/* Listings grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))
          ) : listings?.length === 0 ? (
            <div className="col-span-full py-16 text-center">
              <Tag className="h-12 w-12 text-[#0B3954]/20 mx-auto mb-3" />
              <p className="font-serif text-lg font-medium text-[#0B3954] mb-1">
                No listings found
              </p>
              <p className="text-sm text-muted-foreground">
                {activeZip
                  ? `Nothing listed near ${activeZip} in that category yet.`
                  : "No listings yet — check back soon."}
              </p>
            </div>
          ) : (
            listings?.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
