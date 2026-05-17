import { Layout } from "@/components/layout";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Users, Package, AlertTriangle, DollarSign, TrendingUp,
  Shield, CheckSquare, Activity, Search, Eye, Ban, Flag,
  CheckCircle, Clock, XCircle, BarChart3, ShieldAlert, ListChecks,
  Megaphone, MessageSquare, Star, RefreshCw,
} from "lucide-react";
import { useGetCurrentUser } from "@workspace/api-client-react";

const NAV_SECTIONS = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "users", label: "Users & Members", icon: Users },
  { id: "listings", label: "Listings Monitor", icon: Package },
  { id: "payments", label: "Payments & Disputes", icon: DollarSign },
  { id: "reports", label: "Reports & Flags", icon: Flag },
  { id: "revenue", label: "Subscription Revenue", icon: TrendingUp },
  { id: "fraud", label: "Fraud Alerts", icon: ShieldAlert },
  { id: "checklist", label: "Daily Checklist", icon: ListChecks },
];

const MOCK_USERS = [
  { id: 1, name: "Sarah M.", type: "Buyer", joined: "Jan 12, 2025", listings: 0, transactions: 4, status: "Active" },
  { id: 2, name: "James T.", type: "Seller", joined: "Feb 3, 2025", listings: 8, transactions: 12, status: "Active" },
  { id: 3, name: "Raj P.", type: "Seller", joined: "Mar 18, 2025", listings: 2, transactions: 1, status: "Flagged" },
  { id: 4, name: "Donna K.", type: "Buyer", joined: "Apr 1, 2025", listings: 0, transactions: 7, status: "Active" },
  { id: 5, name: "Mike L.", type: "Seller", joined: "Apr 22, 2025", listings: 14, transactions: 19, status: "Active" },
  { id: 6, name: "Carla B.", type: "Buyer", joined: "May 3, 2025", listings: 0, transactions: 2, status: "Suspended" },
];

const MOCK_LISTINGS = [
  { id: 1, title: "Vintage Oak Dresser", seller: "James T.", category: "Furniture", price: "$145", pickup: "Local Pickup", status: "Active" },
  { id: 2, title: "iPhone 12 (cracked screen)", seller: "Raj P.", category: "Electronics", price: "$80", pickup: "Porch Pickup", status: "Flagged" },
  { id: 3, title: "Baby Stroller — Like New", seller: "Mike L.", category: "Baby & Kids", price: "$55", pickup: "Local Pickup", status: "Active" },
  { id: 4, title: "Designer Handbag (replica?)", seller: "Carla B.", category: "Fashion", price: "$200", pickup: "Porch Pickup", status: "Flagged" },
  { id: 5, title: "Lawn Mower", seller: "Mike L.", category: "Garden", price: "$120", pickup: "Local Pickup", status: "Active" },
];

const MOCK_DISPUTES = [
  { id: 1, buyer: "Sarah M.", seller: "Raj P.", item: "iPhone 12", amount: "$80", reason: "Item not as described", status: "Open" },
  { id: 2, buyer: "Donna K.", seller: "Mike L.", item: "Baby Stroller", amount: "$55", reason: "Item wasn't there for porch pickup", status: "Open" },
];

const MOCK_REPORTS = [
  { id: 1, reporter: "Sarah M.", reported: "Raj P.", type: "User", reason: "Suspicious messages", priority: "High" },
  { id: 2, reporter: "James T.", reported: "iPhone 12 listing", type: "Listing", reason: "Misleading description", priority: "Medium" },
  { id: 3, reporter: "Donna K.", reported: "Carla B.", type: "User", reason: "No-show for porch pickup", priority: "Low" },
];

const FRAUD_PATTERNS = [
  { pattern: "Multiple accounts from same IP", count: 2, risk: "High" },
  { pattern: "Rapid listing + deletion cycle", count: 1, risk: "Medium" },
  { pattern: "Price-bait-and-switch on porch pickups", count: 3, risk: "High" },
  { pattern: "New account, high-value listings", count: 4, risk: "Medium" },
];

const CHECKLIST_ITEMS = [
  "Review new reports and flags",
  "Check open disputes",
  "Scan active listings for issues",
  "Review fraud alerts",
  "Check app store reviews",
  "Review subscriber metrics",
  "Respond to support messages",
  "Post social media content",
];

const SUBSCRIBER_PROJECTION = [
  { count: 100, mrr: "$199", arr: "$2,388" },
  { count: 250, mrr: "$498", arr: "$5,970" },
  { count: 500, mrr: "$995", arr: "$11,940" },
  { count: 1000, mrr: "$1,990", arr: "$23,880" },
  { count: 2500, mrr: "$4,975", arr: "$59,700" },
  { count: 5000, mrr: "$9,950", arr: "$119,400" },
];

const ACTIVITY_FEED = [
  { time: "2m ago", icon: "🟢", msg: "New subscriber — James T. upgraded to Monthly" },
  { time: "8m ago", icon: "🚩", msg: "Listing flagged — 'iPhone 12' by Raj P." },
  { time: "14m ago", icon: "💬", msg: "New dispute opened — Sarah M. vs Raj P." },
  { time: "31m ago", icon: "💸", msg: "Payment released — $55 to Mike L." },
  { time: "1h ago", icon: "🟢", msg: "New subscriber — Donna K. upgraded to Yearly" },
  { time: "2h ago", icon: "🔴", msg: "User suspended — Carla B. (repeat violations)" },
];

function StatCard({ label, value, icon: Icon, sub, color = "navy" }: { label: string; value: string; icon: any; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-border/60 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color === "gold" ? "bg-[#D4AF37]/15" : "bg-[#0B3954]/8"}`}>
          <Icon className={`h-4 w-4 ${color === "gold" ? "text-[#D4AF37]" : "text-[#0B3954]"}`} />
        </div>
      </div>
      <p className="text-2xl font-serif font-bold text-[#0B3954]">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-xl font-bold text-[#0B3954] mb-4">{children}</h2>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Flagged: "bg-amber-50 text-amber-700 border-amber-200",
    Suspended: "bg-rose-50 text-rose-700 border-rose-200",
    Open: "bg-amber-50 text-amber-700 border-amber-200",
    High: "bg-rose-50 text-rose-700 border-rose-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Low: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <Badge className={`text-xs border ${map[status] ?? "bg-muted text-muted-foreground"}`}>{status}</Badge>
  );
}

export default function AdminDashboard() {
  const { data: currentUser } = useGetCurrentUser();
  const [activeSection, setActiveSection] = useState("overview");
  const [userSearch, setUserSearch] = useState("");
  const [listingFilter, setListingFilter] = useState("All");
  const [checklist, setChecklist] = useState<boolean[]>(new Array(8).fill(false));

  const toggleCheck = (i: number) => {
    const next = [...checklist];
    next[i] = !next[i];
    setChecklist(next);
  };

  const checkCount = checklist.filter(Boolean).length;

  const filteredUsers = MOCK_USERS.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.type.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredListings = listingFilter === "All"
    ? MOCK_LISTINGS
    : MOCK_LISTINGS.filter(l => l.status === listingFilter);

  const flaggedListings = MOCK_LISTINGS.filter(l => l.status === "Flagged");

  return (
    <Layout>
      <div className="bg-[#0B3954] py-8">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-1">
            <Shield className="h-6 w-6 text-[#D4AF37]" />
            <h1 className="font-serif text-2xl font-bold text-white">Admin Dashboard</h1>
            <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 text-xs ml-1">Founder Access</Badge>
          </div>
          <p className="text-white/50 text-sm">Your back window to everything happening in the app.</p>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar nav */}
          <nav className="hidden md:flex flex-col gap-1 w-52 shrink-0">
            {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-left transition-colors ${
                  activeSection === id
                    ? "bg-[#0B3954] text-white"
                    : "text-[#0B3954]/70 hover:bg-[#0B3954]/6"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>

          {/* Mobile nav */}
          <div className="md:hidden w-full mb-4 overflow-x-auto pb-2">
            <div className="flex gap-2 min-w-max">
              {NAV_SECTIONS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    activeSection === id ? "bg-[#0B3954] text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0 space-y-6">

            {/* ── OVERVIEW ── */}
            {activeSection === "overview" && (
              <div className="space-y-6">
                <SectionHeader>Overview</SectionHeader>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Total Subscribers" value="47" icon={Users} sub="+3 this week" color="gold" />
                  <StatCard label="Active Listings" value="182" icon={Package} sub="across all sellers" />
                  <StatCard label="Pending Disputes" value="2" icon={AlertTriangle} sub="needs attention" color="gold" />
                  <StatCard label="Today's Revenue" value="$14.97" icon={DollarSign} sub="3 new subs today" />
                </div>

                {/* Subscriber growth chart (simple bar) */}
                <div className="bg-white rounded-2xl border border-border/60 p-5 shadow-sm">
                  <h3 className="font-semibold text-[#0B3954] text-sm mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[#D4AF37]" />
                    Subscriber Growth — Last 30 Days
                  </h3>
                  <div className="flex items-end gap-1 h-24">
                    {[12, 15, 14, 18, 20, 19, 22, 21, 24, 26, 25, 28, 30, 29, 31, 33, 32, 35, 34, 36, 38, 37, 40, 41, 42, 44, 43, 45, 46, 47].map((v, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-[#0B3954]/15 hover:bg-[#D4AF37]/60 transition-colors"
                        style={{ height: `${(v / 47) * 100}%` }}
                        title={`Day ${i + 1}: ${v} subscribers`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>Apr 17</span><span>May 1</span><span>May 17</span>
                  </div>
                </div>

                {/* Activity feed */}
                <div className="bg-white rounded-2xl border border-border/60 p-5 shadow-sm">
                  <h3 className="font-semibold text-[#0B3954] text-sm mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#D4AF37]" />
                    Real-Time Activity Feed
                  </h3>
                  <div className="space-y-3">
                    {ACTIVITY_FEED.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <span className="text-base leading-none mt-0.5">{item.icon}</span>
                        <div className="flex-1">
                          <span className="text-[#0B3954]/80">{item.msg}</span>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── USERS ── */}
            {activeSection === "users" && (
              <div className="space-y-5">
                <SectionHeader>Users & Members</SectionHeader>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or type…"
                    className="pl-9 rounded-xl"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                  />
                </div>

                {/* Flagged accounts callout */}
                {MOCK_USERS.filter(u => u.status !== "Active").length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span className="text-sm text-amber-800 font-medium">
                      {MOCK_USERS.filter(u => u.status !== "Active").length} accounts need your attention (flagged or suspended).
                    </span>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Name</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Type</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Joined</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Listings</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Transactions</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3 font-medium text-[#0B3954]">{user.name}</td>
                          <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{user.type}</td>
                          <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{user.joined}</td>
                          <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{user.listings}</td>
                          <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{user.transactions}</td>
                          <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button className="p-1 rounded hover:bg-muted transition-colors text-[#0B3954]/60 hover:text-[#0B3954]" title="View"><Eye className="h-4 w-4" /></button>
                              <button className="p-1 rounded hover:bg-amber-50 transition-colors text-amber-600" title="Warn"><AlertTriangle className="h-4 w-4" /></button>
                              <button className="p-1 rounded hover:bg-rose-50 transition-colors text-rose-600" title="Suspend"><Ban className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── LISTINGS ── */}
            {activeSection === "listings" && (
              <div className="space-y-5">
                <SectionHeader>Listings Monitor</SectionHeader>
                {flaggedListings.length > 0 && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span className="text-sm text-rose-800 font-medium">
                      {flaggedListings.length} listings flagged for urgent review.
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  {["All", "Active", "Flagged", "Removed"].map(f => (
                    <button
                      key={f}
                      onClick={() => setListingFilter(f)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        listingFilter === f ? "bg-[#0B3954] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Item</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Seller</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Category</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Price</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Pickup</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredListings.map(listing => (
                        <tr key={listing.id} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3 font-medium text-[#0B3954] max-w-[160px] truncate">{listing.title}</td>
                          <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{listing.seller}</td>
                          <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{listing.category}</td>
                          <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{listing.price}</td>
                          <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">{listing.pickup}</td>
                          <td className="px-4 py-3"><StatusBadge status={listing.status} /></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button className="p-1 rounded hover:bg-emerald-50 transition-colors text-emerald-600 text-xs" title="Clear flag"><CheckCircle className="h-4 w-4" /></button>
                              <button className="p-1 rounded hover:bg-rose-50 transition-colors text-rose-600" title="Remove"><XCircle className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── PAYMENTS & DISPUTES ── */}
            {activeSection === "payments" && (
              <div className="space-y-6">
                <SectionHeader>Payments & Disputes</SectionHeader>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Held in Escrow" value="$235" icon={Lock as any} sub="3 transactions" color="gold" />
                  <StatCard label="Released Today" value="$55" icon={DollarSign} sub="1 transaction" />
                  <StatCard label="Open Disputes" value="2" icon={AlertTriangle} color="gold" />
                  <StatCard label="Resolved This Week" value="4" icon={CheckCircle as any} />
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-[#0B3954] text-sm">Open Disputes</h3>
                  {MOCK_DISPUTES.map(d => (
                    <div key={d.id} className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <StatusBadge status="Open" />
                            <span className="text-sm font-semibold text-[#0B3954]">{d.item} — {d.amount}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Buyer: {d.buyer} · Seller: {d.seller}</p>
                          <p className="text-xs text-amber-700">"{d.reason}"</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" variant="outline" className="rounded-full text-xs border-[#0B3954]/20 text-[#0B3954]">
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                          <Button size="sm" className="rounded-full text-xs bg-[#D4AF37] text-[#0B3954] hover:bg-[#c9a430] border-0">
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── REPORTS ── */}
            {activeSection === "reports" && (
              <div className="space-y-5">
                <SectionHeader>Reports & Flags</SectionHeader>
                <p className="text-sm text-muted-foreground -mt-3">Priority queue of pending user reports and listing flags.</p>
                <div className="space-y-3">
                  {MOCK_REPORTS.map(r => (
                    <div key={r.id} className="bg-white rounded-2xl border border-border/60 p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <StatusBadge status={r.priority} />
                            <Badge className="text-xs bg-muted text-muted-foreground border">{r.type}</Badge>
                          </div>
                          <p className="text-sm font-medium text-[#0B3954]">
                            {r.reporter} reported {r.reported}
                          </p>
                          <p className="text-xs text-muted-foreground">Reason: "{r.reason}"</p>
                        </div>
                        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                          <Button size="sm" variant="outline" className="rounded-full text-xs border-[#0B3954]/20 text-[#0B3954]">
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Investigate
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-full text-xs">
                            Dismiss
                          </Button>
                          <Button size="sm" className="rounded-full text-xs bg-rose-600 text-white hover:bg-rose-700 border-0">
                            <Ban className="h-3.5 w-3.5 mr-1" />
                            Ban User
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── REVENUE ── */}
            {activeSection === "revenue" && (
              <div className="space-y-6">
                <SectionHeader>Subscription Revenue</SectionHeader>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="MRR" value="$93.53" icon={TrendingUp} sub="47 subscribers" color="gold" />
                  <StatCard label="Annual Run Rate" value="$1,122" icon={BarChart3} />
                  <StatCard label="Monthly Subs" value="38" icon={Users} />
                  <StatCard label="Annual Subs" value="9" icon={Star as any} color="gold" />
                </div>
                <div className="bg-white rounded-2xl border border-border/60 p-5 shadow-sm">
                  <h3 className="font-semibold text-[#0B3954] text-sm mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#D4AF37]" />
                    Revenue Projection (Monthly @ $1.99/sub)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-2 text-xs font-semibold text-muted-foreground">Subscribers</th>
                          <th className="text-left pb-2 text-xs font-semibold text-muted-foreground">MRR</th>
                          <th className="text-left pb-2 text-xs font-semibold text-muted-foreground">ARR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SUBSCRIBER_PROJECTION.map(row => (
                          <tr key={row.count} className="border-b last:border-0">
                            <td className="py-2.5 font-medium text-[#0B3954]">{row.count.toLocaleString()}</td>
                            <td className="py-2.5 text-emerald-700 font-semibold">{row.mrr}</td>
                            <td className="py-2.5 text-emerald-800 font-bold">{row.arr}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-3">Based on $1.99/month subscription rate. Annual plan conversion not included.</p>
                </div>
              </div>
            )}

            {/* ── FRAUD ── */}
            {activeSection === "fraud" && (
              <div className="space-y-6">
                <SectionHeader>Fraud Alerts</SectionHeader>

                {/* Active alerts */}
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="h-5 w-5 text-rose-600" />
                    <h3 className="font-semibold text-rose-800 text-sm">Active Fraud Alerts</h3>
                    <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-xs ml-auto">2 alerts</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white rounded-xl border border-rose-200 px-4 py-3 text-sm text-rose-800">
                      🔴 Raj P. — Multiple listings removed. Account flagged for review.
                    </div>
                    <div className="bg-white rounded-xl border border-rose-200 px-4 py-3 text-sm text-rose-800">
                      🔴 Carla B. — Suspended. 3 reports in 7 days.
                    </div>
                  </div>
                </div>

                {/* Pattern monitor */}
                <div className="bg-white rounded-2xl border border-border/60 p-5 shadow-sm">
                  <h3 className="font-semibold text-[#0B3954] text-sm mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#D4AF37]" />
                    Pattern Monitor — This Week
                  </h3>
                  <div className="space-y-3">
                    {FRAUD_PATTERNS.map((p, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <StatusBadge status={p.risk} />
                        <span className="text-sm text-[#0B3954]/80 flex-1">{p.pattern}</span>
                        <span className="text-xs font-semibold text-muted-foreground">{p.count}×</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Protections status */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                  <h3 className="font-semibold text-emerald-800 text-sm mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    Built-In Protections — All Active
                  </h3>
                  <div className="space-y-2">
                    {[
                      "Escrow payment hold (5-day auto-release)",
                      "Porch pickup photo timestamp required",
                      "Report & block system — users + listings",
                      "New account listing cooldown monitoring",
                      "Stripe fraud detection (Radar rules)",
                    ].map((p) => (
                      <div key={p} className="flex items-center gap-2 text-sm text-emerald-800">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── DAILY CHECKLIST ── */}
            {activeSection === "checklist" && (
              <div className="space-y-5">
                <SectionHeader>Daily Checklist</SectionHeader>
                <p className="text-sm text-muted-foreground -mt-3">Tick these off each morning to keep everything running smoothly.</p>

                <div className="bg-white rounded-2xl border border-border/60 p-6 shadow-sm space-y-3">
                  {CHECKLIST_ITEMS.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => toggleCheck(i)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        checklist[i]
                          ? "bg-emerald-50 border-emerald-200"
                          : "border-border/60 hover:border-[#0B3954]/20"
                      }`}
                    >
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        checklist[i] ? "bg-emerald-500 border-emerald-500" : "border-border"
                      }`}>
                        {checklist[i] && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                      </div>
                      <span className={`text-sm ${checklist[i] ? "text-emerald-800 line-through" : "text-[#0B3954]/80"}`}>
                        {item}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#0B3954]/70">{checkCount} of 8 complete</span>
                    <span className="font-semibold text-[#0B3954]">{Math.round((checkCount / 8) * 100)}%</span>
                  </div>
                  <Progress value={(checkCount / 8) * 100} className="h-2 bg-muted" />
                </div>

                {checkCount === 8 && (
                  <div className="bg-[#D4AF37]/15 border border-[#D4AF37]/40 rounded-2xl p-5 text-center">
                    <p className="text-2xl mb-1">🎉</p>
                    <p className="font-serif font-bold text-[#0B3954]">All done for today!</p>
                    <p className="text-sm text-[#0B3954]/60 mt-1">You're crushing it. The community thanks you.</p>
                    <button
                      onClick={() => setChecklist(new Array(8).fill(false))}
                      className="mt-3 text-xs text-[#0B3954]/50 hover:text-[#0B3954] transition-colors flex items-center gap-1 mx-auto"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Reset for tomorrow
                    </button>
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>
    </Layout>
  );
}
