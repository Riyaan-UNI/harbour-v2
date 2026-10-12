import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { fieldBase } from './field-base';

/**
 * Textarea — spec §8, the Input's multi-line sibling.
 *
 * Same fill, hairline and states; the height is a minimum rather than a fixed
 * 2.75rem, and it grows with its content.
 */
export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, rows = 4, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(fieldBase, 'min-h-24 py-3', className)}
        {...rest}
      />
    );
  },
);
