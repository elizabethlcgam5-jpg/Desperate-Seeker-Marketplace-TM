import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiUrl } from "@/lib/api";
import { Link } from "wouter";
import { Search, Tag, ShoppingBag, X, ArrowRight, MapPin } from "lucide-react";

interface SearchResult {
  interpretation: string;
  suggestions: string[];
  requests: {
    id: string;
    title: string;
    category: string;
    zipCode: string;
    maxBudget: number | null;
    type: "request";
  }[];
  listings: {
    id: string;
    title: string;
    category: string;
    zipCode: string;
    price: number;
    isFeatured: boolean;
    type: "listing";
  }[];
}

export function AISearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search trigger
  useEffect(() => {
    if (query.trim().length < 3) {
      setResults(null);
      setOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(query.trim());
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function runSearch(q: string) {
    setLoading(true);
    setOpen(true);
    try {
      const res = await fetch(getApiUrl("openai/search"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      if (!res.ok) throw new Error("Search failed");
      const data: SearchResult = await res.json();
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSuggestion(s: string) {
    setQuery(s);
  }

  function clear() {
    setQuery("");
    setResults(null);
    setOpen(false);
  }

  const hasResults = results && (results.requests.length > 0 || results.listings.length > 0);

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          <Search className="h-4 w-4 text-[#D4AF37]" />
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results && setOpen(true)}
          placeholder="Search — try 'vintage sofa near 90210' or 'camera under $200'..."
          className="pl-10 pr-10 h-12 rounded-2xl border-[#D4AF37]/40 bg-white/10 text-white placeholder:text-white/40 focus:bg-white/15 focus:border-[#D4AF37] text-sm"
        />
        {query && (
          <button
            onClick={clear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && query.length >= 3 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl border border-border/60 shadow-xl z-50 overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Search className="h-3.5 w-3.5 text-[#D4AF37] animate-pulse" />
                Searching...
              </div>
              <Skeleton className="h-8 w-full rounded-xl" />
              <Skeleton className="h-8 w-3/4 rounded-xl" />
              <Skeleton className="h-8 w-5/6 rounded-xl" />
            </div>
          ) : !hasResults ? (
            <div className="p-6 text-center">
              <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No matches found for "{query}"</p>
              <p className="text-xs text-muted-foreground mt-1">Try different keywords</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {/* AI interpretation */}
              {results?.interpretation && (
                <div className="px-4 py-3 flex items-start gap-2 bg-[#FDF5E6]/60">
                  <Search className="h-3.5 w-3.5 text-[#D4AF37] mt-0.5 shrink-0" />
                  <p className="text-xs text-[#0B3954]/70 italic">{results.interpretation}</p>
                </div>
              )}

              {/* Buyer Requests */}
              {results && results.requests.length > 0 && (
                <div>
                  <div className="px-4 pt-3 pb-1 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-[#0B3954]/50" />
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#0B3954]/50">
                      Buyer Requests
                    </p>
                  </div>
                  {results.requests.map((r) => (
                    <Link key={r.id} href={`/requests/${r.id}`} onClick={() => setOpen(false)}>
                      <div className="px-4 py-2.5 hover:bg-[#0B3954]/5 cursor-pointer flex items-center justify-between gap-3 group">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#0B3954] line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
                            {r.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">{r.category}</span>
                            {r.zipCode && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <MapPin className="h-2.5 w-2.5" />{r.zipCode}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {r.maxBudget && (
                            <span className="text-xs font-semibold text-[#D4AF37]">${r.maxBudget}</span>
                          )}
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-[#D4AF37]" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Listings */}
              {results && results.listings.length > 0 && (
                <div>
                  <div className="px-4 pt-3 pb-1 flex items-center gap-1.5">
                    <ShoppingBag className="h-3.5 w-3.5 text-[#0B3954]/50" />
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#0B3954]/50">
                      Listings for Sale
                    </p>
                  </div>
                  {results.listings.map((l) => (
                    <Link key={l.id} href={`/browse`} onClick={() => setOpen(false)}>
                      <div className="px-4 py-2.5 hover:bg-[#0B3954]/5 cursor-pointer flex items-center justify-between gap-3 group">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-[#0B3954] line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
                              {l.title}
                            </p>
                            {l.isFeatured && (
                              <Badge className="text-[9px] px-1.5 py-0 bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30 h-4">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">{l.category}</span>
                            {l.zipCode && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <MapPin className="h-2.5 w-2.5" />{l.zipCode}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-semibold text-[#D4AF37]">${l.price.toLocaleString()}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-[#D4AF37]" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* AI suggestions */}
              {results?.suggestions && results.suggestions.length > 0 && (
                <div className="px-4 py-3 bg-muted/20">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    Try also
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {results.suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSuggestion(s)}
                        className="text-xs px-3 py-1 rounded-full bg-white border border-[#0B3954]/15 text-[#0B3954] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
