export interface RotationMember {
  user_id: string;
  last_cooked?: string | null; // ISO date string
}

export interface RotationAssignment {
  user_id: string;
  scheduled_date: string; // YYYY-MM-DD
}

/**
 * Generate a fair round-robin cook rotation for the next `days` days.
 * Members who cooked least recently are assigned first.
 * Dates that already have a cook assigned in `existingDates` are skipped.
 */
export function generateRotation(
  members: RotationMember[],
  days: number,
  existingDates: Set<string>,
): RotationAssignment[] {
  if (members.length === 0) return [];

  // Sort by last_cooked ascending (null/undefined = never cooked = highest priority)
  const queue = [...members].sort((a, b) => {
    if (!a.last_cooked && !b.last_cooked) return 0;
    if (!a.last_cooked) return -1;
    if (!b.last_cooked) return 1;
    return a.last_cooked < b.last_cooked ? -1 : 1;
  });

  const assignments: RotationAssignment[] = [];
  let queueIdx = 0;

  for (let i = 0; i < days; i++) {
    const date = offsetDate(new Date(), i);
    if (existingDates.has(date)) continue;

    assignments.push({ user_id: queue[queueIdx % queue.length].user_id, scheduled_date: date });
    queueIdx++;
  }

  return assignments;
}

function offsetDate(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}
