const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');

function isMember(members, userId) {
    const uid = String(userId);
    return members.some(m => String(m) === uid);
}

class TaskController {
    static async getAll(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const tasks = await Task.getByUser(req.session.userId);
            res.json({ success: true, tasks });
        } catch (error) {
            console.error('Error obteniendo tareas:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static async getByProject(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const project = await Project.getById(req.params.projectId);
            if (!project) {
                return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
            }

            if (!isMember(project.members, req.session.userId) &&
                String(project.owner) !== String(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const tasks = await Task.getByProject(req.params.projectId);
            res.json({ success: true, tasks });
        } catch (error) {
            console.error('Error obteniendo tareas:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static async getById(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const task = await Task.getById(req.params.id);

            if (!task) {
                return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
            }

            const project = await Project.getById(task.projectId);
            if (!project) {
                return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
            }

            if (!isMember(project.members, req.session.userId) &&
                String(project.owner) !== String(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            res.json({ success: true, task });
        } catch (error) {
            console.error('Error obteniendo tarea:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static async create(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const {
                projectId,
                title,
                description,
                priority,
                dueDate,
                assignee,
                backlogId,
                sprintId,
                epicId,
                type
            } = req.body;

            if (!projectId || !title) {
                return res.status(400).json({ success: false, message: 'Proyecto y título son requeridos' });
            }

            const project = await Project.getById(projectId);
            if (!project) {
                return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
            }

            if (!isMember(project.members, req.session.userId) &&
                String(project.owner) !== String(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado al proyecto' });
            }

            const task = await Task.create({
                projectId,
                title,
                description,
                priority,
                dueDate,
                assignee,
                backlogId,
                sprintId,
                epicId,
                type,
                reporter: req.session.userId
            });

            if (assignee) {
                NotificationService.sendTaskAssignment(task.id, assignee).catch(console.error);
            }

            res.json({ success: true, task });
        } catch (error) {
            console.error('Error creando tarea:', error);
            res.status(500).json({ success: false, message: 'Error del servidor: ' + error.message });
        }
    }

    static async update(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const task = await Task.getById(req.params.id);

            if (!task) {
                return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
            }

            const project = await Project.getById(task.projectId);
            if (!project) {
                return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
            }

            if (!isMember(project.members, req.session.userId) &&
                String(project.owner) !== String(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const updated = await Task.update(req.params.id, req.body);

            res.json({ success: true, task: updated });
        } catch (error) {
            console.error('Error actualizando tarea:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static async delete(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const task = await Task.getById(req.params.id);

            if (!task) {
                return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
            }

            const project = await Project.getById(task.projectId);
            if (!project) {
                return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
            }

            if (!isMember(project.members, req.session.userId) &&
                String(project.owner) !== String(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            await Task.delete(req.params.id);

            res.json({ success: true });
        } catch (error) {
            console.error('Error eliminando tarea:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static async addComment(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const { text } = req.body;

            if (!text) {
                return res.status(400).json({ success: false, message: 'Texto requerido' });
            }

            const task = await Task.getById(req.params.id);

            if (!task) {
                return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
            }

            const comment = await Task.addComment(req.params.id, {
                author: req.session.userId,
                text
            });

            res.json({ success: true, comment });
        } catch (error) {
            console.error('Error agregando comentario:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static async getStats(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const userProjects = await Project.getByUser(req.session.userId);
            let combinedStats = {
                total: 0, todo: 0, inProgress: 0, review: 0, done: 0,
                highPriority: 0, mediumPriority: 0, lowPriority: 0, overdue: 0
            };

            for (let proj of userProjects) {
                const projStats = await Task.getStats(proj.id);
                for (let key in combinedStats) {
                    combinedStats[key] += (projStats[key] || 0);
                }
            }

            res.json({ success: true, stats: combinedStats });
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static async getMyTasks(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const tasks = await Task.getByUser(req.session.userId);
            res.json({ success: true, tasks });
        } catch (error) {
            console.error('Error obteniendo tareas:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }
}

module.exports = TaskController;
