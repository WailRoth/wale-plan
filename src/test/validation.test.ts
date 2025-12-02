import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { emailSchema, passwordSchema } from '~/lib/auth/client';

describe('Email Validation', () => {
  it('should validate standard email formats', () => {
    const validEmails = [
      'simple@example.com',
      'very.common@example.com',
      'disposable.style.email.with+symbol@example.com',
      'user.name+tag+sorting@example.com',
      'x@example.com',
      'example-indeed@strange-example.com',
    ];

    validEmails.forEach(email => {
      const result = emailSchema.safeParse(email);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(email);
      } else {
        console.log(`Failed email: ${email}`, result.error);
      }
    });
  });

  it('should reject invalid email formats', () => {
    const invalidEmails = [
      'Abc.example.com', // @ missing
      'A@b@c@example.com', // multiple @
      'invalid-email', // no @domain
      '@domain.com', // no local part
    ];

    invalidEmails.forEach(email => {
      const result = emailSchema.safeParse(email);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues?.[0]?.message).toContain('Invalid email address format');
      }
    });
  });

  it('should reject empty email', () => {
    const result = emailSchema.safeParse('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error?.issues?.[0]?.message).toBe('Email is required');
    }
  });
});

describe('Password Validation', () => {
  it('should accept valid passwords', () => {
    const validPasswords = [
      'Password123!',
      'MySecureP@ss1',
      'Str0ng#Pass',
      'Complex$Pass99',
      'ValidPass1*',
    ];

    validPasswords.forEach(password => {
      const result = passwordSchema.safeParse(password);
      if (!result.success) {
        console.log(`Failed password: ${password}`, result.error.issues);
      }
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(password);
      }
    });
  });

  it('should reject passwords that are too short', () => {
    const invalidPasswords = [
      'Ab1!', // 4 chars
      'Pass1', // 5 chars
      '1234567', // 7 chars, no special char or uppercase
      'Abcdefg', // 7 chars, no number or special char
    ];

    invalidPasswords.forEach(password => {
      const result = passwordSchema.safeParse(password);
      expect(result.success).toBe(false);
    });
  });

  it('should reject passwords without uppercase letter', () => {
    const invalidPasswords = [
      'password123!',
      'lowercase1!',
      'alllowercase',
      'n0uppercase!',
    ];

    invalidPasswords.forEach(password => {
      const result = passwordSchema.safeParse(password);
      expect(result.success).toBe(false);
    });
  });

  it('should reject passwords without numbers', () => {
    const invalidPasswords = [
      'Password!',
      'NO_NUMBERS_HERE!',
      'AllLetters!',
      'NoDigits!',
    ];

    invalidPasswords.forEach(password => {
      const result = passwordSchema.safeParse(password);
      expect(result.success).toBe(false);
    });
  });

  it('should reject passwords without special characters', () => {
    const invalidPasswords = [
      'Password123',
      'NoSpecialChar99',
      'ALLCAPS123',
      'justlettersandnumbers1',
    ];

    invalidPasswords.forEach(password => {
      const result = passwordSchema.safeParse(password);
      expect(result.success).toBe(false);
    });
  });

  it('should provide specific error messages', () => {
    // Test length error
    let result = passwordSchema.safeParse('Ab1!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error?.issues?.[0]?.message).toBe('Password must be at least 8 characters');
    }

    // Test uppercase error
    result = passwordSchema.safeParse('alllowercase1!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(issue =>
        issue.message === 'Password must contain at least one uppercase letter'
      )).toBe(true);
    }

    // Test number error
    result = passwordSchema.safeParse('NoNumbers!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(issue =>
        issue.message === 'Password must contain at least one number'
      )).toBe(true);
    }

    // Test special character error
    result = passwordSchema.safeParse('NoSpecial123');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(issue =>
        issue.message === 'Password must contain at least one special character'
      )).toBe(true);
    }
  });
});

describe('Combined Validation', () => {
  it('should validate email and password together', () => {
    const authSchema = z.object({
      email: emailSchema,
      password: passwordSchema,
    });

    const validData = {
      email: 'user@example.com',
      password: 'SecurePass123!'
    };

    const result = authSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('should reject invalid combination', () => {
    const authSchema = z.object({
      email: emailSchema,
      password: passwordSchema,
    });

    const invalidData = {
      email: 'invalid-email',
      password: 'weak'
    };

    const result = authSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      // Should have multiple errors
      expect(result.error.issues.length).toBeGreaterThan(1);
    }
  });
});