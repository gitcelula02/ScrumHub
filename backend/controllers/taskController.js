const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');

class TaskController {
    static async getAll(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }
            
            const tasks = await Task.getAll();
            const tasksWithUsers = await Promise.all(tasks.map(async task => {
                const assignee = task.assignee ? await User.findById(task.assignee) : null;
                const reporter = await User.findById(task.reporter);
                return {
                    ...task,
                    assigneeData: assignee ? { id: assignee.id, name: assignee.name, avatar: assignee.avatar } : null,
                    reporterData: reporter ? { id: reporter.id, name: reporter.name, avatar: reporter.avatar } : null
                };
            }));
            
            res.json({ success: true, tasks: tasksWithUsers });
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
            const memberIds = project && Array.isArray(project.members) ? project.members : [];

            if (!project || !memberIds.includes(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }
            
            const tasks = await Task.getByProject(req.params.projectId);
            const tasksWithUsers = await Promise.all(tasks.map(async task => {
                const assignee = task.assignee ? await User.findById(task.assignee) : null;
                const reporter = await User.findById(task.reporter);
                return {
                    ...task,
                    assigneeData: assignee ? { id: assignee.id, name: assignee.name, avatar: assignee.avatar } : null,
                    reporterData: reporter ? { id: reporter.id, name: reporter.name, avatar: reporter.avatar } : null
                };
            }));
            
            res.json({ success: true, tasks: tasksWithUsers });
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
            const memberIds = project && Array.isArray(project.members) ? project.members : [];
            if (!project || !memberIds.includes(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }
            
            const assignee = task.assignee ? await User.findById(task.assignee) : null;
            const reporter = await User.findById(task.reporter);
            
            res.json({ 
                success: true, 
                task: {
                    ...task,
                    assigneeData: assignee ? { id: assignee.id, name: assignee.name, avatar: assignee.avatar } : null,
                    reporterData: reporter ? { id: reporter.id, name: reporter.name, avatar: reporter.avatar } : null,
                    projectData: { id: project.id, name: project.name, key: project.key }
                }
            });
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
            
            const { projectId, title, description, priority, dueDate, assignee } = req.body;
            
            if (!projectId || !title) {
                return res.status(400).json({ success: false, message: 'Proyecto y título son requeridos' });
            }
            
            const project = await Project.getById(projectId);
            const memberIds = project && Array.isArray(project.members) ? project.members : [];
            if (!project || !memberIds.includes(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }
            
            const task = await Task.create({
                projectId,
                title,
                description,
                priority,
                dueDate,
                assignee,
                reporter: req.session.userId
            });
            
            if (assignee) {
                // Notificaciones asíncronas no necesitan await para no bloquear
                NotificationService.sendTaskAssignment(task.id, assignee);
            }
            
            res.json({ success: true, task });
        } catch (error) {
            console.error('Error creando tarea:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
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
            const memberIds = project && Array.isArray(project.members) ? project.members : [];
            if (!project || !memberIds.includes(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }
            
            const previousAssignee = task.assignee;
            const updated = await Task.update(req.params.id, req.body);
            
            if (req.body.assignee && req.body.assignee !== previousAssignee) {
                NotificationService.sendTaskAssignment(updated.id, req.body.assignee);
            } else {
                NotificationService.sendTaskUpdate(updated.id);
            }
            
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
            const memberIds = project && Array.isArray(project.members) ? project.members : [];
            if (!project || !memberIds.includes(req.session.userId)) {
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
            
            const project = await Project.getById(task.projectId);
            const memberIds = project && Array.isArray(project.members) ? project.members : [];
            if (!project || !memberIds.includes(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
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
                    combinedStats[key] += projStats[key];
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
            const tasksWithProjects = await Promise.all(tasks.map(async task => {
                const project = await Project.getById(task.projectId);
                return {
                    ...task,
                    projectData: project ? { id: project.id, name: project.name, key: project.key } : null
                };
            }));
            
            res.json({ success: true, tasks: tasksWithProjects });
        } catch (error) {
            console.error('Error obteniendo tareas:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }
}

module.exports = TaskController;
