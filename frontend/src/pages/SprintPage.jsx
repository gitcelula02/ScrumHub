import { useParams } from 'react-router-dom';
import { SprintView } from '@/features/sprints/components/SprintView';
import { useSprints } from '@/features/sprints/hooks/useSprints';
import { useBacklog } from '@/features/backlog/hooks/useBacklog';

/**
 * @page SprintPage
 * @route /projects/:projectId/sprints
 * @description Sprint management page. Provides sprint list + unassigned backlog tasks
 * to SprintView for assignment workflows.
 */
export default function SprintPage() {
  const { projectId } = useParams();
  const { sprints, loading: sprintsLoading, error } = useSprints(projectId);
  const { epics,   loading: backlogLoading }        = useBacklog(projectId);

  // Flatten unassigned tasks for the backlog assignment panel
  const unassigned = epics
    .flatMap(e => e.tasks ?? [])
    .filter(t => !t.sprintId);

  return (
    <SprintView
      sprints={sprints}
      backlog={unassigned}
      loading={sprintsLoading || backlogLoading}
      error={error}
    />
  );
}
