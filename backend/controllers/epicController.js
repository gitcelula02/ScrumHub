const Epic = require('../models/Epic');
const Project = require('../models/Project');

function isMember(members, userId) {
    const uid = String(userId);
    return members.some(m => String(m) === uid);
}

const EpicController = {
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
            const epics = await Epic.getByProject(projectId);
            res.json({ success: true, epics });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async getById(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const { id } = req.params;
            const epic = await Epic.getById(id);
            if (!epic) return res.status(404).json({ success: false, message: 'Epic not found' });
            const project = await Project.getById(epic.projectId);
            if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
            if (!isMember(project.members, req.session.userId) && String(project.owner) !== String(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }
            res.json({ success: true, epic });
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
            const { title, description, priority, dueDate, backlogId } = req.body;
            const project = await Project.getById(projectId);
            if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
            if (!isMember(project.members, req.session.userId) && String(project.owner) !== String(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const epic = await Epic.create(projectId, {
                title,
                description,
                priority,
                dueDate,
                backlogId
            });

            res.status(201).json({ success: true, epic });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async update(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const { id } = req.params;
            const existing = await Epic.getById(id);
            if (!existing) return res.status(404).json({ success: false, message: 'Epic not found' });
            const project = await Project.getById(existing.projectId);
            if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
            if (!isMember(project.members, req.session.userId) && String(project.owner) !== String(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const epic = await Epic.update(id, req.body);
            res.json({ success: true, epic });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async delete(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const { id } = req.params;
            const existing = await Epic.getById(id);
            if (!existing) return res.status(404).json({ success: false, message: 'Epic not found' });
            const project = await Project.getById(existing.projectId);
            if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
            if (!isMember(project.members, req.session.userId) && String(project.owner) !== String(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            await Epic.delete(id);
            res.json({ success: true });
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

            const epic = await Epic.getById(id);
            if (!epic) return res.status(404).json({ success: false, message: 'Epic not found' });
            const project = await Project.getById(epic.projectId);
            if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
            if (!isMember(project.members, req.session.userId) && String(project.owner) !== String(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const tasks = await Epic.assignTasks(id, taskIds);
            res.json({ success: true, tasks });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = EpicController;
