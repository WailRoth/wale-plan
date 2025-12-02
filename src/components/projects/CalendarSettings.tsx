"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { toast } from "~/components/ui/toast/use-toast";
import { Clock, Calendar, Save, RotateCcw } from "lucide-react";

// Form validation schema
const calendarSettingsSchema = z.object({
  workingDays: z.array(z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]))
    .min(1, "At least one working day is required")
    .max(7, "Cannot have more than 7 working days"),
  workingHours: z.record(z.string(), z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM"),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format. Use HH:MM"),
  })),
});

type CalendarSettingsValues = z.infer<typeof calendarSettingsSchema>;

interface CalendarSettingsProps {
  initialWorkingDays?: string[];
  initialWorkingHours?: Record<string, { start: string; end: string }>;
  onSave?: (settings: CalendarSettingsValues) => void;
  disabled?: boolean;
}

const workingDaysOptions = [
  { id: "Mon", label: "Monday" },
  { id: "Tue", label: "Tuesday" },
  { id: "Wed", label: "Wednesday" },
  { id: "Thu", label: "Thursday" },
  { id: "Fri", label: "Friday" },
  { id: "Sat", label: "Saturday" },
  { id: "Sun", label: "Sunday" },
];

const defaultWorkingHours = {
  monday: { start: "09:00", end: "17:00" },
  tuesday: { start: "09:00", end: "17:00" },
  wednesday: { start: "09:00", end: "17:00" },
  thursday: { start: "09:00", end: "17:00" },
  friday: { start: "09:00", end: "17:00" },
  saturday: { start: "09:00", end: "17:00" },
  sunday: { start: "09:00", end: "17:00" },
};

const quickSettings = {
  "5-day": {
    label: "5-Day Week",
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    workingHours: defaultWorkingHours,
  },
  "6-day": {
    label: "6-Day Week",
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    workingHours: defaultWorkingHours,
  },
  "7-day": {
    label: "7-Day Week",
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    workingHours: defaultWorkingHours,
  },
  "weekend-only": {
    label: "Weekend Only",
    workingDays: ["Sat", "Sun"],
    workingHours: defaultWorkingHours,
  },
} as const;

export function CalendarSettings({
  initialWorkingDays = ["Mon", "Tue", "Wed", "Thu", "Fri"],
  initialWorkingHours = defaultWorkingHours,
  onSave,
  disabled = false,
}: CalendarSettingsProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<CalendarSettingsValues>({
    resolver: zodResolver(calendarSettingsSchema),
    defaultValues: {
      workingDays: initialWorkingDays as ("Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun")[],
      workingHours: initialWorkingHours,
    },
    values: {
      workingDays: initialWorkingDays as ("Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun")[],
      workingHours: initialWorkingHours,
    },
  });

  const workingDays = form.watch("workingDays");
  const workingHours = form.watch("workingHours");

  const handleWorkingDayChange = (dayId: string, checked: boolean) => {
    const currentDays = form.getValues("workingDays");
    if (checked) {
      form.setValue("workingDays", [...currentDays, dayId as "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"]);
    } else {
      form.setValue("workingDays", currentDays.filter(d => d !== dayId));
    }
  };

  const handleWorkingHoursChange = (dayId: string, field: "start" | "end", value: string) => {
    const currentHours = form.getValues("workingHours");
    const dayKey = dayId.toLowerCase();
    const existingHours = currentHours[dayKey] || { start: "09:00", end: "17:00" };

    form.setValue("workingHours", {
      ...currentHours,
      [dayKey]: {
        ...existingHours,
        [field]: value,
      },
    });
  };

  const handleQuickSettings = (settingKey: keyof typeof quickSettings) => {
    const setting = quickSettings[settingKey];
    form.setValue("workingDays", setting.workingDays);
    form.setValue("workingHours", setting.workingHours);
  };

  const handleReset = () => {
    form.reset();
  };

  const onSubmit = async (data: CalendarSettingsValues) => {
    setIsSaving(true);
    try {
      await onSave?.(data);
      toast({
        title: "Success",
        description: "Calendar settings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save calendar settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const validateTimeRange = (start: string, end: string): boolean => {
    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);

    if (startHour > endHour) return false;
    if (startHour === endHour && startMin >= endMin) return false;

    return true;
  };

  const getTimeRangeError = (start: string, end: string): string | null => {
    if (!validateTimeRange(start, end)) {
      return "End time must be after start time";
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Calendar Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Quick Settings */}
          <div className="space-y-3">
            <Label>Quick Settings</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(quickSettings).map(([key, setting]) => (
                <Button
                  key={key}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSettings(key as keyof typeof quickSettings)}
                  disabled={disabled}
                >
                  {setting.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Working Days */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <Label>Working Days</Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {workingDaysOptions.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.id}`}
                    checked={workingDays.includes(day.id)}
                    onCheckedChange={(checked) => handleWorkingDayChange(day.id, checked as boolean)}
                    disabled={disabled}
                  />
                  <Label htmlFor={`day-${day.id}`} className="text-sm">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
            {form.formState.errors.workingDays && (
              <p className="text-sm text-destructive">
                {form.formState.errors.workingDays.message}
              </p>
            )}
          </div>

          {/* Working Hours */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <Label>Working Hours</Label>
            </div>
            <div className="space-y-2">
              {workingDays.map((day) => {
                const dayKey = day.toLowerCase();
                const dayHours = workingHours[dayKey];
                const dayLabel = workingDaysOptions.find(d => d.id === day)?.label || day;
                const timeError = dayHours ? getTimeRangeError(dayHours.start, dayHours.end) : null;

                return (
                  <div key={day} className="flex items-center gap-2">
                    <Label className="w-20 text-sm">{dayLabel}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={dayHours?.start || "09:00"}
                        onChange={(e) => handleWorkingHoursChange(day, "start", e.target.value)}
                        disabled={disabled}
                        className="w-24"
                      />
                      <span className="text-sm">to</span>
                      <Input
                        type="time"
                        value={dayHours?.end || "17:00"}
                        onChange={(e) => handleWorkingHoursChange(day, "end", e.target.value)}
                        disabled={disabled}
                        className={`w-24 ${timeError ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {timeError && (
                      <p className="text-xs text-destructive">{timeError}</p>
                    )}
                  </div>
                );
              })}
            </div>
            {form.formState.errors.workingHours && (
              <p className="text-sm text-destructive">
                {form.formState.errors.workingHours.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={disabled || !form.formState.isDirty}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              type="submit"
              disabled={disabled || isSaving || !form.formState.isValid || !form.formState.isDirty}
            >
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}