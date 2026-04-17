import { useState, useCallback } from 'react';

/**
 * @hook useCanvasElements
 * @description Manages canvas element state including add, move, resize, delete,
 * and update operations. Handles element selection and z-index ordering.
 *
 * @param {Object[]} initialElements - Initial elements array (from workspace data)
 *
 * @returns {{
 *   elements: Object[],
 *   selectedId: string | null,
 *   addElement: Function,
 *   updateElement: Function,
 *   deleteElement: Function,
 *   selectElement: Function,
 *   clearSelection: Function,
 *   bringToFront: Function,
 *   saveElements: Function,
 * }}
 *
 * @example
 * const {
 *   elements,
 *   selectedId,
 *   addElement,
 *   updateElement,
 *   deleteElement,
 *   selectElement,
 *   clearSelection
 * } = useCanvasElements([]);
 */
export function useCanvasElements(initialElements = []) {
  const [elements, setElements] = useState(initialElements);
  const [selectedId, setSelectedId] = useState(null);
  const [nextZIndex, setNextZIndex] = useState(
    initialElements.length > 0
      ? Math.max(...initialElements.map(e => e.zIndex)) + 1
      : 1
  );

  const addElement = useCallback((type) => {
    const id = `el-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const baseElement = {
      id,
      type,
      x: 100 + Math.random() * 200,
      y: 80 + Math.random() * 150,
      width: type === 'text' ? 300 : 180,
      height: type === 'text' ? 40 : 120,
      content: type === 'sticky' ? '' : type === 'text' ? 'Double-click to edit' : '',
      color: type === 'sticky' ? '#fef3c7' : type === 'shape' ? '#e0e7ff' : 'transparent',
      shapeType: type === 'shape' ? 'rect' : null,
      zIndex: nextZIndex
    };

    setElements(prev => [...prev, baseElement]);
    setNextZIndex(prev => prev + 1);
    setSelectedId(id);
    return id;
  }, [nextZIndex]);

  const updateElement = useCallback((id, updates) => {
    setElements(prev =>
      prev.map(el =>
        el.id === id ? { ...el, ...updates } : el
      )
    );
  }, []);

  const deleteElement = useCallback((id) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  }, [selectedId]);

  const selectElement = useCallback((id) => {
    setSelectedId(id);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
  }, []);

  const bringToFront = useCallback((id) => {
    setElements(prev =>
      prev.map(el =>
        el.id === id ? { ...el, zIndex: nextZIndex } : el
      )
    );
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  return {
    elements,
    selectedId,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    clearSelection,
    bringToFront
  };
}