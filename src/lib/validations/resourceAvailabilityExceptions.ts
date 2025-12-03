import { z } from 'zod';

// Exception type enum with validation
export const exceptionTypeSchema = z.enum(['holiday', 'vacation', 'custom', 'non-working'], {
  message: 'Exception type must be one of: holiday, vacation, custom, non-working',
});

// Date validation
export const exceptionDateSchema = z.string({
  required_error: 'Exception date is required',
  invalid_type_error: 'Exception date must be a string',
}).refine(
  (date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && date.match(/^\d{4}-\d{2}-\d{2}$/);
  },
  {
    message: 'Exception date must be a valid date in YYYY-MM-DD format',
  }
);

// Time validation (HH:MM format, optional)
export const timeSchema = z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
  message: 'Time must be in HH:MM format (24-hour)',
}).optional();

// Hours available validation - positive number with proper precision
export const hoursAvailableSchema = z.number({
  required_error: 'Hours available is required',
  invalid_type_error: 'Hours available must be a number',
}).min(0, {
  message: 'Hours available cannot be negative',
}).max(24, {
  message: 'Hours available cannot exceed 24 hours',
}).refine(
  (value) => {
    // Ensure proper decimal precision (2 decimal places allowed to match database precision 4, scale 2)
    return Number.isFinite(value) && Number(value.toFixed(2)) === value;
  },
  {
    message: 'Hours available can have at most 2 decimal places',
  }
);

// Hourly rate validation for exceptions
export const exceptionHourlyRateSchema = z.number({
  required_error: 'Hourly rate is required',
  invalid_type_error: 'Hourly rate must be a number',
}).positive({
  message: 'Hourly rate must be a positive number',
}).max(999999.99, {
  message: 'Hourly rate cannot exceed 999,999.99',
}).refine(
  (value) => {
    // Ensure proper decimal precision (2 decimal places)
    return Number.isFinite(value) && Number(value.toFixed(2)) === value;
  },
  {
    message: 'Hourly rate can have at most 2 decimal places',
  }
);

// Currency code validation
export const currencySchema = z.string().length(3, {
  message: 'Currency must be a 3-letter ISO 4217 code (e.g., USD, EUR, GBP)',
}).regex(/^[A-Z]{3}$/, {
  message: 'Currency must be uppercase 3-letter code (e.g., USD, EUR, GBP)',
});

// Notes validation (optional)
export const notesSchema = z.string().max(1000, {
  message: 'Notes cannot exceed 1000 characters',
}).trim().optional();

// Create exception input schema
export const createExceptionSchema = z.object({
  resourceId: z.number({
    required_error: 'Resource ID is required',
    invalid_type_error: 'Resource ID must be a number',
  }).positive({
    message: 'Resource ID must be a positive number',
  }),
  exceptionDate: exceptionDateSchema,
  startTimeUtc: timeSchema,
  endTimeUtc: timeSchema,
  hoursAvailable: hoursAvailableSchema,
  hourlyRate: exceptionHourlyRateSchema,
  currency: currencySchema.default('USD'),
  isActive: z.boolean().default(true),
  exceptionType: exceptionTypeSchema,
  notes: notesSchema,
}).refine(
  (data) => {
    // If hoursAvailable is 0, exceptionType should be 'non-working'
    if (data.hoursAvailable === 0 && data.exceptionType !== 'non-working') {
      return false;
    }
    return true;
  },
  {
    message: 'Exception type must be "non-working" when hours available is 0',
    path: ['exceptionType'],
  }
).refine(
  (data) => {
    // If both times are provided, validate they form a proper range
    if (data.startTimeUtc && data.endTimeUtc) {
      const start = new Date(`2000-01-01T${data.startTimeUtc}`);
      const end = new Date(`2000-01-01T${data.endTimeUtc}`);
      return end > start;
    }
    return true;
  },
  {
    message: 'End time must be after start time',
    path: ['endTimeUtc'],
  }
);

// Update exception input schema - all fields optional except id
export const updateExceptionSchema = z.object({
  id: z.string({
    required_error: 'Exception ID is required',
    invalid_type_error: 'Exception ID must be a string',
  }).uuid({
    message: 'Exception ID must be a valid UUID',
  }),
  exceptionDate: exceptionDateSchema.optional(),
  startTimeUtc: timeSchema.optional(),
  endTimeUtc: timeSchema.optional(),
  hoursAvailable: hoursAvailableSchema.optional(),
  hourlyRate: exceptionHourlyRateSchema.optional(),
  currency: currencySchema.optional(),
  isActive: z.boolean().optional(),
  exceptionType: exceptionTypeSchema.optional(),
  notes: notesSchema.optional(),
}).refine(
  (data) => {
    // At least one field must be provided for update
    const hasUpdateField = Object.keys(data).some(key => key !== 'id' && data[key as keyof typeof data] !== undefined);
    return hasUpdateField;
  },
  {
    message: 'At least one field must be provided for update',
  }
).refine(
  (data) => {
    // If hoursAvailable is set to 0 and exceptionType is provided, it should be 'non-working'
    if (data.hoursAvailable === 0 && data.exceptionType && data.exceptionType !== 'non-working') {
      return false;
    }
    return true;
  },
  {
    message: 'Exception type must be "non-working" when hours available is 0',
    path: ['exceptionType'],
  }
);

// Delete exception input schema
export const deleteExceptionSchema = z.object({
  id: z.string({
    required_error: 'Exception ID is required',
    invalid_type_error: 'Exception ID must be a string',
  }).uuid({
    message: 'Exception ID must be a valid UUID',
  }),
});

// Get exceptions by resource ID schema
export const getExceptionsByResourceIdSchema = z.object({
  resourceId: z.number({
    required_error: 'Resource ID is required',
    invalid_type_error: 'Resource ID must be a number',
  }).positive({
    message: 'Resource ID must be a positive number',
  }),
  startDate: exceptionDateSchema.optional(),
  endDate: exceptionDateSchema.optional(),
}).refine(
  (data) => {
    // If both dates are provided, validate date range
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  }
);

// Export types for use in the application
export type CreateExceptionInput = z.infer<typeof createExceptionSchema>;
export type UpdateExceptionInput = z.infer<typeof updateExceptionSchema>;
export type DeleteExceptionInput = z.infer<typeof deleteExceptionSchema>;
export type GetExceptionsByResourceIdInput = z.infer<typeof getExceptionsByResourceIdSchema>;

// Resource availability exception type (for UI components)
export interface ResourceAvailabilityException {
  id: string;
  resourceId: number;
  exceptionDate: string;
  startTimeUtc?: string;
  endTimeUtc?: string;
  hoursAvailable: string;
  hourlyRate: string;
  currency: string;
  isActive: boolean;
  exceptionType: string;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Error types for better error handling
export interface ExceptionValidationError extends Error {
  code: 'VALIDATION_ERROR';
  field?: string;
  value?: unknown;
}

export interface ExceptionNotFoundError extends Error {
  code: 'EXCEPTION_NOT_FOUND';
  exceptionId: string;
}

export interface ExceptionConflictError extends Error {
  code: 'EXCEPTION_CONFLICT';
  resourceId: number;
  exceptionDate: string;
}

// Type guard functions for exception error handling
export function isExceptionValidationError(error: unknown): error is ExceptionValidationError {
  return error instanceof Error && 'code' in error && (error as ExceptionValidationError).code === 'VALIDATION_ERROR';
}

export function isExceptionNotFoundError(error: unknown): error is ExceptionNotFoundError {
  return error instanceof Error && 'code' in error && (error as ExceptionNotFoundError).code === 'EXCEPTION_NOT_FOUND';
}

export function isExceptionConflictError(error: unknown): error is ExceptionConflictError {
  return error instanceof Error && 'code' in error && (error as ExceptionConflictError).code === 'EXCEPTION_CONFLICT';
}