/**
 * Organization utility functions
 */

/**
 * Validate IANA timezone identifier
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get list of common IANA timezones
 */
export function getCommonTimezones(): string[] {
  return [
    "UTC",
    // Americas
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Toronto",
    "America/Mexico_City",
    "America/Sao_Paulo",
    "America/Argentina/Buenos_Aires",
    // Europe
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Rome",
    "Europe/Madrid",
    "Europe/Amsterdam",
    "Europe/Stockholm",
    "Europe/Moscow",
    // Asia
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Asia/Hong_Kong",
    "Asia/Singapore",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Seoul",
    "Asia/Jakarta",
    // Africa
    "Africa/Cairo",
    "Africa/Lagos",
    "Africa/Johannesburg",
    // Oceania
    "Australia/Sydney",
    "Australia/Melbourne",
    "Pacific/Auckland",
  ];
}

/**
 * Get all IANA timezones (comprehensive list)
 */
export function getAllTimezones(): string[] {
  return Intl.supportedValuesOf('timeZone') as string[];
}

/**
 * Format timezone for display
 */
export function formatTimezoneDisplay(timezone: string): string {
  try {
    const now = new Date();
    const offset = now.toLocaleTimeString('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });

    const offsetMatch = offset.match(/([+-]\d{2}:\d{2})$/);
    const utcOffset = offsetMatch ? offsetMatch[1] : '';

    return `${timezone} (UTC${utcOffset})`;
  } catch {
    return timezone;
  }
}

/**
 * Get current time in timezone
 */
export function getCurrentTimeInTimezone(timezone: string): {
  time: string;
  date: string;
  dateTime: Date;
} {
  try {
    const now = new Date();

    return {
      time: now.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      date: now.toLocaleDateString('en-US', {
        timeZone: timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      dateTime: now
    };
  } catch {
    const now = new Date();
    return {
      time: now.toTimeString(),
      date: now.toDateString(),
      dateTime: now
    };
  }
}

/**
 * Convert UTC date to timezone
 */
export function convertToTimezone(date: Date, timezone: string): Date {
  try {
    const utcString = date.toISOString();
    const localString = new Date(utcString).toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    // Parse back to Date object (this keeps the original UTC timestamp)
    return new Date(utcString);
  } catch {
    return date;
  }
}

/**
 * Format date in timezone
 */
export function formatDateInTimezone(
  date: Date,
  timezone: string,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    return date.toLocaleDateString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...options
    });
  } catch {
    return date.toLocaleDateString();
  }
}

/**
 * Format datetime in timezone
 */
export function formatDateTimeInTimezone(
  date: Date,
  timezone: string,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    return date.toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      ...options
    });
  } catch {
    return date.toLocaleString();
  }
}

/**
 * Get user-friendly timezone name with current time
 */
export function getTimezoneWithCurrentTime(timezone: string): {
  name: string;
  currentTime: string;
  offset: string;
} {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    });

    const parts = formatter.formatToParts(now);
    const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value || '';

    // Calculate offset manually
    const utcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    const localTime = new Date(utcTime.toLocaleString('en-US', { timeZone: timezone }));
    const offsetMs = localTime.getTime() - utcTime.getTime();
    const offsetHours = Math.floor(offsetMs / (1000 * 60 * 60));
    const offsetSign = offsetHours >= 0 ? '+' : '';
    const offsetString = `${offsetSign}${Math.abs(offsetHours).toString().padStart(2, '0')}:00`;

    return {
      name: timezone,
      currentTime: formatDateTimeInTimezone(now, timezone),
      offset: offsetString
    };
  } catch {
    return {
      name: timezone,
      currentTime: 'Invalid timezone',
      offset: 'N/A'
    };
  }
}

/**
 * Check if two timezones have different current dates
 */
export function haveDifferentDates(timezone1: string, timezone2: string): boolean {
  try {
    const now = new Date();
    const date1 = now.toLocaleDateString('en-US', { timeZone: timezone1 });
    const date2 = now.toLocaleDateString('en-US', { timeZone: timezone2 });
    return date1 !== date2;
  } catch {
    return false;
  }
}

/**
 * Get timezone offset from UTC for given timezone
 */
export function getTimezoneOffset(timezone: string): string {
  try {
    const now = new Date();
    const utcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    const localTime = new Date(utcTime.toLocaleString('en-US', { timeZone: timezone }));
    const offsetMs = localTime.getTime() - utcTime.getTime();
    const offsetHours = Math.floor(offsetMs / (1000 * 60 * 60));
    const offsetMinutes = Math.floor((offsetMs % (1000 * 60 * 60)) / (1000 * 60));
    const offsetSign = offsetHours >= 0 ? '+' : '-';

    return `${offsetSign}${Math.abs(offsetHours).toString().padStart(2, '0')}:${Math.abs(offsetMinutes).toString().padStart(2, '0')}`;
  } catch {
    return '+00:00';
  }
}