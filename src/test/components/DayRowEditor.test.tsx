import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DayRowEditor } from "~/components/resources/DayRowEditor";
import { type DailyAvailabilityPattern } from "~/lib/validations/resourcePattern";

describe("DayRowEditor", () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    day: "monday",
    dayName: "Monday",
    pattern: {
      dayOfWeek: "monday" as const,
      isActive: true,
      startTime: "09:00",
      endTime: "17:00",
      hourlyRate: 50,
    },
    currency: "USD",
    onChange: mockOnChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders day name in French", () => {
    render(<DayRowEditor {...defaultProps} />);

    expect(screen.getByText("Lundi")).toBeInTheDocument();
  });

  it("renders time inputs correctly", () => {
    render(<DayRowEditor {...defaultProps} />);

    expect(screen.getByDisplayValue("09:00")).toBeInTheDocument();
    expect(screen.getByDisplayValue("17:00")).toBeInTheDocument();
  });

  it("renders hourly rate input with correct value", () => {
    render(<DayRowEditor {...defaultProps} />);

    expect(screen.getByDisplayValue("50")).toBeInTheDocument();
  });

  it("shows currency symbol correctly", () => {
    render(<DayRowEditor {...defaultProps} />);

    expect(screen.getByText("$")).toBeInTheDocument(); // USD symbol
    expect(screen.getByText("USD")).toBeInTheDocument();
  });

  it("shows active status when pattern is active", () => {
    render(<DayRowEditor {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox", { name: /Actif/i });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();
  });

  it("shows inactive status when pattern is inactive", () => {
    const inactiveProps = {
      ...defaultProps,
      pattern: {
        ...defaultProps.pattern,
        isActive: false,
      },
    };

    render(<DayRowEditor {...inactiveProps} />);

    expect(screen.getByText("Inactif")).toBeInTheDocument();
    const checkbox = screen.getByRole("checkbox", { name: /Actif/i });
    expect(checkbox).not.toBeChecked();
  });

  it("disables inputs when pattern is inactive", () => {
    const inactiveProps = {
      ...defaultProps,
      pattern: {
        ...defaultProps.pattern,
        isActive: false,
      },
    };

    render(<DayRowEditor {...inactiveProps} />);

    const startTimeInput = screen.getByDisplayValue("09:00");
    const endTimeInput = screen.getByDisplayValue("17:00");
    const hourlyRateInput = screen.getByDisplayValue("50");

    expect(startTimeInput).toBeDisabled();
    expect(endTimeInput).toBeDisabled();
    expect(hourlyRateInput).toBeDisabled();
  });

  it("disables all inputs when disabled prop is true", () => {
    const disabledProps = {
      ...defaultProps,
      disabled: true,
    };

    render(<DayRowEditor {...disabledProps} />);

    const startTimeInput = screen.getByDisplayValue("09:00");
    const endTimeInput = screen.getByDisplayValue("17:00");
    const hourlyRateInput = screen.getByDisplayValue("50");
    const checkbox = screen.getByRole("checkbox", { name: /Actif/i });

    expect(startTimeInput).toBeDisabled();
    expect(endTimeInput).toBeDisabled();
    expect(hourlyRateInput).toBeDisabled();
    expect(checkbox).toBeDisabled();
  });

  it("calls onChange when start time is changed", () => {
    render(<DayRowEditor {...defaultProps} />);

    const startTimeInput = screen.getByDisplayValue("09:00");
    fireEvent.change(startTimeInput, { target: { value: "08:00" } });

    expect(mockOnChange).toHaveBeenCalledWith({
      dayOfWeek: "monday",
      isActive: true,
      startTime: "08:00",
      endTime: "17:00",
      hourlyRate: 50,
    });
  });

  it("calls onChange when end time is changed", () => {
    render(<DayRowEditor {...defaultProps} />);

    const endTimeInput = screen.getByDisplayValue("17:00");
    fireEvent.change(endTimeInput, { target: { value: "18:00" } });

    expect(mockOnChange).toHaveBeenCalledWith({
      dayOfWeek: "monday",
      isActive: true,
      startTime: "09:00",
      endTime: "18:00",
      hourlyRate: 50,
    });
  });

  it("calls onChange when hourly rate is changed", () => {
    render(<DayRowEditor {...defaultProps} />);

    const hourlyRateInput = screen.getByDisplayValue("50");
    fireEvent.change(hourlyRateInput, { target: { value: "60" } });

    expect(mockOnChange).toHaveBeenCalledWith({
      dayOfWeek: "monday",
      isActive: true,
      startTime: "09:00",
      endTime: "17:00",
      hourlyRate: 60,
    });
  });

  it("calls onChange when checkbox is toggled", () => {
    render(<DayRowEditor {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox", { name: /Actif/i });
    fireEvent.click(checkbox);

    expect(mockOnChange).toHaveBeenCalledWith({
      dayOfWeek: "monday",
      isActive: false,
      startTime: "09:00",
      endTime: "17:00",
      hourlyRate: 50,
    });
  });

  it("validates time format and rejects invalid input", () => {
    render(<DayRowEditor {...defaultProps} />);

    const startTimeInput = screen.getByDisplayValue("09:00");
    fireEvent.change(startTimeInput, { target: { value: "25:00" } }); // Invalid time

    // Should not call onChange for invalid time
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("validates hourly rate and rejects negative values", () => {
    render(<DayRowEditor {...defaultProps} />);

    const hourlyRateInput = screen.getByDisplayValue("50");
    fireEvent.change(hourlyRateInput, { target: { value: "-10" } }); // Negative rate

    // Should not call onChange for negative rate
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("handles empty hourly rate correctly", () => {
    render(<DayRowEditor {...defaultProps} />);

    const hourlyRateInput = screen.getByDisplayValue("50");
    fireEvent.change(hourlyRateInput, { target: { value: "" } });

    expect(mockOnChange).toHaveBeenCalledWith({
      dayOfWeek: "monday",
      isActive: true,
      startTime: "09:00",
      endTime: "17:00",
      hourlyRate: undefined,
    });
  });

  it("shows different currency symbols", () => {
    const euroProps = {
      ...defaultProps,
      currency: "EUR",
    };

    render(<DayRowEditor {...euroProps} />);

    expect(screen.getByText("€")).toBeInTheDocument(); // EUR symbol
    expect(screen.getByText("EUR")).toBeInTheDocument();
  });

  it("handles different days correctly", () => {
    const tuesdayProps = {
      ...defaultProps,
      day: "saturday" as const,
      dayName: "Saturday",
    };

    render(<DayRowEditor {...tuesdayProps} />);

    expect(screen.getByText("Samedi")).toBeInTheDocument();
  });

  it("handles ResourceWorkScheduleResponse format", () => {
    const scheduleProps = {
      ...defaultProps,
      pattern: {
        resourceId: 123,
        dayOfWeek: 1,
        dayOfWeekName: "monday",
        isActive: true,
        workStartTime: "10:00",
        workEndTime: "18:00",
        totalWorkHours: 8.0,
        hourlyRate: 55.00,
        currency: "USD",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    render(<DayRowEditor {...scheduleProps} />);

    expect(screen.getByDisplayValue("10:00")).toBeInTheDocument();
    expect(screen.getByDisplayValue("18:00")).toBeInTheDocument();
    expect(screen.getByDisplayValue("55")).toBeInTheDocument();
  });
});