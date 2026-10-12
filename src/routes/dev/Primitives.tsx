import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Aurora } from '../../components/Aurora';
import {
  Bento,
  BentoItem,
  Cluster,
  Container,
  Cq,
  Grid,
  Heading,
  Section,
  Stack,
  Text,
  VisuallyHidden,
  type Space,
} from '../../components/layout';

/**
 * /dev/primitives — every Brick 1 primitive, every variant, plus the stress
 * cases that break naive layout: unbroken words, twenty grid items, a bento at
 * every size, a Stack inside a Cluster, and one block that changes layout on
 * its container width rather than the viewport.
 *
 * This page is the reason the primitives exist, so it uses nothing but
 * primitives for structure.
 */

/** A visible box, so padding and gaps are actually legible. */
function Panel({
  children,
  label,
}: {
  children?: ReactNode;
  label?: string;
}): JSX.Element {
  return (
    <Stack gap={2} className="bg-bg-elevated border-border rounded-md border p-4">
      {label ? (
        <Text role="label" tone="muted">
          {label}
        </Text>
      ) : null}
      {children}
    </Stack>
  );
}

const GAP_STEPS: readonly Space[] = [1, 4, 7, 10];

const LONG_WORDS = [
  'Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch',
  'https://harbour.example.org/a/very/long/unbroken/path/segment/that/never/ends/anywhere',
  'Donaudampfschifffahrtselektrizitätenhauptbetriebswerkbauunterbeamtengesellschaft',
] as const;

const BENTO_SIZES = ['third', 'half', 'twothirds', 'full'] as const;

export function Primitives(): JSX.Element {
  return (
    <>
      <Aurora />

      <main className="layer-raised">
        <Section>
          <Stack gap={3}>
            <Text role="label" tone="muted">
              Harbour · Brick 1
            </Text>
            <Heading level={1}>Layout primitives</Heading>
            <Text tone="muted">
              Every primitive, every variant, and the cases that break layout:
              unbroken words, twenty items, a bento at every size, a Stack inside
              a Cluster, and one block that answers to its container rather than
              the viewport.
            </Text>
            <Link
              to="/dev"
              className="text-accent-text hover:text-text inline-flex items-center text-sm font-medium transition-colors"
            >
              ← Dev hub
            </Link>
          </Stack>
        </Section>

        <Section>
          <Stack gap={6}>
            <Heading level={2}>Container</Heading>
            <Text role="small" tone="muted">
              Three widths. The border shows the container's own box, so the
              padding-inline step is visible: 1rem, then 1.5rem from 40em, then
              2rem from 64em.
            </Text>
            <Stack gap={4}>
              {(['page', 'measure', 'narrow'] as const).map((size) => (
                <Container key={size} size={size} className="border-border border">
                  <Text role="label" tone="muted">
                    size = {size}
                  </Text>
                </Container>
              ))}
            </Stack>
          </Stack>
        </Section>

        <Section>
          <Stack gap={6}>
            <Heading level={2}>Section</Heading>
            <Text role="small" tone="muted">
              padding-block comes from the section token. `contained` (the
              default) wraps the children in a page Container; turning it off
              leaves the children to manage their own width.
            </Text>
            <Stack gap={4}>
              <Section className="border-border border">
                <Text role="small" tone="muted">
                  contained — the children sit inside a page Container
                </Text>
              </Section>
              <Section contained={false} className="border-border border">
                <Container size="narrow" className="border-border border">
                  <Text role="small" tone="muted">
                    contained=false, with a narrow Container of its own
                  </Text>
                </Container>
              </Section>
            </Stack>
          </Stack>
        </Section>

        <Section>
          <Stack gap={6}>
            <Heading level={2}>Stack</Heading>
            <Text role="small" tone="muted">
              A column. The gap is a spec step — 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 —
              and a raw value is a type error.
            </Text>
            <Grid min="md" gap={6}>
              {GAP_STEPS.map((step) => (
                <Panel key={step} label={`gap = ${step}`}>
                  <Stack gap={step}>
                    <span className="bg-accent-fill block h-3 rounded-sm" />
                    <span className="bg-accent-fill block h-3 rounded-sm" />
                    <span className="bg-accent-fill block h-3 rounded-sm" />
                  </Stack>
                </Panel>
              ))}
            </Grid>
            <Grid min="md" gap={6}>
              {(['start', 'center', 'end', 'stretch'] as const).map((align) => (
                <Panel key={align} label={`align = ${align}`}>
                  <Stack gap={3} align={align} className="border-border border p-4">
                    <span className="bg-accent-fill block h-3 w-24 rounded-sm" />
                    <span className="bg-accent-fill block h-3 w-32 rounded-sm" />
                  </Stack>
                </Panel>
              ))}
            </Grid>
          </Stack>
        </Section>

        <Section>
          <Stack gap={6}>
            <Heading level={2}>Cluster</Heading>
            <Text role="small" tone="muted">
              A wrapping row. Items that do not fit move to the next line, which
              is what makes it safe at 320px without a single media query.
            </Text>
            <Stack gap={4}>
              {(['start', 'center', 'end', 'between'] as const).map((justify) => (
                <Panel key={justify} label={`justify = ${justify}`}>
                  <Cluster gap={3} justify={justify}>
                    {['One', 'Two', 'Three', 'Four', 'Five'].map((item) => (
                      <span
                        key={item}
                        className="bg-accent-fill text-on-accent type-small rounded-pill px-4 py-2"
                      >
                        {item}
                      </span>
                    ))}
                  </Cluster>
                </Panel>
              ))}
              <Panel label="Stack nested in a Cluster">
                <Cluster gap={6} align="start">
                  <Stack gap={2}>
                    <Text role="label" tone="muted">
                      Column one
                    </Text>
                    <Text role="small" tone="muted">
                      A Stack is a Cluster item like any other.
                    </Text>
                  </Stack>
                  <Stack gap={2}>
                    <Text role="label" tone="muted">
                      Column two
                    </Text>
                    <Text role="small" tone="muted">
                      Both wrap together when the row runs out of room.
                    </Text>
                  </Stack>
                </Cluster>
              </Panel>
            </Stack>
          </Stack>
        </Section>

        <Section>
          <Stack gap={6}>
            <Heading level={2}>Grid</Heading>
            <Text role="small" tone="muted">
              auto-fit, with a track minimum of 14rem, 17rem or 22rem. There is
              no column count to keep in step with a breakpoint.
            </Text>
            <Stack gap={6}>
              {(['sm', 'md', 'lg'] as const).map((min) => (
                <Stack gap={2} key={min}>
                  <Text role="label" tone="muted">
                    min = {min}
                  </Text>
                  <Grid min={min} gap={4}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Panel key={n}>
                        <Text role="small" tone="muted">
                          Item {n}
                        </Text>
                      </Panel>
                    ))}
                  </Grid>
                </Stack>
              ))}
              <Stack gap={2}>
                <Text role="label" tone="muted">
                  Twenty items, min = md
                </Text>
                <Grid min="md" gap={4} data-testid="grid-20">
                  {Array.from({ length: 20 }, (_, index) => (
                    <Panel key={index}>
                      <Text role="small" tone="muted">
                        {index + 1}
                      </Text>
                    </Panel>
                  ))}
                </Grid>
              </Stack>
            </Stack>
          </Stack>
        </Section>

        <Section>
          <Stack gap={6}>
            <Heading level={2}>Bento</Heading>
            <Text role="small" tone="muted">
              12 columns from 64em, 2 from 40em, 1 below. At the two-column stage
              third and half take one column and twothirds and full take two; at
              one column everything takes one. `tall` doubles the row span from
              64em.
            </Text>
            <Bento gap={4} data-testid="bento">
              {BENTO_SIZES.map((size) => (
                <BentoItem key={size} size={size}>
                  <Panel label={size}>
                    <Text role="small" tone="muted">
                      size = {size}
                    </Text>
                  </Panel>
                </BentoItem>
              ))}
              <BentoItem size="third" tall>
                <Panel label="third + tall">
                  <Text role="small" tone="muted">
                    Two rows from 64em
                  </Text>
                </Panel>
              </BentoItem>
              <BentoItem size="twothirds">
                <Panel label="twothirds">
                  <Text role="small" tone="muted">
                    Beside the tall item
                  </Text>
                </Panel>
              </BentoItem>
            </Bento>
          </Stack>
        </Section>

        <Section>
          <Stack gap={6}>
            <Heading level={2}>Heading</Heading>
            <Text role="small" tone="muted">
              The element's rank and its visual size are separate. Below, each
              heading is an h{'{level}'} while the role sets the size — so the
              outline stays honest even when the type scale does not match it.
              The levels start at 2 so the demo never skips a rank under the h2
              that titles this section.
            </Text>
            <Stack gap={4}>
              {([2, 3, 4, 5, 6] as const).map((level) => (
                <Heading key={level} level={level}>
                  Level {level}, default role
                </Heading>
              ))}
              <Heading level={4} role="display">
                An h4 at display size
              </Heading>
              <Heading level={2} role="h3">
                An h2 at h3 size
              </Heading>
            </Stack>
          </Stack>
        </Section>

        <Section>
          <Stack gap={6}>
            <Heading level={2}>Text</Heading>
            <Text role="small" tone="muted">
              Three roles and three tones. Body carries the 65ch measure, so a
              long paragraph wraps before it becomes unreadable.
            </Text>
            <Stack gap={4}>
              {(['body', 'small', 'label'] as const).map((role) => (
                <Stack gap={2} key={role}>
                  <Text role="label" tone="muted">
                    role = {role}
                  </Text>
                  <Stack gap={1}>
                    <Text role={role} tone="default">
                      Default tone — Harbour keeps you steady
                    </Text>
                    <Text role={role} tone="muted">
                      Muted tone — Harbour keeps you steady
                    </Text>
                    <Text role={role} tone="subtle">
                      Subtle tone — Harbour keeps you steady
                    </Text>
                  </Stack>
                </Stack>
              ))}
              <Panel label="body measure, 65ch">
                <Text tone="muted">
                  Arriving is the easy part. Language, scams and loneliness are
                  the things nobody warns you about, and most daily admin assumes
                  you already speak the language. Harbour turns what you hear and
                  what you need to say into short, clear sentences, and keeps the
                  rest of it to itself.
                </Text>
              </Panel>
            </Stack>
          </Stack>
        </Section>

        <Section>
          <Stack gap={6}>
            <Heading level={2}>VisuallyHidden</Heading>
            <Text role="small" tone="muted">
              In the DOM, out of sight. The word hidden is in this sentence:
              <VisuallyHidden>you cannot see this, but a screen reader can</VisuallyHidden>
              — inspect the paragraph to find it.
            </Text>
          </Stack>
        </Section>

        <Section>
          <Stack gap={6}>
            <Heading level={2}>Cq — container queries</Heading>
            <Text role="small" tone="muted">
              The same markup in two differently sized containers. The variant is
              @lg: (container width), not lg: (viewport width), so the block
              answers to the box it is in. Where the page is narrower than the
              containers, both boxes are the same width and look the same — that
              is the point, not a failure.
            </Text>
            <Stack gap={6}>
              <Stack gap={2}>
                <Text role="label" tone="muted">
                  In a narrow Container (28rem)
                </Text>
                <Container size="narrow">
                  <Cq className="border-border rounded-md border p-4">
                    <div
                      className="grid grid-cols-1 gap-4 @xs:grid-cols-2 @lg:grid-cols-3"
                      data-testid="cq-narrow"
                    >
                      {[1, 2, 3, 4].map((n) => (
                        <Panel key={n}>
                          <Text role="small" tone="muted">
                            Card {n}
                          </Text>
                        </Panel>
                      ))}
                    </div>
                  </Cq>
                </Container>
              </Stack>
              <Stack gap={2}>
                <Text role="label" tone="muted">
                  In a page Container (75rem)
                </Text>
                <Container size="page">
                  <Cq className="border-border rounded-md border p-4">
                    <div
                      className="grid grid-cols-1 gap-4 @xs:grid-cols-2 @lg:grid-cols-3"
                      data-testid="cq-wide"
                    >
                      {[1, 2, 3, 4].map((n) => (
                        <Panel key={n}>
                          <Text role="small" tone="muted">
                            Card {n}
                          </Text>
                        </Panel>
                      ))}
                    </div>
                  </Cq>
                </Container>
              </Stack>
            </Stack>
          </Stack>
        </Section>

        <Section>
          <Stack gap={6}>
            <Heading level={2}>Stress: unbroken words</Heading>
            <Text role="small" tone="muted">
              Long words and long URLs wrap rather than pushing the page sideways.
              If any of these cause a horizontal scrollbar, the run fails.
            </Text>
            <Stack gap={4}>
              {LONG_WORDS.map((word) => (
                <Panel key={word}>
                  <Text role="small" tone="muted" className="break-all">
                    {word}
                  </Text>
                </Panel>
              ))}
              <Stack gap={2}>
                <Text role="label" tone="muted">
                  The same words in a Grid and a Cluster
                </Text>
                <Grid min="md" gap={4}>
                  {LONG_WORDS.map((word) => (
                    <Panel key={word}>
                      <Text role="small" tone="muted" className="break-all">
                        {word}
                      </Text>
                    </Panel>
                  ))}
                </Grid>
                <Cluster gap={4}>
                  {LONG_WORDS.map((word) => (
                    <span
                      key={word}
                      className="bg-bg-elevated border-border type-small rounded-md border px-4 py-2 break-all"
                    >
                      {word}
                    </span>
                  ))}
                </Cluster>
              </Stack>
            </Stack>
          </Stack>
        </Section>
      </main>
    </>
  );
}
