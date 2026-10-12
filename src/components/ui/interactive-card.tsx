import * as Dialog from '@radix-ui/react-dialog';
import { motion, useReducedMotion } from 'motion/react';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { Cluster, Heading, Stack, Text, type HeadingLevel } from '../layout';
import { Button } from './button';
import { Card } from './card';
import { CloseIcon } from './icons';

/**
 * InteractiveCard — spec §8's interactive card behaviour, complete.
 *
 * Four effects, each with the guard the spec asks for:
 *
 *   1. **Pointer spotlight.** `--mx` and `--my` are written on the card in a
 *      rAF-throttled `pointermove`, so a burst of pointer events costs one
 *      style write per frame rather than one per event. The gradient itself is
 *      CSS (`ui.css`), and its peak alpha is the solved `--spotlight-alpha`
 *      token rather than a number chosen here.
 *   2. **Tilt, at most `--tilt-max`.** Only while `(hover: hover) and
 *      (pointer: fine)` matches *and* motion is allowed — the component sets
 *      `data-tilt` from those two media queries, so a touch device and a
 *      reduced-motion user never get the 3D transform at all.
 *   3. **Expand in place.** Supplying `details` makes the card expandable. The
 *      trigger is a real `<button>` filling the card, so a tap expands it and
 *      nothing depends on hover; the panel is a Radix dialog, which brings the
 *      focus trap, `Esc`, the scroll lock and the focus restore with it. Motion's
 *      `layoutId` is what makes it read as the same object growing rather than a
 *      second card appearing.
 *   4. **Focus mirrors hover.** The lift, the border and the spotlight are all
 *      on `:hover` *and* `:focus-within`, so tabbing to the trigger looks
 *      exactly like pointing at the card.
 *
 * Reduced motion keeps every state and drops every transition: no tilt, no
 * morph, and the spotlight still follows the pointer because it is a gradient
 * position, not an animation.
 */
export type InteractiveCardProps = {
  /** The card's heading, and the expand trigger's accessible name. */
  title: string;
  /** Heading rank. Decoupled from size. Defaults to 3. */
  level?: HeadingLevel;
  /** A line under the title. */
  description?: ReactNode;
  /** The front of the card. Always visible. */
  children?: ReactNode;
  /** Revealed on expand. Supplying it is what makes the card expandable. */
  details?: ReactNode;
  /** The foot of the card — a Chip, a hint, a Button. */
  footer?: ReactNode;
  className?: string;
};

/** Used only if the token cannot be read; the token is the source of truth. */
const FALLBACK_TILT_MAX = 6;

/** Reads `--tilt-max` once, so the cap exists in exactly one place. */
function readTiltMax(): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--tilt-max')
    .trim();
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : FALLBACK_TILT_MAX;
}

/**
 * True only when a tilt is both possible and welcome: a device with real hover
 * and a fine pointer, and a user who has not asked for reduced motion.
 */
function useTiltEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = (): void => {
      setEnabled(fine.matches && !reduced.matches);
    };

    update();
    fine.addEventListener('change', update);
    reduced.addEventListener('change', update);
    return () => {
      fine.removeEventListener('change', update);
      reduced.removeEventListener('change', update);
    };
  }, []);

  return enabled;
}

export function InteractiveCard({
  title,
  level = 3,
  description,
  children,
  details,
  footer,
  className,
}: InteractiveCardProps): JSX.Element {
  const expandable = details !== undefined && details !== null;
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion() === true;
  const tiltEnabled = useTiltEnabled();

  const surface = useRef<HTMLDivElement>(null);
  const hitArea = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const point = useRef({ x: 0, y: 0 });
  const tiltMax = useRef(FALLBACK_TILT_MAX);

  // `layoutId` must be stable and unique per card, so two cards never share a
  // morph. React's `useId` is already unique and stable across a re-render.
  const layoutId = useId();
  const panelTitleId = `${layoutId}-panel-title`;

  useEffect(() => {
    tiltMax.current = readTiltMax();
  }, []);

  // A pending frame must not outlive the card.
  useEffect(
    () => () => {
      if (frame.current !== 0) cancelAnimationFrame(frame.current);
    },
    [],
  );

  const trackPointer = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      point.current = { x: event.clientX, y: event.clientY };
      if (frame.current !== 0) return;

      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        const element = surface.current;
        const area = hitArea.current;
        if (!element || !area) return;

        // Measured from the wrapper, never from the card: the card lifts and
        // tilts, and measuring a moving box would make the spotlight crawl.
        const rect = area.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const nx = (point.current.x - rect.left) / rect.width;
        const ny = (point.current.y - rect.top) / rect.height;

        element.style.setProperty('--mx', `${(nx * 100).toFixed(2)}%`);
        element.style.setProperty('--my', `${(ny * 100).toFixed(2)}%`);

        if (!tiltEnabled) return;
        const max = tiltMax.current;
        element.style.setProperty(
          '--tilt-y',
          `${((nx - 0.5) * 2 * max).toFixed(2)}deg`,
        );
        element.style.setProperty(
          '--tilt-x',
          `${((0.5 - ny) * 2 * max).toFixed(2)}deg`,
        );
      });
    },
    [tiltEnabled],
  );

  /** Level the card, but leave the spotlight where it was — it only fades. */
  const levelCard = useCallback(() => {
    const element = surface.current;
    if (!element) return;
    element.style.setProperty('--tilt-x', '0deg');
    element.style.setProperty('--tilt-y', '0deg');
  }, []);

  const heading = (
    <Stack gap={2}>
      <Heading level={level}>{title}</Heading>
      {description ? (
        <Text role="small" tone="muted">
          {description}
        </Text>
      ) : null}
    </Stack>
  );

  const body = children ? <Stack gap={4}>{children}</Stack> : null;
  const foot = footer ? <Cluster gap={3}>{footer}</Cluster> : null;

  const shared = {
    ref: surface,
    variant: 'interactive' as const,
    padded: false,
    className,
    'data-tilt': tiltEnabled ? ('true' as const) : undefined,
    'data-expandable': expandable ? ('true' as const) : ('false' as const),
    'data-state': open ? ('expanded' as const) : ('collapsed' as const),
  };

  /**
   * The pointer handlers sit on this wrapper, not on the card.
   *
   * The card lifts and rotates, so its own box moves under the pointer — and a
   * pointer sitting a few pixels inside an edge can end up outside the card the
   * moment it tilts, which fires `pointerleave`, which levels the card, which
   * puts the pointer back inside. The result is a flicker at the edges. The
   * wrapper is never transformed, so its hit area is stable, and because the
   * card is its descendant `:hover` on the wrapper survives the lift.
   */
  const wrapper = (card: ReactNode): JSX.Element => (
    <div
      ref={hitArea}
      className="ui-card-hit min-w-0"
      onPointerMove={trackPointer}
      onPointerLeave={levelCard}
    >
      {card}
    </div>
  );

  if (!expandable) {
    return wrapper(
      <Card {...shared}>
        <div className="relative flex flex-col gap-6 p-6">
          {heading}
          {body}
          {foot}
        </div>
      </Card>,
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {wrapper(
        <Card {...shared}>
          <motion.div
            layoutId={reduceMotion ? undefined : layoutId}
            className="relative flex flex-col gap-6 p-6"
          >
            {heading}
            {body}
            {foot}
          </motion.div>

          {/* Last in the tree, so it paints above the content and takes the
              click — the content stays readable underneath it. */}
          <Dialog.Trigger asChild>
            <button
              type="button"
              className="ui-card__trigger"
              aria-label={title}
            />
          </Dialog.Trigger>
        </Card>,
      )}

      <Dialog.Portal>
        <Dialog.Overlay className="ui-overlay fixed inset-0 z-modal" />
        <div className="pointer-events-none fixed inset-0 z-modal grid place-items-center p-4">
          <Dialog.Content asChild aria-describedby={undefined}>
            <motion.div
              layoutId={reduceMotion ? undefined : layoutId}
              className="ui-card__panel glass pointer-events-auto"
            >
              <div className="flex flex-col gap-6 p-6">
                <Stack gap={2}>
                  <Dialog.Title asChild>
                    <Heading level={level} id={panelTitleId}>
                      {title}
                    </Heading>
                  </Dialog.Title>
                  {description ? (
                    <Text role="small" tone="muted">
                      {description}
                    </Text>
                  ) : null}
                </Stack>

                {body}
                {details ? <Stack gap={4}>{details}</Stack> : null}
                {foot}

                <Dialog.Close asChild>
                  <Button variant="secondary" size="small">
                    <CloseIcon />
                    Close
                  </Button>
                </Dialog.Close>
              </div>
            </motion.div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
