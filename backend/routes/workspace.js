const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

function ensureUserAccess(req, res) {
    const { userId } = req.params;
    if (!req.session.userId) {
        res.status(401).json({ success: false, message: 'No autenticado' });
        return null;
    }

    if (String(req.session.userId) !== String(userId)) {
        res.status(403).json({ success: false, message: 'Acceso denegado' });
        return null;
    }

    return userId;
}

function toExplorerProject(project) {
    return {
        id: String(project.id),
        name: project.name,
        description: project.description || '',
        goal: project.goal || '',
        color: project.color || '#667eea',
        icon: project.icon || '📁',
        status: project.status || 'active',
        created_by_user_id: String(project.owner || project.owner_id || ''),
        created_at: project.created_at || project.createdAt || '',
        updated_at: project.updated_at || project.updatedAt || project.created_at || ''
    };
}

async function getExplorerProjects(userId) {
    const projects = await Project.getByUser(userId);
    return projects.map(toExplorerProject);
}

router.get('/users/:userId/folders', async (req, res) => {
    try {
        const userId = ensureUserAccess(req, res);
        if (!userId) return;

        const projects = await getExplorerProjects(userId);
        res.json({
            data: [
                {
                    id: 'root',
                    user_id: String(userId),
                    parent_id: null,
                    name: 'Projects',
                    order_index: 0,
                    created_at: '',
                    updated_at: '',
                    children: [],
                    projects
                }
            ]
        });
    } catch (error) {
        console.error('Error obteniendo explorer folders:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/users/:userId/projects', async (req, res) => {
    try {
        const userId = ensureUserAccess(req, res);
        if (!userId) return;

        const projects = await getExplorerProjects(userId);
        res.json({ pinned: projects });
    } catch (error) {
        console.error('Error obteniendo explorer projects:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/users/:userId/projects/search', async (req, res) => {
    try {
        const userId = ensureUserAccess(req, res);
        if (!userId) return;

        const q = String(req.query.q || '').toLowerCase();
        const projects = await getExplorerProjects(userId);
        const data = projects
            .filter(project => project.name.toLowerCase().includes(q))
            .map(project => ({
                id: project.id,
                name: project.name,
                color: project.color,
                icon: project.icon,
                folder_name: null,
                status: project.status
            }));

        res.json({ data });
    } catch (error) {
        console.error('Error buscando explorer projects:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/users/:userId/folders', (req, res) => {
    const userId = ensureUserAccess(req, res);
    if (!userId) return;

    const now = new Date().toISOString();
    res.status(201).json({
        id: `local-${Date.now()}`,
        user_id: String(userId),
        parent_id: req.body.parent_id || null,
        name: req.body.name,
        order_index: 0,
        created_at: now,
        updated_at: now
    });
});

router.post('/users/:userId/folders/:folderId/projects', (req, res) => {
    const userId = ensureUserAccess(req, res);
    if (!userId) return;

    res.status(201).json({
        folder_project_id: `${req.params.folderId}-${req.body.project_id}`,
        project_id: req.body.project_id,
        folder_id: req.params.folderId
    });
});

router.delete('/users/:userId/folders/:folderId/projects/:projectId', (req, res) => {
    const userId = ensureUserAccess(req, res);
    if (!userId) return;
    res.json({ success: true });
});

router.patch('/users/:userId/projects/:projectId/move', async (req, res) => {
    try {
        const userId = ensureUserAccess(req, res);
        if (!userId) return;

        const project = await Project.getById(req.params.projectId);
        if (!project) return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
        res.json(toExplorerProject(project));
    } catch (error) {
        console.error('Error moviendo explorer project:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/users/:userId/projects/:projectId/pin', (req, res) => {
    const userId = ensureUserAccess(req, res);
    if (!userId) return;
    res.json({ success: true });
});

router.delete('/users/:userId/projects/:projectId/pin', (req, res) => {
    const userId = ensureUserAccess(req, res);
    if (!userId) return;
    res.json({ success: true });
});

module.exports = router;
