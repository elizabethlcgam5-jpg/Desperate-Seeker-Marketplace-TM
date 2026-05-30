import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useListThreads } from "@workspace/api-client-react";
import { toast } from "sonner";
import {
  useNotificationSettings,
  readCachedSettings,
} from "@/hooks/use-notification-settings";
import { useMessageSound } from "@/hooks/use-message-sound";

// Messages icon for the header: shows a red unread badge and drives the
// new-message alerts (toast / sound / vibration) by polling the thread list.
export function MessagesNavButton() {
  const { data: threads } = useListThreads({
    query: { refetchInterval: 15_000 },
  });
  const { data: settings } = useNotificationSettings();
  const playDing = useMessageSound();
  const prevUnreadRef = useRef<Record<string, number> | null>(null);

  const totalUnread = (threads ?? []).reduce(
    (sum, t) => sum + (t.unread ?? 0),
    0,
  );

  useEffect(() => {
    if (!threads) return;
    const current: Record<string, number> = {};
    let hasNew = false;
    for (const t of threads) {
      current[t.id] = t.unread ?? 0;
      const prev = prevUnreadRef.current?.[t.id] ?? 0;
      if ((t.unread ?? 0) > prev && !t.muted) hasNew = true;
    }
    const firstRun = prevUnreadRef.current === null;
    prevUnreadRef.current = current;
    if (firstRun || !hasNew) return;

    const s = settings ?? readCachedSettings();
    if (!s.enabled) return;
    if (s.messageAlerts) {
      toast("New message", {
        description: "You have a new message in your inbox.",
      });
    }
    if (s.sound) playDing();
    if (s.vibration && typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(200);
    }
  }, [threads, settings, playDing]);

  return (
    <Link href="/messages">
      <Button
        variant="ghost"
        size="icon"
        title="Messages"
        className="relative text-white/80 hover:text-white hover:bg-white/10"
      >
        <MessageSquare className="h-5 w-5" />
        {totalUnread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </Button>
    </Link>
  );
}
