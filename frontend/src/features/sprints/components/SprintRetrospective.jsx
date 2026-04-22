import { useState, useCallback } from 'react';

/**
 * @component SprintRetrospective
 * @description Free-form retrospective documents space.
 * Multiple documents that can be organized, renamed, and edited.
 */
export function SprintRetrospective({ onClose }) {
  const [documents, setDocuments] = useState([
    { id: 'doc-1', title: 'What Went Well', content: getInitialContent('What Went Well') },
    { id: 'doc-2', title: 'What Could Be Improved', content: getInitialContent('What Could Be Improved') },
    { id: 'doc-3', title: 'Action Items', content: getInitialContent('Action Items') },
  ]);
  const [activeDocId, setActiveDocId] = useState('doc-1');
  const [isCreating, setIsCreating] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');

  const activeDoc = documents.find(d => d.id === activeDocId);

  const handleCreateDoc = () => {
    if (!newDocTitle.trim()) return;
    const newDoc = {
      id: `doc-${Date.now()}`,
      title: newDocTitle.trim(),
      content: getInitialContent(newDocTitle.trim()),
    };
    setDocuments(prev => [...prev, newDoc]);
    setActiveDocId(newDoc.id);
    setNewDocTitle('');
    setIsCreating(false);
  };

  const handleUpdateContent = useCallback((content) => {
    setDocuments(prev =>
      prev.map(d => d.id === activeDocId ? { ...d, content } : d)
    );
  }, [activeDocId]);

  const handleRenameDoc = (docId, newTitle) => {
    setDocuments(prev =>
      prev.map(d => d.id === docId ? { ...d, title: newTitle } : d)
    );
  };

  const handleDeleteDoc = (docId) => {
    if (documents.length <= 1) return;
    const newDocs = documents.filter(d => d.id !== docId);
    setDocuments(newDocs);
    if (activeDocId === docId) {
      setActiveDocId(newDocs[0]?.id);
    }
  };

  const handleClose = () => {
    onClose?.();
  };

  return (
    <div className="retrospective-overlay" onClick={handleClose}>
      <div className="retrospective-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="retrospective-header">
          <div className="d-flex align-items-center gap-3">
            <h2 className="h5 fw-medium mb-0">Sprint Retrospective</h2>
            <span className="text-xs text-secondary">Sprint documents</span>
          </div>
          <button className="btn-close" onClick={handleClose} aria-label="Close" />
        </div>

        {/* Body */}
        <div className="retrospective-body">
          {/* Sidebar - Document list */}
          <div className="retrospective-sidebar">
            <div className="retrospective-doc-list">
              {documents.map(doc => (
                <div
                  key={doc.id}
                  className={`retrospective-doc-item ${activeDocId === doc.id ? 'active' : ''}`}
                  onClick={() => setActiveDocId(doc.id)}
                >
                  <span className="retrospective-doc-icon">📄</span>
                  <span className="retrospective-doc-title">{doc.title}</span>
                  <button
                    className="btn btn-link btn-sm p-0 ms-auto"
                    onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc.id); }}
                    aria-label={`Delete ${doc.title}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {isCreating ? (
              <div className="retrospective-create-form">
                <input
                  type="text"
                  className="form-control form-control-sm mb-2"
                  placeholder="Document title..."
                  value={newDocTitle}
                  onChange={e => setNewDocTitle(e.target.value)}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleCreateDoc()}
                />
                <div className="d-flex gap-2">
                  <button className="btn btn-primary btn-sm flex-grow-1" onClick={handleCreateDoc}>
                    Create
                  </button>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => setIsCreating(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="btn btn-outline-primary btn-sm w-100 mt-2"
                onClick={() => setIsCreating(true)}
              >
                + New Document
              </button>
            )}
          </div>

          {/* Main content - Document editor */}
          <div className="retrospective-content">
            {activeDoc ? (
              <div className="retrospective-editor">
                <div className="retrospective-editor-header">
                  <input
                    type="text"
                    className="form-control form-control-lg border-0 p-0 fw-medium"
                    value={activeDoc.title}
                    onChange={e => handleRenameDoc(activeDoc.id, e.target.value)}
                    aria-label="Document title"
                  />
                </div>
                <RetrospectiveEditor
                  content={activeDoc.content}
                  onChange={handleUpdateContent}
                />
              </div>
            ) : (
              <div className="text-center text-secondary py-5">
                Select or create a document to start
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RetrospectiveEditor({ content, onChange }) {
  const [showToolbar, setShowToolbar] = useState(true);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const handleTableInsert = () => {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    if (rows && cols) {
      let table = '<table class="table table-bordered table-sm" style="width: auto;">';
      for (let i = 0; i < rows; i++) {
        table += '<tr>';
        for (let j = 0; j < cols; j++) {
          table += '<td style="padding: 8px; min-width: 80px;">&nbsp;</td>';
        }
        table += '</tr>';
      }
      table += '</table><p></p>';
      execCommand('insertHTML', table);
    }
  };

  return (
    <div className="retrospective-editor-wrapper">
      {showToolbar && (
        <div className="retrospective-toolbar">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => execCommand('bold')}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => execCommand('italic')}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => execCommand('underline')}
            title="Underline"
          >
            <u>U</u>
          </button>
          <span className="toolbar-sep" />
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => execCommand('insertUnorderedList')}
            title="Bullet list"
          >
            •
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => execCommand('insertOrderedList')}
            title="Numbered list"
          >
            1.
          </button>
          <span className="toolbar-sep" />
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={handleTableInsert}
            title="Insert table"
          >
            ⊞ Table
          </button>
          <span className="toolbar-sep" />
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => execCommand('formatBlock', '<h3>')}
          >
            Heading
          </button>
          <span className="toolbar-sep" />
          <input
            type="color"
            className="color-input"
            title="Text color"
            defaultValue="#000000"
            onChange={e => execCommand('foreColor', e.target.value)}
          />
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => execCommand('removeFormat')}
            title="Clear formatting"
          >
            Clear
          </button>
        </div>
      )}
      <div
        className="retrospective-content-area"
        contentEditable
        dangerouslySetInnerHTML={{ __html: content }}
        onInput={e => onChange(e.currentTarget.innerHTML)}
        onFocus={() => setShowToolbar(true)}
      />
    </div>
  );
}

function getInitialContent(title) {
  if (title.toLowerCase().includes('action')) {
    return `<h3>Action Items</h3>
<table class="table table-bordered table-sm" style="width: auto;">
<tr><td style="padding: 8px;"><strong>Task</strong></td><td style="padding: 8px;"><strong>Assignee</strong></td><td style="padding: 8px;"><strong>Status</strong></td></tr>
<tr><td style="padding: 8px;">&nbsp;</td><td style="padding: 8px;">&nbsp;</td><td style="padding: 8px;">&nbsp;</td></tr>
</table>
<p></p>`;
  }
  return `<h3>${title}</h3>
<p>Enter your retrospective notes here...</p>
<ul>
<li>&nbsp;</li>
<li>&nbsp;</li>
</ul>
<p></p>`;
}