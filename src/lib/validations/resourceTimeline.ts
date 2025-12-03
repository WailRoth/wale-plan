import { z } from 'zod';

export const resourceTimelineInputSchema = z.object({
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .refine(date => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, 'Start date must be a valid date'),
  endDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .refine(date => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, 'End date must be a valid date'),
  organizationId: z.number().positive('Organization ID must be a positive number'),
  resourceIds: z.array(z.number().positive())
    .max(500, 'Cannot query more than 500 resources at once')
    .optional(),
  filters: z.object({
    resourceType: z.string().optional(),
    availabilityStatus: z.enum(['working', 'non-working', 'exception']).optional(),
    minHours: z.number().min(0).optional(),
    maxHours: z.number().min(0).optional(),
  }).optional(),
}).refine(data => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return startDate <= endDate;
}, {
  message: 'Start date must be before or equal to end date',
  path: ['startDate'],
}).refine(data => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return daysDiff <= 90; // Max 90 days for performance
}, {
  message: 'Date range cannot exceed 90 days for performance reasons',
  path: ['endDate'],
});

export type ResourceTimelineInput = z.infer<typeof resourceTimelineInputSchema>;