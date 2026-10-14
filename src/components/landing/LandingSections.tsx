import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FinalCall } from './FinalCall';
import { HowItWorks } from './HowItWorks';
import { LiveDemo } from './LiveDemo';
import { PracticeTeaser } from './PracticeTeaser';
import { PreviewStrip } from './PreviewStrip';
import { ProblemCards } from './ProblemCards';
import { RentalBand } from './RentalBand';
import { SectionTransition } from './SectionTransition';
import { ToolsShowcase } from './ToolsShowcase';
import { TrustBand } from './TrustBand';

gsap.registerPlugin(ScrollTrigger, useGSAP);

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
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const sections = gsap.utils.toArray<HTMLElement>(
      '.layout-section',
      root.current,
    );

    sections.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 88%',
            once: true,
          },
        },
      );
    });
  }, { scope: root });

  return (
    <div ref={root} className="landing-motion-sections">
      <ToolsShowcase /><SectionTransition index={0} />
      <RentalBand /><SectionTransition index={1} />
      <ProblemCards /><SectionTransition index={2} />
      <LiveDemo /><SectionTransition index={3} />
      <PracticeTeaser /><SectionTransition index={4} />
      <PreviewStrip /><SectionTransition index={5} />
      <HowItWorks /><SectionTransition index={6} />
      <TrustBand /><SectionTransition index={7} />
      <FinalCall />
    </div>
  );
}
