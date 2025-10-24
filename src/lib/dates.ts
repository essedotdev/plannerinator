/**
 * Centralized date and time utilities using date-fns
 *
 * This module provides consistent date formatting across the application
 * and eliminates code duplication.
 */

import { formatDistanceToNow, format, differenceInCalendarDays } from "date-fns";

/**
 * Converts various date types to Date object
 */
const toDate = (date: Date | string): Date => {
  return date instanceof Date ? date : new Date(date);
};

/**
 * Format date as short date (e.g., "Jan 15")
 */
export const formatShortDate = (date: Date | string): string => {
  return format(toDate(date), "MMM d");
};

/**
 * Format date as full date (e.g., "Jan 15, 2025")
 */
export const formatFullDate = (date: Date | string): string => {
  return format(toDate(date), "MMM d, yyyy");
};

/**
 * Format date with time (e.g., "Jan 15, 02:30 PM")
 */
export const formatDateTime = (date: Date | string): string => {
  return format(toDate(date), "MMM d, h:mm a");
};

/**
 * Format time only (e.g., "02:30 PM")
 */
export const formatTime = (date: Date | string): string => {
  return format(toDate(date), "h:mm a");
};

/**
 * Format as relative time (e.g., "2 hours ago")
 */
export const formatRelative = (date: Date | string): string => {
  return formatDistanceToNow(toDate(date), { addSuffix: true });
};

/**
 * Calculate days between a date and today
 * Positive = future, Negative = past
 */
export const getDaysUntil = (date: Date | string): number => {
  return differenceInCalendarDays(toDate(date), new Date());
};

/**
 * Calculate days since a date (always positive)
 */
export const getDaysSince = (date: Date | string): number => {
  return Math.abs(differenceInCalendarDays(new Date(), toDate(date)));
};

/**
 * Check if a date is in the past
 */
export const isPast = (date: Date | string): boolean => {
  return toDate(date) < new Date();
};

/**
 * Check if a date is overdue (past and not completed)
 */
export const isOverdue = (date: Date | string, isCompleted: boolean): boolean => {
  return !isCompleted && isPast(date);
};

/**
 * Check if two dates are equal (ignoring time)
 */
export const areDatesEqual = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = toDate(date1);
  const d2 = toDate(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * Format due date with context (e.g., "3 days left", "2 days overdue")
 */
export const formatDueDate = (dueDate: Date | string): string => {
  const days = getDaysUntil(dueDate);

  if (days < 0) {
    return `${Math.abs(days)} days overdue`;
  } else if (days === 0) {
    return "Due today";
  } else {
    return `${days} days left`;
  }
};

/**
 * Get color class for due date based on urgency
 */
export const getDueDateColorClass = (dueDate: Date | string): string => {
  const days = getDaysUntil(dueDate);

  if (days < 0) {
    return "bg-red-500/10 text-red-700 dark:text-red-300";
  } else if (days < 7) {
    return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300";
  }
  return "";
};

/**
 * Format date for HTML date input (YYYY-MM-DD)
 */
export const formatForDateInput = (date: Date | string): string => {
  return format(toDate(date), "yyyy-MM-dd");
};

/**
 * Format datetime for HTML datetime-local input (YYYY-MM-DDTHH:mm)
 */
export const formatForDateTimeInput = (date: Date | string): string => {
  return format(toDate(date), "yyyy-MM-dd'T'HH:mm");
};
