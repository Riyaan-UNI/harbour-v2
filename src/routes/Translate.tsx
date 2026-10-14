import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { Link } from 'react-router-dom';
import { translateText } from '@legacy/lib/api.js';
import { essentialCantonesePhrases } from '@legacy/data/essentialCantonesePhrases.js';
import {
  Cluster,
  Grid,
  Heading,
  Section,
  Stack,
  Text,
} from '../components/layout';
import {
  Button,
  Card,
  DemoBadge,
  Disclaimer,
  ErrorState,
  FormField,
  StatusBadge,
  Skeleton,
  Textarea,
  toast,
} from '../components/ui';
import {
  ArrowRight,
  Camera,
  Copy,
  Languages,
  Mic,
  Volume2,
} from '../components/ui/icons';
import { publicUrl } from '../lib/public-url';

/**
 * Translate — the Cantonese helper, rebuilt in Harbour's own design language.
 *
 * This is the AppHome sibling: the same token layer (global teal/gold, never a
 * bespoke re-theme), the same layout primitives (Section, Stack, Cluster,
 * Grid) and the same shared components (Card, Button, FormField, StatusBadge,
 * DemoBadge, ErrorState, Disclaimer). The gold accent matches the "Cantonese
 * helper" tile on AppHome.
 *
 * The inspiration's *features* are carried over, not its brand: a source
 * language chooser (flag chips), a composer with sample phrases, a real
 * translation call, voice capture with a live transcript, a camera entry point,
 * a recent-translations list, and an offline phrase pack. Honesty rules
 * (Addendum 1): the camera entry is labelled a preview, the voice path says
 * "simulation" when device speech recognition is missing, and an error always
 * offers the offline phrase pack.
 */

type SourceLang = {
  id: string;
  label: string;
  flag: string;
};

const SOURCE_LANGS: SourceLang[] = [
  { id: 'en', label: 'English', flag: publicUrl('/flags/gb.svg') },
  { id: 'es', label: 'Español', flag: publicUrl('/flags/es.svg') },
  { id: 'fr', label: 'Français', flag: publicUrl('/flags/fr.svg') },
  { id: 'ro', label: 'Română', flag: publicUrl('/flags/ro.svg') },
];

const TARGET_LANG: SourceLang = { id: 'yue', label: 'Cantonese · 廣東話', flag: publicUrl('/flags/hk.svg') };

const INITIAL_SOURCE: SourceLang = SOURCE_LANGS[0] ?? { id: 'en', label: 'English', flag: publicUrl('/flags/gb.svg') };

const SAMPLES = [
  'Where is the nearest MTR station?',
  'Can I have the bill, please?',
  'I need an ambulance.',
  'How much is this?',
];

const VOICE_SAMPLE = 'Could you help me, please?';

const RECENT_KEY = 'harbour-translate-history';

type RecentItem = {
  id: string;
  sourceId: string;
  sourceLabel: string;
  flag: string;
  phrase: string;
  cantonese: string;
  at: number;
};

function loadRecent(): RecentItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    return Array.isArray(raw) ? (raw as RecentItem[]) : [];
  } catch {
    return [];
  }
}

/* A minimal shape for the Web Speech API, which TypeScript's DOM lib does not
   fully describe (and which is vendor-prefixed as webkitSpeechRecognition). */
type SpeechResult = { 0: { transcript: string; isFinal?: boolean }; length: number };
type SpeechEvent = { results: ArrayLike<SpeechResult> };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const timeLabel = (at: number): string =>
  new Intl.DateTimeFormat('en-HK', { hour: '2-digit', minute: '2-digit' }).format(new Date(at));

export default function Translate(): JSX.Element {
  const [source, setSource] = useState<SourceLang>(INITIAL_SOURCE);
  const [phrase, setPhrase] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [result, setResult] = useState<{ cantonese: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [voiceOn, setVoiceOn] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceGloss, setVoiceGloss] = useState('');
  const [voiceCantonese, setVoiceCantonese] = useState('');
  const recognitionRef = useRef<Recognition | null>(null);
  const finalRef = useRef('');

  const [recent, setRecent] = useState<RecentItem[]>(loadRecent);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setVoiceOn(recognitionCtor() !== null);
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const pushRecent = useCallback((item: RecentItem): void => {
    setRecent((current) => {
      const next = [
        item,
        ...current.filter((entry) => entry.phrase !== item.phrase),
      ].slice(0, 6);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const speak = useCallback((text: string): void => {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      toast.warning('Speech playback is not available in this browser.');
      return;
    }
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-HK';
    utterance.rate = 0.9;
    const voice = synth.getVoices().find((v) => /^(yue|zh)-HK$/i.test(v.lang));
    if (voice) utterance.voice = voice;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(utterance);
  }, [speaking]);

  const copy = useCallback(async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard.');
    } catch {
      toast.error('Copy is not available in this browser.');
    }
  }, []);

  const translate = useCallback(async (text: string): Promise<string | null> => {
    const trimmed = text.trim();
    if (!trimmed) return null;
    try {
      const data = await translateText(trimmed);
      const cantonese = data.translation?.trim() ?? '';
      return cantonese || null;
    } catch {
      return null;
    }
  }, []);

  async function runTranslate(): Promise<void> {
    const text = phrase.trim();
    if (!text || status === 'loading') return;
    setStatus('loading');
    setError(null);
    setResult(null);
    const cantonese = await translate(text);
    if (!cantonese) {
      setError('Harbour could not reach the translation service just now.');
      setStatus('error');
      return;
    }
    setResult({ cantonese });
    setStatus('ready');
    pushRecent({
      id: `${Date.now()}`,
      sourceId: source.id,
      sourceLabel: source.label,
      flag: source.flag,
      phrase: text,
      cantonese,
      at: Date.now(),
    });
  }

  function stopListening(): void {
    recognitionRef.current?.stop();
    setListening(false);
  }

  async function startListening(): Promise<void> {
    const Ctor = recognitionCtor();
    setVoiceGloss('');
    setVoiceCantonese('');
    if (!Ctor) return;
    finalRef.current = '';
    const recognition = new Ctor();
    recognition.lang = 'en-HK';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const last = event.results?.[event.results.length - 1]?.[0];
      if (!last) return;
      finalRef.current = last.transcript;
      setVoiceGloss(last.transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => {
      setListening(false);
      void finishVoice(finalRef.current);
    };
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  async function finishVoice(text: string): Promise<void> {
    const cantonese = await translate(text);
    if (cantonese) {
      setVoiceCantonese(cantonese);
      pushRecent({
        id: `${Date.now()}`,
        sourceId: 'voice',
        sourceLabel: 'Voice',
        flag: publicUrl('/flags/hk.svg'),
        phrase: text,
        cantonese,
        at: Date.now(),
      });
    }
  }

  function toggleVoice(): void {
    if (listening) {
      stopListening();
      return;
    }
    if (voiceOn === false) {
      // No device speech recognition: run a labelled sample so the flow is
      // still visible, and say plainly that it is a simulation.
      setVoiceGloss(VOICE_SAMPLE);
      void finishVoice(VOICE_SAMPLE);
      return;
    }
    void startListening();
  }

  function clearRecent(): void {
    setRecent([]);
    localStorage.removeItem(RECENT_KEY);
  }

  const phraseCategories: string[] = Array.from(
    new Set(essentialCantonesePhrases.map((entry) => entry.category)),
  );

  return (
    <div className="translate-page">
      {/* Masthead — the AppHome-style editorial lead. */}
      <Section aria-label="Cantonese helper">
        <Stack gap={4}>
          <span className="app-home-eyebrow">CANTONESE HELPER · 廣東話</span>
          <Heading level={1}>Say the useful thing, with the right context.</Heading>
          <Text role="body" tone="muted">
            Type, speak, or start from a sample phrase. Harbour redacts personal
            details before translating, and nothing you type is saved.
          </Text>
        </Stack>
      </Section>

      {/* Composer — language chooser, input, and the live result. */}
      <Section aria-label="Translate a phrase">
        <Card
          variant="static"
          style={{ '--tile-accent': 'var(--gold-fill)' } as CSSProperties}
        >
          <span className="app-home-tile__accent" aria-hidden="true" />

          <Stack gap={4}>
            <Text role="label" tone="subtle">
              Translate from
            </Text>
            <div className="translate-langs" role="group" aria-label="Source language">
              {SOURCE_LANGS.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  className="translate-lang"
                  aria-pressed={source.id === lang.id}
                  onClick={() => setSource(lang)}
                >
                  <span className="translate-flag">
                    <img src={lang.flag} alt="" width={24} height={24} />
                  </span>
                  <span className="translate-lang__name">{lang.label}</span>
                </button>
              ))}
            </div>

            <Cluster gap={3} align="center">
              <ArrowRight aria-hidden="true" className="text-text-subtle" />
              <span className="translate-lang translate-lang--target">
                <span className="translate-flag">
                  <img src={TARGET_LANG.flag} alt="" width={24} height={24} />
                </span>
                <span className="translate-lang__name">{TARGET_LANG.label}</span>
              </span>
            </Cluster>

            <FormField
              id="translate-phrase"
              label="Your phrase"
              hint="We redact HKID, phone and bank details before translating. Pasted text is not saved."
            >
              {(control) => (
                <Textarea
                  {...control}
                  value={phrase}
                  maxLength={2000}
                  rows={3}
                  placeholder="What would you like to say?"
                  onChange={(event) => setPhrase(event.target.value)}
                />
              )}
            </FormField>

            <div className="translate-samples" aria-label="Sample phrases">
              {SAMPLES.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  className="translate-sample"
                  onClick={() => setPhrase(sample)}
                >
                  {sample}
                </button>
              ))}
            </div>
          </Stack>

          <div className="translate-result" aria-live="polite">
            {status === 'loading' ? (
              <Skeleton className="h-16 rounded-md" />
            ) : null}
            {status === 'ready' && result ? (
              <Stack gap={3}>
                <div className="translate-result__meta">
                  <StatusBadge tone="green">Translated</StatusBadge>
                  <Text role="label" tone="subtle">
                    {source.label} → Cantonese · 廣東話
                  </Text>
                </div>
                <p className="translate-result__cantonese" lang="zh-HK">
                  {result.cantonese}
                </p>
              </Stack>
            ) : null}
            {status === 'error' ? (
              <ErrorState
                title="Translation is unavailable"
                onRetry={() => void runTranslate()}
                offline="While you wait, the phrase pack below works offline."
              >
                {error}
              </ErrorState>
            ) : null}
          </div>

          <Cluster gap={3} className="flex-wrap">
            <Button
              variant="primary"
              onClick={() => void runTranslate()}
              loading={status === 'loading'}
              disabled={!phrase.trim() || status === 'loading'}
            >
              <Languages />
              Translate
            </Button>
            {result ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => speak(result.cantonese)}
                  aria-pressed={speaking}
                >
                  <Volume2 />
                  {speaking ? 'Stop' : 'Listen'}
                </Button>
                <Button variant="secondary" onClick={() => void copy(result.cantonese)}>
                  <Copy />
                  Copy
                </Button>
              </>
            ) : null}
          </Cluster>

          <Disclaimer>
            Machine translation can miss context. For anything important, check
            with a fluent Cantonese speaker.
          </Disclaimer>
        </Card>
      </Section>

      {/* Other ways to say it — voice and camera, carried over from the
          inspiration, expressed in Harbour's cards. */}
      <Section aria-label="Other ways to say it">
        <div className="app-home-head">
          <div className="app-home-head__lead">
            <Heading level={2}>Other ways to say it</Heading>
            <Text role="body" tone="muted">
              Speak it aloud, or point your camera at a menu or a sign.
            </Text>
          </div>
        </div>

        <Grid min="sm" gap={5}>
          <Card variant="static" className="h-full">
            <div className="translate-voice">
              <div
                className="translate-voice__orb"
                data-listening={listening || undefined}
                aria-hidden="true"
              />
              <Stack gap={2} align="center">
                <Cluster justify="center">
                  <Heading level={3}>Voice</Heading>
                  {voiceOn === false ? <DemoBadge variant="simulation">Simulation</DemoBadge> : null}
                </Cluster>
                <Text role="small" tone="muted">
                  Speak a phrase — it is transcribed, then translated to Cantonese.
                </Text>
              </Stack>
              <Button
                variant={listening ? 'secondary' : 'primary'}
                onClick={toggleVoice}
                aria-pressed={listening}
              >
                <Mic />
                {listening ? 'Listening… tap to stop' : 'Start speaking'}
              </Button>
              {voiceGloss || voiceCantonese ? (
                <div className="translate-voice__transcript" aria-live="polite">
                  {voiceGloss ? (
                    <p className="translate-voice__line translate-voice__line--gloss">
                      “{voiceGloss}”
                    </p>
                  ) : null}
                  {voiceCantonese ? (
                    <p className="translate-voice__line" lang="zh-HK">
                      {voiceCantonese}
                    </p>
                  ) : null}
                  {voiceCantonese ? (
                    <Cluster gap={3} justify="center">
                      <Button variant="ghost" size="small" onClick={() => speak(voiceCantonese)}>
                        <Volume2 />
                        Listen
                      </Button>
                      <Button variant="ghost" size="small" onClick={() => void copy(voiceCantonese)}>
                        <Copy />
                        Copy
                      </Button>
                    </Cluster>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Card>

          <Card variant="static" className="h-full">
            <div className="translate-camera">
              <div className="translate-camera__frame">
                <Camera aria-hidden="true" />
              </div>
              <Stack gap={2} align="center">
                <Cluster justify="center">
                  <DemoBadge variant="demo">Preview</DemoBadge>
                </Cluster>
                <Heading level={3}>Camera</Heading>
                <Text role="small" tone="muted">
                  Aim at written Cantonese or a menu to translate it. Camera
                  translate is a preview — not wired to a live scanner yet.
                </Text>
              </Stack>
            </div>
          </Card>
        </Grid>
      </Section>

      {/* Recent translations — remembered locally, never uploaded. */}
      <Section aria-label="Recent translations">
        <div className="app-home-head">
          <div className="app-home-head__lead">
            <Heading level={2}>Recent translations</Heading>
            <Text role="body" tone="muted">
              Kept on this device only. Tap one to translate it again.
            </Text>
          </div>
          {recent.length > 0 ? (
            <Button variant="ghost" size="small" onClick={clearRecent}>
              Clear
            </Button>
          ) : null}
        </div>

        {recent.length === 0 ? (
          <Card variant="flat">
            <Text role="small" tone="muted">
              Your recent phrases will appear here once you translate something.
            </Text>
          </Card>
        ) : (
          <ul className="translate-recent__list">
            {recent.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="translate-recent__item"
                  onClick={() => {
                    setPhrase(item.phrase);
                    const match = SOURCE_LANGS.find((lang) => lang.id === item.sourceId);
                    if (match) setSource(match);
                  }}
                >
                  <span className="translate-flag translate-flag--lg">
                    <img src={item.flag} alt="" width={40} height={40} />
                  </span>
                  <span className="translate-recent__copy">
                    <span className="translate-recent__primary">{item.phrase}</span>
                    <span className="translate-recent__secondary" lang="zh-HK">
                      {item.cantonese}
                    </span>
                  </span>
                  <span className="translate-recent__secondary">
                    {item.sourceLabel} · {timeLabel(item.at)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Offline phrase pack — deterministic fallback + everyday useful. */}
      <Section aria-label="Offline phrase pack">
        <div className="app-home-head">
          <div className="app-home-head__lead">
            <Heading level={2}>Phrases for moments like these</Heading>
            <Text role="body" tone="muted">
              Saved on device, works offline. Tap the speaker to hear the
              Cantonese.
            </Text>
          </div>
        </div>

        <Card variant="static">
          <div className="translate-phrases">
            {phraseCategories.map((category) => (
              <div key={category} className="translate-phrases__group">
                <span className="translate-phrases__label">{category}</span>
                {essentialCantonesePhrases
                  .filter((entry) => entry.category === category)
                  .map((entry) => (
                    <div key={entry.english} className="translate-phrase">
                      <span className="translate-phrase__copy">
                        <span className="translate-phrase__en">{entry.english}</span>
                        <span className="translate-phrase__yue" lang="zh-HK">
                          {entry.cantonese}
                        </span>
                        <span className="translate-phrase__jyut">{entry.jyutping}</span>
                      </span>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => speak(entry.cantonese)}
                        aria-label={`Listen to: ${entry.english}`}
                      >
                        <Volume2 />
                      </Button>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </Card>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            to="/app/chat"
            className="inline-flex items-center gap-2 text-accent-text hover:underline"
          >
            Need help with the situation? Ask Harbour for context
            <ArrowRight />
          </Link>
        </div>

        <Disclaimer>
          Draft wording. A Cantonese speaker should review these phrases before
          public release — confirm important matters with a fluent speaker.
        </Disclaimer>
      </Section>
    </div>
  );
}
