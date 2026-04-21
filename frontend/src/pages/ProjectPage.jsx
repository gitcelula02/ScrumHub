import { useParams } from 'react-router-dom';
import { OverviewView } from '@/features/overview/components/OverviewView';
import { useOverview } from '@/features/overview/hooks/useOverview';
import { useBacklog } from '@/features/backlog/hooks/useBacklog';

/**
 * @page ProjectPage
 * @route /projects/:projectId
 * @description Shows the project overview with statistics, charts, and team info.
 * Composes OverviewView with data from useOverview and useBacklog hooks.
 */
export default function ProjectPage() {
  const { projectId } = useParams();
  const {
    loading,
    stats,
    velocityData,
    teamWorkload,
    overdueTasks,
    upcomingDeadlines,
    recentActivity,
    chatNotifications,
    nextDaily,
    userTasks,
    projectDescription,
    updateDescription,
  } = useOverview(projectId);

  const { epics, loading: backlogLoading } = useBacklog(projectId);

  const combinedLoading = loading || backlogLoading;

  return (
    <OverviewView
      stats={{ ...stats, epics }}
      velocityData={velocityData}
      teamWorkload={teamWorkload}
      overdueTasks={overdueTasks}
      upcomingDeadlines={upcomingDeadlines}
      recentActivity={recentActivity}
      chatNotifications={chatNotifications}
      nextDaily={nextDaily}
      userTasks={userTasks}
      projectDescription={projectDescription}
      loading={combinedLoading}
      onUpdateDescription={updateDescription}
    />
  );
}
