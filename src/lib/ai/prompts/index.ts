/**
 * AI Prompt System
 *
 * Modular prompt builder for the AI assistant.
 *
 * @example
 * ```ts
 * import { buildSystemPrompt, createTemporalContext, getUserStats } from "@/lib/ai/prompts";
 *
 * const prompt = buildSystemPrompt({
 *   user: { id: "123", name: "Mario" },
 *   temporal: createTemporalContext(),
 *   stats: await getUserStats(userId),
 * });
 * ```
 */

// Main exports
export { buildSystemPrompt, buildSimpleSystemPrompt, createTemporalContext } from "./builder";
export { getUserStats } from "./stats";

// Types
export type {
  PromptContext,
  UserContext,
  UserStats,
  TemporalContext,
  ConversationContext,
  PromptSection,
  PromptBuilderOptions,
} from "./types";

// Section builders (for advanced customization)
export {
  buildIdentitySection,
  buildContextSection,
  buildRulesSection,
  buildToolsSection,
  buildDatesSection,
  buildExamplesSection,
  buildConversationSection,
  buildFormattingSection,
  buildGuidelinesSection,
} from "./sections";
