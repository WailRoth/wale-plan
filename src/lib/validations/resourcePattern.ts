import { z } from "zod";

export const dailyAvailabilityPatternSchema = z.object({
  dayOfWeek: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
  isActive: z.boolean(),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM"),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM"),
  hourlyRate: z.number().min(0, "Hourly rate must be positive").optional(),
});

export const weeklyAvailabilityPatternSchema = z.object({
  resourceId: z.number().positive(),
  patterns: z.array(dailyAvailabilityPatternSchema).length(7, "Exactly 7 days must be provided"),
  currency: z.string().length(3, "Currency must be 3 characters").default("USD"),
});

export const updateDailyPatternSchema = weeklyAvailabilityPatternSchema;

export const getByResourceIdSchema = z.object({
  resourceId: z.number().positive(),
});

export const resetToDefaultsSchema = z.object({
  resourceId: z.number().positive(),
});

// Validation helper functions
export function validateTimeRange(startTime: string, endTime: string): boolean {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  if (startHour === undefined || startMin === undefined || endHour === undefined || endMin === undefined) {
    return false;
  }

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return endMinutes > startMinutes;
}

export function validateWorkingHours(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  if (startHour === undefined || startMin === undefined || endHour === undefined || endMin === undefined) {
    return 0;
  }

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return (endMinutes - startMinutes) / 60; // Return hours
}

export function validateAtLeastOneActiveDay(patterns: WeeklyAvailabilityPattern): boolean {
  return patterns.patterns.some(pattern => pattern.isActive);
}

export function getDefaultAvailabilityPatterns() {
  return [
    { dayOfWeek: "monday" as const, isActive: true, startTime: "09:00", endTime: "17:00", hourlyRate: undefined },
    { dayOfWeek: "tuesday" as const, isActive: true, startTime: "09:00", endTime: "17:00", hourlyRate: undefined },
    { dayOfWeek: "wednesday" as const, isActive: true, startTime: "09:00", endTime: "17:00", hourlyRate: undefined },
    { dayOfWeek: "thursday" as const, isActive: true, startTime: "09:00", endTime: "17:00", hourlyRate: undefined },
    { dayOfWeek: "friday" as const, isActive: true, startTime: "09:00", endTime: "17:00", hourlyRate: undefined },
    { dayOfWeek: "saturday" as const, isActive: false, startTime: "00:00", endTime: "00:00", hourlyRate: undefined },
    { dayOfWeek: "sunday" as const, isActive: false, startTime: "00:00", endTime: "00:00", hourlyRate: undefined },
  ];
}

export type DailyAvailabilityPattern = z.infer<typeof dailyAvailabilityPatternSchema>;
export type WeeklyAvailabilityPattern = z.infer<typeof weeklyAvailabilityPatternSchema>;
export type UpdateDailyPatternInput = z.infer<typeof updateDailyPatternSchema>;
export type GetByResourceIdInput = z.infer<typeof getByResourceIdSchema>;
export type ResetToDefaultsInput = z.infer<typeof resetToDefaultsSchema>;