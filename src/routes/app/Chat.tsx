import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { Link } from 'react-router-dom';
import { sendChat } from '@legacy/lib/api.js';
import { Heading, Stack, Text } from '../../components/layout';
import {
  Button,
  Chip,
  DemoBadge,
  Disclaimer,
  ErrorState,
  FormField,
  Skeleton,
  Textarea,
  type FormFieldControlProps,
} from '../../components/ui';
import { Send } from '../../components/ui/icons';
import { ChatBeacon } from '../../components/chat/ChatBeacon';
import { ChatCompass } from '../../components/chat/ChatCompass';
import { ChatConstellation } from '../../components/chat/ChatConstellation';
import { ChatRingStack } from '../../components/chat/ChatRingStack';
import { ChatTideWave } from '../../components/chat/ChatTideWave';

/* --------------------------------------------------------------------------
   Types
   -------------------------------------------------------------------------- */

type MessageRole = 'user' | 'harbour';

type Message = {
  id: string;
  role: MessageRole;
  text: string;
  demo?: boolean;
  /** ISO string, set when the message lands. Rendered as a local time. */
  at: string;
};

/* A run of consecutive messages by the same speaker — one visual group. */
type MessageGroup = {
  role: MessageRole;
  messages: Message[];
};

/* --------------------------------------------------------------------------
   Constants
   -------------------------------------------------------------------------- */

const SUGGESTIONS = [
  'How do I use the MTR?',
  'What is an Octopus card?',
  'Where can I get a SIM card?',
  'How do I open a Hong Kong bank account?',
  'What should I do if I feel sick?',
  'When do I apply for my HKID?',
];

const MAX_CHARS = 3000;
const COUNTER_WARN_AT = MAX_CHARS * 0.9;

const TIME_FORMAT = new Intl.DateTimeFormat('en-HK', {
  hour: '2-digit',
  minute: '2-digit',
});

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Fold a flat message list into consecutive same-speaker runs. */
function groupMessages(messages: Message[]): MessageGroup[] {
  const groups: MessageGroup[] = [];

  for (const message of messages) {
    const last = groups[groups.length - 1];
    if (last && last.role === message.role) {
      last.messages.push(message);
    } else {
      groups.push({ role: message.role, messages: [message] });
    }
  }

  return groups;
}

/* --------------------------------------------------------------------------
   Component
   -------------------------------------------------------------------------- */

export default function Chat(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [error, setError] = useState<Error | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  /* Auto-resize textarea — direct height set, never animated (legacy technique). */
  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = 'auto';
    node.style.height = `${Math.min(node.scrollHeight, 240)}px`;
  }, [input]);

  /* Keep the newest message in view. */
  useEffect(() => {
    if (!endRef.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    endRef.current.scrollIntoView({
      block: 'nearest',
      behavior: reduced ? 'auto' : 'smooth',
    });
  }, [messages, status]);

  /* Send a message (or retry one). */
  const sendMessage = useCallback(
    async (text: string, isRetry = false) => {
      const trimmed = text.trim();
      if (!trimmed || status === 'sending') return;

      let nextMessages = messages;

      if (!isRetry) {
        const userMsg: Message = {
          id: uid(),
          role: 'user',
          text: trimmed,
          at: new Date().toISOString(),
        };
        nextMessages = [...messages, userMsg];
        setMessages(nextMessages);
      }

      setInput('');
      setStatus('sending');
      setError(null);

      /* On retry, exclude the last message (it is being re-sent as `message`). */
      const historyBase = isRetry ? nextMessages.slice(0, -1) : nextMessages;
      const history = historyBase
        .slice(-11)
        .map((m) => ({ role: m.role, content: m.text }));

      try {
        const data = await sendChat(trimmed, history);
        const harbourMsg: Message = {
          id: uid(),
          role: 'harbour',
          text: data.reply,
          demo: data.demo,
          at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, harbourMsg]);
        setStatus('idle');
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Something went wrong'),
        );
        setStatus('error');
      }
    },
    [messages, status],
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  }

  function handleReset() {
    setMessages([]);
    setStatus('idle');
    setError(null);
    setInput('');
    textareaRef.current?.focus();
  }

  function handleRetry() {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUser) {
      void sendMessage(lastUser.text, true);
    }
  }

  const groups = useMemo(() => groupMessages(messages), [messages]);

  const isEmpty = messages.length === 0 && status === 'idle' && !error;
  const beaconState: 'idle' | 'thinking' =
    status === 'sending' ? 'thinking' : 'idle';
  const counterOverWarn = input.length >= COUNTER_WARN_AT;
  const statusLabel =
    status === 'sending'
      ? 'Harbour is thinking'
      : error
        ? 'Connection lost'
        : 'Ready';

  return (
    <div className="ask-page">
      {/* Aurora field — decoration only, behind content, aria-hidden. */}
      <div className="ask-aurora" aria-hidden="true">
        <div className="ask-aurora__blob ask-aurora__blob--1" />
        <div className="ask-aurora__blob ask-aurora__blob--2" />
        <div className="ask-aurora__blob ask-aurora__blob--3" />
      </div>

      <div className="ask-page__content">
        <div className="ask-frame">
          {/* The one contained colour field on this page. It sits under the
              thread's glass, so it may run at the patch cap. */}
          <div className="ask-frame__glow" aria-hidden="true" />

          {/* Header strip — solid, never glass, so the page keeps its glass
              budget for the thread and the composer. */}
          <header className="ask-header">
            <ChatCompass />
            <div className="ask-header__text">
              <span className="ask-header__eyebrow">ASK HARBOUR</span>
              <Heading level={1} role="h3">
                No question is too small.
              </Heading>
              <Text role="small" tone="muted">
                Ask about everyday student life. Answers need an internet
                connection.
              </Text>
            </div>

            <div className="ask-header__meta">
              <span className="ask-header__status" role="status">
                <span
                  className={`ask-header__status-dot ask-header__status-dot--${status}`}
                  aria-hidden="true"
                />
                {statusLabel}
              </span>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="small"
                  onClick={handleReset}
                  aria-label="Start a new conversation"
                >
                  Start a new conversation
                </Button>
              )}
            </div>
          </header>

          {/* Thread — the only scrolling region in the frame. */}
          <div
            className="ask-thread"
            role="log"
            aria-live="polite"
            aria-label="Conversation"
          >
            {isEmpty ? (
              <div className="ask-empty">
                <ChatConstellation />
                <Text role="body" tone="muted" className="ask-empty__text">
                  Start with anything on your mind. These are the questions
                  people ask most.
                </Text>
                <div
                  className="ask-chips"
                  role="group"
                  aria-label="Suggested questions"
                >
                  {SUGGESTIONS.map((s) => (
                    <Chip key={s} variant="neutral" asChild>
                      <button type="button" onClick={() => void sendMessage(s)}>
                        {s}
                      </button>
                    </Chip>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {groups.map((group, groupIndex) => {
                  const firstMessage = group.messages[0];
                  if (!firstMessage) return null;
                  return (
                    <div
                      key={firstMessage.id}
                      className={`ask-group ask-group--${group.role}`}
                    >
                    {group.messages.map((msg, index) => {
                      const first = index === 0;
                      return (
                        <article
                          key={msg.id}
                          className={`ask-bubble ask-bubble--${msg.role}${
                            first ? '' : ' ask-bubble--continuation'
                          }`}
                        >
                          {first && (
                            <span className="ask-bubble__eyebrow">
                              {msg.role === 'harbour' && (
                                <span
                                  className="ask-bubble__eyebrow-dot"
                                  aria-hidden="true"
                                />
                              )}
                              {msg.role === 'user' ? 'YOU' : 'HARBOUR'}
                            </span>
                          )}
                          <div className="ask-bubble__body">
                            <p>{msg.text}</p>
                          </div>
                          <footer className="ask-bubble__footer">
                            {msg.role === 'harbour' && msg.demo ? (
                              <DemoBadge variant="demo" />
                            ) : null}
                            <Text role="small" tone="subtle">
                              <time dateTime={msg.at}>
                                {TIME_FORMAT.format(new Date(msg.at))}
                              </time>
                            </Text>
                          </footer>
                        </article>
                      );
                    })}

                    {/* The thinking turn lands inside the harbour run. */}
                    {group.role === 'harbour' &&
                      status === 'sending' &&
                      groupIndex === groups.length - 1 && (
                        <article className="ask-bubble ask-bubble--harbour ask-bubble--thinking">
                          <span className="ask-bubble__eyebrow">
                            <span
                              className="ask-bubble__eyebrow-dot"
                              aria-hidden="true"
                            />
                            HARBOUR IS THINKING
                          </span>
                          <div className="ask-bubble__body">
                            <div className="ask-bubble__art">
                              <ChatRingStack />
                              <ChatBeacon state={beaconState} />
                            </div>
                            <div className="ask-skeleton">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                              <Skeleton className="h-4 w-2/3" />
                            </div>
                            <span
                              className="ask-bubble__caret"
                              aria-hidden="true"
                            />
                          </div>
                        </article>
                      )}
                    </div>
                  );
                })}

                {/* A waiting harbour turn with no harbour run yet to join. */}
                {status === 'sending' &&
                  (groups.length === 0 ||
                    groups[groups.length - 1]?.role === 'user') && (
                    <div className="ask-group ask-group--harbour">
                      <article className="ask-bubble ask-bubble--harbour ask-bubble--thinking">
                        <span className="ask-bubble__eyebrow">
                          <span
                            className="ask-bubble__eyebrow-dot"
                            aria-hidden="true"
                          />
                          HARBOUR IS THINKING
                        </span>
                        <div className="ask-bubble__body">
                          <div className="ask-bubble__art">
                            <ChatRingStack />
                            <ChatBeacon state={beaconState} />
                          </div>
                          <div className="ask-skeleton">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                          <span
                            className="ask-bubble__caret"
                            aria-hidden="true"
                          />
                        </div>
                      </article>
                    </div>
                  )}

                {status === 'error' && error && (
                  <div className="ask-error">
                    <ErrorState
                      title="Can't reach Harbour right now"
                      onRetry={handleRetry}
                      retryLabel="Try again"
                      offline={
                        <Stack gap={2} align="start">
                          <Text role="small" tone="muted">
                            While you wait
                          </Text>
                          <Link
                            to="/app/checklist"
                            className="text-accent-text hover:underline"
                          >
                            Open your settling-in checklist
                          </Link>
                          <Link
                            to="/app/home#emergency-ripples"
                            className="text-accent-text hover:underline"
                          >
                            View emergency numbers
                          </Link>
                          <a
                            href="tel:999"
                            className="text-accent-text hover:underline"
                          >
                            Call emergency services · 999
                          </a>
                        </Stack>
                      }
                    >
                      {error.message}
                    </ErrorState>
                  </div>
                )}

                <div ref={endRef} />
              </>
            )}
          </div>

          {/* Composer — the frame's last child, so it never scrolls. */}
          <div className="ask-composer">
            <div className="ask-composer__glow" aria-hidden="true" />
            <form onSubmit={handleSubmit} className="ask-form">
              <FormField
                id="chat-message"
                label="Your question"
                hint="Avoid including names or private account details. When available, your question is sent to Harbour's AI provider to prepare a response."
              >
                {(control: FormFieldControlProps) => (
                  <Textarea
                    {...control}
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                      setInput(event.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    maxLength={MAX_CHARS}
                    placeholder="Ask Harbour anything about settling in…"
                    disabled={status === 'sending'}
                    className="ask-form__input"
                  />
                )}
              </FormField>

              <div className="ask-form__actions">
                <Text
                  role="label"
                  tone="subtle"
                  className={
                    counterOverWarn ? 'ask-form__count ask-form__count--warn' : 'ask-form__count'
                  }
                >
                  {input.length.toLocaleString('en-HK')} /{' '}
                  {MAX_CHARS.toLocaleString('en-HK')}
                </Text>
                <Button
                  type="submit"
                  variant="primary"
                  loading={status === 'sending'}
                  disabled={!input.trim() || status === 'sending'}
                  className="ask-form__send"
                >
                  <Send />
                  {status === 'sending' ? 'Thinking…' : 'Ask Harbour'}
                </Button>
              </div>
            </form>

            <Disclaimer>
              General information only. Check official sources for important
              decisions.
            </Disclaimer>

            {/* The tide sits along the composer's base edge. */}
            <div className="ask-composer__tide">
              <ChatTideWave />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
