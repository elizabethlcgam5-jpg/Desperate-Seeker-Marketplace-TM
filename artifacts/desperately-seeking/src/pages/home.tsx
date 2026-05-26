import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AISearch } from "@/components/ai-search";
import {
  useListRequests,
  useGetOverviewStats,
  useGetCurrentUser,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import {
  PenSquare,
  CheckCircle2,
  ArrowRight,
  Sofa,
  Sparkles,
  Baby,
  Gem,
  Hammer,
  Leaf,
} from "lucide-react";

const FEATURED_CATEGORIES = [
  { label: "Furniture", icon: Sofa, href: "/browse?category=Furniture" },
  { label: "Decor", icon: Leaf, href: "/browse?category=Home+%26+Garden" },
  { label: "Vintage", icon: Sparkles, href: "/browse?category=Collectibles" },
  { label: "Kids", icon: Baby, href: "/browse?category=Clothing" },
  { label: "Collectibles", icon: Gem, href: "/browse?category=Collectibles" },
  { label: "DIY", icon: Hammer, href: "/browse?category=Tools" },
];

const STEPS = [
  {
    n: 1,
    title: "Tell us what you're looking for.",
    desc: "Describe exactly what you need, set your budget, and post it in under a minute.",
  },
  {
    n: 2,
    title: "Sellers get instant match alerts.",
    desc: "Premium sellers are notified the moment a request matches their inventory.",
  },
  {
    n: 3,
    title: "Chat locally.",
    desc: "Connect with nearby sellers through secure in-app messaging — no spam, no middlemen.",
  },
  {
    n: 4,
    title: "Meet and complete the sale.",
    desc: "Arrange a local meetup, inspect the item, and close the deal on your terms.",
  },
];

const DIFFERENTIATORS = [
  "No shipping fees",
  "No bumps or boosted posts",
  "No ads",
  "Buyer-first, local-first",
  "Instant match alerts for sellers",
  "Only 5% platform fee on completed sales",
];

export default function Home() {
  const { data: stats } = useGetOverviewStats();
  const { data: currentUser } = useGetCurrentUser();
  const { data: requests, isLoading: requestsLoading } = useListRequests({
    status: "open",
    sort: "newest",
  });

  const isSubscribed =
    currentUser &&
    currentUser.subscriptionTier &&
    currentUser.subscriptionTier !== "free";

  return (
    <Layout>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-[#0B3954] pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center">
          <h1 className="font-serif font-bold tracking-tight leading-none mb-4">
            <span className="block text-[#D4AF37] text-6xl md:text-8xl italic drop-shadow-lg">
              Desperately
            </span>
            <span className="block text-white text-5xl md:text-7xl mt-1">
              Seeking
            </span>
          </h1>
          <p className="text-white/75 text-lg md:text-xl mt-6 mb-10 max-w-xl mx-auto leading-relaxed">
            Post what you need. Help comes to you.
          </p>
          {/* AI Search */}
          <div className="w-full max-w-2xl mx-auto">
            <AISearch />
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/requests/new">
              <Button
                size="lg"
                className="w-full sm:w-auto text-base px-8 py-6 rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] shadow-xl transition-transform hover:-translate-y-0.5 border-0"
              >
                <PenSquare className="mr-2 h-5 w-5" />
                Post What You Need
              </Button>
            </Link>
            <Link href="/browse">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base px-8 py-6 rounded-full text-white border-white/30 bg-white/10 hover:bg-white/20 hover:text-white"
              >
                Browse Requests
              </Button>
            </Link>
          </div>
          <div className="mt-4">
            <Link href="/seller">
              <div className="inline-flex flex-col items-center gap-0.5 group cursor-pointer">
                <span className="text-white font-semibold text-sm group-hover:text-[#D4AF37] transition-colors">
                  Start Selling
                </span>
                <span className="text-white/45 text-xs">
                  Post your first 2 items for free.
                </span>
              </div>
            </Link>
          </div>

          {/* Stats bar */}
          {stats && (
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 pt-12 mt-10 border-t border-white/10">
              <StatPill value={stats.openRequests} label="Open Requests" />
              <StatPill value={stats.totalResponses} label="Offers Made" />
              <StatPill value={stats.fulfilledThisWeek} label="Matches This Week" />
              <StatPill value={stats.activeSellers} label="Active Sellers" />
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="bg-[#FDF5E6] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#0B3954] text-center mb-14">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {STEPS.map((step) => (
              <div key={step.n} className="flex flex-col items-center text-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0B3954] text-[#D4AF37] font-bold text-xl font-serif shadow-md">
                  {step.n}
                </div>
                <h3 className="font-serif text-base font-semibold text-[#0B3954] leading-snug">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY WE'RE DIFFERENT ──────────────────────────────────────── */}
      <section className="bg-[#0B3954] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">
                Why We're Different
              </h2>
              <p className="text-white/65 leading-relaxed mb-8">
                Most marketplaces make sellers shout over each other. We flip that. Buyers post what they need, and sellers who actually have it come forward.
              </p>
              <Link href="/pricing">
                <Button className="rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 gap-2">
                  See How It Works <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <ul className="space-y-4">
              {DIFFERENTIATORS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span className="text-white/85 text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── PRICING PREVIEW ──────────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-24 border-b">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#0B3954] text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-center mb-12">
            Buyers always free. Sellers post one or two items for free or choose a plan that works.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Free */}
            <div className="rounded-2xl border border-border/60 p-6 text-center">
              <p className="font-serif text-xl font-semibold text-[#0B3954] mb-2">Free</p>
              <p className="text-3xl font-bold font-serif text-[#0B3954] mb-1">$0</p>
              <p className="text-sm text-muted-foreground mb-4"></p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Post requests, browse listings, view responses.
              </p>
            </div>
            {/* Premium */}
            <Link href="/pricing">
              <div className="rounded-2xl border-2 border-[#D4AF37] bg-[#FDF5E6] p-6 text-center relative shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-[#0B3954] text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </span>
                <p className="font-serif text-xl font-semibold text-[#0B3954] mb-2">Premium</p>
                <p className="text-3xl font-bold font-serif text-[#0B3954] mb-1">$1.99</p>
                <p className="text-sm text-muted-foreground mb-4">per month</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Unlimited responses, messaging, and instant match alerts.
                </p>
                <span className="inline-block rounded-full px-4 py-1.5 text-xs font-bold bg-[#D4AF37] text-[#0B3954]">
                  Get Started →
                </span>
              </div>
            </Link>
            {/* Yearly */}
            <Link href="/pricing">
              <div className="rounded-2xl border border-border/60 p-6 text-center cursor-pointer hover:shadow-md transition-shadow">
                <p className="font-serif text-xl font-semibold text-[#0B3954] mb-2">Premium Yearly</p>
                <p className="text-3xl font-bold font-serif text-[#0B3954] mb-1">$14.99</p>
                <p className="text-sm text-muted-foreground mb-4">per year · save 37%</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Everything in Premium — best value for frequent sellers.
                </p>
                <span className="inline-block rounded-full px-4 py-1.5 text-xs font-bold border border-[#0B3954]/30 text-[#0B3954]">
                  Get Started →
                </span>
              </div>
            </Link>
          </div>
          <div className="text-center mt-8">
            <Link href="/pricing">
              <Button
                variant="outline"
                className="rounded-full border-[#0B3954]/30 text-[#0B3954] hover:bg-[#0B3954] hover:text-white gap-2"
              >
                See Full Pricing <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED CATEGORIES ──────────────────────────────────────── */}
      <section className="bg-[#FDF5E6] py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#0B3954] text-center mb-12">
            Featured Categories
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {FEATURED_CATEGORIES.map(({ label, icon: Icon, href }) => (
              <Link key={label} href={href}>
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#0B3954]/10 bg-white p-5 text-center hover:border-[#D4AF37] hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0B3954]/8 group-hover:bg-[#D4AF37]/15 transition-colors">
                    <Icon className="h-6 w-6 text-[#0B3954] group-hover:text-[#D4AF37] transition-colors" />
                  </div>
                  <span className="text-sm font-semibold text-[#0B3954]">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND STORY ──────────────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#0B3954] mb-6">
            Welcome to Desperately Seeking™
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-6">
            Desperately Seeking™ makes buying and selling easier for everyone. Instead of scrolling through endless listings, you simply post what you need and let the right sellers come to you. It's a faster, cleaner way to find exactly what you're looking for.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Whether you're searching for something specific or trying to sell items you no longer need, Desperately Seeking™ keeps things simple, honest, and stress-free. Real people helping each other find what they need without the usual hassle.
          </p>
          <div className="mt-10">
            <Link href="/requests/new">
              <Button
                size="lg"
                className="rounded-full bg-[#0B3954] text-white hover:bg-[#0a3247] px-10 gap-2"
              >
                Start Seeking <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── LATEST REQUESTS (live feed) ───────────────────────────────── */}
      {requests && requests.length > 0 && (
        <section className="bg-[#FDF5E6] border-t py-16">
          <div className="container mx-auto px-4 md:px-8 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#0B3954]">
                Latest Requests
              </h2>
              <Link href="/browse">
                <Button variant="ghost" className="text-[#0B3954] gap-1.5 hover:bg-[#0B3954]/5">
                  See all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {requestsLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-40 rounded-2xl" />
                  ))
                : requests.slice(0, 6).map((req) => (
                    <Link key={req.id} href={`/requests/${req.id}`}>
                      <div className="bg-white rounded-2xl border border-border/60 p-5 hover:border-[#D4AF37] hover:shadow-sm transition-all cursor-pointer">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#0B3954] text-white">
                              Looking For
                            </span>
                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#0B3954]/8 text-[#0B3954]">
                              {req.category}
                            </span>
                          </div>
                          {req.maxBudget && (
                            <span className="text-[#D4AF37] font-bold font-serif text-sm shrink-0">
                              ${req.maxBudget}
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif font-semibold text-[#0B3954] line-clamp-2 leading-snug">
                          {req.title}
                        </h3>
                        {req.zipCode && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Near {req.zipCode}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}

function StatPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="font-serif text-3xl font-bold text-[#D4AF37]">{value}</div>
      <div className="text-xs text-white/60 mt-1 uppercase tracking-wide">{label}</div>
    </div>
  );
}
