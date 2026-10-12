import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { fieldBase } from './field-base';

/**
 * Input — spec §8. 2.75rem tall, the strong glass fill, a hairline border.
 *
 * Label above and helper text below are the FormField's job; this is only the
 * control. States: hover, focus-visible, disabled and invalid (driven by
 * `aria-invalid`, so the visual and the semantic state cannot disagree).
 */
export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = 'text', ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(fieldBase, 'h-11', className)}
      {...rest}
    />
  );
});
