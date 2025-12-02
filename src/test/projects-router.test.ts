import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCallerFactory } from '~/server/api/trpc';
import { appRouter } from '~/server/api/root';
import { projects } from '~/server/db/schema';

// Mock the database
const mockDb = {
  query: {
    projects: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    organizationMembers: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    organizations: {
      findFirst: vi.fn(),
    },
  },
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

// Mock session context
const mockSession = {
  user: {
    id: 'test-user-id',
  },
};

const createMockContext = () => ({
  db: mockDb,
  session: mockSession,
});

describe('Projects Router', () => {
  let createCaller: ReturnType<typeof createCallerFactory>;

  beforeEach(() => {
    vi.clearAllMocks();
    createCaller = createCallerFactory(appRouter);
  });

  describe('create', () => {
    it('should create a project successfully', async () => {
      // Mock membership check - user is member of organization
      mockDb.query.organizationMembers.findFirst.mockResolvedValue({
        organizationId: 1,
        userId: 'test-user-id',
        role: 'member',
      });

      // Mock project creation
      const mockCreatedProject = {
        id: 1,
        name: 'Test Project',
        organizationId: 1,
        status: 'planning',
      };

      mockDb.insert.mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockCreatedProject]),
      });

      const caller = createCaller(createMockContext());
      const result = await caller.projects.create({
        organizationId: 1,
        name: 'Test Project',
        description: 'Test Description',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedProject);
    });

    it('should reject creation if user is not member of organization', async () => {
      // Mock membership check - user is NOT member of organization
      mockDb.query.organizationMembers.findFirst.mockResolvedValue(null);

      const caller = createCaller(createMockContext());
      const result = await caller.projects.create({
        organizationId: 1,
        name: 'Test Project',
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Not a member of this organization');
    });
  });

  describe('getById', () => {
    it('should return project if user is member of organization', async () => {
      const mockProject = {
        id: 1,
        name: 'Test Project',
        description: 'Test Description',
        status: 'planning',
        organizationId: 1,
        startDate: null,
        endDate: null,
        workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        workingHours: {
          monday: { start: '09:00', end: '17:00' },
        },
        organization: {
          members: [{ userId: 'test-user-id' }], // User is member
        },
      };

      mockDb.query.projects.findFirst.mockResolvedValue(mockProject);

      const caller = createCaller(createMockContext());
      const result = await caller.projects.getById({ id: 1 });

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(1);
      expect(result.data?.name).toBe('Test Project');
    });

    it('should reject access if user is not member of organization', async () => {
      const mockProject = {
        id: 1,
        organization: {
          members: [], // No members - user not member
        },
      };

      mockDb.query.projects.findFirst.mockResolvedValue(mockProject);

      const caller = createCaller(createMockContext());
      const result = await caller.projects.getById({ id: 1 });

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Not authorized to view this project');
    });
  });

  describe('getOrganizationProjects', () => {
    it('should return projects for organization if user is member', async () => {
      // Mock membership check
      mockDb.query.organizationMembers.findFirst.mockResolvedValue({
        organizationId: 1,
        userId: 'test-user-id',
      });

      const mockProjects = [
        {
          id: 1,
          name: 'Project 1',
          description: 'Description 1',
          status: 'planning',
          startDate: null,
          endDate: null,
        },
        {
          id: 2,
          name: 'Project 2',
          description: 'Description 2',
          status: 'active',
          startDate: null,
          endDate: null,
        },
      ];

      mockDb.query.projects.findMany.mockResolvedValue(mockProjects);

      const caller = createCaller(createMockContext());
      const result = await caller.projects.getOrganizationProjects({ organizationId: 1 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].name).toBe('Project 1');
    });

    it('should reject access if user is not member of organization', async () => {
      mockDb.query.organizationMembers.findFirst.mockResolvedValue(null);

      const caller = createCaller(createMockContext());
      const result = await caller.projects.getOrganizationProjects({ organizationId: 1 });

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Not a member of this organization');
    });
  });

  describe('getAvailableWorkingDays', () => {
    it('should return array of working days', async () => {
      const caller = createCaller(createMockContext());
      const result = await caller.projects.getAvailableWorkingDays();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    });
  });

  describe('getAvailableStatuses', () => {
    it('should return array of project statuses', async () => {
      const caller = createCaller(createMockContext());
      const result = await caller.projects.getAvailableStatuses();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(['planning', 'active', 'completed', 'archived']);
    });
  });
});