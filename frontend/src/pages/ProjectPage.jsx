import { useParams } from 'react-router-dom';
import { ProjectStatsView } from '@/features/projects/components/ProjectStatsView';
import { useBacklog } from '@/features/backlog/hooks/useBacklog';
import { useSprints } from '@/features/sprints/hooks/useSprints';

/**
 * @page ProjectPage
 * @route /projects/:projectId
 * @description Shows the project statistics overview when a user clicks a project.
 * Composes ProjectStatsView with data from backlog and sprint hooks.
 */
export default function ProjectPage() {
  const { projectId } = useParams();
  const { epics, loading: backlogLoading }    = useBacklog(projectId);
  const { sprints, loading: sprintsLoading }  = useSprints(projectId);

  return (
    <ProjectStatsView
      project={{ name: 'Project' }}
      epics={epics}
      sprints={sprints}
      loading={backlogLoading || sprintsLoading}
    />
  );
}
