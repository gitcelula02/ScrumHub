import { useMemo } from 'react';

/**
 * Hook to determine theme tokens based on an entity (Project, Task, etc.)
 */
export const useEntityTheme = (type: 'project' | 'task' | 'sprint', priority?: string) => {
  return useMemo(() => {
    switch (type) {
      case 'project':
        return 'var(--primary)';
      case 'task':
        if (priority === 'high') return 'var(--priority-high)';
        if (priority === 'med') return 'var(--priority-med)';
        return 'var(--priority-low)';
      case 'sprint':
        return 'oklch(0.70 0.15 220)';
      default:
        return 'inherit';
    }
  }, [type, priority]);
};
