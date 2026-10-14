import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode, RefObject } from 'react';
import { Heading, VisuallyHidden } from '../layout';
import { Button } from './button';
import { CloseIcon } from './icons';

/**
 * Sheet — a panel that slides in from the inline end.
 *
 * Radix's Dialog underneath, which is what shadcn's Sheet is: the focus trap,
 * `Esc`, the scroll lock, the backdrop and the focus restore all come with it.
 * The slide and the fade are CSS keyframes keyed off the `data-state` Radix
 * puts on the element, so no animation library is involved and the global
 * reduced-motion rule turns them into instant state changes for free.
 *
 * Brick 3 uses it for the landing nav below 48em, where the link row becomes a
 * sheet of 2.75rem rows. It lives in `src/components/ui/` rather than the
 * landing folder because Brick 5's country picker wants it too.
 */
export type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The panel's accessible name. Visually hidden unless `showTitle`. */
  title: string;
  /** Show the title as a visible heading rather than a screen-reader-only one. */
  showTitle?: boolean;
  /**
   * Where focus goes when the sheet closes.
   *
   * Radix hands focus back to the `Dialog.Trigger`, and this sheet has none:
   * the control that opens it lives in the page's own markup, not inside the
   * dialog, so there is nothing for Radix to find and focus would fall to
   * `<body>`. The caller passes its trigger's ref instead. Without it the sheet
   * still opens and closes correctly — the only thing lost is where the
   * keyboard lands afterwards, which for a keyboard user is the whole point.
   */
  returnFocusTo?: RefObject<HTMLElement>;
  /** Optional styling hooks for a feature-specific theme. */
  className?: string;
  overlayClassName?: string;
  children: ReactNode;
};

export function Sheet({
  open,
  onOpenChange,
  title,
  showTitle = false,
  returnFocusTo,
  className,
  overlayClassName,
  children,
}: SheetProps): JSX.Element {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={`ui-overlay ui-sheet__overlay fixed inset-0 z-modal ${overlayClassName ?? ''}`}
        />
        <Dialog.Content
          asChild
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            const target = returnFocusTo?.current;
            if (!target) return;
            event.preventDefault();
            target.focus();
          }}
        >
          <div className={`ui-sheet glass ${className ?? ''}`}>
            <div className="flex flex-col gap-6 p-6">
              <div className="flex items-start justify-between gap-4">
                <Dialog.Title asChild>
                  {showTitle ? (
                    <Heading level={2}>{title}</Heading>
                  ) : (
                    <VisuallyHidden as="h2">{title}</VisuallyHidden>
                  )}
                </Dialog.Title>

                <Dialog.Close asChild>
                  <Button variant="secondary" size="small">
                    <CloseIcon />
                    Close
                  </Button>
                </Dialog.Close>
              </div>

              {children}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
