import { describe, it, expect } from "vitest";
import {
  createTaskSchema,
  updateTaskSchema,
  taskFilterSchema,
  bulkTaskOperationSchema,
  taskStatusSchema,
  taskPrioritySchema,
} from "./schema";

/**
 * Task Schema Validation Tests
 *
 * Tests Zod schemas for:
 * - createTaskSchema: Task creation validation
 * - updateTaskSchema: Task update validation
 * - taskFilterSchema: Query filters validation
 * - bulkTaskOperationSchema: Bulk operations validation
 * - Enums: status and priority validation
 */

describe("Task Schemas", () => {
  // ============================================================================
  // CREATE TASK SCHEMA
  // ============================================================================

  describe("createTaskSchema", () => {
    it("should accept valid task with all fields", () => {
      const validData = {
        title: "Test Task",
        description: "This is a test task",
        dueDate: new Date("2025-12-31"),
        startDate: new Date("2025-01-01"),
        duration: 60,
        priority: "high",
        projectId: "123e4567-e89b-12d3-a456-426614174000",
        parentTaskId: "123e4567-e89b-12d3-a456-426614174001",
      };

      const result = createTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept task with only title (minimal)", () => {
      const validData = { title: "Minimal Task" };

      const result = createTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject task without title", () => {
      const invalidData = { description: "No title provided" };

      const result = createTaskSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("title");
      }
    });

    it("should reject empty title", () => {
      const invalidData = { title: "" };

      const result = createTaskSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject title longer than 255 characters", () => {
      const invalidData = { title: "a".repeat(256) };

      const result = createTaskSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should trim whitespace from title", () => {
      const data = { title: "  Task with spaces  " };

      const result = createTaskSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Task with spaces");
      }
    });

    it("should reject description longer than 5000 characters", () => {
      const invalidData = {
        title: "Test",
        description: "a".repeat(5001),
      };

      const result = createTaskSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept valid priority values", () => {
      const priorities = ["low", "medium", "high", "urgent"];

      priorities.forEach((priority) => {
        const result = createTaskSchema.safeParse({ title: "Test", priority });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid priority", () => {
      const invalidData = { title: "Test", priority: "super-urgent" };

      const result = createTaskSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept valid UUID for projectId", () => {
      const validData = {
        title: "Test",
        projectId: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = createTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID for projectId", () => {
      const invalidData = {
        title: "Test",
        projectId: "not-a-uuid",
      };

      const result = createTaskSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject duration less than 1", () => {
      const invalidData = {
        title: "Test",
        duration: 0,
      };

      const result = createTaskSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept null values for optional fields", () => {
      const validData = {
        title: "Test",
        description: null,
        dueDate: null,
        priority: null,
        projectId: null,
      };

      const result = createTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // UPDATE TASK SCHEMA
  // ============================================================================

  describe("updateTaskSchema", () => {
    it("should accept partial updates", () => {
      const validData = { title: "Updated Title" };

      const result = updateTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept updating only status", () => {
      const validData = { status: "done" };

      const result = updateTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept empty object (no updates)", () => {
      const validData = {};

      const result = updateTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should still validate title if provided", () => {
      const invalidData = { title: "a".repeat(256) };

      const result = updateTaskSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // ============================================================================
  // TASK FILTER SCHEMA
  // ============================================================================

  describe("taskFilterSchema", () => {
    it("should accept valid filters", () => {
      const validData = {
        status: "todo",
        priority: "high",
        search: "important",
        limit: 50,
        offset: 0,
        sortBy: "dueDate",
        sortOrder: "asc",
      };

      const result = taskFilterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept empty filters", () => {
      const validData = {};

      const result = taskFilterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should apply default values", () => {
      const validData = {};

      const result = taskFilterSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
        expect(result.data.offset).toBe(0);
        expect(result.data.sortBy).toBe("createdAt");
        expect(result.data.sortOrder).toBe("desc");
      }
    });

    it("should reject limit greater than 100", () => {
      const invalidData = { limit: 101 };

      const result = taskFilterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject negative offset", () => {
      const invalidData = { offset: -1 };

      const result = taskFilterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept valid date ranges", () => {
      const validData = {
        dueDateFrom: new Date("2025-01-01"),
        dueDateTo: new Date("2025-12-31"),
      };

      const result = taskFilterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject search longer than 500 chars", () => {
      const invalidData = { search: "a".repeat(501) };

      const result = taskFilterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // ============================================================================
  // BULK TASK OPERATION SCHEMA
  // ============================================================================

  describe("bulkTaskOperationSchema", () => {
    it("should accept valid bulk delete operation", () => {
      const validData = {
        taskIds: ["123e4567-e89b-12d3-a456-426614174000", "123e4567-e89b-12d3-a456-426614174001"],
        operation: "delete",
      };

      const result = bulkTaskOperationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept updateStatus with status field", () => {
      const validData = {
        taskIds: ["123e4567-e89b-12d3-a456-426614174000"],
        operation: "updateStatus",
        status: "done",
      };

      const result = bulkTaskOperationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept updatePriority with priority field", () => {
      const validData = {
        taskIds: ["123e4567-e89b-12d3-a456-426614174000"],
        operation: "updatePriority",
        priority: "urgent",
      };

      const result = bulkTaskOperationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty taskIds array", () => {
      const invalidData = {
        taskIds: [],
        operation: "delete",
      };

      const result = bulkTaskOperationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid UUIDs in taskIds", () => {
      const invalidData = {
        taskIds: ["not-a-uuid"],
        operation: "delete",
      };

      const result = bulkTaskOperationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid operation", () => {
      const invalidData = {
        taskIds: ["123e4567-e89b-12d3-a456-426614174000"],
        operation: "invalidOperation",
      };

      const result = bulkTaskOperationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // ============================================================================
  // ENUM SCHEMAS
  // ============================================================================

  describe("taskStatusSchema", () => {
    it("should accept valid status values", () => {
      const validStatuses = ["todo", "in_progress", "done", "cancelled"];

      validStatuses.forEach((status) => {
        const result = taskStatusSchema.safeParse(status);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid status", () => {
      const result = taskStatusSchema.safeParse("invalid_status");
      expect(result.success).toBe(false);
    });
  });

  describe("taskPrioritySchema", () => {
    it("should accept valid priority values", () => {
      const validPriorities = ["low", "medium", "high", "urgent"];

      validPriorities.forEach((priority) => {
        const result = taskPrioritySchema.safeParse(priority);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid priority", () => {
      const result = taskPrioritySchema.safeParse("critical");
      expect(result.success).toBe(false);
    });
  });
});
