import AsyncStorage from "@react-native-async-storage/async-storage";

export type HomeWeekMoodDay = {
  date: string;
  day: string;
  filled: boolean;
  mood: string | null;
  emoji: string | null;
  color: string;
};

export type ReminderItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  createdAt: string;
};

export type AppNotificationAction = "open-diary" | "open-reminders" | "open-breathing";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  icon: string;
  color: string;
  createdAt: string;
  actionLabel: string;
  action: AppNotificationAction;
  read: boolean;
};

export const REMINDER_STORAGE_PREFIX = "reflectly_reminders";
export const NOTIFICATION_READS_PREFIX = "reflectly_notification_reads";
export const REMINDERS_UPDATED_EVENT = "reflectly:reminders-updated";
export const OPEN_REMINDERS_EVENT = "reflectly:open-reminders";
export const DIARY_UPDATED_EVENT = "reflectly:diary-updated";

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function parseDateKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00Z`);
}

function getDayDifference(fromDateKey: string, toDateKey: string) {
  const fromDate = parseDateKey(fromDateKey);
  const toDate = parseDateKey(toDateKey);
  return Math.round((fromDate.getTime() - toDate.getTime()) / (24 * 60 * 60 * 1000));
}

function joinTitles(items: ReminderItem[]) {
  const titles = items.map((item) => item.title).filter(Boolean);
  if (titles.length === 0) return "Open reminders to review them.";
  if (titles.length === 1) return titles[0];
  if (titles.length === 2) return `${titles[0]} and ${titles[1]}`;
  return `${titles[0]}, ${titles[1]} and ${titles.length - 2} more`;
}

export function getScopedStorageKey(prefix: string, userId?: number | string | null) {
  if (!userId && userId !== 0) {
    return prefix;
  }

  return `${prefix}_${userId}`;
}

export async function loadScopedJsonList<T>(
  prefix: string,
  userId?: number | string | null,
  fallbackKey?: string,
): Promise<T[]> {
  const scopedKey = getScopedStorageKey(prefix, userId);
  try {
    const stored = await AsyncStorage.getItem(scopedKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }

    if (fallbackKey) {
      const legacy = await AsyncStorage.getItem(fallbackKey);
      if (legacy) {
        const parsed = JSON.parse(legacy);
        const normalized = Array.isArray(parsed) ? parsed : [];
        await AsyncStorage.setItem(scopedKey, JSON.stringify(normalized));
        return normalized;
      }
    }
  } catch (error) {
    console.error(`Failed to load scoped data for ${prefix}:`, error);
  }

  return [];
}

export async function saveScopedJsonList<T>(
  prefix: string,
  userId: number | string,
  items: T[],
) {
  const scopedKey = getScopedStorageKey(prefix, userId);
  await AsyncStorage.setItem(scopedKey, JSON.stringify(items));
}

export async function loadNotificationReadIds(userId?: number | string | null) {
  if (!userId && userId !== 0) {
    return [];
  }

  return loadScopedJsonList<string>(NOTIFICATION_READS_PREFIX, userId);
}

export async function saveNotificationReadIds(userId: number | string, ids: string[]) {
  await saveScopedJsonList(NOTIFICATION_READS_PREFIX, userId, ids);
}

export function buildHomeNotifications({
  weekMoods,
  reminders,
}: {
  weekMoods: HomeWeekMoodDay[];
  reminders: ReminderItem[];
}) {
  const todayKey = getTodayKey();
  const todayMood = weekMoods[0];
  const notifications: Omit<AppNotification, "read">[] = [];

  if (!todayMood?.filled) {
    notifications.push({
      id: `diary-missing-${todayKey}`,
      title: "You have not written today's diary",
      body: "A quick note can help you track how today is going.",
      icon: "create-outline",
      color: "#F59E0B",
      createdAt: `${todayKey}T08:00:00.000Z`,
      actionLabel: "Write now",
      action: "open-diary",
    });
  }

  if (todayMood?.filled && todayMood.color === "#F87171") {
    notifications.push({
      id: `stress-high-${todayKey}`,
      title: "Your stress looks high today",
      body: "Try a breathing break or a calm game to reset your energy.",
      icon: "heart-dislike-outline",
      color: "#EF4444",
      createdAt: `${todayKey}T08:05:00.000Z`,
      actionLabel: "Breathe now",
      action: "open-breathing",
    });
  }

  const dueToday = reminders.filter((reminder) => reminder.date === todayKey);
  if (dueToday.length > 0) {
    notifications.push({
      id: `reminders-today-${todayKey}`,
      title: `${dueToday.length} reminder${dueToday.length === 1 ? "" : "s"} due today`,
      body: joinTitles(dueToday),
      icon: "notifications-outline",
      color: "#F59E0B",
      createdAt: `${todayKey}T09:00:00.000Z`,
      actionLabel: "Open reminders",
      action: "open-reminders",
    });
  }

  const overdue = reminders.filter((reminder) => reminder.date < todayKey);
  if (overdue.length > 0) {
    notifications.push({
      id: `reminders-overdue-${todayKey}`,
      title: `${overdue.length} reminder${overdue.length === 1 ? "" : "s"} overdue`,
      body: joinTitles(overdue),
      icon: "alarm-outline",
      color: "#B45309",
      createdAt: `${todayKey}T09:10:00.000Z`,
      actionLabel: "Review reminders",
      action: "open-reminders",
    });
  }

  const upcoming = reminders
    .filter((reminder) => reminder.date > todayKey)
    .sort((left, right) => left.date.localeCompare(right.date))
    .filter((reminder) => getDayDifference(reminder.date, todayKey) <= 3);

  if (upcoming.length > 0) {
    const nearestDate = upcoming[0].date;
    const soonItems = upcoming.filter((reminder) => reminder.date === nearestDate);
    const diffDays = getDayDifference(nearestDate, todayKey);
    const dateLabel = diffDays === 1 ? "tomorrow" : `in ${diffDays} days`;

    notifications.push({
      id: `reminders-upcoming-${nearestDate}`,
      title: `Upcoming reminder ${dateLabel}`,
      body: joinTitles(soonItems),
      icon: "calendar-outline",
      color: "#3B82F6",
      createdAt: `${nearestDate}T09:20:00.000Z`,
      actionLabel: "Open reminders",
      action: "open-reminders",
    });
  }

  return notifications.slice(0, 5);
}

export function applyReadState(notifications: Omit<AppNotification, "read">[], readIds: string[]) {
  const readSet = new Set(readIds);
  return notifications.map((notification) => ({
    ...notification,
    read: readSet.has(notification.id),
  }));
}
