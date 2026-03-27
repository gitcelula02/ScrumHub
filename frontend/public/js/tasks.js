const API_BASE = '/api/tasks';

async function api(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    const data = await response.json();
    if (!response.ok && response.status === 401) {
        window.location.href = '/login';
    }
    return data;
}

async function getTasks() {
    return api('/');
}

async function getMyTasks() {
    return api('/my-tasks');
}

async function getTaskById(id) {
    return api(`/${id}`);
}

async function getTasksByProject(projectId) {
    return api(`/project/${projectId}`);
}

async function getStats() {
    return api('/stats');
}

async function createTask(data) {
    return api('/', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

async function updateTask(id, data) {
    return api(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

async function deleteTask(id) {
    return api(`/${id}`, { method: 'DELETE' });
}

async function addComment(taskId, text) {
    return api(`/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text })
    });
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function getPriorityClass(priority) {
    const classes = {
        low: 'priority-low',
        medium: 'priority-medium',
        high: 'priority-high',
        urgent: 'priority-urgent'
    };
    return classes[priority] || 'priority-medium';
}

function getStatusText(status) {
    const statuses = {
        'todo': 'Por hacer',
        'in-progress': 'En progreso',
        'review': 'En revisión',
        'done': 'Completada'
    };
    return statuses[status] || status;
}

function getStatusIcon(status) {
    const icons = {
        'todo': '📋',
        'in-progress': '🔄',
        'review': '👁️',
        'done': '✅'
    };
    return icons[status] || '📋';
}

window.TaskAPI = {
    getAll: getTasks,
    getMyTasks,
    getById: getTaskById,
    getByProject: getTasksByProject,
    getStats,
    create: createTask,
    update: updateTask,
    delete: deleteTask,
    addComment
};

window.TaskHelpers = {
    formatDate,
    getPriorityClass,
    getStatusText,
    getStatusIcon
};
