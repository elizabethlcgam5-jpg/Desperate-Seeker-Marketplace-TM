import { Layout } from "@/components/layout";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  MessageSquare,
  Volume2,
  Vibrate,
  Mail,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
  type NotificationSettings,
} from "@/hooks/use-notification-settings";

type Row = {
  key: keyof NotificationSettings;
  label: string;
  description: string;
  icon: LucideIcon;
  toastOn: string;
  toastOff: string;
  note?: string;
};

const ROWS: Row[] = [
  {
    key: "messageAlerts",
    label: "Message Alerts",
    description: "Show a banner pop-up when a new message arrives.",
    icon: MessageSquare,
    toastOn: "Message alerts turned on",
    toastOff: "Message alerts turned off",
  },
  {
    key: "sound",
    label: "Sound",
    description: "Play a soft ding for new messages (muted chats stay silent).",
    icon: Volume2,
    toastOn: "Sound turned on",
    toastOff: "Sound turned off",
  },
  {
    key: "vibration",
    label: "Vibration",
    description: "Vibrate on mobile devices when a new message arrives.",
    icon: Vibrate,
    toastOn: "Vibration turned on",
    toastOff: "Vibration turned off",
  },
  {
    key: "email",
    label: "Email Notifications",
    description: "Get an email when someone messages you.",
    icon: Mail,
    toastOn: "Email notifications turned on",
    toastOff: "Email notifications turned off",
    note: "Email delivery activates once an email provider is connected.",
  },
  {
    key: "push",
    label: "Push Notifications",
    description: "Real-time alerts on mobile and installed (PWA) apps.",
    icon: Smartphone,
    toastOn: "Push notifications turned on",
    toastOff: "Push notifications turned off",
    note: "Push delivery activates once a push provider is connected.",
  },
];

export default function NotificationSettingsPage() {
  const { data, isLoading } = useNotificationSettings();
  const update = useUpdateNotificationSettings();
  const settings = data ?? DEFAULT_NOTIFICATION_SETTINGS;

  const setValue = (
    key: keyof NotificationSettings,
    value: boolean,
    on: string,
    off: string,
  ) => {
    update.mutate({ [key]: value });
    toast.success(value ? on : off);
  };

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Notifications
            </h1>
            <p className="text-muted-foreground">
              Choose how you want to hear about new messages.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Master switch */}
            <div className="bg-card border rounded-2xl shadow-sm p-5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-xl shrink-0">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Enable Notifications
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Master switch for all message alerts.
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(v) =>
                  setValue(
                    "enabled",
                    v,
                    "Notifications turned on",
                    "Notifications turned off",
                  )
                }
              />
            </div>

            {/* Detailed toggles */}
            <div
              className={`bg-card border rounded-2xl shadow-sm divide-y divide-border/60 transition-opacity ${
                settings.enabled ? "" : "opacity-50"
              }`}
            >
              {ROWS.map((row) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.key}
                    className="p-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-xl shrink-0">
                        <Icon className="w-5 h-5 text-foreground/70" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {row.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {row.description}
                        </p>
                        {row.note && (
                          <p className="text-xs text-amber-700 mt-1">
                            {row.note}
                          </p>
                        )}
                      </div>
                    </div>
                    <Switch
                      disabled={!settings.enabled}
                      checked={settings[row.key]}
                      onCheckedChange={(v) =>
                        setValue(row.key, v, row.toastOn, row.toastOff)
                      }
                    />
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              You can mute individual conversations from the “…” menu inside any
              chat.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
