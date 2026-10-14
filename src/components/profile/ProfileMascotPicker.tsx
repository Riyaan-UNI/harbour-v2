import { Mascot, type MascotKind } from '../ui';
import { Text } from '../layout';

/**
 * ProfileMascotPicker — the "Choose your mascot" radio group on `/app/profile`.
 *
 * A native `<fieldset>` + `<legend>` over twelve native `<input type="radio"
 * name="mascotId">` controls, each styled as a card holding a `Mascot` and its
 * name. Native radios are the one control that is keyboard-, screen-reader-
 * and form-correct with zero ARIA invention, so none is added: the fieldset
 * groups them, the legend names the group, the label wraps the visible card,
 * and the browser owns the roving focus and the `aria-checked` state.
 *
 * The list is the v2 `MascotKind` order from `ui/mascot.tsx` — twelve
 * creatures, not the legacy four — and the chosen id is written through
 * `useProfile().saveProfile` on Save (the parent owns that). This component is
 * presentational: it takes the current `value` and reports changes; it reads
 * no store itself.
 *
 * Why the helper copy branches: a photo and a mascot are two controls of one
 * "how you look" group, and the rule is explicit rather than implicit — a photo
 * wins when one exists. The parent keeps a replaced photo for the session and
 * offers "Use my photo again", so picking a mascot is reversible.
 */

export type ProfileMascotPickerProps = {
  /** The currently selected kind. */
  value: MascotKind;
  /** Called with the newly chosen kind. */
  onChange: (kind: MascotKind) => void;
  /** Whether a photo is currently the visible face (drives the helper copy). */
  hasPhoto: boolean;
  /**
   * Whether a photo was replaced this session, so the "Use my photo again"
   * action is offered. The parent owns the restore handler.
   */
  canRestorePhoto?: boolean;
  /** Restores the session's photo. Only rendered when `canRestorePhoto`. */
  onRestorePhoto?: () => void;
};

/** The twelve kinds, in the v2 manifest's order — one source of truth. */
const MASCOT_KINDS: readonly MascotKind[] = [
  'otter',
  'octopus',
  'turtle',
  'jellyfish',
  'crab',
  'seahorse',
  'starfish',
  'shrimp',
  'seal',
  'eel',
  'pufferfish',
  'whale',
];

function labelFor(kind: MascotKind): string {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

export function ProfileMascotPicker({
  value,
  onChange,
  hasPhoto,
  canRestorePhoto = false,
  onRestorePhoto,
}: ProfileMascotPickerProps): JSX.Element {
  return (
    <fieldset className="app-profile-mascot">
      <legend className="type-small text-text font-medium">
        Choose your mascot
      </legend>

      <Text role="small" tone="muted" className="app-profile-mascot__help">
        {hasPhoto
          ? 'Your photo is showing. Pick a mascot to use that instead — you can switch back anytime.'
          : 'No photo yet. Pick a mascot, or add a photo.'}
      </Text>

      <div className="app-profile-mascot__grid">
        {MASCOT_KINDS.map((kind) => {
          const checked = kind === value;
          return (
            <label key={kind} className="app-profile-mascot__option">
              <input
                type="radio"
                name="mascotId"
                value={kind}
                checked={checked}
                onChange={() => onChange(kind)}
                className="app-profile-mascot__input"
              />
              <span className="app-profile-mascot__card">
                <Mascot kind={kind} className="app-profile-mascot__creature" />
                <span className="app-profile-mascot__name">
                  {labelFor(kind)}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {canRestorePhoto && onRestorePhoto ? (
        <button
          type="button"
          className="app-profile-mascot__restore"
          onClick={onRestorePhoto}
        >
          Use my photo again
        </button>
      ) : null}
    </fieldset>
  );
}
