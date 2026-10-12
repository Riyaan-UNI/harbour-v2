import type { CSSProperties } from 'react';
import { Toaster as SonnerToaster } from 'sonner';
import { useResolvedTheme } from '../../theme/useTheme';

/**
 * Toast — spec §8: Sonner, themed with tokens, a 4s duration, polite
 * `aria-live`.
 *
 * Sonner ships a light and a dark palette of its own. Rather than let it
 * repaint the UI, its CSS variables are pointed at Harbour tokens inline, which
 * is the one place that beats Sonner's own attribute-selector rules. The toast
 * surface is therefore `--bg-elevated` with `--text` on it in both themes, and
 * a success or error toast only recolours the icon, never the text.
 *
 * Sonner renders a polite live region by default (`role="status"` for a normal
 * toast), which is what the spec asks for; errors keep Sonner's `role="alert"`,
 * because a failure that changes what you can do next is worth interrupting for.
 *
 * `toast` itself is re-exported from the barrel in `index.ts`, so callers
 * import everything from one place.
 */

const TOAST_STYLE: CSSProperties = {
  '--normal-bg': 'var(--bg-elevated)',
  '--normal-text': 'var(--text)',
  '--normal-border': 'var(--border)',
  '--success-bg': 'var(--bg-elevated)',
  '--success-text': 'var(--success)',
  '--success-border': 'var(--border)',
  '--error-bg': 'var(--bg-elevated)',
  '--error-text': 'var(--danger)',
  '--error-border': 'var(--border)',
  '--border-radius': 'var(--radius-md)',
  '--width': '22rem',
} as CSSProperties;

export function Toaster(): JSX.Element {
  const theme = useResolvedTheme();

  return (
    <SonnerToaster
      theme={theme}
      position="bottom-center"
      duration={4000}
      closeButton
      containerAriaLabel="Notifications"
      style={TOAST_STYLE}
      toastOptions={{
        classNames: {
          title: 'type-small text-text',
          description: 'type-small text-text-muted',
          actionButton: 'type-small',
          cancelButton: 'type-small',
          closeButton: 'text-text-muted',
        },
      }}
    />
  );
}
