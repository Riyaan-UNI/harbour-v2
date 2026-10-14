import { Link } from 'react-router-dom';
import { BentoItem, Grid, Heading, Stack, Text } from '../layout';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { DemoBadge } from '../ui/demo-badge';
import { FeatureConceptArt, type HarbourFeature } from '../landing/FeatureConceptArt';

/**
 * ToolCards — module 9. The four concept-art tool cards.
 *
 * Each card is a `Card variant="flat"` rather than an `InteractiveCard`, and the
 * "Open" action is a real link. Two reasons, both learned in review:
 *
 *   1. **An expandable card cannot carry a link.** `InteractiveCard`'s expand
 *      trigger is `<button className="ui-card__trigger">` sized `inset: 0`, so it
 *      covers the whole card *including the footer*. Any `<a>` rendered inside
 *      is painted over and cannot be clicked — a dead affordance that still
 *      looks like a link to a sighted user.
 *   2. **The spec's own card rule.** `docs/DESIGN_SPEC.md` §8 allows at most
 *      three glass surfaces on screen; the spec's §5 mapping permits one glass
 *      card, not four interactive ones.
 *
 * So the card carries the Harbour concept art and the description, the
 * `DemoBadge` stays, and a `Button asChild` below it navigates to the real tool.
 * The destination is the app shell's own link table (`AppShell.tsx`), so the
 * dashboard and the shell agree on where every tool lives.
 *
 * The concept-art sketches are SAMPLE output, so each card carries a permanent
 * DemoBadge (Appendix B).
 */

type Tool = {
  feature: HarbourFeature;
  title: string;
  description: string;
  /** Where "Open" actually goes — the app shell's own route. */
  to: string;
  /** The shell's label for that route, so the link reads like the nav. */
  openLabel: string;
};

const TOOLS: Tool[] = [
  {
    feature: 'settle',
    title: 'Settlement Assistant',
    description:
      'Ask how to get set up — SIM, bank, Octopus, housing — in your own language.',
    to: '/app/checklist',
    openLabel: 'Open the settle-in list',
  },
  {
    feature: 'scam',
    title: 'Anti-Scam Centre',
    description: 'Flag suspicious messages and offers. Sensitive details are hidden.',
    to: '/app/shield',
    openLabel: 'Open Scam X-ray',
  },
  {
    feature: 'cantonese',
    title: 'Translation Gateway',
    description: 'Speak or type. Get one short sentence in Cantonese.',
    to: '/app/translate',
    openLabel: 'Open the Cantonese helper',
  },
  {
    feature: 'ask',
    title: 'Voice SOS and Community',
    description:
      'Need a hand with an errand? Ask, and a Cantonese-speaking student can help.',
    to: '/app/chat',
    openLabel: 'Open Ask Harbour',
  },
];

export function ToolCards(): JSX.Element {
  return (
    <BentoItem size="full" className="dash-panel">
      <Stack gap={4}>
        <Stack gap={2}>
          <Text role="label" tone="muted">
            Four things Harbour does
          </Text>
          <Heading level={2}>Four tools, one harbour.</Heading>
        </Stack>

        <Grid min="sm" gap={4}>
          {TOOLS.map((tool) => (
            <Stack key={tool.feature} gap={3} className="dash-tool">
              <Card variant="flat" className="dash-tool__card">                <div className="dash-art-box">
                  <FeatureConceptArt feature={tool.feature} />
                </div>
                <CardHeader>
                  <Text role="label" tone="muted">
                    {tool.title}
                  </Text>
                  <Heading level={3}>{tool.title}</Heading>
                </CardHeader>
                <CardContent>
                  <Stack gap={3}>
                    <Text tone="muted">{tool.description}</Text>
                    <DemoBadge variant="sample" />
                  </Stack>
                </CardContent>
              </Card>

              <Button variant="secondary" size="small" asChild>
                <Link to={tool.to}>{tool.openLabel}</Link>
              </Button>
            </Stack>
          ))}
        </Grid>
      </Stack>
    </BentoItem>
  );
}
