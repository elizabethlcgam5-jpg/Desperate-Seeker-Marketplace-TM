import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  requestId: string | null;
  requestTitle: string | null;
  requestDescription: string | null;
  listingId: string | null;
  read: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

type PanelView = "inapp" | "email";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<PanelView>("inapp");
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  async function fetchNotifications() {
    try {
      const res = await fetch(getApiUrl("notifications"), {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  async function markAllRead() {
    await fetch(getApiUrl("notifications/read-all"), {
      method: "PATCH",
      credentials: "include",
    });
    setData((prev) =>
      prev
        ? {
            ...prev,
            unreadCount: 0,
            notifications: prev.notifications.map((n) => ({ ...n, read: true })),
          }
        : prev,
    );
  }

  async function markRead(id: string) {
    await fetch(getApiUrl(`notifications/${id}/read`), {
      method: "PATCH",
      credentials: "include",
    });
    setData((prev) =>
      prev
        ? {
            ...prev,
            unreadCount: Math.max(0, prev.unreadCount - 1),
            notifications: prev.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n,
            ),
          }
        : prev,
    );
  }

  const unread = data?.unreadCount ?? 0;
  const firstUnread = data?.notifications.find((n) => !n.read);

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative text-white/80 hover:text-white hover:bg-white/10"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) fetchNotifications();
        }}
        title="Match alerts"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4AF37] text-[#0B3954] text-[10px] font-bold leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#0B3954]/10 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0B3954]">
            <span className="text-white font-semibold text-sm">
              Match Alerts
              {unread > 0 && (
                <span className="ml-2 bg-[#D4AF37] text-[#0B3954] text-[10px] font-bold rounded-full px-1.5 py-0.5">
                  {unread} new
                </span>
              )}
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-white/60 hover:text-white text-xs"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Tab strip */}
          <div className="flex border-b border-[#0B3954]/10 bg-white">
            <button
              onClick={() => setView("inapp")}
              className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                view === "inapp"
                  ? "border-[#D4AF37] text-[#0B3954]"
                  : "border-transparent text-[#0B3954]/40 hover:text-[#0B3954]/70"
              }`}
            >
              In-app
              {unread > 0 && view !== "inapp" && (
                <span className="ml-1 bg-[#D4AF37] text-[#0B3954] rounded-full px-1.5 text-[9px] font-bold">
                  {unread}
                </span>
              )}
            </button>
            <button
              onClick={() => setView("email")}
              className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                view === "email"
                  ? "border-[#D4AF37] text-[#0B3954]"
                  : "border-transparent text-[#0B3954]/40 hover:text-[#0B3954]/70"
              }`}
            >
              Email alert
            </button>
          </div>

          {/* In-app tab */}
          {view === "inapp" && (
            <div className="max-h-[400px] overflow-y-auto">
              {!data || data.notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="h-8 w-8 text-[#0B3954]/15 mx-auto mb-2" />
                  <p className="text-sm text-[#0B3954]/50">No match alerts yet.</p>
                  <p className="text-xs text-[#0B3954]/35 mt-1">
                    You'll be notified when buyers post requests matching your listings.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-[#0B3954]/8 px-3 py-3 space-y-2.5">
                  {data.notifications.map((n) => (
                    <li
                      key={n.id}
                      onClick={() => !n.read && markRead(n.id)}
                      className={`rounded-xl border p-3.5 cursor-pointer transition-all ${
                        n.read
                          ? "bg-white border-[#e0e0e0] opacity-70"
                          : "bg-white border-[#D4AF37]/40 shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                            n.type === "exact"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-[#D4AF37]/15 text-[#0B3954]"
                          }`}
                        >
                          {n.type === "exact" ? "✓✓" : "~"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-bold ${
                                n.type === "exact" ? "text-emerald-700" : "text-[#0B3954]"
                              }`}
                            >
                              {n.title}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-[#0B3954]/35">
                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                              </span>
                              {!n.read && (
                                <span className="h-2 w-2 rounded-full bg-[#D4AF37] shrink-0" />
                              )}
                            </div>
                          </div>
                          <p className="text-[11px] text-[#0B3954]/65 mt-1 leading-relaxed">
                            {n.message}
                          </p>
                          {n.requestTitle && (
                            <div className="mt-2 bg-[hsl(39_83%_95%)] rounded-lg px-2.5 py-1.5">
                              <p className="text-[10px] text-[#0B3954]/40 font-medium">
                                Buyer's request:
                              </p>
                              <p className="text-[10px] text-[#0B3954]/70 italic mt-0.5">
                                "{n.requestTitle}"
                              </p>
                            </div>
                          )}
                          {n.requestId && (
                            <Link
                              href="/buyer-requests"
                              onClick={() => {
                                markRead(n.id);
                                setOpen(false);
                              }}
                              className="mt-2 inline-block text-xs font-semibold text-[#D4AF37] hover:text-[#c9a430]"
                            >
                              Respond →
                            </Link>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Email preview tab */}
          {view === "email" && (
            <div className="p-3 max-h-[400px] overflow-y-auto">
              <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-sm overflow-hidden">
                <div className="bg-[#f5f5f5] border-b border-[#e0e0e0] px-4 py-3 space-y-1">
                  <div className="flex gap-2 text-[11px] text-[#0B3954]/50">
                    <span className="font-medium w-8">From:</span>
                    <span>matches@desperatelyseeking.com</span>
                  </div>
                  <div className="flex gap-2 text-[11px] text-[#0B3954]/50">
                    <span className="font-medium w-8">To:</span>
                    <span>you@email.com</span>
                  </div>
                  <div className="flex gap-2 text-[11px]">
                    <span className="font-medium w-8 text-[#0B3954]/50">Re:</span>
                    <span className="font-bold text-[#0B3954]">
                      🔔 {firstUnread ? `Exact match — someone needs your listing` : "Match alert from Desperately Seeking"}
                    </span>
                  </div>
                </div>
                <div className="px-5 py-5 space-y-4">
                  <p className="font-serif font-bold text-[#0B3954]">Desperately Seeking</p>
                  <div className="h-px bg-[#e0e0e0]" />
                  <p className="text-sm font-semibold text-[#0B3954]">Hi there,</p>
                  {firstUnread ? (
                    <>
                      <p className="text-sm text-[#0B3954]/70 leading-relaxed">
                        A buyer nearby is looking for{" "}
                        <strong className="text-[#0B3954]">
                          {firstUnread.requestTitle ?? "an item matching your listing"}
                        </strong>{" "}
                        — {firstUnread.type === "exact" ? "an exact match" : "a similar match"} for
                        one of your listings.
                      </p>
                      {firstUnread.requestDescription && (
                        <div className="bg-[hsl(39_83%_95%)] border border-[#D4AF37]/25 rounded-xl px-4 py-3">
                          <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wide mb-1.5">
                            Their request
                          </p>
                          <p className="text-sm text-[#0B3954]/80 italic">
                            "{firstUnread.requestDescription}"
                          </p>
                        </div>
                      )}
                      <p className="text-sm text-[#0B3954]/70 leading-relaxed">
                        Be the first to respond — buyers typically choose the first seller who
                        reaches out.
                      </p>
                      <Link
                        href="/buyer-requests"
                        onClick={() => setOpen(false)}
                        className="block w-full text-center rounded-full bg-[#D4AF37] text-[#0B3954] font-bold py-3 text-sm hover:bg-[#c9a430] transition-colors"
                      >
                        Respond to this buyer →
                      </Link>
                    </>
                  ) : (
                    <p className="text-sm text-[#0B3954]/60">
                      This is a preview of the email alert sellers receive when a buyer posts a
                      request matching their listing.
                    </p>
                  )}
                  <p className="text-[10px] text-[#0B3954]/35 text-center">
                    You're getting this because you have an active matching listing.{" "}
                    <span className="underline cursor-pointer">Unsubscribe</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
