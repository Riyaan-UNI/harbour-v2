import type { ElementType } from 'react';
import { cn } from '../../lib/cn';
import {
  createPolymorphicComponent,
  type PolymorphicProps,
  type PolymorphicRef,
} from './types';

/** The three text roles in spec §5. */
export type TextRole = 'body' | 'small' | 'label';

/** The three text tones in spec §3. */
export type TextTone = 'default' | 'muted' | 'subtle';

export type TextOwnProps = {
  /** Defaults to `body`. Body is capped at 65ch by the role itself. */
  role?: TextRole;
  /** Defaults to `default`. */
  tone?: TextTone;
};

const ROLE_CLASS: Record<TextRole, string> = {
  body: 'type-body',
  small: 'type-small',
  label: 'type-label',
};

const TONE_CLASS: Record<TextTone, string> = {
  default: 'text-text',
  muted: 'text-text-muted',
  subtle: 'text-text-subtle',
};

/**
 * Text — the only place a body, small or label size may be set.
 *
 * `role="label"` is Geist Mono, uppercase and tracked, per spec §5. `role="body"`
 * carries the 65ch measure.
 */
const TextImpl = <C extends ElementType = 'p'>(
  {
    as,
    role = 'body',
    tone = 'default',
    className,
    ...rest
  }: PolymorphicProps<C, TextOwnProps>,
  ref: PolymorphicRef<C>,
) => {
  const Component = (as ?? 'p') as ElementType;

  return (
    <Component
      ref={ref}
      className={cn(ROLE_CLASS[role], TONE_CLASS[tone], className)}
      {...rest}
    />
  );
};

export const Text = createPolymorphicComponent<'p', TextOwnProps>(TextImpl);
