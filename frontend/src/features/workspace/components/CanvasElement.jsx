import { useState, useRef, useCallback } from 'react';

/**
 * @component CanvasElement
 * @description Renders a single element on the workspace canvas.
 * Supports drag-to-move and inline text editing for sticky notes and text elements.
 * Follows IDE aesthetic: "Sober, Structured, Sophisticated".
 *
 * COLOR CONTRACT:
 * Consumes --color-brand-500 for selection ring, --color-border for borders.
 * Element background color comes from element.color prop.
 *
 * @param {{
 *   element: Object,
 *   isSelected: boolean,
 *   onSelect: Function,
 *   onUpdate: Function,
 *   onDelete: Function,
 *   onBringToFront: Function,
 * }} props
 *
 * @returns {JSX.Element}
 *
 * @example
 * <CanvasElement
 *   element={el}
 *   isSelected={selectedId === el.id}
 *   onSelect={() => selectElement(el.id)}
 *   onUpdate={(updates) => updateElement(el.id, updates)}
 * />
 */
export function CanvasElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onBringToFront
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(element.content);
  const dragStart = useRef({ x: 0, y: 0, elX: 0, elY: 0 });
  const elementRef = useRef(null);
  const textareaRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    if (isEditing) return;
    if (e.target.closest('.canvas-el-resize') || e.target.closest('.canvas-el-delete')) {
      return;
    }

    e.stopPropagation();
    onSelect();
    onBringToFront();

    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      elX: element.x,
      elY: element.y
    };

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - dragStart.current.x;
      const dy = moveEvent.clientY - dragStart.current.y;
      onUpdate({
        x: dragStart.current.elX + dx,
        y: dragStart.current.elY + dy
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [isEditing, element.x, element.y, onSelect, onUpdate, onBringToFront]);

const handleDoubleClick = (e) => {
  e.stopPropagation();
  if (element.type === 'sticky' || element.type === 'text') {
    setEditContent(element.content);
    setIsEditing(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, 0);
  }
};

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (editContent !== element.content) {
      onUpdate({ content: editContent });
    }
  }, [editContent, element.content, onUpdate]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(element.content);
    }
    if (e.key === 'Enter' && !e.shiftKey && element.type === 'text') {
      e.preventDefault();
      handleBlur();
    }
  }, [element.content, handleBlur, element.type]);

  const handleDeleteClick = useCallback((e) => {
    e.stopPropagation();
    onDelete();
  }, [onDelete]);

  const getElementStyle = () => {
    const base = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      zIndex: element.zIndex,
      cursor: isDragging ? 'grabbing' : 'grab',
      transition: isDragging ? 'none' : 'box-shadow 150ms linear, border-color 150ms linear'
    };

    if (element.type === 'text') {
      return {
        ...base,
        background: 'transparent',
        border: 'none',
        padding: '4px 0',
        outline: 'none'
      };
    }

    return base;
  };

  const renderElementContent = () => {
    if (isEditing) {
      return (
        <textarea
          ref={textareaRef}
          className="canvas-el-textarea"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            color: element.type === 'sticky' ? '#1a1a1a' : 'inherit',
            padding: element.type === 'sticky' ? '8px' : '0'
          }}
        />
      );
    }

    if (element.type === 'sticky') {
      return (
        <div className="canvas-el-sticky-content">
          {element.content || (
            <span className="canvas-el-placeholder">
              Double-click to edit
            </span>
          )}
        </div>
      );
    }

    if (element.type === 'shape') {
      return (
        <div
          className="canvas-el-shape"
          style={{
            width: '100%',
            height: '100%',
            background: element.color || '#e0e7ff',
            border: '1px solid var(--color-border)',
            borderRadius: element.shapeType === 'circle' ? '50%' : '3px'
          }}
        />
      );
    }

    if (element.type === 'text') {
      return (
        <div
          className="canvas-el-text-content"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            lineHeight: '1.5',
            color: 'var(--color-text)',
            whiteSpace: 'pre-wrap'
          }}
        >
          {element.content || 'Double-click to edit'}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      ref={elementRef}
      className={`canvas-element canvas-element--${element.type} ${isSelected ? 'canvas-element--selected' : ''} ${isDragging ? 'canvas-element--dragging' : ''}`}
      style={getElementStyle()}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      role="button"
      tabIndex={0}
      aria-label={`${element.type} element`}
      aria-selected={isSelected}
    >
      {element.type !== 'shape' && element.type !== 'text' && (
        <div
          className="canvas-el-bg"
          style={{ background: element.color || '#fef3c7' }}
        />
      )}

      {renderElementContent()}

      {isSelected && !isEditing && (
        <>
          <div className="canvas-el-resize" title="Resize">
            ◳
          </div>
          <button
            className="canvas-el-delete"
            onClick={handleDeleteClick}
            title="Delete element"
            aria-label="Delete element"
            type="button"
          >
            ✕
          </button>
        </>
      )}
    </div>
  );
}