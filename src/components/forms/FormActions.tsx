import { Button } from "@/components/ui/button";

interface FormActionsProps {
  /**
   * Whether the form is currently submitting
   */
  isSubmitting: boolean;

  /**
   * Form mode - determines the submit button label
   */
  mode: "create" | "edit";

  /**
   * Callback when cancel button is clicked
   */
  onCancel: () => void;

  /**
   * Optional custom submit button label
   * If not provided, defaults based on mode:
   * - create: "Create {Entity}"
   * - edit: "Save Changes"
   */
  submitLabel?: string;

  /**
   * Optional custom cancel button label
   * Defaults to "Cancel"
   */
  cancelLabel?: string;
}

/**
 * Reusable form action buttons component.
 *
 * Provides consistent Cancel and Submit buttons for all forms
 * with appropriate loading states and labels.
 *
 * @example
 * ```tsx
 * <form onSubmit={onSubmit}>
 *   {/* form fields *\/}
 *   <FormActions
 *     isSubmitting={isSubmitting}
 *     mode="create"
 *     onCancel={() => router.back()}
 *     submitLabel="Create Task"
 *   />
 * </form>
 * ```
 */
export function FormActions({
  isSubmitting,
  mode,
  onCancel,
  submitLabel,
  cancelLabel = "Cancel",
}: FormActionsProps) {
  const defaultSubmitLabel = mode === "create" ? "Create" : "Save Changes";
  const submittingLabel = "Saving...";

  return (
    <div className="flex gap-2 justify-end pt-4">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {cancelLabel}
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? submittingLabel : submitLabel || defaultSubmitLabel}
      </Button>
    </div>
  );
}
