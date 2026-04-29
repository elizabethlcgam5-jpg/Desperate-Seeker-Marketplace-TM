import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, Tag, Sparkles } from "lucide-react";
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
  listingId: string | null;
  read: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
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
            notifications: prev.notifications.map((n) => ({
              ...n,
              read: true,
            })),
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
        title="Notifications"
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
          <div className="flex items-center justify-between px-4 py-3 bg-[#0B3954]">
            <span className="text-white font-semibold text-sm">
              Match Alerts
              {unread > 0 && (
                <span className="ml-2 bg-[#D4AF37] text-[#0B3954] text-xs font-bold rounded-full px-1.5 py-0.5">
                  {unread} new
                </span>
              )}
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-white/70 hover:text-white text-xs"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {!data || data.notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="h-8 w-8 text-[#0B3954]/15 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No match alerts yet.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You'll be notified when buyers post requests matching your
                  listings.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[#0B3954]/8">
                {data.notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`px-4 py-3 flex gap-3 hover:bg-[#0B3954]/5 transition-colors ${!n.read ? "bg-[#D4AF37]/6" : ""}`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {n.type === "exact" ? (
                        <div className="h-7 w-7 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                          <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
                        </div>
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-[#0B3954]/10 flex items-center justify-center">
                          <Tag className="h-3.5 w-3.5 text-[#0B3954]/60" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-[#0B3954]">
                          {n.title}
                        </p>
                        {!n.read && (
                          <button
                            onClick={() => markRead(n.id)}
                            className="shrink-0 text-[#0B3954]/40 hover:text-[#0B3954] mt-0.5"
                            title="Mark as read"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                        {n.message}
                      </p>
                      <div className="flex items-center justify-between mt-1.5 gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(n.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        {n.requestId && (
                          <Link
                            href={`/buyer-requests`}
                            onClick={() => {
                              markRead(n.id);
                              setOpen(false);
                            }}
                            className="text-[10px] font-medium text-[#0B3954] hover:underline"
                          >
                            View request →
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
