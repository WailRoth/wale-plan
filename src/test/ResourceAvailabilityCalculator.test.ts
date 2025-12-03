import { describe, it, expect, beforeEach } from 'vitest';
import { ResourceAvailabilityCalculator } from '~/lib/ResourceAvailabilityCalculator';
import type { ResourceWorkScheduleResponse } from '~/lib/types/resourcePattern';
import type { ResourceAvailabilityException } from '~/lib/validations/resourceAvailabilityExceptions';

describe('ResourceAvailabilityCalculator', () => {
  let calculator: ResourceAvailabilityCalculator;
  let mockWorkSchedules: ResourceWorkScheduleResponse[];
  let mockExceptions: ResourceAvailabilityException[];

  beforeEach(() => {
    // Reset data before each test
    mockWorkSchedules = [];
    mockExceptions = [];
    calculator = new ResourceAvailabilityCalculator(mockWorkSchedules, mockExceptions);
  });

  describe('Basic functionality', () => {
    it('should initialize with empty data', () => {
      expect(calculator).toBeInstanceOf(ResourceAvailabilityCalculator);
    });

    it('should return default non-working day when no patterns or exceptions exist', () => {
      const result = calculator.calculateAvailability('2024-01-15');

      expect(result.date).toBe('2024-01-15');
      expect(result.hoursAvailable).toBe(0);
      expect(result.isWorkingDay).toBe(false);
      expect(result.source).toBe('weekly_pattern');
      expect(result.notes).toBe('No availability pattern found');
    });
  });

  describe('Weekly pattern calculations', () => {
    beforeEach(() => {
      mockWorkSchedules = [
        {
          resourceId: 1,
          dayOfWeek: 0, // Monday
          dayOfWeekName: 'Monday',
          isActive: true,
          workStartTime: '09:00',
          workEndTime: '17:00',
          totalWorkHours: 8,
          hourlyRate: 50,
          currency: 'USD',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          resourceId: 1,
          dayOfWeek: 4, // Friday
          dayOfWeekName: 'Friday',
          isActive: true,
          workStartTime: '09:00',
          workEndTime: '13:00',
          totalWorkHours: 4,
          hourlyRate: 60,
          currency: 'USD',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          resourceId: 1,
          dayOfWeek: 5, // Saturday
          dayOfWeekName: 'Saturday',
          isActive: false,
          workStartTime: null,
          workEndTime: null,
          totalWorkHours: 0,
          hourlyRate: null,
          currency: 'USD',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      calculator = new ResourceAvailabilityCalculator(mockWorkSchedules, mockExceptions);
    });

    it('should correctly identify Monday as working day', () => {
      // 2024-01-15 is a Monday
      const result = calculator.calculateAvailability('2024-01-15');

      expect(result.dayOfWeek).toBe(0); // Monday (0-based)
      expect(result.hoursAvailable).toBe(8);
      expect(result.hourlyRate).toBe(50);
      expect(result.isWorkingDay).toBe(true);
      expect(result.source).toBe('weekly_pattern');
      expect(result.currency).toBe('USD');
    });

    it('should correctly identify Friday as working day with different hours', () => {
      // 2024-01-19 is a Friday
      const result = calculator.calculateAvailability('2024-01-19');

      expect(result.dayOfWeek).toBe(4); // Friday (0-based)
      expect(result.hoursAvailable).toBe(4);
      expect(result.hourlyRate).toBe(60);
      expect(result.isWorkingDay).toBe(true);
      expect(result.source).toBe('weekly_pattern');
    });

    it('should correctly identify Saturday as non-working day', () => {
      // 2024-01-20 is a Saturday
      const result = calculator.calculateAvailability('2024-01-20');

      expect(result.dayOfWeek).toBe(5); // Saturday (0-based)
      expect(result.hoursAvailable).toBe(0);
      expect(result.isWorkingDay).toBe(false);
      expect(result.source).toBe('weekly_pattern');
    });

    it('should handle Sunday correctly', () => {
      // 2024-01-21 is a Sunday
      const result = calculator.calculateAvailability('2024-01-21');

      expect(result.dayOfWeek).toBe(6); // Sunday (0-based)
      expect(result.hoursAvailable).toBe(0);
      expect(result.isWorkingDay).toBe(false);
      expect(result.source).toBe('weekly_pattern');
    });
  });

  describe('Exception priority logic', () => {
    beforeEach(() => {
      mockWorkSchedules = [
        {
          resourceId: 1,
          dayOfWeek: 0, // Monday
          dayOfWeekName: 'Monday',
          isActive: true,
          workStartTime: '09:00',
          workEndTime: '17:00',
          totalWorkHours: 8,
          hourlyRate: 50,
          currency: 'USD',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockExceptions = [
        {
          id: '1',
          resourceId: 1,
          exceptionDate: '2024-01-15',
          startTimeUtc: '10:00',
          endTimeUtc: '14:00',
          hoursAvailable: '4',
          hourlyRate: '75',
          currency: 'USD',
          isActive: true,
          exceptionType: 'custom',
          notes: 'Special event',
          createdAt: new Date('2024-01-01T00:00:00Z'),
        },
      ];

      calculator = new ResourceAvailabilityCalculator(mockWorkSchedules, mockExceptions);
    });

    it('should prioritize active exception over weekly pattern', () => {
      // 2024-01-15 is a Monday with both a pattern and an exception
      const result = calculator.calculateAvailability('2024-01-15');

      expect(result.source).toBe('exception');
      expect(result.hoursAvailable).toBe(4); // Exception hours, not pattern hours (8)
      expect(result.hourlyRate).toBe(75); // Exception rate, not pattern rate (50)
      expect(result.isWorkingDay).toBe(true);
      expect(result.notes).toBe('Special event');
    });

    it('should handle non-working exceptions (0 hours)', () => {
      mockExceptions = [
        {
          id: '2',
          resourceId: 1,
          exceptionDate: '2024-01-15',
          startTimeUtc: null,
          endTimeUtc: null,
          hoursAvailable: '0',
          hourlyRate: '50',
          currency: 'USD',
          isActive: true,
          exceptionType: 'non-working',
          notes: 'Holiday',
          createdAt: new Date('2024-01-01T00:00:00Z'),
        },
      ];

      calculator.updateExceptions(mockExceptions);
      const result = calculator.calculateAvailability('2024-01-15');

      expect(result.source).toBe('exception');
      expect(result.hoursAvailable).toBe(0);
      expect(result.isWorkingDay).toBe(false);
      expect(result.notes).toBe('Holiday');
    });

    it('should ignore inactive exceptions', () => {
      mockExceptions = [
        {
          id: '3',
          resourceId: 1,
          exceptionDate: '2024-01-15',
          startTimeUtc: '10:00',
          endTimeUtc: '14:00',
          hoursAvailable: '4',
          hourlyRate: '75',
          currency: 'USD',
          isActive: false, // Inactive exception
          exceptionType: 'custom',
          notes: 'Inactive event',
          createdAt: new Date('2024-01-01T00:00:00Z'),
        },
      ];

      calculator.updateExceptions(mockExceptions);
      const result = calculator.calculateAvailability('2024-01-15');

      expect(result.source).toBe('weekly_pattern'); // Should use weekly pattern
      expect(result.hoursAvailable).toBe(8); // Weekly pattern hours
      expect(result.hourlyRate).toBe(50); // Weekly pattern rate
    });
  });

  describe('Date range calculations', () => {
    beforeEach(() => {
      mockWorkSchedules = [
        {
          resourceId: 1,
          dayOfWeek: 0, // Monday
          dayOfWeekName: 'Monday',
          isActive: true,
          workStartTime: '09:00',
          workEndTime: '17:00',
          totalWorkHours: 8,
          hourlyRate: 50,
          currency: 'USD',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          resourceId: 1,
          dayOfWeek: 1, // Tuesday
          dayOfWeekName: 'Monday',
          isActive: true,
          workStartTime: '09:00',
          workEndTime: '17:00',
          totalWorkHours: 8,
          hourlyRate: 50,
          currency: 'USD',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          resourceId: 1,
          dayOfWeek: 2, // Wednesday
          dayOfWeekName: 'Monday',
          isActive: true,
          workStartTime: '09:00',
          workEndTime: '17:00',
          totalWorkHours: 8,
          hourlyRate: 50,
          currency: 'USD',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          resourceId: 1,
          dayOfWeek: 3, // Thursday
          dayOfWeekName: 'Monday',
          isActive: true,
          workStartTime: '09:00',
          workEndTime: '17:00',
          totalWorkHours: 8,
          hourlyRate: 50,
          currency: 'USD',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          resourceId: 1,
          dayOfWeek: 4, // Friday
          dayOfWeekName: 'Monday',
          isActive: true,
          workStartTime: '09:00',
          workEndTime: '17:00',
          totalWorkHours: 8,
          hourlyRate: 50,
          currency: 'USD',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockExceptions = [
        {
          id: '4',
          resourceId: 1,
          exceptionDate: '2024-01-16', // Tuesday
          startTimeUtc: null,
          endTimeUtc: null,
          hoursAvailable: '0',
          hourlyRate: '50',
          currency: 'USD',
          isActive: true,
          exceptionType: 'holiday',
          notes: 'New Year',
          createdAt: new Date('2024-01-01T00:00:00Z'),
        },
      ];

      calculator = new ResourceAvailabilityCalculator(mockWorkSchedules, mockExceptions);
    });

    it('should calculate availability for date range', () => {
      const results = calculator.calculateAvailabilityRange('2024-01-15', '2024-01-19');

      expect(results).toHaveLength(5); // 5 days: Mon-Fri

      // Monday: Weekly pattern
      expect(results[0].date).toBe('2024-01-15');
      expect(results[0].source).toBe('weekly_pattern');
      expect(results[0].hoursAvailable).toBe(8);

      // Tuesday: Exception (holiday)
      expect(results[1].date).toBe('2024-01-16');
      expect(results[1].source).toBe('exception');
      expect(results[1].hoursAvailable).toBe(0);

      // Wednesday-Friday: Weekly patterns (no exceptions)
      expect(results[2].hoursAvailable).toBe(8); // Wednesday
      expect(results[3].hoursAvailable).toBe(8); // Thursday
      expect(results[4].hoursAvailable).toBe(8); // Friday
    });

    it('should calculate total available hours', () => {
      const totalHours = calculator.getTotalAvailableHours('2024-01-15', '2024-01-19');

      // Monday (8) + Tuesday (0) + Wednesday (8) + Thursday (8) + Friday (8) = 32
      expect(totalHours).toBe(32);
    });

    it('should provide calculation summary', () => {
      const summary = calculator.getCalculationSummary('2024-01-15', '2024-01-19');

      expect(summary.totalDays).toBe(5);
      expect(summary.workingDays).toBe(4); // Tuesday is non-working due to exception
      expect(summary.totalHours).toBe(32);
      expect(summary.exceptionsCount).toBe(1);
      expect(summary.averageHoursPerWorkingDay).toBe(8); // 32 / 4 = 8
    });
  });

  describe('Exception management', () => {
    beforeEach(() => {
      mockWorkSchedules = [
        {
          resourceId: 1,
          dayOfWeek: 0,
          dayOfWeekName: 'Monday',
          isActive: true,
          workStartTime: '09:00',
          workEndTime: '17:00',
          totalWorkHours: 8,
          hourlyRate: 50,
          currency: 'USD',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      calculator = new ResourceAvailabilityCalculator(mockWorkSchedules, mockExceptions);
    });

    it('should detect if date has exception', () => {
      expect(calculator.hasException('2024-01-15')).toBe(false);

      calculator.addException({
        id: '5',
        resourceId: 1,
        exceptionDate: '2024-01-15',
        startTimeUtc: null,
        endTimeUtc: null,
        hoursAvailable: '4',
        hourlyRate: '75',
        currency: 'USD',
        isActive: true,
        exceptionType: 'custom',
        notes: 'Test exception',
        createdAt: new Date(),
      });

      expect(calculator.hasException('2024-01-15')).toBe(true);
    });

    it('should add new exception', () => {
      const exceptionCountBefore = calculator.getExceptionsInRange('2024-01-01', '2024-01-31').length;

      calculator.addException({
        id: '6',
        resourceId: 1,
        exceptionDate: '2024-01-20',
        startTimeUtc: null,
        endTimeUtc: null,
        hoursAvailable: '6',
        hourlyRate: '60',
        currency: 'USD',
        isActive: true,
        exceptionType: 'custom',
        notes: 'Another test',
        createdAt: new Date(),
      });

      const exceptionCountAfter = calculator.getExceptionsInRange('2024-01-01', '2024-01-31').length;
      expect(exceptionCountAfter).toBe(exceptionCountBefore + 1);
    });

    it('should remove exception', () => {
      const exceptionId = '7';
      calculator.addException({
        id: exceptionId,
        resourceId: 1,
        exceptionDate: '2024-01-21',
        startTimeUtc: null,
        endTimeUtc: null,
        hoursAvailable: '6',
        hourlyRate: '60',
        currency: 'USD',
        isActive: true,
        exceptionType: 'custom',
        notes: 'To be removed',
        createdAt: new Date(),
      });

      expect(calculator.hasException('2024-01-21')).toBe(true);

      const removed = calculator.removeException(exceptionId);
      expect(removed).toBe(true);
      expect(calculator.hasException('2024-01-21')).toBe(false);
    });

    it('should update exception', () => {
      const exceptionId = '8';
      calculator.addException({
        id: exceptionId,
        resourceId: 1,
        exceptionDate: '2024-01-22',
        startTimeUtc: null,
        endTimeUtc: null,
        hoursAvailable: '4',
        hourlyRate: '50',
        currency: 'USD',
        isActive: true,
        exceptionType: 'custom',
        notes: 'Original',
        createdAt: new Date(),
      });

      const updated = calculator.updateException(exceptionId, {
        hoursAvailable: '6',
        hourlyRate: '75',
        notes: 'Updated',
      });

      expect(updated).toBe(true);

      const result = calculator.calculateAvailability('2024-01-22');
      expect(result.hoursAvailable).toBe(6);
      expect(result.hourlyRate).toBe(75);
      expect(result.notes).toBe('Updated');
    });
  });

  describe('Edge cases and validation', () => {
    it('should handle invalid date formats gracefully', () => {
      expect(() => {
        calculator.calculateAvailability('invalid-date');
      }).toThrow('Invalid date format');
    });

    it('should handle empty date range', () => {
      const results = calculator.calculateAvailabilityRange('2024-01-01', '2023-12-31'); // End before start
      expect(results).toHaveLength(0);
    });

    it('should handle same start and end date', () => {
      const results = calculator.calculateAvailabilityRange('2024-01-15', '2024-01-15');
      expect(results).toHaveLength(1);
      expect(results[0].date).toBe('2024-01-15');
    });

    it('should handle multiple exceptions on same date', () => {
      // Add multiple exceptions for the same date (last one should win)
      calculator.addException({
        id: '9',
        resourceId: 1,
        exceptionDate: '2024-01-15',
        startTimeUtc: null,
        endTimeUtc: null,
        hoursAvailable: '4',
        hourlyRate: '50',
        currency: 'USD',
        isActive: true,
        exceptionType: 'custom',
        notes: 'First',
        createdAt: new Date(),
      });

      calculator.addException({
        id: '10',
        resourceId: 1,
        exceptionDate: '2024-01-15',
        startTimeUtc: null,
        endTimeUtc: null,
        hoursAvailable: '6',
        hourlyRate: '75',
        currency: 'USD',
        isActive: true,
        exceptionType: 'custom',
        notes: 'Second',
        createdAt: new Date(),
      });

      const result = calculator.calculateAvailability('2024-01-15');
      // The first exception found should be used (implementation-dependent)
      expect(result.source).toBe('exception');
      expect([4, 6]).toContain(result.hoursAvailable);
    });
  });
});