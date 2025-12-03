import type { z } from 'zod';
import { resourceTimelineInputSchema } from '~/lib/validations/resourceTimeline';

export interface ResourceTimelineDay {
  date: string;
  hoursAvailable: number;
  hourlyRate: number;
  currency: string;
  isWorkingDay: boolean;
  source: 'weekly_pattern' | 'exception';
  dayOfWeek: number;
  cost: number;
  notes?: string;
}

export interface ResourceTimelineResource {
  id: number;
  name: string;
  type: string;
  hourlyRate: number;
  currency: string;
  isActive: boolean;
  timelineData: ResourceTimelineDay[];
}

export interface ResourceTimelineDateRange {
  startDate: string;
  endDate: string;
  totalDays: number;
}

export interface ResourceTimelineMetadata {
  generatedAt: string;
  timezone: string;
  totalResources: number;
  organizationId: number;
}

export interface ResourceTimelineData {
  resources: ResourceTimelineResource[];
  dateRange: ResourceTimelineDateRange;
  metadata: ResourceTimelineMetadata;
}

export interface GetResourceTimelineResponse {
  data: ResourceTimelineData;
}

export interface ResourceTimelineFilters {
  resourceType?: string;
  availabilityStatus?: 'working' | 'non-working' | 'exception';
  minHours?: number;
  maxHours?: number;
}

export interface ResourceTimelineInput {
  startDate: string;
  endDate: string;
  organizationId: number;
  resourceIds?: number[];
  filters?: ResourceTimelineFilters;
}

// Type for inferred Zod schema
export type ResourceTimelineInputSchema = z.infer<typeof resourceTimelineInputSchema>;