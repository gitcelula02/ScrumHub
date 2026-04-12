// projects.js - API helper for projects
(function() {
    const PROJECTS_BASE = '/api/projects';

    async function apiCall(endpoint, options = {}) {
        const response = await fetch(`${PROJECTS_BASE}${endpoint}`, {
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
        return apiCall('/all');
    }

    async function getProject(id) {
        return apiCall(`/${id}`);
    }

    async function createProject(data) {
        return apiCall('/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async function updateProject(id, data) {
        return apiCall(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async function deleteProject(id) {
        return apiCall(`/${id}`, { method: 'DELETE' });
    }

    async function addMember(projectId, email) {
        return apiCall(`/${projectId}/members`, {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    async function getTree(projectId) {
        return apiCall(`/${projectId}/tree`);
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

    console.log('ProjectAPI loaded:', typeof window.ProjectAPI);
})();
