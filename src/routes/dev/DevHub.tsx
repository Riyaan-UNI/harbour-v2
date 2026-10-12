import { Link } from 'react-router-dom';
import { Aurora } from '../../components/Aurora';
import { ThemeToggle } from '../../components/ThemeToggle';
import {
  Cluster,
  Container,
  Grid,
  Heading,
  Section,
  Stack,
  Text,
} from '../../components/layout';
import { Card } from '../../components/ui';
import { ROUTES } from '../route-config';

/**
 * /dev — the dev hub.
 *
 * A single place to see every route, grouped by production and dev, with
 * descriptions and brick numbers. Each card links to its route. The header
 * carries the theme toggle and a link back to the landing page.
 */

function RouteCard({ route }: { route: (typeof ROUTES)[number] }): JSX.Element {
  return (
    <Card variant="flat" className="h-full">
      <Stack gap={4} className="p-6">
        <Cluster justify="between" align="center" gap={3}>
          <Heading level={3} role="h3">
            {route.label}
          </Heading>
          <Text role="label" tone="muted">
            Brick {route.brick}
          </Text>
        </Cluster>
        <Text tone="muted">{route.description}</Text>
        <Text role="small" tone="subtle">
          {route.path}
        </Text>
        <div>
          <Link
            to={route.path}
            aria-label={`Open ${route.label}`}
            className="text-accent-text hover:text-text inline-flex items-center text-sm font-medium transition-colors"
          >
            Open →
          </Link>
        </div>
      </Stack>
    </Card>
  );
}

export function DevHub(): JSX.Element {
  const production = ROUTES.filter((r) => r.group === 'production');
  const dev = ROUTES.filter((r) => r.group === 'dev');

  return (
    <>
      <Aurora />

      <main className="layer-raised">
        <Section>
          <Container>
            <Stack gap={8}>
              <Cluster as="header" justify="between" align="start" gap={6}>
                <Stack gap={3}>
                  <Text role="label" tone="muted">
                    Harbour · Dev hub
                  </Text>
                  <Heading level={1}>Routes</Heading>
                  <Text tone="muted">
                    Every route in the app, with its brick number and a quick
                    description.
                  </Text>
                </Stack>
                <ThemeToggle />
              </Cluster>

              <Stack gap={6}>
                <Heading level={2} role="h2">
                  Production
                </Heading>
                <Grid min="md" gap={6}>
                  {production.map((route) => (
                    <RouteCard key={route.path} route={route} />
                  ))}
                </Grid>
              </Stack>

              <Stack gap={6}>
                <Heading level={2} role="h2">
                  Development
                </Heading>
                <Grid min="md" gap={6}>
                  {dev.map((route) => (
                    <RouteCard key={route.path} route={route} />
                  ))}
                </Grid>
              </Stack>
            </Stack>
          </Container>
        </Section>
      </main>
    </>
  );
}
