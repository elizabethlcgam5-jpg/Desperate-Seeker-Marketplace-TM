import { useState } from "react";

const NOTIFICATIONS = [
  {
    id: 1,
    type: "exact",
    title: "Exact match alert",
    message: "A buyer near you is looking for a Vintage Oak Dresser — you listed one last week.",
    time: "2 min ago",
    read: false,
    distance: "1.8 mi away",
    request: "Vintage oak dresser, 3 drawers, natural finish",
  },
  {
    id: 2,
    type: "similar",
    title: "Similar match",
    message: "Buyer posted for mid-century wooden furniture. Your sideboard listing may be a fit.",
    time: "41 min ago",
    read: false,
    distance: "3.2 mi away",
    request: "Mid-century wooden furniture, any condition",
  },
  {
    id: 3,
    type: "exact",
    title: "Exact match alert",
    message: "Someone needs a Levi's denim jacket, size M — matches your listing.",
    time: "2 hr ago",
    read: true,
    distance: "0.9 mi away",
    request: "Levi's denim jacket, size M or L",
  },
];

export function SellerNotification() {
  const [tab, setTab] = useState<"notifications" | "email">("notifications");
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const unread = notifications.filter(n => !n.read).length;

  const markRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="min-h-screen bg-[#FDF5E6] flex flex-col">
      {/* Nav */}
      <div className="bg-[#0B3954] px-4 py-3 flex items-center justify-between">
        <span className="text-[#D4AF37] font-serif font-bold text-sm">Desperately Seeking</span>
        <div className="relative">
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          {unread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#D4AF37] text-[#0B3954] text-[9px] font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="bg-[#0B3954] px-4 pb-4">
        <h1 className="font-serif text-lg font-bold text-white">Match Alerts</h1>
        <p className="text-white/60 text-xs mt-0.5">We notify you the moment a buyer is looking for something you sell.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#0B3954]/10 bg-white">
        <button
          onClick={() => setTab("notifications")}
          className={`flex-1 py-3 text-xs font-semibold transition-colors border-b-2 ${tab === "notifications" ? "border-[#D4AF37] text-[#0B3954]" : "border-transparent text-[#0B3954]/40"}`}
        >
          In-app {unread > 0 && <span className="ml-1 bg-[#D4AF37] text-[#0B3954] rounded-full px-1.5 py-0.5 text-[9px] font-bold">{unread}</span>}
        </button>
        <button
          onClick={() => setTab("email")}
          className={`flex-1 py-3 text-xs font-semibold transition-colors border-b-2 ${tab === "email" ? "border-[#D4AF37] text-[#0B3954]" : "border-transparent text-[#0B3954]/40"}`}
        >
          Email preview
        </button>
      </div>

      <div className="flex-1 px-4 py-4">

        {tab === "notifications" && (
          <div className="space-y-3">
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`rounded-xl border p-4 cursor-pointer transition-all ${n.read ? "bg-white border-[#e0e0e0] opacity-70" : "bg-white border-[#D4AF37]/40 shadow-sm"}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-sm ${n.type === "exact" ? "bg-emerald-100 text-emerald-700" : "bg-[#D4AF37]/15 text-[#0B3954]"}`}>
                    {n.type === "exact" ? "✓✓" : "~"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold ${n.type === "exact" ? "text-emerald-700" : "text-[#0B3954]"}`}>{n.title}</span>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-[#D4AF37] shrink-0" />}
                    </div>
                    <p className="text-xs text-[#0B3954]/70 mt-1 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-[#0B3954]/40">{n.time}</span>
                      <span className="text-[10px] text-[#0B3954]/40">·</span>
                      <span className="text-[10px] text-[#0B3954]/40">{n.distance}</span>
                    </div>
                    <div className="mt-2 bg-[#FDF5E6] rounded-lg px-2.5 py-1.5">
                      <p className="text-[10px] text-[#0B3954]/50 font-medium mb-0.5">Buyer's request:</p>
                      <p className="text-[10px] text-[#0B3954]/75 italic">"{n.request}"</p>
                    </div>
                    <button className="mt-2.5 text-xs font-semibold text-[#D4AF37] hover:text-[#c9a430]">
                      Respond to buyer →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "email" && (
          <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-sm overflow-hidden">
            {/* Email chrome */}
            <div className="bg-[#f5f5f5] border-b border-[#e0e0e0] px-4 py-3 space-y-1">
              <div className="flex gap-2 text-xs text-[#0B3954]/50">
                <span className="font-medium w-8">From:</span>
                <span>matches@desperatelyseeking.com</span>
              </div>
              <div className="flex gap-2 text-xs text-[#0B3954]/50">
                <span className="font-medium w-8">To:</span>
                <span>you@email.com</span>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="font-medium w-8 text-[#0B3954]/50">Re:</span>
                <span className="font-bold text-[#0B3954]">🔔 Exact match — someone needs your oak dresser</span>
              </div>
            </div>
            {/* Email body */}
            <div className="px-5 py-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-[#0B3954] text-base">Desperately Seeking</span>
              </div>
              <div className="h-px bg-[#e0e0e0]" />
              <p className="text-sm font-semibold text-[#0B3954]">Hi Sarah,</p>
              <p className="text-sm text-[#0B3954]/70 leading-relaxed">
                A buyer <strong className="text-[#0B3954]">1.8 miles from you</strong> just posted a request for a <strong className="text-[#0B3954]">Vintage Oak Dresser</strong> — and it's an exact match for one of your listings.
              </p>
              <div className="bg-[#FDF5E6] border border-[#D4AF37]/25 rounded-xl px-4 py-3">
                <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wide mb-1.5">Their request</p>
                <p className="text-sm text-[#0B3954]/80 italic">"Vintage oak dresser, 3 drawers, natural finish — good or fair condition ok"</p>
              </div>
              <p className="text-sm text-[#0B3954]/70 leading-relaxed">
                Be the first to respond — buyers pick from the first few sellers who reach out.
              </p>
              <button className="w-full rounded-full bg-[#D4AF37] text-[#0B3954] font-bold py-3 text-sm">
                Respond to this buyer →
              </button>
              <p className="text-[10px] text-[#0B3954]/35 text-center">
                You're receiving this because you have a matching listing active. <span className="underline cursor-pointer">Unsubscribe</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
