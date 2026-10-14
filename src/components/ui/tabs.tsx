import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { tabVariants } from './tabs-variants';

/**
 * Tabs — Brick 2b's tab set, hand-rolled.
 *
 * There is no tab library in the dependency list and `sheet.tsx` already set
 * the precedent: when a component's behaviour is well-specified (ARIA's tab
 * pattern is, exactly), hand-writing beats adding a dependency for one
 * consumer. Scam Shield's X-ray/Drill switch is that first consumer.
 *
 * What the ARIA pattern requires and this implements:
 *
 *   - Roving tabindex: only the selected tab is in the page's tab order
 *     (`tabIndex=0`), the rest are reachable with the arrow keys.
 *   - ArrowLeft / ArrowRight move and **activate** (automatic activation —
 *     correct for tabs whose panels are always in the DOM, cheap to swap).
 *     Home / End jump to the first / last. Movement wraps at both ends.
 *   - `aria-selected`, `aria-controls` and `aria-labelledby` wire each tab to
 *     its panel; the ids come from `useId`, so two Tabs on one page cannot
 *     collide.
 *   - Panels stay **mounted**, `hidden` when inactive. That is deliberate: a
 *     drill in progress or a message half-typed must survive a tab switch.
 *
 * The Tabs root renders no DOM — it is context only, so the page owns the
 * layout around the list and the panels. It is fully controlled: the caller
 * holds `value` and `onValueChange`, which is what lets the page's own CTAs
 * ("practise a scam") switch tabs.
 */

type TabsContextValue = {
  baseId: string;
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`<${component}> must be used inside <Tabs>`);
  }
  return context;
}

export type TabsProps = {
  /** The selected tab's value. */
  value: string;
  /** Called with the next value when a tab is activated. */
  onValueChange: (value: string) => void;
  children: ReactNode;
};

export function Tabs({
  value,
  onValueChange,
  children,
}: TabsProps): JSX.Element {
  const baseId = useId();
  const context = useMemo(
    () => ({ baseId, value, setValue: onValueChange }),
    [baseId, value, onValueChange],
  );
  return <TabsContext.Provider value={context}>{children}</TabsContext.Provider>;
}

export type TabsListProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'onChange' | 'onKeyDown'
> & {
  /** The row's accessible name — required, it is what names the group. */
  'aria-label': string;
  /** Called after the pattern's own key handling, if the page needs it. */
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
};

export function TabsList({
  className,
  children,
  onKeyDown,
  ...rest
}: TabsListProps): JSX.Element {
  // `value` is deliberately not read here: the active tab is found through
  // the DOM (the focused trigger), which is what the arrow keys move from.
  const { setValue } = useTabsContext('TabsList');

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>): void => {
      const tabs = Array.from(
        event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
      );
      if (tabs.length === 0) return;
      const current = tabs.findIndex((tab) => tab === document.activeElement);
      if (current === -1) return;

      // Movement wraps: past the last tab comes the first, per the ARIA
      // authoring practices for automatically activated tabs.
      let next = -1;
      if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      if (next === -1) return;

      event.preventDefault();
      const target = tabs[next];
      if (!target) return;
      target.focus();
      // `data-value`, not `target.value`: the trigger's `value` prop is
      // destructured out of the DOM props on purpose (a button's own `value`
      // is form data), so the DOM element carries none — reading it activated
      // the tab with an empty string.
      const nextValue = target.dataset.value;
      if (nextValue) setValue(nextValue);
    },
    [setValue],
  );

  return (
    <div
      role="tablist"
      className={cn('ui-tabs__list flex flex-wrap gap-2', className)}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        handleKeyDown(event);
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export type TabsTriggerProps = ComponentPropsWithoutRef<'button'> & {
  /** This tab's value — matches the `Tabs` `value` when selected. */
  value: string;
};

export function TabsTrigger({
  value,
  className,
  children,
  ...rest
}: TabsTriggerProps): JSX.Element {
  const { baseId, value: activeValue, setValue } = useTabsContext('TabsTrigger');
  const selected = value === activeValue;

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      data-value={value}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      data-state={selected ? 'active' : 'inactive'}
      className={cn(tabVariants({ selected }), className)}
      onClick={() => setValue(value)}
      {...rest}
    >
      {children}
    </button>
  );
}

export type TabsPanelProps = ComponentPropsWithoutRef<'div'> & {
  /** The tab value this panel belongs to. */
  value: string;
};

export function TabsPanel({
  value,
  className,
  children,
  ...rest
}: TabsPanelProps): JSX.Element {
  const { baseId, value: activeValue } = useTabsContext('TabsPanel');
  const selected = value === activeValue;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      hidden={!selected}
      // No tabIndex: the ARIA practices give the panel a tab stop only when
      // it contains no focusable elements, and both Scam Shield panels do.
      className={cn('ui-tabs__panel', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
