const API_BASE = '/api/projects';

async function api(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        ...options
    });
    const data = await response.json();
    if (!response.ok && response.status === 401) {
        window.location.href = '/login';
    }
    return data;
}

async function getProjects() {
    return api('/all');
}

async function getProject(id) {
    return api(`/${id}`);
}

async function createProject(data) {
    return api('/', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

async function updateProject(id, data) {
    return api(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

async function deleteProject(id) {
    return api(`/${id}`, { method: 'DELETE' });
}

async function addMember(projectId, email) {
    return api(`/${projectId}/members`, {
        method: 'POST',
        body: JSON.stringify({ email })
    });
}

async function getTree(projectId) {
    return api(`/${projectId}/tree`);
}

window.ProjectAPI = {
    getAll: getProjects,
    getById: getProject,
    create: createProject,
    update: updateProject,
    delete: deleteProject,
    addMember,
    getTree
};
