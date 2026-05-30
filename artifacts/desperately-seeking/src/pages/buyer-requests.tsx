import React, { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MicButton } from "@/components/mic-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useGetCurrentUser,
  useListRequests,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  MapPin,
  Clock,
  Sparkles,
  MessageSquare,
  Filter,
  Inbox,
} from "lucide-react";

const CATEGORIES = [
  "All",
  "Antique Furniture",
  "Vintage Clothing",
  "Electronics",
  "Art & Collectibles",
  "Musical Instruments",
  "Books & Media",
  "Outdoor & Sports",
  "Jewelry & Watches",
  "Home & Garden",
  "Toys & Games",
  "Other",
];

const URGENCY_COLORS: Record<string, string> = {
  low: "bg-secondary/10 text-secondary-foreground",
  normal: "bg-blue-50 text-blue-700",
  high: "bg-destructive/10 text-destructive",
};

export default function BuyerRequests() {
  const { data: user } = useGetCurrentUser();

  const { data: allRequests, isLoading } = useListRequests();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const openRequests = useMemo(() => {
    let requests = allRequests?.filter((r) => r.status === "open") ?? [];

    if (selectedCategory !== "All") {
      requests = requests.filter(
        (r) =>
          r.category.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      requests = requests.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return requests;
  }, [allRequests, selectedCategory, searchQuery]);

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-[#0B3954] py-12">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <Badge className="mb-4 border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#D4AF37]">
            <Inbox className="h-3.5 w-3.5 mr-1.5" />
            Buyer Request Inbox
          </Badge>
          <h1 className="font-serif text-4xl font-bold text-white">
            Browse Open{" "}
            <span className="italic text-[#D4AF37]">Buyer Requests</span>
          </h1>
          <p className="mt-3 text-white/65 text-lg max-w-xl mx-auto">
            Buyers tell you exactly what they want. If you have it, respond and
            close the deal.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-4 py-2 text-sm text-[#D4AF37]">
            <Sparkles className="h-4 w-4" />
            Responding to buyers is always free &amp; unlimited.
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-10 md:px-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 pr-12 rounded-full border-[#0B3954]/20"
              placeholder="Search by keyword or tag…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
              <MicButton
                title="Search by voice"
                className="h-7 w-7"
                onResult={(text) => setSearchQuery(text)}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground shrink-0">Category:</span>
          </div>
        </div>

        {/* Category pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-[#0B3954] text-white"
                  : "bg-white border border-border/60 text-muted-foreground hover:border-[#0B3954]/30 hover:text-[#0B3954]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-5">
          {isLoading
            ? "Loading…"
            : `${openRequests.length} open request${openRequests.length !== 1 ? "s" : ""}${
                selectedCategory !== "All" ? ` in ${selectedCategory}` : ""
              }${searchQuery ? ` matching "${searchQuery}"` : ""}`}
        </p>

        {/* Request cards */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        ) : openRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white p-12 text-center shadow-sm">
            <Inbox className="mx-auto h-10 w-10 text-[#D4AF37]/40 mb-3" />
            <p className="font-serif text-[#0B3954]">No requests found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your filters or check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {openRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl bg-white border border-border/60 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className="text-[10px] font-semibold bg-[#0B3954] text-white border-0 rounded-full px-2.5">
                        Looking For
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs capitalize bg-background"
                      >
                        {req.category}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`text-xs capitalize ${URGENCY_COLORS[req.urgency]}`}
                      >
                        {req.urgency} urgency
                      </Badge>
                    </div>

                    <Link href={`/requests/${req.id}`}>
                      <h3 className="font-serif font-semibold text-[#0B3954] text-lg hover:text-[#D4AF37] transition-colors cursor-pointer line-clamp-1">
                        {req.title}
                      </h3>
                    </Link>

                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {req.description}
                    </p>

                    {req.tags && req.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {req.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] bg-muted/60 rounded-full px-2 py-0.5 text-muted-foreground"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {req.location || "Anywhere"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDistanceToNow(new Date(req.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {req.responseCount} offer
                        {req.responseCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="font-serif font-semibold text-[#0B3954]">
                        {req.budgetMin && req.budgetMax
                          ? `$${req.budgetMin}–$${req.budgetMax}`
                          : req.budgetMax
                            ? `Up to $${req.budgetMax}`
                            : "Open"}
                      </p>
                    </div>

                    {/* Buyer avatar */}
                    <Link href={`/profile/${req.buyer.id}`}>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#0B3954] transition-colors">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={req.buyer.avatarUrl} />
                          <AvatarFallback className="text-[8px]">
                            {req.buyer.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {req.buyer.name}
                      </div>
                    </Link>

                    {/* Respond button — responding is always free */}
                    <Link href={`/requests/${req.id}`}>
                      <Button
                        size="sm"
                        className="rounded-full bg-[#D4AF37] text-[#0B3954] font-semibold hover:bg-[#c9a430] border-0"
                      >
                        I have this!
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </Layout>
  );
}
