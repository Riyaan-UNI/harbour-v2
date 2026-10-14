import { useEffect, useRef, useState } from 'react';
import { Cluster, Grid, Heading, Stack, Text } from '../../components/layout';
import { Button, Tabs, TabsList, TabsPanel, TabsTrigger } from '../../components/ui';
import { XrayPanel } from '../../components/app/scam/XrayPanel';
import { DrillPanel } from '../../components/app/scam/DrillPanel';
import { SampleRead } from '../../components/app/scam/SampleRead';
import { RecoverySection } from '../../components/app/scam/RecoverySection';
import { FinalCall } from '../../components/app/scam/FinalCall';
import { ScamXrayScene } from '../../components/app/scam/ScamXrayScene';

/**
 * ScamShield — the `/app/scam` page.
 *
 * The v2 rebuild of the old build's Shield page, following the structure the
 * owner approved: a hero, the tool behind two tabs (Scam X-ray and Scam
 * Drill), a SAMPLE-labelled example read, an "if it already happened"
 * recovery section, and a calm final call. The inspiration page's logo strip
 * and testimonials are deliberately absent — inventing customers or praise is
 * banned, and the page spends the space on the tool and the recovery steps
 * instead.
 *
 * The hero's "check a message" CTA moves focus into the tool's textarea,
 * which needs the switch-then-focus dance: the X-ray panel starts `hidden`
 * when the drill tab is current, and a hidden element cannot take focus. So
 * the click asks for focus and the effect performs it once the panel is
 * visible again.
 */
export default function ScamShield(): JSX.Element {
  const [tab, setTab] = useState('xray');
  const [pendingFocus, setPendingFocus] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!pendingFocus || tab !== 'xray') return;
    inputRef.current?.focus();
    setPendingFocus(false);
  }, [pendingFocus, tab]);

  function showXray(): void {
    setPendingFocus(true);
    setTab('xray');
  }

  function showDrill(): void {
    setTab('drill');
  }

  return (
    <div className="scam-shield">
      <Stack gap={8}>
        <Grid min="md" gap={8} className="scam-shield__hero">
          <Stack gap={3}>
            <Text role="label" tone="subtle">
              SAFETY TOOL
            </Text>
            <Heading level={1}>See through the message.</Heading>
            <Text role="body" tone="muted">
              Paste a suspicious message. Get the patterns, the warning signs
              and a next step — not a verdict.
            </Text>
            <Text role="small" tone="subtle">
              This runs a basic keyword check in your browser. It does not say
              whether a message is genuine.
            </Text>
            <Cluster gap={3}>
              <Button onClick={showXray}>Check a message</Button>
              <Button variant="secondary" onClick={showDrill}>
                Practise a scam
              </Button>
            </Cluster>
          </Stack>
          <ScamXrayScene />
        </Grid>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList aria-label="Scam Shield tools" className="scam-shield__tabs">
            <TabsTrigger value="xray">Check a message</TabsTrigger>
            <TabsTrigger value="drill">Practise a scam</TabsTrigger>
          </TabsList>
          <TabsPanel value="xray" className="scam-shield__panel">
            <XrayPanel inputRef={inputRef} />
          </TabsPanel>
          <TabsPanel value="drill" className="scam-shield__panel">
            <DrillPanel />
          </TabsPanel>
        </Tabs>

        <SampleRead />
        <RecoverySection />
        <FinalCall onXray={showXray} onDrill={showDrill} />
      </Stack>
    </div>
  );
}
