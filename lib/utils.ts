import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getDateRange(range: 'daily' | 'weekly' | 'mtd' | 'ytd' | 'custom', customStart?: Date, customEnd?: Date): { start: Date; end: Date } {
  const now = new Date();
  let start: Date;
  let end: Date = getEndOfDay(now);

  switch (range) {
    case 'daily':
      start = getStartOfDay(now);
      break;
    case 'weekly':
      start = new Date(now);
      start.setDate(now.getDate() - 6); // 7 days including today (today + 6 days ago)
      start = getStartOfDay(start);
      break;
    case 'mtd':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'ytd':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case 'custom':
      start = customStart ? getStartOfDay(customStart) : getStartOfDay(now);
      end = customEnd ? getEndOfDay(customEnd) : getEndOfDay(now);
      break;
    default:
      start = getStartOfDay(now);
  }

  return { start, end };
}

