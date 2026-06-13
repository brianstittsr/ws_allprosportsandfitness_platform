import { describe, it, expect } from "vitest";
import { loginSchema, programSchema, contactSchema } from "@/schemas";

describe("loginSchema", () => {
  it("validates a correct login", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "password123" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "password123" });
    expect(result.success).toBe(false);
  });

  it("rejects a short password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "short" });
    expect(result.success).toBe(false);
  });
});

describe("programSchema", () => {
  it("validates a correct program", () => {
    const result = programSchema.safeParse({
      name: "Yoga Basics",
      type: "yoga",
      departmentId: "dept-1",
      locationIds: ["loc-1"],
      managerIds: ["user-1"],
      instructorIds: ["user-2"],
      waiverRequired: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a program without a name", () => {
    const result = programSchema.safeParse({
      name: "",
      type: "yoga",
      departmentId: "dept-1",
    });
    expect(result.success).toBe(false);
  });
});

describe("contactSchema", () => {
  it("validates a correct contact", () => {
    const result = contactSchema.safeParse({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      contactTypes: ["active_client"],
      emailConsent: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a contact without first name", () => {
    const result = contactSchema.safeParse({
      firstName: "",
      lastName: "Doe",
      email: "jane@example.com",
      contactTypes: ["active_client"],
    });
    expect(result.success).toBe(false);
  });
});
