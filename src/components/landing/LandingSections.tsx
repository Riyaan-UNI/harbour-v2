import { FinalCall } from './FinalCall';
import { HowItWorks } from './HowItWorks';
import { LiveDemo } from './LiveDemo';
import { PracticeTeaser } from './PracticeTeaser';
import { PreviewStrip } from './PreviewStrip';
import { ProblemCards } from './ProblemCards';
import { RentalBand } from './RentalBand';
import { ToolsShowcase } from './ToolsShowcase';
import { TrustBand } from './TrustBand';

/**
 * Everything below the hero — Brick 4's sections, in the addendum's order.
 *
 * This file exists to be one chunk. Spec §12 asks for below-the-fold sections
 * to be code-split: the sections use `InteractiveCard`, which brings in the
 * motion library, and none of that is needed for the hero's first paint.
 * The landing page imports this through `lazy`, so the chunk starts
 * fetching the moment the page mounts and the sections appear a beat later,
 * below the fold, with nothing in the first screen moving.
 */
export function LandingSections(): JSX.Element {
  return (
    <>
      <ToolsShowcase />
      <RentalBand />
      <ProblemCards />
      <LiveDemo />
      <PracticeTeaser />
      <PreviewStrip />
      <HowItWorks />
      <TrustBand />
      <FinalCall />
    </>
  );
}
