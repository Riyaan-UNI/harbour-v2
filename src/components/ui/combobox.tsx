import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { comboboxVariants } from './combobox-variants';
import { Check, ChevronDown, Search } from './icons';
import { fieldBase } from './field-base';

/**
 * Combobox — Brick 2b's searchable select, hand-rolled.
 *
 * The pattern: a trigger button (`role="combobox"`) opens a popover holding a
 * search input and a `role="listbox"` of `role="option"` rows. Typing filters
 * the rows by their label; ArrowUp/Down / Home / End move an active row,
 * Enter picks it, Escape closes and returns focus to the trigger.
 *
 * Everything is left to the browser that the browser can own — the trigger is
 * a real `<button>`, the rows are real `<button>`s (so a click, a tap and a
 * keyboard Enter hit the same handler), and the search box is a real
 * `<input type="text">`. ARIA is added only where it carries information the
 * DOM does not: which element is the listbox, what is selected, and which row
 * is currently active.
 *
 * Two things this file deliberately does NOT do:
 *
 *   - **No portal.** The popover renders in place, directly under the trigger,
 *     because the profile form has no clipping ancestor and an in-place
 *     popover keeps the tab order and the a11y tree honest. If a future caller
 *     nests it inside `overflow: hidden`, that caller adds the portal.
 *   - **No `useId`-in-a-selector.** `useId` values contain colons, so a DOM
 *     query built from one is invalid; active/selected state is compared as
 *     strings and, in tests, by role.
 *
 * The component is fully controlled: the caller holds `value` and gets
 * `onChange(next)`. It is presentational otherwise — it reads no store.
 */

export type ComboboxOption = {
  /** The stable value written on select (an ISO code, an id, a sentinel). */
  value: string;
  /** The plain-text label; the search filters on this. */
  label: string;
  /** Optional secondary line under the label (an acronym, a hint). */
  detail?: string;
};

export type ComboboxProps = {
  /** `id` for the trigger, so a `<label htmlFor>` points at it. */
  id?: string;
  /** The selected option's value, or `''` for nothing chosen. */
  value: string;
  /** Called with the next value when a row is picked, or `''` on clear. */
  onChange: (value: string) => void;
  /** The full option list. Filtering happens internally. */
  options: readonly ComboboxOption[];
  /** Shown on the trigger when nothing is selected. */
  placeholder: string;
  /** Placeholder for the popover's search box. */
  searchPlaceholder?: string;
  /** Shown when the filter matches nothing. */
  emptyLabel?: string;
  /** Accessible name for the popover's listbox, e.g. "Home country or region". */
  listLabel: string;
  /** Accessible name for the search box, e.g. "Search countries". */
  searchLabel: string;
  /** A leading mark per option — a flag, a crest, an avatar. */
  renderIcon?: (option: ComboboxOption) => ReactNode;
  /** Accessible name for the trigger when it is not a plain field label. */
  'aria-label'?: string;
  /** Passed through from `FormField`. */
  required?: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  className?: string;
};

export function Combobox({
  id,
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder = 'Search…',
  emptyLabel = 'No matches',
  listLabel,
  searchLabel,
  renderIcon,
  className,
  ...aria
}: ComboboxProps): JSX.Element {
  const baseId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) =>
      `${option.label} ${option.detail ?? ''}`.toLowerCase().includes(needle),
    );
  }, [options, query]);

  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number): string => `${baseId}-option-${index}`;

  const close = useCallback((returnFocus = true): void => {
    setOpen(false);
    setQuery('');
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  const openAndFocus = useCallback((): void => {
    setQuery('');
    // Start the active row on the current selection so Enter is a no-op, not
    // a surprise jump to the top of the list.
    const start = selected
      ? options.findIndex((option) => option.value === selected.value)
      : 0;
    setActiveIndex(start < 0 ? 0 : start);
    setOpen(true);
  }, [options, selected]);

  // Move focus into the search box once the popover is on screen.
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  // Outside press closes. `mousedown` (not `click`) so the popover is gone
  // before the press lands on whatever is beneath it.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      close(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open, close]);

  // Keep the active row scrolled into view as it moves.
  useEffect(() => {
    if (!open) return;
    const node = popoverRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );
    node?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const choose = useCallback(
    (next: string): void => {
      onChange(next);
      close();
    },
    [onChange, close],
  );

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, matches.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(Math.max(matches.length - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = matches[activeIndex];
      if (option) choose(option.value);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      close(false);
    }
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openAndFocus();
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      close();
    }
  };

  return (
    <div className={cn('ui-combobox relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-invalid={aria['aria-invalid']}
        aria-describedby={aria['aria-describedby']}
        aria-required={aria.required || undefined}
        aria-label={aria['aria-label']}
        data-state={open ? 'open' : 'closed'}
        className={cn(
          comboboxVariants({ open }),
          'h-11 ui-combobox__trigger',
        )}
        onClick={() => (open ? close() : openAndFocus())}
        onKeyDown={handleTriggerKeyDown}
      >
        {selected && renderIcon ? (
          <span className="ui-combobox__mark" aria-hidden="true">
            {renderIcon(selected)}
          </span>
        ) : null}
        <span
          className={cn(
            'ui-combobox__label flex-1 truncate',
            selected ? 'text-text' : 'text-text-subtle',
          )}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'ui-combobox__chevron size-4 shrink-0 text-text-muted transition-transform duration-fast',
            open && 'rotate-180',
          )}
        />
      </button>

      {open ? (
        <div ref={popoverRef} className="ui-combobox__popover">
          <div className="ui-combobox__search">
            <Search className="ui-combobox__search-icon size-4" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholder}
              aria-label={searchLabel}
              aria-controls={listboxId}
              aria-activedescendant={
                matches.length ? optionId(activeIndex) : undefined
              }
              autoComplete="off"
              spellCheck={false}
              className={cn(fieldBase, 'ui-combobox__search-input h-10')}
            />
          </div>

          <div
            id={listboxId}
            role="listbox"
            aria-label={listLabel}
            className="ui-combobox__list"
          >
            {matches.length ? (
              matches.map((option, index) => {
                const isSelected = option.value === value;
                const isActive = index === activeIndex;
                return (
                  <button
                    key={option.value}
                    type="button"
                    id={optionId(index)}
                    role="option"
                    aria-selected={isSelected}
                    data-index={index}
                    data-active={isActive || undefined}
                    className={cn(
                      'ui-combobox__option',
                      isActive && 'is-active',
                      isSelected && 'is-selected',
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => choose(option.value)}
                  >
                    {renderIcon ? (
                      <span className="ui-combobox__mark" aria-hidden="true">
                        {renderIcon(option)}
                      </span>
                    ) : null}
                    <span className="ui-combobox__option-text">
                      <span className="ui-combobox__option-label">{option.label}</span>
                      {option.detail ? (
                        <span className="ui-combobox__option-detail">
                          {option.detail}
                        </span>
                      ) : null}
                    </span>
                    {isSelected ? (
                      <Check className="ui-combobox__check size-4" />
                    ) : null}
                  </button>
                );
              })
            ) : (
              <p className="ui-combobox__empty">{emptyLabel}</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
