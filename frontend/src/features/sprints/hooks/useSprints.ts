import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { sprintService } from "../services/sprintService";
import { useTasks } from "@/features/backlog";
import type { Sprint } from "../types";
import type { Task } from "@/types";

export function useSprints(projectId: string) {
  const { data: tasks = [] } = useTasks(projectId);
  const query = useQuery<Sprint[]>({
    queryKey: ["project", projectId, "sprints"],
    queryFn: () => sprintService.getSprints(projectId),
  });

  const sprintsWithMetrics = useMemo(() => {
    return query.data?.map((sprint) => {
      const sprintTasks = tasks.filter((task) => task.sprint === sprint.id);
      const completedCount = sprintTasks.filter((task) => task.status === "done").length;
      return {
        ...sprint,
        taskCount: sprintTasks.length,
        completedCount,
      };
    }) ?? [];
  }, [query.data, tasks]);

  return {
    ...query,
    data: sprintsWithMetrics,
  };
}
