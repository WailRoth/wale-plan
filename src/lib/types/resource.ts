import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import type { resources } from '~/server/db/schema';

// Export the database types for use in the application
export type ResourceSelect = typeof resources.$inferSelect;
export type ResourceInsert = typeof resources.$inferInsert;

// Resource type enum for use in frontend
export const ResourceType = {
  HUMAN: 'human',
  MATERIAL: 'material',
  EQUIPMENT: 'equipment',
} as const;

export type ResourceType = typeof ResourceType[keyof typeof ResourceType];

// Resource interface for frontend usage
export interface Resource {
  id: number;
  organizationId: number;
  userId: string | null;
  name: string;
  type: ResourceType;
  hourlyRate: string; // Stored as string to maintain precision
  dailyWorkHours: string; // Stored as string to maintain precision
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

// Result type for consistent error handling (following T3 patterns)
export type ResourceResult<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Resource API response types
export interface CreateResourceResponse {
  id: number;
  name: string;
  organizationId: number;
  type: ResourceType;
  hourlyRate: string;
  dailyWorkHours: string;
  currency: string;
  isActive: boolean;
}

export interface UpdateResourceResponse {
  id: number;
  name: string;
  type: ResourceType;
  hourlyRate: string;
  dailyWorkHours: string;
  currency: string;
  isActive: boolean;
  updatedAt: Date;
}

export interface DeleteResourceResponse {
  id: number;
  deleted: boolean;
}

export interface GetResourceResponse {
  id: number;
  name: string;
  type: ResourceType;
  hourlyRate: string;
  dailyWorkHours: string;
  currency: string;
  isActive: boolean;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

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

// Type guards for error handling
export function isResourceValidationError(error: unknown): error is ResourceValidationError {
  return error instanceof Error && 'code' in error && (error as ResourceValidationError).code === 'VALIDATION_ERROR';
}

export function isResourceNotFoundError(error: unknown): error is ResourceNotFoundError {
  return error instanceof Error && 'code' in error && (error as ResourceNotFoundError).code === 'RESOURCE_NOT_FOUND';
}

export function isResourceAccessError(error: unknown): error is ResourceAccessError {
  return error instanceof Error && 'code' in error && (error as ResourceAccessError).code === 'ACCESS_DENIED';
}

// Resource statistics and calculations
export interface ResourceStats {
  totalResources: number;
  activeResources: number;
  resourcesByType: Record<ResourceType, number>;
  averageHourlyRate: number;
  totalDailyCapacity: number; // Total work hours across all resources
}

// Resource assignment interface (for future use with task assignments)
export interface ResourceAssignment {
  id: number;
  resourceId: number;
  taskId: number;
  assignedUnits: string; // Percentage of resource (e.g., "0.5" = 50%)
  assignedHours: string;
  cost: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date | null;
}

// Resource availability interface (for future use with scheduling)
export interface ResourceAvailability {
  id: number;
  resourceId: number;
  startDate: Date;
  endDate: Date;
  availabilityType: 'vacation' | 'sick_leave' | 'holiday' | 'training' | 'unavailable';
  description: string | null;
  isFullDay: boolean;
  startTime: string | null; // HH:MM format
  endTime: string | null; // HH:MM format
  isActive: boolean;
}

// Resource work schedule interface (for future use with day-specific patterns)
export interface ResourceWorkSchedule {
  resourceId: number;
  dayOfWeek: number; // 0-6 (Sunday=0 or Monday=0)
  dayType: 'regular' | 'weekend' | 'holiday' | 'custom';
  isWorkingDay: boolean;
  workStartTime: string | null; // HH:MM:SS format
  workEndTime: string | null; // HH:MM:SS format
  breakStartTime: string | null; // HH:MM:SS format
  breakEndTime: string | null; // HH:MM:SS format
  totalWorkHours: string | null;
  hourlyRate: string | null;
  currency: string;
  isActive: boolean;
}