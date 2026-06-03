const Backlog = require('../models/Backlog');
const Project = require('../models/Project');

function isMember(members, userId) {
    const uid = String(userId);
    return members.some(m => String(m) === uid);
}

const BacklogController = {
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

            const backlogs = await Backlog.getByProject(projectId);
            res.json({ success: true, backlogs });
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
            const { name, description, type, color, orderIndex, isDefault } = req.body;
            const project = await Project.getById(projectId);
            if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
            if (!isMember(project.members, req.session.userId) && String(project.owner) !== String(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const backlog = await Backlog.create(projectId, {
                name,
                description,
                type,
                color,
                orderIndex,
                isDefault
            });

            res.status(201).json({ success: true, backlog });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedBacklog = await Backlog.update(id, updateData);
            res.json({ success: true, backlog: updatedBacklog });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            await Backlog.delete(id);
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = BacklogController;
