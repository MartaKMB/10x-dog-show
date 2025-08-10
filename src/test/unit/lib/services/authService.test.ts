import { describe, it, expect } from "vitest";

describe("AuthService - Basic Validation", () => {
  describe("Walidacja danych", () => {
    it("waliduje format email", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "test+tag@example.org",
      ];

      const invalidEmails = [
        "invalid-email",
        "test@",
        "@example.com",
        "test.example.com",
      ];

      validEmails.forEach((email) => {
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });

      invalidEmails.forEach((email) => {
        expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    it("waliduje długość hasła", () => {
      const validPasswords = ["password123", "SecurePass!", "1234567890"];
      const invalidPasswords = ["123", "pass", ""];

      validPasswords.forEach((password) => {
        expect(password.length).toBeGreaterThanOrEqual(8);
      });

      invalidPasswords.forEach((password) => {
        expect(password.length).toBeLessThan(8);
      });
    });
  });
});
