import { Layout } from "@/components/layout";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Package,
  DollarSign,
  Activity,
  MessageSquare,
  ShoppingBag,
  TrendingUp,
  BarChart3,
  ListChecks,
} from "lucide-react";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { getApiUrl } from "@/lib/api";

type Stats = {
  users: { total: number; sellers: number };
  listings: { total: number; active: number; sold: number };
  requests: { total: number };
  messages: { total: number };
  commissions: { totalEarned: number; transactions: number };
  notifications: { unread: number };
};

type AdminUser = {
  id: string;
  name: string;
  handle: string;
  email: string | null;
  tier: string;
  joinedAt: string;
};

type AdminListing = {
  id: string;
  title: string;
  sellerName: string | null;
  category: string;
  price: number;
  status: string;
  availability: string;
  isAvailable: boolean;
  createdAt: string;
};

type AdminMessage = {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

type AdminCommission = {
  id: string;
  sellerId: string;
  listingId: string | null;
  salePrice: number;
  commissionAmount: number;
  status: string;
  createdAt: string;
};

const NAV_SECTIONS = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "users", label: "Users", icon: Users },
  { id: "listings", label: "Listings", icon: Package },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "payments", label: "Payments", icon: DollarSign },
];

function useAdmin<T>(path: string) {
  return useQuery<T>({
    queryKey: ["admin", path],
    queryFn: async () => {
      const res = await fetch(getApiUrl(`admin/${path}`), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });
}

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  color = "navy",
}: {
  label: string;
  value: string;
  icon: any;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border/60 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            color === "gold" ? "bg-[#D4AF37]/15" : "bg-[#0B3954]/8"
          }`}
        >
          <Icon
            className={`h-4 w-4 ${
              color === "gold" ? "text-[#D4AF37]" : "text-[#0B3954]"
            }`}
          />
        </div>
      </div>
      <p className="text-2xl font-serif font-bold text-[#0B3954]">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-xl font-bold text-[#0B3954] mb-4">
      {children}
    </h2>
  );
}

export default function AdminDashboard() {
  const [section, setSection] = useState("overview");
  const { data: user } = useGetCurrentUser();
  const { data: stats, isLoading: statsLoading } =
    useAdmin<Stats>("stats");
  const { data: users, isLoading: usersLoading } =
    useAdmin<AdminUser[]>("users");
  const { data: listings, isLoading: listingsLoading } =
    useAdmin<AdminListing[]>("listings");
  const { data: messages, isLoading: messagesLoading } =
    useAdmin<AdminMessage[]>("messages");
  const { data: commissions, isLoading: commissionsLoading } =
    useAdmin<AdminCommission[]>("commissions");

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 md:px-8 max-w-3xl py-16 text-center">
          <h1 className="font-serif text-2xl font-bold text-[#0B3954] mb-2">
            Admin only
          </h1>
          <p className="text-muted-foreground">
            Please sign in to access the admin dashboard.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-[#0B3954] py-8">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">
            Admin Dashboard
          </h1>
          <p className="text-white/70 text-sm mt-2">
            Live data from your production database.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-7xl py-8">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
          {/* Sidebar */}
          <nav className="space-y-1">
            {NAV_SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    section === s.id
                      ? "bg-[#0B3954] text-white"
                      : "text-[#0B3954]/70 hover:bg-[#0B3954]/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {s.label}
                </button>
              );
            })}
          </nav>

          {/* Main */}
          <div>
            {section === "overview" && (
              <div>
                <SectionHeader>Platform Overview</SectionHeader>
                {statsLoading || !stats ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-28 rounded-2xl" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      label="Total Users"
                      value={stats.users.total.toString()}
                      icon={Users}
                    />
                    <StatCard
                      label="Paid Sellers"
                      value={stats.users.sellers.toString()}
                      icon={TrendingUp}
                      color="gold"
                    />
                    <StatCard
                      label="Active Listings"
                      value={stats.listings.active.toString()}
                      icon={Package}
                      sub={`${stats.listings.total} total · ${stats.listings.sold} sold`}
                    />
                    <StatCard
                      label="Buyer Requests"
                      value={stats.requests.total.toString()}
                      icon={ShoppingBag}
                    />
                    <StatCard
                      label="Messages Sent"
                      value={stats.messages.total.toString()}
                      icon={MessageSquare}
                    />
                    <StatCard
                      label="Commissions Earned"
                      value={`$${stats.commissions.totalEarned.toFixed(2)}`}
                      icon={DollarSign}
                      color="gold"
                      sub={`${stats.commissions.transactions} sales`}
                    />
                    <StatCard
                      label="Unread Notifications"
                      value={stats.notifications.unread.toString()}
                      icon={BarChart3}
                    />
                    <StatCard
                      label="Items Sold"
                      value={stats.listings.sold.toString()}
                      icon={ListChecks}
                    />
                  </div>
                )}
              </div>
            )}

            {section === "users" && (
              <div>
                <SectionHeader>Users ({users?.length ?? 0})</SectionHeader>
                {usersLoading ? (
                  <Skeleton className="h-64 rounded-2xl" />
                ) : !users || users.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No users yet.</p>
                ) : (
                  <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-[#0B3954]/5 text-[#0B3954]">
                        <tr>
                          <th className="text-left p-3 font-semibold">Name</th>
                          <th className="text-left p-3 font-semibold">Handle</th>
                          <th className="text-left p-3 font-semibold">Email</th>
                          <th className="text-left p-3 font-semibold">Tier</th>
                          <th className="text-left p-3 font-semibold">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-t border-border/40">
                            <td className="p-3 font-medium">{u.name}</td>
                            <td className="p-3 text-muted-foreground">
                              @{u.handle}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {u.email ?? "—"}
                            </td>
                            <td className="p-3">
                              <Badge
                                className={`text-xs ${
                                  u.tier === "free"
                                    ? "bg-muted text-muted-foreground"
                                    : "bg-[#D4AF37] text-[#0B3954]"
                                }`}
                              >
                                {u.tier}
                              </Badge>
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {new Date(u.joinedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {section === "listings" && (
              <div>
                <SectionHeader>
                  Listings ({listings?.length ?? 0})
                </SectionHeader>
                {listingsLoading ? (
                  <Skeleton className="h-64 rounded-2xl" />
                ) : !listings || listings.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No listings yet.
                  </p>
                ) : (
                  <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-[#0B3954]/5 text-[#0B3954]">
                        <tr>
                          <th className="text-left p-3 font-semibold">Title</th>
                          <th className="text-left p-3 font-semibold">Seller</th>
                          <th className="text-left p-3 font-semibold">
                            Category
                          </th>
                          <th className="text-left p-3 font-semibold">Price</th>
                          <th className="text-left p-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listings.map((l) => (
                          <tr key={l.id} className="border-t border-border/40">
                            <td className="p-3 font-medium">{l.title}</td>
                            <td className="p-3 text-muted-foreground">
                              {l.sellerName ?? "—"}
                            </td>
                            <td className="p-3 text-muted-foreground capitalize">
                              {l.category}
                            </td>
                            <td className="p-3 font-semibold text-[#D4AF37]">
                              ${l.price.toLocaleString()}
                            </td>
                            <td className="p-3">
                              <Badge
                                className={`text-xs ${
                                  l.status === "sold"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                {l.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {section === "messages" && (
              <div>
                <SectionHeader>
                  Recent Messages ({messages?.length ?? 0})
                </SectionHeader>
                {messagesLoading ? (
                  <Skeleton className="h-64 rounded-2xl" />
                ) : !messages || messages.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No messages yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className="bg-white rounded-xl border border-border/60 p-3 shadow-sm"
                      >
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Thread: {m.threadId.slice(0, 8)}</span>
                          <span>
                            {new Date(m.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-[#0B3954]">{m.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {section === "payments" && (
              <div>
                <SectionHeader>
                  Commissions ({commissions?.length ?? 0})
                </SectionHeader>
                {commissionsLoading ? (
                  <Skeleton className="h-64 rounded-2xl" />
                ) : !commissions || commissions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No commissions recorded yet.
                  </p>
                ) : (
                  <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-[#0B3954]/5 text-[#0B3954]">
                        <tr>
                          <th className="text-left p-3 font-semibold">Sale</th>
                          <th className="text-left p-3 font-semibold">
                            Commission (5%)
                          </th>
                          <th className="text-left p-3 font-semibold">Status</th>
                          <th className="text-left p-3 font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commissions.map((c) => (
                          <tr key={c.id} className="border-t border-border/40">
                            <td className="p-3 font-semibold">
                              ${c.salePrice.toLocaleString()}
                            </td>
                            <td className="p-3 font-semibold text-[#D4AF37]">
                              ${c.commissionAmount.toLocaleString()}
                            </td>
                            <td className="p-3">
                              <Badge
                                className={`text-xs ${
                                  c.status === "paid"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                              >
                                {c.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
