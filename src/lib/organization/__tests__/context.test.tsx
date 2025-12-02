import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { OrganizationProvider, useOrganization } from '../context';

// Mock tRPC
const mockGetUserOrganizations = vi.fn();

vi.mock('~/trpc/react', () => ({
  api: {
    organization: {
      getUserOrganizations: {
        useQuery: () => mockGetUserOrganizations()
      }
    }
  }
}));

describe('OrganizationContext', () => {
  beforeEach(() => {
    localStorage.clear();
    mockGetUserOrganizations.mockReturnValue({
      data: { success: true, data: [] },
      isLoading: false
    });
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <OrganizationProvider>{children}</OrganizationProvider>
  );

  it('should provide default context values', () => {
    const { result } = renderHook(() => useOrganization(), { wrapper });

    expect(result.current.currentOrganization).toBe(null);
    expect(result.current.organizations).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('should initialize with localStorage organization ID', () => {
    localStorage.setItem('currentOrganizationId', '1');

    // Mock organizations data
    mockGetUserOrganizations.mockReturnValue({
      data: {
        success: true,
        data: [
          { id: 1, name: 'Test Org', timezone: 'America/New_York', role: 'owner' },
          { id: 2, name: 'Another Org', timezone: 'UTC', role: 'admin' }
        ]
      },
      isLoading: false
    });

    const { result } = renderHook(() => useOrganization(), { wrapper });

    // Should load the organization from localStorage
    expect(result.current.currentOrganization?.id).toBe(1);
  });

  it('should switch organization correctly', () => {
    // Mock organizations data
    mockGetUserOrganizations.mockReturnValue({
      data: {
        success: true,
        data: [
          { id: 1, name: 'Test Org', timezone: 'America/New_York', role: 'owner' },
          { id: 2, name: 'Another Org', timezone: 'UTC', role: 'admin' }
        ]
      },
      isLoading: false
    });

    const { result } = renderHook(() => useOrganization(), { wrapper });

    act(() => {
      result.current.switchOrganization(2);
    });

    expect(result.current.currentOrganization?.id).toBe(2);
    expect(localStorage.getItem('currentOrganizationId')).toBe('2');
  });

  it('should handle invalid organization ID in localStorage', async () => {
    localStorage.setItem('currentOrganizationId', '999');

    // Mock organizations data
    mockGetUserOrganizations.mockReturnValue({
      data: {
        success: true,
        data: [
          { id: 1, name: 'Test Org', timezone: 'America/New_York', role: 'owner' },
          { id: 2, name: 'Another Org', timezone: 'UTC', role: 'admin' }
        ]
      },
      isLoading: false
    });

    const { result } = renderHook(() => useOrganization(), { wrapper });

    // Should fall back to first available organization
    await waitFor(() => {
      expect(result.current.currentOrganization?.id).toBe(1);
    });
  });

  it('should clear localStorage when organization is cleared', () => {
    localStorage.setItem('currentOrganizationId', '1');

    // Mock empty organizations to ensure clear works
    mockGetUserOrganizations.mockReturnValue({
      data: {
        success: true,
        data: []
      },
      isLoading: false
    });

    const { result } = renderHook(() => useOrganization(), { wrapper });

    act(() => {
      result.current.clearOrganization();
    });

    expect(localStorage.getItem('currentOrganizationId')).toBeNull();
  });
});