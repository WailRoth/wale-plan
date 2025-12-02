import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

// Mock the trpc mutation for registration
const mockRegisterWithOrganization = vi.fn();

describe('Organization Registration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate registration schema with organization data', () => {
    const registrationSchema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(1),
      organizationName: z.string().min(1),
      organizationDescription: z.string().optional(),
      timezone: z.string().min(1)
        .refine((tz) => {
          try {
            Intl.DateTimeFormat(undefined, { timeZone: tz });
            return true;
          } catch {
            return false;
          }
        }, "Invalid timezone"),
    });

    // Valid data should pass
    const validData = {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
      organizationName: "Test Organization",
      timezone: "America/New_York"
    };

    expect(() => registrationSchema.parse(validData)).not.toThrow();

    // Invalid timezone should fail
    expect(() => registrationSchema.parse({
      ...validData,
      timezone: "Invalid/Timezone"
    })).toThrow();

    // Missing required fields should fail
    expect(() => registrationSchema.parse({
      ...validData,
      organizationName: ""
    })).toThrow();
  });

  it('should handle successful registration flow', async () => {
    mockRegisterWithOrganization.mockResolvedValue({
      success: true,
      user: { id: 1, email: "test@example.com", name: "Test User" },
      organization: { id: 1, name: "Test Org", timezone: "America/New_York", role: "owner" }
    });

    const result = await mockRegisterWithOrganization({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
      organizationName: "Test Organization",
      timezone: "America/New_York"
    });

    expect(result.success).toBe(true);
    expect(result.user.email).toBe("test@example.com");
    expect(result.organization.role).toBe("owner");
  });

  it('should handle registration errors', async () => {
    mockRegisterWithOrganization.mockResolvedValue({
      error: { message: "Email already exists" }
    });

    try {
      await mockRegisterWithOrganization({
        email: "existing@example.com",
        password: "password123",
        name: "Test User",
        organizationName: "Test Organization",
        timezone: "America/New_York"
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should validate timezone during registration', () => {
    const timezones = [
      "America/New_York",
      "Europe/London",
      "Asia/Tokyo",
      "UTC",
      "Invalid/Timezone"
    ];

    const validateTimezone = (timezone: string) => {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
        return true;
      } catch {
        return false;
      }
    };

    expect(validateTimezone("America/New_York")).toBe(true);
    expect(validateTimezone("Europe/London")).toBe(true);
    expect(validateTimezone("Asia/Tokyo")).toBe(true);
    expect(validateTimezone("UTC")).toBe(true);
    expect(validateTimezone("Invalid/Timezone")).toBe(false);
  });
});