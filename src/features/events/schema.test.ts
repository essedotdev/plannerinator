import { describe, it, expect } from "vitest";
import {
  createEventSchema,
  updateEventSchema,
  eventFilterSchema,
  eventCalendarTypeSchema,
} from "./schema";

/**
 * Event Schema Validation Tests
 *
 * Tests Zod schemas for:
 * - createEventSchema: Event creation validation
 * - updateEventSchema: Event update validation
 * - eventFilterSchema: Query filters validation
 * - eventCalendarTypeSchema: Calendar type enum validation
 */

describe("Event Schemas", () => {
  // ============================================================================
  // CREATE EVENT SCHEMA
  // ============================================================================

  describe("createEventSchema", () => {
    it("should accept valid event with all fields", () => {
      const validData = {
        title: "Team Meeting",
        description: "Weekly sync with the team",
        startTime: new Date("2025-12-31T10:00:00"),
        endTime: new Date("2025-12-31T11:00:00"),
        location: "Conference Room A",
        locationUrl: "https://maps.google.com/conference-a",
        projectId: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = createEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept event with only required fields (title + startTime)", () => {
      const validData = {
        title: "Quick Meeting",
        startTime: new Date("2025-12-31T10:00:00"),
      };

      const result = createEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject event without title", () => {
      const invalidData = {
        startTime: new Date("2025-12-31T10:00:00"),
        description: "No title provided",
      };

      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("title");
      }
    });

    it("should reject event without startTime", () => {
      const invalidData = {
        title: "Meeting",
        description: "No start time",
      };

      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("startTime");
      }
    });

    it("should reject empty title", () => {
      const invalidData = {
        title: "",
        startTime: new Date("2025-12-31T10:00:00"),
      };

      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject title longer than 255 characters", () => {
      const invalidData = {
        title: "a".repeat(256),
        startTime: new Date("2025-12-31T10:00:00"),
      };

      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should trim whitespace from title", () => {
      const data = {
        title: "  Meeting with spaces  ",
        startTime: new Date("2025-12-31T10:00:00"),
      };

      const result = createEventSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Meeting with spaces");
      }
    });

    it("should reject description longer than 5000 characters", () => {
      const invalidData = {
        title: "Test Event",
        startTime: new Date("2025-12-31T10:00:00"),
        description: "a".repeat(5001),
      };

      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject endTime before startTime", () => {
      const invalidData = {
        title: "Test Event",
        startTime: new Date("2025-12-31T11:00:00"),
        endTime: new Date("2025-12-31T10:00:00"),
      };

      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("endTime");
      }
    });

    it("should accept endTime after startTime", () => {
      const validData = {
        title: "Test Event",
        startTime: new Date("2025-12-31T10:00:00"),
        endTime: new Date("2025-12-31T11:00:00"),
      };

      const result = createEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept valid UUID for projectId", () => {
      const validData = {
        title: "Test Event",
        startTime: new Date("2025-12-31T10:00:00"),
        projectId: "123e4567-e89b-12d3-a456-426614174000",
      };

      const result = createEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID for projectId", () => {
      const invalidData = {
        title: "Test Event",
        startTime: new Date("2025-12-31T10:00:00"),
        projectId: "not-a-uuid",
      };

      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid URL for locationUrl", () => {
      const invalidData = {
        title: "Test Event",
        startTime: new Date("2025-12-31T10:00:00"),
        locationUrl: "not a url",
      };

      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept valid URL for locationUrl", () => {
      const validData = {
        title: "Test Event",
        startTime: new Date("2025-12-31T10:00:00"),
        locationUrl: "https://maps.google.com/place",
      };

      const result = createEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept null values for optional fields", () => {
      const validData = {
        title: "Test Event",
        startTime: new Date("2025-12-31T10:00:00"),
        description: null,
        endTime: null,
        location: null,
        locationUrl: null,
        projectId: null,
      };

      const result = createEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject location longer than 500 characters", () => {
      const invalidData = {
        title: "Test Event",
        startTime: new Date("2025-12-31T10:00:00"),
        location: "a".repeat(501),
      };

      const result = createEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // ============================================================================
  // UPDATE EVENT SCHEMA
  // ============================================================================

  describe("updateEventSchema", () => {
    it("should accept partial updates", () => {
      const validData = { title: "Updated Title" };

      const result = updateEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept updating only startTime", () => {
      const validData = { startTime: new Date("2025-12-31T14:00:00") };

      const result = updateEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept empty object (no updates)", () => {
      const validData = {};

      const result = updateEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should still validate title if provided", () => {
      const invalidData = { title: "a".repeat(256) };

      const result = updateEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject endTime before startTime when both provided", () => {
      const invalidData = {
        startTime: new Date("2025-12-31T11:00:00"),
        endTime: new Date("2025-12-31T10:00:00"),
      };

      const result = updateEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("endTime");
      }
    });

    it("should accept updating only endTime without validation error", () => {
      const validData = { endTime: new Date("2025-12-31T15:00:00") };

      const result = updateEventSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // EVENT FILTER SCHEMA
  // ============================================================================

  describe("eventFilterSchema", () => {
    it("should accept valid filters", () => {
      const validData = {
        calendarType: "work",
        allDay: true,
        search: "meeting",
        limit: 50,
        offset: 0,
        sortBy: "startTime",
        sortOrder: "asc",
      };

      const result = eventFilterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept empty filters", () => {
      const validData = {};

      const result = eventFilterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should apply default values", () => {
      const validData = {};

      const result = eventFilterSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
        expect(result.data.offset).toBe(0);
        expect(result.data.sortBy).toBe("startTime");
        expect(result.data.sortOrder).toBe("asc");
      }
    });

    it("should reject limit greater than 100", () => {
      const invalidData = { limit: 101 };

      const result = eventFilterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject negative offset", () => {
      const invalidData = { offset: -1 };

      const result = eventFilterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept valid date ranges", () => {
      const validData = {
        startTimeFrom: new Date("2025-01-01"),
        startTimeTo: new Date("2025-12-31"),
      };

      const result = eventFilterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject search longer than 500 chars", () => {
      const invalidData = { search: "a".repeat(501) };

      const result = eventFilterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept valid calendar types", () => {
      const types = ["personal", "work", "family", "other"];

      types.forEach((type) => {
        const result = eventFilterSchema.safeParse({ calendarType: type });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid calendar type", () => {
      const invalidData = { calendarType: "invalid-type" };

      const result = eventFilterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept valid sortBy values", () => {
      const sortByValues = ["createdAt", "startTime", "title"];

      sortByValues.forEach((sortBy) => {
        const result = eventFilterSchema.safeParse({ sortBy });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid sortBy value", () => {
      const invalidData = { sortBy: "invalidField" };

      const result = eventFilterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // ============================================================================
  // ENUM SCHEMAS
  // ============================================================================

  describe("eventCalendarTypeSchema", () => {
    it("should accept valid calendar type values", () => {
      const validTypes = ["personal", "work", "family", "other"];

      validTypes.forEach((type) => {
        const result = eventCalendarTypeSchema.safeParse(type);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid calendar type", () => {
      const result = eventCalendarTypeSchema.safeParse("invalid_type");
      expect(result.success).toBe(false);
    });
  });
});
