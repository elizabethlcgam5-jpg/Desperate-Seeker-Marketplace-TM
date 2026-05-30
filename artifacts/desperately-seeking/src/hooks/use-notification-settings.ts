import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/api";

export type NotificationSettings = {
  enabled: boolean;
  messageAlerts: boolean;
  sound: boolean;
  vibration: boolean;
  email: boolean;
  push: boolean;
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  messageAlerts: true,
  sound: true,
  vibration: true,
  email: false,
  push: false,
};

const STORAGE_KEY = "ds_notification_settings";
export const NOTIFICATION_SETTINGS_KEY = ["notification-settings"] as const;

// Synchronous read of the last-known settings — used by alert logic that can't
// wait for an async fetch (sound/vibration on a freshly arrived message).
export function readCachedSettings(): NotificationSettings {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

function writeCache(settings: NotificationSettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore quota / privacy-mode errors
  }
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: NOTIFICATION_SETTINGS_KEY,
    queryFn: async (): Promise<NotificationSettings> => {
      const res = await fetch(getApiUrl("me/notification-settings"), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load notification settings");
      const json = (await res.json()) as Partial<NotificationSettings>;
      const merged = { ...DEFAULT_NOTIFICATION_SETTINGS, ...json };
      writeCache(merged);
      return merged;
    },
    staleTime: 60_000,
  });
}

export function useUpdateNotificationSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      patch: Partial<NotificationSettings>,
    ): Promise<NotificationSettings> => {
      const res = await fetch(getApiUrl("me/notification-settings"), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed to update notification settings");
      const json = (await res.json()) as Partial<NotificationSettings>;
      const merged = { ...DEFAULT_NOTIFICATION_SETTINGS, ...json };
      writeCache(merged);
      return merged;
    },
    onSuccess: (data) => {
      qc.setQueryData(NOTIFICATION_SETTINGS_KEY, data);
    },
  });
}
