import { describe, it, expect } from "vitest";
import {
  createNoteSchema,
  updateNoteSchema,
  noteFilterSchema,
  bulkNoteOperationSchema,
  noteTypeSchema,
} from "./schema";

/**
 * Note Schema Validation Tests
 *
 * Tests Zod schemas for:
 * - createNoteSchema: Note creation validation
 * - updateNoteSchema: Note update validation
 * - noteFilterSchema: Query filters validation
 * - bulkNoteOperationSchema: Bulk operations validation
 * - noteTypeSchema: Note type enum validation
 */

describe("Note Schemas", () => {
  // ============================================================================
  // CREATE NOTE SCHEMA
  // ============================================================================

  describe("createNoteSchema", () => {
    it("should accept valid note with title and content", () => {
      const validData = {
        title: "Meeting Notes",
        content: "This is the content of my note",
      };

      const result = createNoteSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept note with only title", () => {
      const validData = { title: "Just a title" };

      const result = createNoteSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept note with only content", () => {
      const validData = { content: "Just content without title" };

      const result = createNoteSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject note without title and content", () => {
      const invalidData = {};

      const result = createNoteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject note with empty title and empty content", () => {
      const invalidData = { title: "", content: "" };

      const result = createNoteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should trim whitespace from title", () => {
      const data = { title: "  Note with spaces  " };

      const result = createNoteSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Note with spaces");
      }
    });

    it("should reject title longer than 500 characters", () => {
      const invalidData = {
        title: "a".repeat(501),
        content: "Some content",
      };

      const result = createNoteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject content longer than 100,000 characters", () => {
      const invalidData = {
        title: "Test",
        content: "a".repeat(100001),
      };

      const result = createNoteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept valid UUID for projectId", () => {
      const validData = {
        title: "Test",
        projectId: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = createNoteSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID for projectId", () => {
      const invalidData = {
        title: "Test",
        projectId: "not-a-uuid",
      };

      const result = createNoteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept valid UUID for parentNoteId", () => {
      const validData = {
        title: "Test",
        parentNoteId: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = createNoteSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID for parentNoteId", () => {
      const invalidData = {
        title: "Test",
        parentNoteId: "not-a-uuid",
      };

      const result = createNoteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept null values for optional fields", () => {
      const validData = {
        title: "Test",
        content: null,
        projectId: null,
        parentNoteId: null,
      };

      const result = createNoteSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // UPDATE NOTE SCHEMA
  // ============================================================================

  describe("updateNoteSchema", () => {
    it("should accept partial updates", () => {
      const validData = { title: "Updated Title" };

      const result = updateNoteSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept updating only content", () => {
      const validData = { content: "Updated content" };

      const result = updateNoteSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept empty object (no updates)", () => {
      const validData = {};

      const result = updateNoteSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should still validate title if provided", () => {
      const invalidData = { title: "a".repeat(501) };

      const result = updateNoteSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept updating isFavorite", () => {
      const validData = { isFavorite: true };

      const result = updateNoteSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept updating type", () => {
      const validData = { type: "document" };

      const result = updateNoteSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // NOTE FILTER SCHEMA
  // ============================================================================

  describe("noteFilterSchema", () => {
    it("should accept valid filters", () => {
      const validData = {
        type: "document",
        isFavorite: true,
        search: "meeting",
        limit: 50,
        offset: 0,
        sortBy: "updatedAt",
        sortOrder: "desc",
      };

      const result = noteFilterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept empty filters", () => {
      const validData = {};

      const result = noteFilterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should apply default values", () => {
      const validData = {};

      const result = noteFilterSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
        expect(result.data.offset).toBe(0);
        expect(result.data.sortBy).toBe("updatedAt");
        expect(result.data.sortOrder).toBe("desc");
      }
    });

    it("should reject limit greater than 100", () => {
      const invalidData = { limit: 101 };

      const result = noteFilterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject negative offset", () => {
      const invalidData = { offset: -1 };

      const result = noteFilterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject search longer than 500 chars", () => {
      const invalidData = { search: "a".repeat(501) };

      const result = noteFilterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept valid note types", () => {
      const types = ["note", "document", "research", "idea", "snippet"];

      types.forEach((type) => {
        const result = noteFilterSchema.safeParse({ type });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid note type", () => {
      const invalidData = { type: "invalid-type" };

      const result = noteFilterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept valid sortBy values", () => {
      const sortByValues = ["createdAt", "updatedAt", "title"];

      sortByValues.forEach((sortBy) => {
        const result = noteFilterSchema.safeParse({ sortBy });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid sortBy value", () => {
      const invalidData = { sortBy: "invalidField" };

      const result = noteFilterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept parentNoteId as null", () => {
      const validData = { parentNoteId: null };

      const result = noteFilterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // BULK NOTE OPERATION SCHEMA
  // ============================================================================

  describe("bulkNoteOperationSchema", () => {
    it("should accept valid bulk delete operation", () => {
      const validData = {
        noteIds: ["123e4567-e89b-12d3-a456-426614174000", "123e4567-e89b-12d3-a456-426614174001"],
        operation: "delete",
      };

      const result = bulkNoteOperationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept favorite operation", () => {
      const validData = {
        noteIds: ["123e4567-e89b-12d3-a456-426614174000"],
        operation: "favorite",
      };

      const result = bulkNoteOperationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept updateType with type field", () => {
      const validData = {
        noteIds: ["123e4567-e89b-12d3-a456-426614174000"],
        operation: "updateType",
        type: "document",
      };

      const result = bulkNoteOperationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept moveToProject with projectId", () => {
      const validData = {
        noteIds: ["123e4567-e89b-12d3-a456-426614174000"],
        operation: "moveToProject",
        projectId: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = bulkNoteOperationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty noteIds array", () => {
      const invalidData = {
        noteIds: [],
        operation: "delete",
      };

      const result = bulkNoteOperationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid UUIDs in noteIds", () => {
      const invalidData = {
        noteIds: ["not-a-uuid"],
        operation: "delete",
      };

      const result = bulkNoteOperationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid operation", () => {
      const invalidData = {
        noteIds: ["123e4567-e89b-12d3-a456-426614174000"],
        operation: "invalidOperation",
      };

      const result = bulkNoteOperationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // ============================================================================
  // ENUM SCHEMAS
  // ============================================================================

  describe("noteTypeSchema", () => {
    it("should accept valid note type values", () => {
      const validTypes = ["note", "document", "research", "idea", "snippet"];

      validTypes.forEach((type) => {
        const result = noteTypeSchema.safeParse(type);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid note type", () => {
      const result = noteTypeSchema.safeParse("invalid_type");
      expect(result.success).toBe(false);
    });
  });
});
