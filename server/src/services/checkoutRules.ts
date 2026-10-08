export function quantity(value: unknown): number {
  if (!Number.isInteger(value) || Number(value) < 1 || Number(value) > 99) {
    throw Object.assign(new Error('Quantity must be an integer between 1 and 99'), { status: 400 });
  }
  return Number(value);
}
export function money(value: number) { return Math.round(value * 100) / 100; }
export function slotStart(date: Date, time: string) {
  return new Date(`${date.toISOString().slice(0, 10)}T${time}:00+05:30`);
}
