import { cn } from '../../lib/cn';
import { EyeOff } from './icons';

/**
 * RedactionNotice — Addendum 1 rule 5. Privacy is demonstrated, not claimed.
 *
 * It reports how many identifiers were hidden in the browser before anything
 * left the device, and it always carries the caveat: patterns can miss things.
 * With a count of zero it says so plainly rather than going quiet, because
 * "nothing matched" is itself information the user should have.
 *
 * It is a polite live region, so the count is announced when the redaction runs
 * without interrupting whatever the user is typing.
 */
export type RedactionNoticeProps = {
  /** How many identifiers were hidden. Zero is a valid, meaningful count. */
  count: number;
  className?: string;
};

export function RedactionNotice({
  count,
  className,
}: RedactionNoticeProps): JSX.Element {
  const safeCount = Math.max(0, Math.trunc(count));

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex items-start gap-2', className)}
    >
      <EyeOff className="mt-1 size-4 shrink-0 text-accent-text" />
      <p className="type-small text-text-muted">
        {safeCount > 0 ? (
          <>
            Harbour hid{' '}
            <strong className="text-text font-semibold">
              {safeCount} {safeCount === 1 ? 'identifier' : 'identifiers'}
            </strong>{' '}
            in your browser before anything was sent. Patterns can miss things,
            so read it over before you send it.
          </>
        ) : (
          <>
            Harbour found nothing to hide in this text. That does not mean it is
            free of personal details — patterns can miss things, so read it over
            before you send it.
          </>
        )}
      </p>
    </div>
  );
}
