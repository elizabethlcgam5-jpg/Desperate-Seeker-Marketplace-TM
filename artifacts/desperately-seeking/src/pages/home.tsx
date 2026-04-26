import { Layout } from "@/components/layout";
import { RequestCard } from "@/components/request-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useListRequests,
  useGetOverviewStats,
  useListCategories,
  useGetCurrentUser,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { PenSquare, Search, Lock, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

const ROTATING_CATEGORIES = [
  "Antique Furniture",
  "Vintage Streetwear",
  "Mid-Century Couches",
  "Refurbished Game Consoles",
  "Camera Gear",
  "Rare Books",
  "Vintage Watches",
  "Estate Jewelry",
];

function RotatingCategory() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % ROTATING_CATEGORIES.length);
        setVisible(true);
      }, 350);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="italic text-[#D4AF37] transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {ROTATING_CATEGORIES[idx]}
    </span>
  );
}

export default function Home() {
  const { data: requests, isLoading: requestsLoading } = useListRequests({
    status: "open",
    sort: "newest",
  });
  const { data: stats } = useGetOverviewStats();
  const { data: categories } = useListCategories();
  const { data: currentUser } = useGetCurrentUser();

  const isSubscribed =
    currentUser &&
    currentUser.subscriptionTier &&
    currentUser.subscriptionTier !== "free";

  // Non-subscribed users see the first 2 cards as teasers
  const teaserCount = !isSubscribed && requests && requests.length > 0 ? 2 : 0;

  return (
    <Layout>
      {/* ─── Hero ──────────────────────────────────────────────────────── */}
      <section className="bg-[#0B3954] py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center space-y-6">
          <Badge className="mb-2 border-[#D4AF37]/30 bg-[#D4AF37]/15 text-[#D4AF37] text-sm px-4 py-1.5">
            Post what you need. Help comes to you.
          </Badge>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight text-balance">
            You say what you want.
            <br />
            <span className="text-[#D4AF37]">Sellers come to you.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto leading-relaxed">
            This is the <em>opposite</em> of a regular marketplace. Buyers post exactly what they need — <RotatingCategory /> — and sellers compete to win your business.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/requests/new">
              <Button
                size="lg"
                className="w-full sm:w-auto text-base h-13 px-8 rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] shadow-xl transition-transform hover:-translate-y-0.5 border-0"
              >
                <PenSquare className="mr-2 h-5 w-5" />
                Post What I'm Seeking
              </Button>
            </Link>
            <Link href="#browse">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base h-13 px-8 rounded-full text-white border-white/30 bg-white/10 hover:bg-white/20 hover:text-white"
              >
                Browse Requests
              </Button>
            </Link>
          </div>

          {stats && (
            <div className="flex justify-center gap-12 pt-10 border-t border-white/10 mt-6">
              <StatPill value={stats.openRequests} label="Open Requests" />
              <StatPill value={stats.totalResponses} label="Offers Made" />
              <StatPill value={stats.fulfilledThisWeek} label="Matches This Week" />
              <StatPill value={stats.activeSellers} label="Active Sellers" />
            </div>
          )}
        </div>
      </section>

      {/* ─── How it works ──────────────────────────────────────────────── */}
      <section className="bg-white border-b py-12">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <Step n={1} title="You post the request" desc="Describe exactly what you want, set your budget, and add photos if you have them. Takes 60 seconds." />
            <Step n={2} title="Sellers respond with offers" desc="Sellers who have what you need send you photos, prices, and details — you don't search, they find you." />
            <Step n={3} title="You pick the best offer" desc="Compare offers side by side, message the seller, and close the deal on your terms." />
          </div>
        </div>
      </section>

      {/* ─── Browse section ────────────────────────────────────────────── */}
      <div id="browse" className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main feed */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-[#0B3954] flex items-center gap-2">
                <Search className="h-5 w-5 text-[#D4AF37]" />
                Latest Requests
              </h2>
              {!isSubscribed && (
                <Link href="/pricing">
                  <Badge className="bg-[#D4AF37]/15 text-[#0B3954] border border-[#D4AF37]/30 cursor-pointer hover:bg-[#D4AF37]/25 text-xs px-3 py-1">
                    <Lock className="mr-1 h-3 w-3" />
                    Unlock seller tools
                  </Badge>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {requestsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-52 rounded-2xl" />
                ))
              ) : requests?.length === 0 ? (
                <div className="col-span-2 py-12 text-center bg-white rounded-2xl border border-dashed shadow-sm">
                  <p className="text-lg font-serif font-medium text-[#0B3954] mb-2">No requests yet</p>
                  <p className="text-muted-foreground mb-6">Be the first to post what you're seeking.</p>
                  <Link href="/requests/new">
                    <Button className="bg-[#D4AF37] text-[#0B3954] hover:bg-[#c9a430] border-0 font-semibold rounded-full">Post a Request</Button>
                  </Link>
                </div>
              ) : (
                requests?.map((req, i) => (
                  <RequestCard
                    key={req.id}
                    request={req}
                    teaser={!isSubscribed && i < teaserCount}
                  />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Seller CTA */}
            {!isSubscribed && (
              <div className="rounded-2xl bg-[#0B3954] p-6 text-white shadow-lg">
                <h3 className="font-serif text-lg font-bold mb-2">Are you a seller?</h3>
                <p className="text-white/70 text-sm mb-4 leading-relaxed">
                  Browse buyer requests, list your inventory, and get notified when someone wants what you have.
                </p>
                <Link href="/pricing">
                  <Button className="w-full bg-[#D4AF37] text-[#0B3954] hover:bg-[#c9a430] font-bold border-0 rounded-full">
                    Start for $4.99/mo
                  </Button>
                </Link>
              </div>
            )}

            {/* Categories */}
            {categories && categories.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border shadow-sm">
                <h3 className="font-serif text-lg font-bold mb-4 text-[#0B3954] flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#D4AF37]" />
                  Browse by Category
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge
                      key={cat.category}
                      variant="outline"
                      className="capitalize font-normal bg-background hover:bg-muted cursor-pointer border-[#0B3954]/15 text-[#0B3954] rounded-full"
                    >
                      {cat.category}{" "}
                      <span className="ml-1 text-[#D4AF37]">{cat.count}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy notice */}
            <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-5">
              <div className="flex gap-3">
                <Lock className="mt-0.5 h-5 w-5 text-[#D4AF37] shrink-0" />
                <div>
                  <p className="font-semibold text-[#0B3954] text-sm mb-1">Buyer privacy protected</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Buyer names and contact info are never shown publicly. All communication happens
                    through our secure in-app messaging, opened only when a match is confirmed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="font-serif text-3xl font-bold text-[#D4AF37]">{value}</div>
      <div className="text-xs text-white/60 mt-1">{label}</div>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37] text-[#0B3954] font-bold text-lg font-serif">
        {n}
      </div>
      <h3 className="font-serif text-lg font-semibold text-[#0B3954]">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
