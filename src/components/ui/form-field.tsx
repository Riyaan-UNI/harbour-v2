import type { ReactNode } from 'react';
import { Stack, Text, VisuallyHidden } from '../layout';
import { AlertTriangle } from './icons';

/**
 * FormField — spec §8. A label above the control, helper text below it, and an
 * error below that with the danger token plus an icon.
 *
 * The control is a render prop rather than a child, so the field can hand it
 * the wiring it needs — a matching `id`, an `aria-describedby` that lists the
 * helper and the error, and `aria-invalid` when there is an error. The control
 * never has to know which of those exist:
 *
 *   <FormField id="nickname" label="What should we call you?" hint="…">
 *     {(props) => <Input {...props} />}
 *   </FormField>
 *
 * The error is text plus an icon, never colour alone (Addendum 1 rule 4), and
 * it is announced because it is in `aria-describedby`, not just shown.
 */

export type FormFieldControlProps = {
  id: string;
  required?: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
};

export type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: (props: FormFieldControlProps) => ReactNode;
};

export function FormField({
  id,
  label,
  hint,
  error,
  required = false,
  className,
  children,
}: FormFieldProps): JSX.Element {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') ||
    undefined;

  return (
    <Stack gap={2} className={className}>
      <label htmlFor={id} className="type-small text-text font-medium">
        {label}
        {required ? (
          <>
            <span className="text-danger" aria-hidden="true">
              {' *'}
            </span>
            <VisuallyHidden> (required)</VisuallyHidden>
          </>
        ) : null}
      </label>

      {children({
        id,
        required,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
      })}

      {hint ? (
        <Text as="p" id={hintId} role="small" tone="muted">
          {hint}
        </Text>
      ) : null}

      {error ? (
        <p id={errorId} className="type-small text-danger flex items-start gap-2">
          <AlertTriangle className="mt-1 size-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </Stack>
  );
}
