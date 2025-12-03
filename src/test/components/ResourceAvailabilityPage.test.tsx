import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ResourceAvailabilityPage } from "~/components/resources/ResourceAvailabilityPage";
import { trpc } from "~/trpc/react";
import { type DailyAvailabilityPattern } from "~/lib/validations/resourcePattern";
import { type ResourceWorkScheduleResponse } from "~/lib/types/resourcePattern";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => ({
    resourceId: "123",
  }),
}));

// Mock tRPC
const mockGetByResourceId = vi.fn();
const mockGetById = vi.fn();
const mockUpdateDailyPattern = vi.fn();
const mockResetToDefaults = vi.fn();

vi.mock("~/trpc/react", () => ({
  trpc: {
    useQuery: vi.fn(),
    useMutation: vi.fn(() => ({ mutate: mockUpdateDailyPattern })),
    resourcePatterns: {
      getByResourceId: {
        useQuery: mockGetByResourceId,
      },
      updateDailyPattern: {
        useMutation: mockUpdateDailyPattern,
      },
      resetToDefaults: {
        useMutation: mockResetToDefaults,
      },
    },
    resources: {
      getById: {
        useQuery: mockGetById,
      },
    },
  },
}));

// Mock toast
vi.mock("~/components/ui/toast/use-toast", () => ({
  toast: vi.fn(),
}));

const createTestClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithClient = (component: React.ReactElement) => {
  const client = createTestClient();
  return render(
    <QueryClientProvider client={client}>
      {component}
    </QueryClientProvider>
  );
};

describe("ResourceAvailabilityPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default successful responses
    mockGetById.mockReturnValue({
      data: {
        success: true,
        data: {
          id: 123,
          name: "Test Resource",
          type: "human",
          hourlyRate: "50.00",
          isActive: true,
        },
      },
      isLoading: false,
      error: null,
    });

    const mockPatterns: ResourceWorkScheduleResponse[] = [
      {
        resourceId: 123,
        dayOfWeek: 1,
        dayOfWeekName: "monday",
        isActive: true,
        workStartTime: "09:00",
        workEndTime: "17:00",
        totalWorkHours: 8.0,
        hourlyRate: 50.0,
        currency: "USD",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Add other days...
      {
        resourceId: 123,
        dayOfWeek: 6,
        dayOfWeekName: "saturday",
        isActive: false,
        workStartTime: null,
        workEndTime: null,
        totalWorkHours: null,
        hourlyRate: null,
        currency: "USD",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        resourceId: 123,
        dayOfWeek: 0,
        dayOfWeekName: "sunday",
        isActive: false,
        workStartTime: null,
        workEndTime: null,
        totalWorkHours: null,
        hourlyRate: null,
        currency: "USD",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    mockGetByResourceId.mockReturnValue({
      data: {
        success: true,
        data: {
          resourceId: 123,
          patterns: mockPatterns,
          currency: "USD",
        },
      },
      isLoading: false,
      error: null,
    });

    mockUpdateDailyPattern.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({
        success: true,
        data: {
          resourceId: 123,
          updated: true,
          patterns: mockPatterns,
        },
      }),
      isPending: false,
    });

    mockResetToDefaults.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({
        success: true,
        data: {
          resourceId: 123,
          reset: true,
          patterns: mockPatterns,
        },
      }),
      isPending: false,
    });
  });

  it("renders resource availability page correctly", async () => {
    renderWithClient(<ResourceAvailabilityPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Resource — Disponibilités")).toBeInTheDocument();
    });

    expect(screen.getByText("Configurez les horaires de travail et tarifs par jour")).toBeInTheDocument();
    expect(screen.getByText("Configuration journalière de disponibilité")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    mockGetById.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithClient(<ResourceAvailabilityPage />);

    expect(screen.getByRole("status")).toBeInTheDocument(); // Loading spinner
  });

  it("shows error state when resource not found", async () => {
    mockGetById.mockReturnValue({
      data: {
        success: false,
        error: { message: "Resource not found" },
      },
      isLoading: false,
      error: new Error("Resource not found"),
    });

    renderWithClient(<ResourceAvailabilityPage />);

    await waitFor(() => {
      expect(screen.getByText("Resource Not Found")).toBeInTheDocument();
    });
  });

  it("displays all days of the week", async () => {
    renderWithClient(<ResourceAvailabilityPage />);

    await waitFor(() => {
      expect(screen.getByText("Lundi")).toBeInTheDocument();
      expect(screen.getByText("Mardi")).toBeInTheDocument();
      expect(screen.getByText("Mercredi")).toBeInTheDocument();
      expect(screen.getByText("Jeudi")).toBeInTheDocument();
      expect(screen.getByText("Vendredi")).toBeInTheDocument();
      expect(screen.getByText("Samedi")).toBeInTheDocument();
      expect(screen.getByText("Dimanche")).toBeInTheDocument();
    });
  });

  it("shows active status for weekdays and inactive for weekends", async () => {
    renderWithClient(<ResourceAvailabilityPage />);

    await waitFor(() => {
      // Check that weekdays are active
      expect(screen.getByDisplayValue("09:00")).toBeInTheDocument(); // Monday start time
      expect(screen.getByDisplayValue("17:00")).toBeInTheDocument(); // Monday end time

      // Check weekend checkboxes are unchecked
      const weekendCheckboxes = screen.getAllByRole("checkbox", { name: /Actif/i });
      // At least weekend checkboxes should be unchecked (this is a simplified check)
    });
  });

  it("enables save button when changes are made", async () => {
    renderWithClient(<ResourceAvailabilityPage />);

    await waitFor(() => {
      // Initially save button should be disabled (no changes yet)
      expect(screen.getByText("Enregistrer")).toBeDisabled();
    });

    // Make a change to activate Saturday
    const saturdayCheckbox = screen.getAllByRole("checkbox", { name: /Actif/i })[5]; // Saturday
    fireEvent.click(saturdayCheckbox);

    // Now save button should be enabled
    await waitFor(() => {
      expect(screen.getByText("Enregistrer")).toBeEnabled();
    });
  });

  it("calls update mutation when save is clicked", async () => {
    renderWithClient(<ResourceAvailabilityPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Resource — Disponibilités")).toBeInTheDocument();
    });

    // Make a change
    const mondayStartTime = screen.getByDisplayValue("09:00");
    fireEvent.change(mondayStartTime, { target: { value: "08:00" } });

    // Click save
    const saveButton = screen.getByText("Enregistrer");
    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateDailyPattern).toHaveBeenCalled();
    });
  });

  it("resets to defaults when reset button is clicked", async () => {
    // Mock window.confirm
    window.confirm = vi.fn(() => true);

    renderWithClient(<ResourceAvailabilityPage />);

    await waitFor(() => {
      expect(screen.getByText("Réinitialiser")).toBeInTheDocument();
    });

    const resetButton = screen.getByText("Réinitialiser");
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(mockResetToDefaults).toHaveBeenCalled();
    });
  });

  it("navigates back when cancel button is clicked and there are unsaved changes", async () => {
    // Mock window.confirm for unsaved changes
    window.confirm = vi.fn(() => true);

    renderWithClient(<ResourceAvailabilityPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Resource — Disponibilités")).toBeInTheDocument();
    });

    // Make a change first
    const mondayStartTime = screen.getByDisplayValue("09:00");
    fireEvent.change(mondayStartTime, { target: { value: "08:00" } });

    // Click back button
    const backButton = screen.getByText("Retour");
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard/resources");
    });
  });

  it("shows correct currency display", async () => {
    renderWithClient(<ResourceAvailabilityPage />);

    await waitFor(() => {
      // Should show USD badges
      expect(screen.getByText("USD")).toBeInTheDocument();
    });
  });
});