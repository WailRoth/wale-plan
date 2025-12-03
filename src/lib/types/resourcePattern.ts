import type { DailyAvailabilityPattern } from "~/lib/validations/resourcePattern";

export interface ResourceWorkScheduleResponse {
  resourceId: number;
  dayOfWeek: number;
  dayOfWeekName: string;
  isActive: boolean;
  workStartTime: string | null;
  workEndTime: string | null;
  totalWorkHours: number | null;
  hourlyRate: string | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyPatternInput extends Omit<DailyAvailabilityPattern, 'dayOfWeek'> {
  dayOfWeek: string;
}

export interface WeeklyPatternInput {
  resourceId: number;
  patterns: DailyPatternInput[];
  currency?: string;
}

export interface GetByResourceIdResponse {
  resourceId: number;
  patterns: ResourceWorkScheduleResponse[];
  currency: string;
}

export interface UpdateDailyPatternResponse {
  resourceId: number;
  updated: boolean;
  patterns: ResourceWorkScheduleResponse[];
}

export interface ResetToDefaultsResponse {
  resourceId: number;
  reset: boolean;
  patterns: ResourceWorkScheduleResponse[];
}

export interface ResourcePatternValidationError extends Error {
  code: 'VALIDATION_ERROR';
  field: string;
  value?: unknown;
}

export interface ResourcePatternNotFoundError extends Error {
  code: 'RESOURCE_NOT_FOUND';
  resourceId: number;
}

export interface ResourcePatternAccessError extends Error {
  code: 'ACCESS_DENIED';
  organizationId: number;
  resourceId?: number;
}

export type ResourcePatternResult<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export type GetResourcePatternResult = ResourcePatternResult<GetByResourceIdResponse>;
export type UpdateResourcePatternResult = ResourcePatternResult<UpdateDailyPatternResponse>;
export type ResetResourcePatternResult = ResourcePatternResult<ResetToDefaultsResponse>;