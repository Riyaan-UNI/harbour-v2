import type { VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Cluster, Heading, Stack, Text } from '../layout';
import { cardVariants } from './card-variants';

/**
 * Card — spec §8. Three variants:
 *
 *   static       glass
 *   interactive  glass, with a hover and a focus-visible state (Brick 2b adds
 *                the pointer spotlight, the <=6 degree tilt and the expand)
 *   flat         a hairline and no glass, so the border is the only boundary —
 *                which is why it uses `--border-strong`, the token held to 3:1
 *
 * The variants never nest: a Card inside a Card, or glass on glass, is the one
 * thing spec §4 forbids outright. `padded` adds the internal rhythm (a column
 * with a 1.5rem gap) so no caller has to repeat it; pass `padded={false}` for a
 * full-bleed card and lay it out with the primitives yourself.
 */

export type CardProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardVariants> & {
    padded?: boolean;
    children?: ReactNode;
  };

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, variant, padded = true, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant }),
        padded && 'flex flex-col gap-6 p-6',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

export type CardSectionProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

/** The heading block of a card. */
export const CardHeader = forwardRef<HTMLDivElement, CardSectionProps>(
  function CardHeader({ className, children, ...rest }, ref) {
    return (
      <Stack ref={ref} gap={2} className={className} {...rest}>
        {children}
      </Stack>
    );
  },
);

export type CardTitleProps = Omit<
  HTMLAttributes<HTMLHeadingElement>,
  'role'
> & {
  /** Heading rank, decoupled from size. Defaults to 3. */
  level?: 2 | 3 | 4 | 5 | 6;
};

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  function CardTitle({ className, level = 3, children, ...rest }, ref) {
    return (
      <Heading ref={ref} level={level} role="h3" className={className} {...rest}>
        {children}
      </Heading>
    );
  },
);

export type CardDescriptionProps = Omit<
  HTMLAttributes<HTMLParagraphElement>,
  'role'
>;

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(function CardDescription({ className, children, ...rest }, ref) {
  return (
    <Text ref={ref} role="small" tone="muted" className={className} {...rest}>
      {children}
    </Text>
  );
});

/** The body of a card. A column with a 1rem gap. */
export const CardContent = forwardRef<HTMLDivElement, CardSectionProps>(
  function CardContent({ className, children, ...rest }, ref) {
    return (
      <Stack ref={ref} gap={4} className={className} {...rest}>
        {children}
      </Stack>
    );
  },
);

/** The actions at the foot of a card. A wrapping row. */
export const CardFooter = forwardRef<HTMLDivElement, CardSectionProps>(
  function CardFooter({ className, children, ...rest }, ref) {
    return (
      <Cluster ref={ref} gap={3} className={className} {...rest}>
        {children}
      </Cluster>
    );
  },
);
