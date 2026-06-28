import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import type { MealPlan } from '../types';
import type { CookScheduleEntry } from './houseService';

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export interface ScheduledReminder {
  type: 'marination' | 'soaking';
  notificationId: string;
  scheduledFor: string;
}

export async function scheduleMealReminders(plan: MealPlan): Promise<ScheduledReminder[]> {
  const granted = await requestNotificationPermissions();
  if (!granted) return [];

  const prep = plan.recipe.prep_instructions;
  if (!prep) return [];

  const [h, m] = (plan.cooking_time ?? '18:00').split(':').map(Number);
  const cookDateTime = new Date(plan.scheduled_date);
  cookDateTime.setHours(h!, m!, 0, 0);

  const reminders: ScheduledReminder[] = [];

  if (prep.marination?.required) {
    const { duration_minutes, instruction, reminder_before_minutes } = prep.marination;
    const fireAt = new Date(cookDateTime.getTime() - (duration_minutes + reminder_before_minutes) * 60_000);
    if (fireAt > new Date()) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Time to Marinate!',
          body: `${instruction} for ${plan.recipe.name}`,
          data: { mealPlanId: plan.id, type: 'marination' },
          sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
      });
      reminders.push({ type: 'marination', notificationId: id, scheduledFor: fireAt.toISOString() });
    }
  }

  if (prep.soaking?.required) {
    const { duration_minutes, instruction, reminder_before_minutes } = prep.soaking;
    const fireAt = new Date(cookDateTime.getTime() - (duration_minutes + reminder_before_minutes) * 60_000);
    if (fireAt > new Date()) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💧 Time to Soak Ingredients!',
          body: `${instruction} for ${plan.recipe.name}`,
          data: { mealPlanId: plan.id, type: 'soaking' },
          sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
      });
      reminders.push({ type: 'soaking', notificationId: id, scheduledFor: fireAt.toISOString() });
    }
  }

  return reminders;
}

export async function cancelMealReminders(notificationIds: string[]): Promise<void> {
  await Promise.all(notificationIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

// ─── House cook reminders ────────────────────────────────────────────────────
// The cook schedule is date-only, so we assume dinner at 7pm for prep timing and
// fire the "you're cooking today" nudge at 8am. All cook notifications use a
// `cook-*` identifier so we can cancel/replace them idempotently on every
// reschedule (no AsyncStorage bookkeeping, no duplicates).
const COOK_NUDGE_HOUR = 8;
const DINNER_HOUR = 19;
const COOK_ID_PREFIX = 'cook-';

function atHour(dateStr: string, hour: number): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y!, (m ?? 1) - 1, d!, hour, 0, 0, 0); // local time
}

/** Remove every previously-scheduled cook notification. */
export async function cancelCookReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync().catch(() => []);
  const ids = scheduled
    .map((n) => n.identifier)
    .filter((id): id is string => !!id && id.startsWith(COOK_ID_PREFIX));
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})));
}

/**
 * Schedule a morning-of cook nudge + marination/soaking prep reminders for the
 * entries where the current user is the assigned cook. Clears any prior cook
 * reminders first, so calling this whenever the schedule loads is safe.
 */
export async function scheduleCookReminders(
  entries: CookScheduleEntry[],
  myUserId: string | undefined,
  enabled: boolean,
): Promise<void> {
  await cancelCookReminders();
  if (!enabled || !myUserId) return;
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  const now = new Date();

  for (const e of entries) {
    if (e.user_id !== myUserId || e.status !== 'pending') continue;

    // 1) Morning-of nudge at 8am.
    const nudgeAt = atHour(e.scheduled_date, COOK_NUDGE_HOUR);
    if (nudgeAt > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: `${COOK_ID_PREFIX}${e.id}`,
        content: {
          title: "👨‍🍳 You're cooking today",
          body: e.recipe_name ? `Tonight: ${e.recipe_name}` : 'It’s your turn to cook tonight.',
          data: { type: 'cook-turn', scheduleId: e.id },
          sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: nudgeAt },
      });
    }

    // 2) Prep reminders, timed off a 7pm dinner (only if the recipe needs prep).
    const prep = e.prep_instructions;
    if (!prep) continue;
    const dinner = atHour(e.scheduled_date, DINNER_HOUR);

    for (const kind of ['marination', 'soaking'] as const) {
      const step = prep[kind];
      if (!step?.required) continue;
      const fireAt = new Date(
        dinner.getTime() - (step.duration_minutes + step.reminder_before_minutes) * 60_000,
      );
      if (fireAt <= now) continue;
      await Notifications.scheduleNotificationAsync({
        identifier: `${COOK_ID_PREFIX}${kind}-${e.id}`,
        content: {
          title: kind === 'marination' ? '⏰ Time to marinate' : '💧 Time to soak',
          body: e.recipe_name ? `${step.instruction} for ${e.recipe_name}` : step.instruction,
          data: { type: `cook-${kind}`, scheduleId: e.id },
          sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
      });
    }
  }
}
