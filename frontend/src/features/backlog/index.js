/**
 * @barrel features/backlog
 * @description Public API for the backlog feature.
 * Import from here in pages and other features — never from internal paths.
 *
 *   import { BacklogTable, useBacklog } from '@/features/backlog';
 */
export { BacklogTable }  from './components/BacklogTable';
export { useBacklog }    from './hooks/useBacklog';
export { backlogService} from './services/backlogService';
