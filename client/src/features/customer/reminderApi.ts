import { apiRequest } from '@/services/api';

export type ReminderItem = { id: string; name: string; quantity: number };
export type PickupReminder = { id: string | null; items: ReminderItem[] };

export function getPickupReminder(token: string) {
  return apiRequest<{ reminder: PickupReminder }>('/api/reminders/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function savePickupReminder(token: string, items: Array<Pick<ReminderItem, 'name' | 'quantity'> | ReminderItem>) {
  return apiRequest<{ reminder: PickupReminder }>('/api/reminders/me', {
    body: JSON.stringify({ items }),
    headers: { Authorization: `Bearer ${token}` },
    method: 'PUT',
  });
}

export function deletePickupReminder(token: string) {
  return apiRequest<{ message: string }>('/api/reminders/me', {
    headers: { Authorization: `Bearer ${token}` },
    method: 'DELETE',
  });
}