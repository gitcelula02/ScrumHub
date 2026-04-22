import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { SprintView } from '@/features/sprints/components/SprintView';
import { useSprints } from '@/features/sprints/hooks/useSprints';
import { useBacklog } from '@/features/backlog/hooks/useBacklog';

/**
 * @page SprintPage
 * @route /projects/:projectId/sprints
 * @description Sprint management page with redesigned sprint view.
 */
export default function SprintPage() {
  const { projectId } = useParams();
  const { sprints, loading: sprintsLoading, error, is404, refetch } = useSprints(projectId);
  const { epics, loading: backlogLoading } = useBacklog(projectId);

  const handleCreateSprint = useCallback(async (sprintData) => {
    console.info('[Sprint] Create sprint:', sprintData);
    refetch();
  }, [refetch]);

  return (
    <SprintView
      sprints={sprints}
      backlog={epics}
      loading={sprintsLoading || backlogLoading}
      error={error}
      is404={is404}
      onCreateSprint={handleCreateSprint}
    />
  );
}
