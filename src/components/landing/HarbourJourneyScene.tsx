import { motion, useReducedMotion } from 'motion/react';
import artworkUrl from '../../../art/harbour-hero-concept-01.svg';
import { Cluster, Stack, Text } from '../layout';
import { DemoBadge } from '../ui';
import { CheckCircle, GraduationCap, ShieldAlert } from '../ui/icons';

const STEPS = [
  { label: 'Find your next step', icon: CheckCircle },
  { label: 'Make the words clearer', icon: GraduationCap },
  { label: 'Check before you act', icon: ShieldAlert },
] as const;

/** The supplied Harbour SVG carries its own accessible, reduced-motion-aware animation. */
export function HarbourJourneyScene(): JSX.Element {
  const reduced = useReducedMotion();

  return (
    <motion.figure
      className="journey-scene"
      initial={false}
      animate={{ y: 0 }}
      transition={{ duration: reduced ? 0 : 0.6 }}
      aria-label="Illustrated introduction to Harbour’s student support tools"
    >
      <div className="journey-scene__art">
        <img
          src={artworkUrl}
          alt="Students climb bright city steps together, surrounded by conversation, checklist and safety symbols."
          width="554"
          height="416"
          loading="eager"
          decoding="async"
        />
      </div>
      <figcaption className="journey-scene__sample">
        <Stack gap={4}>
          <Cluster gap={3} className="journey-scene__sample-top">
            <Text role="label" tone="muted">Your first weeks</Text>
            <DemoBadge variant="sample" />
          </Cluster>
          <Stack as="ul" gap={3} className="journey-scene__steps">
            {STEPS.map(({ label, icon: Icon }, index) => (
              <motion.li
                key={label}
                className="journey-scene__step"
                initial={false}
                whileInView={reduced ? undefined : { x: [8, 0] }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
              >
                <Icon className="journey-scene__step-icon" />
                <Text role="small">{label}</Text>
              </motion.li>
            ))}
          </Stack>
        </Stack>
      </figcaption>
    </motion.figure>
  );
}
