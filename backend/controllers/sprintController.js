const Sprint = require('../models/Sprint');
const Project = require('../models/Project');

function isMember(members, userId) {
    const uid = String(userId);
    return members.some(m => String(m) === uid);
}

const SprintController = {
    async getByProject(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const { projectId } = req.params;
            const project = await Project.getById(projectId);
            if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
            if (!isMember(project.members, req.session.userId) && String(project.owner) !== String(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const sprints = await Sprint.getByProject(projectId);
            res.json({ success: true, sprints });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async create(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const { projectId } = req.params;
            const { name, goal, startDate, endDate, status } = req.body;
            const project = await Project.getById(projectId);
            if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
            if (!isMember(project.members, req.session.userId) && String(project.owner) !== String(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const sprint = await Sprint.create(projectId, {
                name,
                goal,
                startDate,
                endDate,
                status
            });

            res.status(201).json({ success: true, sprint });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async activate(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const { id } = req.params;
            const sprint = await Sprint.getById(id);
            if (!sprint) return res.status(404).json({ success: false, message: 'Sprint not found' });
            const project = await Project.getById(sprint.projectId);
            if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
            if (!isMember(project.members, req.session.userId) && String(project.owner) !== String(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const activated = await Sprint.activate(id);
            res.json({ success: true, sprint: activated });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async complete(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const { id } = req.params;
            const { targetSprintId } = req.body;
            const sprint = await Sprint.getById(id);
            if (!sprint) return res.status(404).json({ success: false, message: 'Sprint not found' });
            const project = await Project.getById(sprint.projectId);
            if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
            if (!isMember(project.members, req.session.userId) && String(project.owner) !== String(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const result = await Sprint.complete(id, targetSprintId);
            res.json({ success: true, result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async assignTasks(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const { id } = req.params;
            const { taskIds } = req.body;
            if (!Array.isArray(taskIds)) {
                return res.status(400).json({ success: false, message: 'taskIds array is required' });
            }

            const sprint = await Sprint.getById(id);
            if (!sprint) return res.status(404).json({ success: false, message: 'Sprint not found' });
            const project = await Project.getById(sprint.projectId);
            if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
            if (!isMember(project.members, req.session.userId) && String(project.owner) !== String(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const tasks = await Sprint.assignTasks(id, taskIds);
            res.json({ success: true, tasks });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = SprintController;
