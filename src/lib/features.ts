/**
 * Feature Flags
 *
 * Centralized feature toggles per abilitare/disabilitare gradualmente
 * le funzionalità dell'applicazione durante lo sviluppo.
 *
 * Usage:
 *   import { FEATURES } from '@/lib/features';
 *
 *   if (FEATURES.TASKS) {
 *     // Render task-related UI
 *   }
 */

export const FEATURES = {
  // Phase 1 - Core Entities
  TASKS: true, // ✅ Completato (CRUD + UI + Tests)
  EVENTS: true, // ✅ Completato (CRUD + UI + Tests)
  NOTES: true, // ✅ Completato (CRUD + UI + Tests + Bulk ops)
  PROJECTS: true, // ✅ Completato (CRUD + UI + Tests + Stats)

  // Phase 1 - Universal Features
  TAGS: true, // ✅ Completato (CRUD + UI + Integration)
  COMMENTS: true, // ✅ Completato (CRUD + UI + Nested replies)
  LINKS: true, // ✅ Completato (CRUD + UI + 8 relationship types)
  SEARCH: true, // ✅ Completato (Cmd+K command palette)

  // Phase 2
  COLLECTIONS: false, // 💭 Futuro

  // Phase 3
  ACTIVITY_LOG: false, // 💭 Futuro
  EXPORT_IMPORT: false, // 💭 Futuro

  // Phase 4
  SHARING: false, // 💭 Futuro

  // Phase 5
  AI_ASSISTANT: false, // 💭 Futuro

  // Phase 6
  FILE_UPLOADS: false, // 💭 Futuro
  API_WEBHOOKS: false, // 💭 Futuro
} as const;

/**
 * Type-safe feature flag keys
 */
export type FeatureFlag = keyof typeof FEATURES;

/**
 * Helper to check if a feature is enabled
 */
export function isFeatureEnabled(feature: FeatureFlag): boolean {
  return FEATURES[feature];
}
