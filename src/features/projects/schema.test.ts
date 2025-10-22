import { describe, it, expect } from "vitest";
import {
  createProjectSchema,
  updateProjectSchema,
  projectFilterSchema,
  projectStatusSchema,
} from "./schema";

/**
 * Project Schema Validation Tests
 *
 * Tests Zod schemas for:
 * - createProjectSchema: Project creation validation
 * - updateProjectSchema: Project update validation
 * - projectFilterSchema: Query filters validation
 * - projectStatusSchema: Project status enum validation
 */

describe("Project Schemas", () => {
  // ============================================================================
  // CREATE PROJECT SCHEMA
  // ============================================================================

  describe("createProjectSchema", () => {
    it("should accept valid project with minimal fields", () => {
      const validData = {
        name: "Website Redesign",
      };

      const result = createProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept valid project with all fields", () => {
      const validData = {
        name: "Marketing Campaign",
        description: "Q1 marketing campaign",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-03-31"),
        icon: "📢",
        parentProjectId: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = createProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject project without name", () => {
      const invalidData = {};

      const result = createProjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty name", () => {
      const invalidData = {
        name: "",
      };

      const result = createProjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should trim whitespace from name", () => {
      const data = {
        name: "  Project with spaces  ",
      };

      const result = createProjectSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Project with spaces");
      }
    });

    it("should reject name longer than 255 characters", () => {
      const invalidData = {
        name: "a".repeat(256),
      };

      const result = createProjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject description longer than 5000 characters", () => {
      const invalidData = {
        name: "Test Project",
        description: "a".repeat(5001),
      };

      const result = createProjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept valid UUID for parentProjectId", () => {
      const validData = {
        name: "Subproject",
        parentProjectId: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = createProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID for parentProjectId", () => {
      const invalidData = {
        name: "Subproject",
        parentProjectId: "not-a-uuid",
      };

      const result = createProjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject endDate before startDate", () => {
      const invalidData = {
        name: "Test Project",
        startDate: new Date("2025-12-31"),
        endDate: new Date("2025-01-01"),
      };

      const result = createProjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("endDate");
      }
    });

    it("should accept endDate equal to startDate", () => {
      const validData = {
        name: "One Day Project",
        startDate: new Date("2025-06-15"),
        endDate: new Date("2025-06-15"),
      };

      const result = createProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept null values for optional fields", () => {
      const validData = {
        name: "Minimal Project",
        description: null,
        startDate: null,
        endDate: null,
        icon: null,
        parentProjectId: null,
      };

      const result = createProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // UPDATE PROJECT SCHEMA
  // ============================================================================

  describe("updateProjectSchema", () => {
    it("should accept partial updates", () => {
      const validData = {
        name: "Updated Name",
      };

      const result = updateProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept updating only description", () => {
      const validData = {
        description: "Updated description",
      };

      const result = updateProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept empty object (no updates)", () => {
      const validData = {};

      const result = updateProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should still validate name if provided", () => {
      const invalidData = {
        name: "a".repeat(256),
      };

      const result = updateProjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept updating status", () => {
      const validData = {
        status: "completed",
      };

      const result = updateProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept updating color", () => {
      const validData = {
        color: "#3b82f6",
      };

      const result = updateProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid hex color", () => {
      const invalidData = {
        color: "blue",
      };

      const result = updateProjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject endDate before startDate in update", () => {
      const invalidData = {
        startDate: new Date("2025-12-31"),
        endDate: new Date("2025-01-01"),
      };

      const result = updateProjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // ============================================================================
  // PROJECT FILTER SCHEMA
  // ============================================================================

  describe("projectFilterSchema", () => {
    it("should accept valid filters", () => {
      const validData = {
        status: "active",
        search: "marketing",
        limit: 50,
        offset: 0,
        sortBy: "updatedAt",
        sortOrder: "desc",
      };

      const result = projectFilterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept empty filters", () => {
      const validData = {};

      const result = projectFilterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should apply default values", () => {
      const validData = {};

      const result = projectFilterSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
        expect(result.data.offset).toBe(0);
        expect(result.data.sortBy).toBe("updatedAt");
        expect(result.data.sortOrder).toBe("desc");
      }
    });

    it("should reject limit greater than 100", () => {
      const invalidData = {
        limit: 101,
      };

      const result = projectFilterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject negative offset", () => {
      const invalidData = {
        offset: -1,
      };

      const result = projectFilterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject search longer than 500 chars", () => {
      const invalidData = {
        search: "a".repeat(501),
      };

      const result = projectFilterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept valid project statuses", () => {
      const statuses = ["active", "on_hold", "completed", "archived", "cancelled"];

      statuses.forEach((status) => {
        const result = projectFilterSchema.safeParse({ status });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid project status", () => {
      const invalidData = {
        status: "invalid-status",
      };

      const result = projectFilterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept valid sortBy values", () => {
      const sortByValues = ["createdAt", "updatedAt", "name", "startDate"];

      sortByValues.forEach((sortBy) => {
        const result = projectFilterSchema.safeParse({ sortBy });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid sortBy value", () => {
      const invalidData = {
        sortBy: "invalidField",
      };

      const result = projectFilterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept date range filters", () => {
      const validData = {
        startDateFrom: new Date("2025-01-01"),
        startDateTo: new Date("2025-12-31"),
        endDateFrom: new Date("2025-01-01"),
        endDateTo: new Date("2025-12-31"),
      };

      const result = projectFilterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept parentProjectId as null", () => {
      const validData = {
        parentProjectId: null,
      };

      const result = projectFilterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept parentProjectId as valid UUID", () => {
      const validData = {
        parentProjectId: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = projectFilterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // ENUM SCHEMAS
  // ============================================================================

  describe("projectStatusSchema", () => {
    it("should accept valid project status values", () => {
      const validStatuses = ["active", "on_hold", "completed", "archived", "cancelled"];

      validStatuses.forEach((status) => {
        const result = projectStatusSchema.safeParse(status);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid project status", () => {
      const result = projectStatusSchema.safeParse("invalid_status");
      expect(result.success).toBe(false);
    });
  });
});
