import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { InfoCircle } from './icons';

/**
 * Disclaimer — the standing line that keeps a claim honest.
 *
 * The default text is the one spec §9 and Addendum 1 rule 7 require. Pass
 * `children` to narrow it (a rental result says "not legal advice" only), but
 * never to remove it: a tool that gives guidance keeps the line that says it is
 * guidance.
 */
const DEFAULT_TEXT =
  'General information, not legal, financial or medical advice. Harbour is not an emergency service, and it does not verify any listing, person or message.';

export type DisclaimerProps = HTMLAttributes<HTMLParagraphElement> & {
  children?: ReactNode;
};

export function Disclaimer({
  className,
  children,
  ...rest
}: DisclaimerProps): JSX.Element {
  return (
    <p
      className={cn(
        'type-small text-text-muted flex items-start gap-2',
        className,
      )}
      {...rest}
    >
      <InfoCircle className="mt-1 size-4 shrink-0" />
      <span>{children ?? DEFAULT_TEXT}</span>
    </p>
  );
}
