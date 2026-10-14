import { Link } from 'react-router-dom';
import { BentoItem, Cluster, Heading, Stack, Text } from '../layout';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Chip } from '../ui/chip';
import { DemoBadge } from '../ui/demo-badge';
import { EmptyState } from '../ui/empty-state';
import { User } from '../ui/icons';
import { FRIEND_DIRECTORY, socialHref } from './dashboard-data';

/**
 * CommunityPanel — module 6. Friends you have added, and the social handles you
 * share. A flat card.
 *
 * Friends render as mascot image avatars (the additive `Avatar src` path), each
 * a real link to that person's profile, with a `+N` chip for overflow. The
 * directory is SAMPLE, so the panel carries a permanent DemoBadge. Only the
 * four known sample people can be named; any other id is ignored rather than
 * invented.
 */

/** How many avatars fit before the overflow chip takes over. */
const MAX_AVATARS = 4;

export type CommunityPanelProps = {
  friends: string[];
  socials: Record<string, string>;
};

export function CommunityPanel({
  friends,
  socials,
}: CommunityPanelProps): JSX.Element {
  const known = friends.flatMap((id) => {
    const entry = FRIEND_DIRECTORY[id];
    return entry ? [{ id, ...entry }] : [];
  });
  const shown = known.slice(0, MAX_AVATARS);
  const overflow = known.length - shown.length;

  const socialLinks = Object.entries(socials)
    .map(([platform, handle]) => ({
      platform,
      handle,
      href: socialHref(platform, handle),
    }))
    .filter((entry): entry is { platform: string; handle: string; href: string } =>
      Boolean(entry.href),
    );

  return (
    <BentoItem size="half" className="dash-lower">
      <Card variant="flat">
        <CardHeader>
          <Cluster justify="between" align="center" gap={3}>
            <Text role="label" tone="muted">
              Your community
            </Text>
            <DemoBadge variant="sample" />
          </Cluster>
          <Heading level={2}>Friends you have added</Heading>
        </CardHeader>

        <CardContent>
          {known.length > 0 ? (
            <Stack gap={2}>
              <Cluster gap={2}>
                {shown.map((friend) => (
                  <Link
                    key={friend.id}
                    to={`/app/profile/${friend.id}`}
                    className="dash-friend"
                  >
                    <Avatar name={friend.name} src={friend.mascot} size="md" />
                  </Link>
                ))}
                {overflow > 0 ? (
                  <Chip variant="neutral" aria-label={`${overflow} more`}>
                    +{overflow}
                  </Chip>
                ) : null}
              </Cluster>
              <Text role="small" tone="muted">
                People you have added on this device.
              </Text>
            </Stack>
          ) : (
            <EmptyState
              title="No friends yet"
              icon={<User className="text-accent-text size-8" />}
              action={
                <Button size="small" asChild>
                  <Link to="/app/people">Find people</Link>
                </Button>
              }
            >
              Search the sample directory to add someone.
            </EmptyState>
          )}

          <Stack gap={2}>
            <Text role="label" tone="muted">
              Shared by you
            </Text>
            {socialLinks.length > 0 ? (
              <Cluster gap={2}>
                {socialLinks.map((entry) => (
                  <Chip key={entry.platform} asChild variant="neutral">
                    <a href={entry.href} target="_blank" rel="noreferrer">
                      {entry.platform} · @{entry.handle.replace(/^@/, '')}
                    </a>
                  </Chip>
                ))}
              </Cluster>
            ) : (
              <Text role="small" tone="muted">
                Add optional usernames in your profile to show them here.
              </Text>
            )}
          </Stack>
        </CardContent>
      </Card>
    </BentoItem>
  );
}
