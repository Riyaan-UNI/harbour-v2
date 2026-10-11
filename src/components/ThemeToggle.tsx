import { setMode, type ThemeMode } from '../theme/theme';
import { useThemeMode } from '../theme/useTheme';
import { cn } from '../lib/cn';

type Option = {
  value: ThemeMode;
  label: string;
  Icon: () => JSX.Element;
};

const MonitorIcon = (): JSX.Element => (
  <svg
    viewBox="0 0 16 16"
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="1.75" y="2.75" width="12.5" height="8.5" rx="1.25" />
    <path d="M5.5 14.25h5" />
    <path d="M8 11.25v3" />
  </svg>
);

const SunIcon = (): JSX.Element => (
  <svg
    viewBox="0 0 16 16"
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="8" cy="8" r="3.25" />
    <path d="M8 1.25v1.5M8 13.25v1.5M1.25 8h1.5M13.25 8h1.5M3.3 3.3l1.05 1.05M11.65 11.65l1.05 1.05M12.7 3.3l-1.05 1.05M4.35 11.65L3.3 12.7" />
  </svg>
);

const MoonIcon = (): JSX.Element => (
  <svg
    viewBox="0 0 16 16"
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M13.25 9.6A5.75 5.75 0 0 1 6.4 2.75a5.75 5.75 0 1 0 6.85 6.85Z" />
  </svg>
);

const OPTIONS: readonly Option[] = [
  { value: 'system', label: 'System', Icon: MonitorIcon },
  { value: 'light', label: 'Light', Icon: SunIcon },
  { value: 'dark', label: 'Dark', Icon: MoonIcon },
];

/**
 * Three-state segmented theme control — spec §8.
 *
 * Each state is a real button with `aria-pressed`, and the circular reveal
 * starts from whichever button was pressed.
 */
export function ThemeToggle(): JSX.Element {
  const mode = useThemeMode();

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className="glass inline-flex items-center gap-1 p-1"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const selected = mode === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={selected}
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              setMode(value, {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
              });
            }}
            className={cn(
              'type-label inline-flex min-h-11 items-center gap-2 rounded-pill px-3',
              'transition-colors duration-fast',
              selected
                ? 'bg-accent-fill text-on-accent'
                : 'text-text hover:bg-glass-fill-strong',
            )}
          >
            <Icon />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
