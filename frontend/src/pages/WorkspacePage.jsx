import { useParams } from 'react-router-dom';
import { useWorkspace, useCanvasElements } from '@/features/workspace/hooks';
import { WorkspaceView } from '@/features/workspace/components';
import { workspaceService } from '@/features/workspace/services';

/**
 * @page WorkspacePage
 * @route /projects/:projectId/workspace
 * @description Thin orchestrator page for the workspace canvas.
 * Fetches workspace data and composes the WorkspaceView component.
 *
 * Per three-tier rule: this is a Tier 3 page (thin orchestrator).
 * It calls hooks and renders feature components — zero rendering logic.
 */
export default function WorkspacePage() {
  const { projectId } = useParams();
  const { workspace, loading, error, is404 } = useWorkspace(projectId);

  const {
    elements,
    selectedId,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    clearSelection,
    bringToFront
  } = useCanvasElements(workspace?.elements ?? []);

  const handleSave = async () => {
    await workspaceService.saveElements(projectId, elements);
  };

  return (
    <WorkspaceView
      elements={elements}
      selectedId={selectedId}
      loading={loading}
      error={error}
      is404={is404}
      onAddElement={addElement}
      onUpdateElement={updateElement}
      onDeleteElement={deleteElement}
      onSelectElement={selectElement}
      onClearSelection={clearSelection}
      onBringToFront={bringToFront}
      onSave={handleSave}
    />
  );
}