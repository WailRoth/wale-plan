import { z } from 'zod';

// Resource type enum with validation
export const resourceTypeSchema = z.enum(['human', 'material', 'equipment'], {
  message: 'Resource type must be one of: human, material, or equipment',
});

// Currency code validation
export const currencySchema = z.string().length(3, {
  message: 'Currency must be a 3-letter ISO 4217 code (e.g., USD, EUR, GBP)',
}).regex(/^[A-Z]{3}$/, {
  message: 'Currency must be uppercase 3-letter code (e.g., USD, EUR, GBP)',
});

// Base rate validation - positive number with proper precision
export const hourlyRateSchema = z.number({
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

// Daily work hours validation - positive number with proper precision
export const dailyWorkHoursSchema = z.number({
  required_error: 'Daily work hours is required',
  invalid_type_error: 'Daily work hours must be a number',
}).positive({
  message: 'Daily work hours must be a positive number',
}).max(24, {
  message: 'Daily work hours cannot exceed 24',
}).refine(
  (value) => {
    // Ensure proper decimal precision (2 decimal places allowed to match database precision 4, scale 2)
    return Number.isFinite(value) && Number(value.toFixed(2)) === value;
  },
  {
    message: 'Daily work hours can have at most 2 decimal places',
  }
);

// Resource name validation
export const resourceNameSchema = z.string({
  required_error: 'Resource name is required',
  invalid_type_error: 'Resource name must be a string',
}).trim()
  .min(1, {
    message: 'Resource name cannot be empty',
  })
  .max(256, {
    message: 'Resource name cannot exceed 256 characters',
  })
  .refine(
    (value) => {
      // Prevent script injection and HTML
      return !/<[^>]*>/.test(value);
    },
    {
      message: 'Resource name cannot contain HTML tags',
    }
  );

// Create resource input schema
export const createResourceSchema = z.object({
  name: resourceNameSchema,
  type: resourceTypeSchema,
  hourlyRate: hourlyRateSchema,
  dailyWorkHours: dailyWorkHoursSchema.default(8.0),
  currency: currencySchema.default('USD'),
  userId: z.string().optional(), // Link to user if this is a human resource
});

// Update resource input schema - all fields optional
export const updateResourceSchema = z.object({
  id: z.number({
    required_error: 'Resource ID is required',
    invalid_type_error: 'Resource ID must be a number',
  }).positive({
    message: 'Resource ID must be a positive number',
  }),
  name: resourceNameSchema.optional(),
  type: resourceTypeSchema.optional(),
  hourlyRate: hourlyRateSchema.optional(),
  dailyWorkHours: dailyWorkHoursSchema.optional(),
  currency: currencySchema.optional(),
  userId: z.string().optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => {
    // At least one field must be provided for update
    const hasUpdateField = Object.keys(data).some(key => key !== 'id' && data[key as keyof typeof data] !== undefined);
    return hasUpdateField;
  },
  {
    message: 'At least one field must be provided for update',
  }
);

// Delete resource input schema
export const deleteResourceSchema = z.object({
  id: z.number({
    required_error: 'Resource ID is required',
    invalid_type_error: 'Resource ID must be a number',
  }).positive({
    message: 'Resource ID must be a positive number',
  }),
});

// Export types for use in the application
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type DeleteResourceInput = z.infer<typeof deleteResourceSchema>;

// Error types for better error handling
export interface ResourceValidationError extends Error {
  code: 'VALIDATION_ERROR';
  field?: string;
  value?: unknown;
}

export interface ResourceNotFoundError extends Error {
  code: 'RESOURCE_NOT_FOUND';
  resourceId: number;
}

export interface ResourceAccessError extends Error {
  code: 'ACCESS_DENIED';
  organizationId: number;
  resourceId?: number;
}

// Type guard functions for resource error handling
export function isResourceValidationError(error: unknown): error is ResourceValidationError {
  return error instanceof Error && 'code' in error && (error as ResourceValidationError).code === 'VALIDATION_ERROR';
}

export function isResourceNotFoundError(error: unknown): error is ResourceNotFoundError {
  return error instanceof Error && 'code' in error && (error as ResourceNotFoundError).code === 'RESOURCE_NOT_FOUND';
}

export function isResourceAccessError(error: unknown): error is ResourceAccessError {
  return error instanceof Error && 'code' in error && (error as ResourceAccessError).code === 'ACCESS_DENIED';
}