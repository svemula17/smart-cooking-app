import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import type { MealPlan } from '../types';

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
