import type { ResourceWorkScheduleResponse } from "~/lib/types/resourcePattern";
import type { ResourceAvailabilityException } from "~/lib/validations/resourceAvailabilityExceptions";

export interface AvailabilityCalculationResult {
  date: string;
  hoursAvailable: number;
  hourlyRate: number;
  currency: string;
  isWorkingDay: boolean;
  source: 'weekly_pattern' | 'exception';
  dayOfWeek: number;
  notes?: string;
}

/**
 * ResourceAvailabilityCalculator
 *
 * Calculates resource availability for a specific date by considering:
 * 1. Active exceptions for the date (highest priority)
 * 2. Weekly availability patterns (fallback)
 *
 * Priority Logic:
 * - If an active exception exists for that date, it overrides all weekly patterns
 * - If the exception has 0 hours, the day is considered non-working
 * - If no exception exists, fall back to weekly day pattern for that date
 * - Inactive exceptions are ignored completely
 */
export class ResourceAvailabilityCalculator {
  private workSchedules: ResourceWorkScheduleResponse[];
  private exceptions: ResourceAvailabilityException[];

  constructor(
    workSchedules: ResourceWorkScheduleResponse[] = [],
    exceptions: ResourceAvailabilityException[] = []
  ) {
    this.workSchedules = workSchedules;
    this.exceptions = exceptions;
  }

  /**
   * Calculate availability for a specific date
   */
  public calculateAvailability(date: string): AvailabilityCalculationResult {
    // Validate date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date format: ${date}`);
    }

    // Normalize date to YYYY-MM-DD format
    const dateParts = parsedDate.toISOString().split('T');
    const normalizedDate = dateParts[0] || '';

    // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = parsedDate.getDay();

    // Convert to Monday-based index (0 = Monday, 6 = Sunday)
    const mondayBasedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    // Step 1: Check for active exception (highest priority)
    const activeException = this.findActiveException(normalizedDate);

    if (activeException) {
      const hoursAvailable = typeof activeException.hoursAvailable === 'string'
        ? parseFloat(activeException.hoursAvailable)
        : (activeException.hoursAvailable || 0);
      const hourlyRate = typeof activeException.hourlyRate === 'string'
        ? parseFloat(activeException.hourlyRate)
        : (activeException.hourlyRate || 0);

      return {
        date: normalizedDate,
        hoursAvailable: hoursAvailable,
        hourlyRate: hourlyRate,
        currency: activeException.currency || 'USD',
        isWorkingDay: hoursAvailable > 0,
        source: 'exception',
        dayOfWeek: mondayBasedDayOfWeek,
        notes: activeException.notes || undefined,
      };
    }

    // Step 2: Fall back to weekly pattern
    const weeklyPattern = this.findWeeklyPattern(mondayBasedDayOfWeek);

    if (weeklyPattern) {
      const totalWorkHours = typeof weeklyPattern.totalWorkHours === 'string'
        ? parseFloat(weeklyPattern.totalWorkHours)
        : (weeklyPattern.totalWorkHours || 0);

      return {
        date: normalizedDate,
        hoursAvailable: totalWorkHours,
        hourlyRate: weeklyPattern.hourlyRate || 0,
        currency: weeklyPattern.currency || 'USD',
        isWorkingDay: weeklyPattern.isActive && totalWorkHours > 0,
        source: 'weekly_pattern',
        dayOfWeek: mondayBasedDayOfWeek,
      };
    }

    // Step 3: Default to non-working day
    return {
      date: normalizedDate,
      hoursAvailable: 0,
      hourlyRate: 0,
      currency: 'USD',
      isWorkingDay: false,
      source: 'weekly_pattern',
      dayOfWeek: mondayBasedDayOfWeek,
      notes: 'No availability pattern found',
    };
  }

  /**
   * Calculate availability for a range of dates
   */
  public calculateAvailabilityRange(startDate: string, endDate: string): AvailabilityCalculationResult[] {
    const results: AvailabilityCalculationResult[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
      const dateParts = current.toISOString().split('T');
      const dateString = dateParts[0] || '';
      results.push(this.calculateAvailability(dateString));
    }

    return results;
  }

  /**
   * Get total available hours in a date range
   */
  public getTotalAvailableHours(startDate: string, endDate: string): number {
    const results = this.calculateAvailabilityRange(startDate, endDate);
    return results.reduce((total, result) => total + result.hoursAvailable, 0);
  }

  /**
   * Find active exception for a specific date
   */
  private findActiveException(date: string): ResourceAvailabilityException | undefined {
    return this.exceptions.find(exception => {
      return exception.exceptionDate === date && exception.isActive;
    });
  }

  /**
   * Find weekly pattern for a specific day of week
   */
  private findWeeklyPattern(dayOfWeek: number): ResourceWorkScheduleResponse | undefined {
    return this.workSchedules.find(schedule => {
      return schedule.dayOfWeek === dayOfWeek && schedule.isActive;
    });
  }

  /**
   * Check if a date is affected by an exception
   */
  public hasException(date: string): boolean {
    return this.findActiveException(date) !== undefined;
  }

  /**
   * Get all exceptions within a date range
   */
  public getExceptionsInRange(startDate: string, endDate: string): ResourceAvailabilityException[] {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return this.exceptions.filter(exception => {
      const exceptionDate = new Date(exception.exceptionDate);
      return exceptionDate >= start && exceptionDate <= end && exception.isActive;
    });
  }

  /**
   * Update work schedules (useful for dynamic updates)
   */
  public updateWorkSchedules(workSchedules: ResourceWorkScheduleResponse[]): void {
    this.workSchedules = workSchedules;
  }

  /**
   * Update exceptions (useful for dynamic updates)
   */
  public updateExceptions(exceptions: ResourceAvailabilityException[]): void {
    this.exceptions = exceptions;
  }

  /**
   * Add a new exception
   */
  public addException(exception: ResourceAvailabilityException): void {
    this.exceptions.push(exception);
  }

  /**
   * Remove an exception
   */
  public removeException(exceptionId: string): boolean {
    const index = this.exceptions.findIndex(e => e.id === exceptionId);
    if (index !== -1) {
      this.exceptions.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Update an existing exception
   */
  public updateException(exceptionId: string, updates: Partial<ResourceAvailabilityException>): boolean {
    const index = this.exceptions.findIndex(e => e.id === exceptionId);
    if (index !== -1) {
      const current = this.exceptions[index];
      if (!current) return false;

      this.exceptions[index] = {
        id: current.id,
        resourceId: current.resourceId,
        exceptionDate: current.exceptionDate,
        startTimeUtc: updates.startTimeUtc ?? current.startTimeUtc,
        endTimeUtc: updates.endTimeUtc ?? current.endTimeUtc,
        hoursAvailable: updates.hoursAvailable ?? current.hoursAvailable,
        hourlyRate: updates.hourlyRate ?? current.hourlyRate,
        currency: updates.currency ?? current.currency,
        isActive: updates.isActive ?? current.isActive,
        exceptionType: updates.exceptionType ?? current.exceptionType,
        notes: updates.notes ?? current.notes,
        createdAt: current.createdAt,
        updatedAt: updates.updatedAt ?? new Date(),
      };
      return true;
    }
    return false;
  }

  /**
   * Get calculation summary for a date range
   */
  public getCalculationSummary(startDate: string, endDate: string): {
    totalDays: number;
    workingDays: number;
    totalHours: number;
    exceptionsCount: number;
    averageHoursPerWorkingDay: number;
  } {
    const results = this.calculateAvailabilityRange(startDate, endDate);
    const workingDays = results.filter(r => r.isWorkingDay);
    const totalHours = workingDays.reduce((sum, r) => sum + r.hoursAvailable, 0);
    const exceptionsCount = this.getExceptionsInRange(startDate, endDate).length;

    return {
      totalDays: results.length,
      workingDays: workingDays.length,
      totalHours,
      exceptionsCount,
      averageHoursPerWorkingDay: workingDays.length > 0 ? totalHours / workingDays.length : 0,
    };
  }
}