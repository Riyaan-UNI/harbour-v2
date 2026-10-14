import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Cluster, Grid, Heading, Stack, Text } from '../components/layout';
import {
  Button,
  Card,
  DemoBadge,
  Input,
  Mascot,
  toast,
  UniversityLogo,
} from '../components/ui';
import {
  Bookmark,
  Heart,
  MapPin,
  MessageCircle,
  Search,
  Share2,
} from '../components/ui/icons';
import { SAMPLE_PEOPLE, SAMPLE_TAGS, type SamplePerson } from '../lib/sample-people';
import { PeopleScene } from '../components/app/PeopleScene';

/**
 * People — the redesigned `/app/people`.
 *
 * The old ported page was a plain directory of list-cards. This rebuild keeps
 * every behaviour it had — free-text search, interest chips, a per-community
 * friend toggle that persists to `harbour-friends`, and the honesty note that
 * these are samples — but reshapes each entry as an Instagram-style post card
 * and gives every person a mascot they keep as their profile picture.
 *
 * The roster is no longer local: it comes from `src/lib/sample-people.ts`, the
 * one array the directory and each person's public profile both read, so a
 * mascot set here is the same creature that greets you on `/app/profile/:id`.
 *
 * Built against the v2 system only: layout primitives and shared components for
 * structure and surface, `Mascot` for the avatars, and tokens for every colour,
 * space and radius. Each card carries its accent as a `--person-accent` scope
 * (a reference to a §3 chart token), so the mascot, hashtags and glow re-theme
 * with the page in both dark and light. Nothing here invents a real statistic:
 * like and comment counts are sample scenery, the cards are badged, and friend
 * connections stay on this device.
 */

function readFriends(): string[] {
  try {
    return JSON.parse(localStorage.getItem('harbour-friends') || '[]');
  } catch {
    return [];
  }
}

export function People(): JSX.Element {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [friends, setFriends] = useState<string[]>(readFriends);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const filtered = useMemo(
    () =>
      SAMPLE_PEOPLE.filter((person) => {
        const matchesQuery = `${person.name} ${person.country} ${person.university} ${person.tags.join(' ')}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesTag = !activeTag || person.tags.includes(activeTag);
        return matchesQuery && matchesTag;
      }),
    [query, activeTag],
  );

  function toggleFriend(id: string): void {
    const person = SAMPLE_PEOPLE.find((item) => item.id === id);
    const added = friends.includes(id);
    const next = added
      ? friends.filter((item) => item !== id)
      : [...friends, id];
    setFriends(next);
    try {
      localStorage.setItem('harbour-friends', JSON.stringify(next));
    } catch {
      /* On this visit only, if storage is blocked. */
    }
    if (person) {
      toast.success(added ? `${person.name} removed.` : `${person.name} added to your people.`);
    }
  }

  function toggleLike(id: string): void {
    setLiked((current) => ({ ...current, [id]: !current[id] }));
  }

  function toggleSave(id: string): void {
    setSaved((current) => ({ ...current, [id]: !current[id] }));
  }

  return (
    <div className="app-people">
      <PeopleScene />
      <div className="app-people__shell">
        <Stack gap={6}>
          {/* Masthead — editorial, left-aligned, matching the rest of the app. */}
          <header className="app-people-intro">
            <span className="app-people-eyebrow">Community · sample directory</span>
            <Heading level={1} role="h1">
              Find your people.
            </Heading>
            <Text role="body" tone="muted" className="app-people-lede">
              Search by name, university, home region, or shared interests. These
              sample profiles are here to show how Harbour connections work.
            </Text>
          </header>

          <div className="app-people-banner">
            <DemoBadge variant="demo">Local demo</DemoBadge>
            <Text role="small" tone="muted">
              Friend connections are saved on this device. No real users are being
              contacted, and the mascots are illustrations.
            </Text>
          </div>

          {/* Controls — free-text search plus the interest chips. */}
          <div className="app-people-controls">
            <div className="app-people-search">
              <span className="app-people-search__icon" aria-hidden="true">
                <Search />
              </span>
              <Input
                type="search"
                className="app-people-search__input"
                aria-label="Search people, universities, or interests"
                placeholder="Search people, universities, or interests"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <Cluster className="app-people-chips" role="group" aria-label="Filter by interest">
              <button
                type="button"
                className="app-people-chip"
                aria-pressed={activeTag === ''}
                onClick={() => setActiveTag('')}
              >
                All
              </button>
              {SAMPLE_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className="app-people-chip"
                  aria-pressed={activeTag === tag}
                  onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
                >
                  {tag}
                </button>
              ))}
            </Cluster>
          </div>

          {/* Results header — count and a steady link to your own profile. */}
          <Cluster className="app-people-results-head" justify="between" align="center">
            <span className="type-small text-text-muted">
              {filtered.length} sample {filtered.length === 1 ? 'profile' : 'profiles'}
            </span>
            <Link className="app-people-profilelink" to="/app/profile">
              View my profile
              <span aria-hidden="true"> ↗</span>
            </Link>
          </Cluster>

          {filtered.length > 0 ? (
            <Grid min="md" gap={6} className="app-people-grid">
              {filtered.map((person) => {
                const isFriend = friends.includes(person.id);
                const isLiked = Boolean(liked[person.id]);
                const isSaved = Boolean(saved[person.id]);
                const likeCount = person.likes + (isLiked ? 1 : 0);
                return (
                  <PersonCard
                    key={person.id}
                    person={person}
                    isFriend={isFriend}
                    isLiked={isLiked}
                    isSaved={isSaved}
                    likeCount={likeCount}
                    onFriend={() => toggleFriend(person.id)}
                    onLike={() => toggleLike(person.id)}
                    onSave={() => toggleSave(person.id)}
                    onFilterTag={setActiveTag}
                  />
                );
              })}
            </Grid>
          ) : (
            <div className="app-people-empty">
              <span className="app-people-empty__glyph" aria-hidden="true">
                <Search />
              </span>
              <Heading level={2} role="h2">
                No matches yet.
              </Heading>
              <Text role="body" tone="muted">
                Try a different name, university, or interest.
              </Text>
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery('');
                  setActiveTag('');
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </Stack>
      </div>
    </div>
  );
}

type PersonCardProps = {
  person: SamplePerson;
  isFriend: boolean;
  isLiked: boolean;
  isSaved: boolean;
  likeCount: number;
  onFriend: () => void;
  onLike: () => void;
  onSave: () => void;
  onFilterTag: (tag: string) => void;
};

/** A single Instagram-shaped post: mascot header, post scene, actions, caption. */
function PersonCard({
  person,
  isFriend,
  isLiked,
  isSaved,
  likeCount,
  onFriend,
  onLike,
  onSave,
  onFilterTag,
}: PersonCardProps): JSX.Element {
  return (
    <Card
      variant="static"
      padded={false}
      className="app-person"
      style={{ '--person-accent': person.accent } as CSSProperties}
    >
      {/* Post scene — the mascot against its own accent field. */}
      <div className="app-person__media">
        <DemoBadge variant="sample" className="app-person__stickershape">
          Sample
        </DemoBadge>
        <Mascot
          kind={person.mascot}
          className="app-person__mascot"
          title={`${person.name}’s mascot`}
        />
        <span className="app-person__place">
          <MapPin />
          {person.place}
        </span>
        <UniversityLogo
          id={person.universityId}
          size="md"
          variant="art"
          className="app-person__crest"
        />
      </div>

      <div className="app-person__body">
        {/* Header — pfp mascot, name, and the follow (friend) toggle. */}
        <Cluster className="app-person__head" justify="between" align="center">
          <Link
            className="app-person__identity"
            to={`/app/profile/${person.id}`}
            aria-label={`Open ${person.name}’s profile`}
          >
            <span className="app-person__pfp" aria-hidden="true">
              <Mascot kind={person.mascot} className="app-person__pfp-img" />
            </span>
            <span className="app-person__who">
              <span className="app-person__handle">{person.handle}</span>
              <span className="app-person__place-inline">
                <img
                  className="app-person__flag"
                  src={`/flags/${person.countryCode}.svg`}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                />
                {person.university} · {person.country}
              </span>
            </span>
          </Link>
          <Button
            size="small"
            variant={isFriend ? 'secondary' : 'primary'}
            aria-pressed={isFriend}
            onClick={onFriend}
          >
            {isFriend ? 'Following' : 'Follow'}
          </Button>
        </Cluster>

        {/* Action bar — like, comment, share; save pinned right. */}
        <div className="app-person__actions">
          <Cluster gap={1} align="center">
            <button
              type="button"
              className={`app-person-action app-person-action--like${isLiked ? ' is-active' : ''}`}
              aria-pressed={isLiked}
              aria-label={isLiked ? `Unlike ${person.name}’s post` : `Like ${person.name}’s post`}
              onClick={onLike}
            >
              <Heart />
            </button>
            <button
              type="button"
              className="app-person-action"
              aria-label={`Comment on ${person.name}’s post`}
              onClick={() => toast('Comments are part of the sample directory.')}
            >
              <MessageCircle />
            </button>
            <button
              type="button"
              className="app-person-action"
              aria-label={`Share ${person.name}’s post`}
              onClick={() => toast('Sharing is part of the sample directory.')}
            >
              <Share2 />
            </button>
          </Cluster>
          <button
            type="button"
            className={`app-person-action app-person-action--save${isSaved ? ' is-active' : ''}`}
            aria-pressed={isSaved}
            aria-label={isSaved ? `Remove ${person.name} from saved` : `Save ${person.name}’s post`}
            onClick={onSave}
          >
            <Bookmark />
          </button>
        </div>

        <Stack gap={2} className="app-person__meta">
          <span className="type-small text-text">
            {likeCount.toLocaleString('en-HK')} likes
          </span>
          <Text role="small" className="app-person__caption">
            <strong className="app-person__caption-name">{person.handle}</strong>{' '}
            {person.note}{' '}
            {person.tags.map((tag) => (
              <button
                type="button"
                key={tag}
                className="app-person__tag"
                onClick={() => onFilterTag(tag)}
              >
                #{tag}
              </button>
            ))}
          </Text>
          <Cluster justify="between" align="center" className="app-person__foot">
            <button
              type="button"
              className="app-person__comments"
              onClick={() => toast('Comments are part of the sample directory.')}
            >
              View all {person.comments} comments
            </button>
            <span className="app-person__time">{person.timeAgo}</span>
          </Cluster>
        </Stack>
      </div>
    </Card>
  );
}

