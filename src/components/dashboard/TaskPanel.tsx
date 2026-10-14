import { Link } from 'react-router-dom';
import { BentoItem, Cluster, Heading, Stack, Text } from '../layout';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Chip } from '../ui/chip';
import { ProgressRing } from '../ui/progress-ring';

/**
 * TaskPanel — module 4. The settle-in progress ring plus the next uncompleted
 * steps from the user's own lists.
 *
 * The ring is decorative and static; the words beside it carry the number, so a
 * progress indicator is never the only carrier of meaning (Addendum 1 rule 4).
 * The denominator is the steps this device actually knows about, so no total is
 * invented.
 */

export type TaskPanelProps = {
  done: number;
  total: number;
  progress: number;
  nextTasks: { id: string; text: string }[];
};

export function TaskPanel({
  done,
  total,
  progress,
  nextTasks,
}: TaskPanelProps): JSX.Element {
  return (
    <BentoItem size="third" className="dash-panel">
      <Card variant="flat">
        <CardHeader>
          <Text role="label" tone="muted">
            Settle-in progress
          </Text>
          <Heading level={2}>Small steps count.</Heading>
        </CardHeader>

        <CardContent>
          <Cluster gap={4} align="center">
            <ProgressRing value={progress} size="lg" />
            <Stack gap={1}>
              <Text role="body">
                <strong>{done}</strong> of {total} recorded steps
              </Text>
              <Text role="small" tone="muted">
                Kept on this device.
              </Text>
            </Stack>
          </Cluster>

          {nextTasks.length > 0 ? (
            <Stack gap={2}>
              <Text role="label" tone="muted">
                Next up
              </Text>
              <Cluster gap={2}>
                {nextTasks.map((task) => (
                  <Chip key={task.id} asChild variant="neutral">
                    <Link to="/app/checklist">{task.text}</Link>
                  </Chip>
                ))}
              </Cluster>
            </Stack>
          ) : null}

          <Button variant="secondary" size="small" asChild>
            <Link to="/app/checklist">Open my settle-in list</Link>
          </Button>
        </CardContent>
      </Card>
    </BentoItem>
  );
}
