const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');

class TaskController {
    static getAll(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }
            
            const tasks = Task.getAll();
            const tasksWithUsers = tasks.map(task => {
                const assignee = task.assignee ? User.findById(task.assignee) : null;
                const reporter = User.findById(task.reporter);
                return {
                    ...task,
                    assigneeData: assignee ? { id: assignee.id, name: assignee.name, avatar: assignee.avatar } : null,
                    reporterData: reporter ? { id: reporter.id, name: reporter.name, avatar: reporter.avatar } : null
                };
            });
            
            res.json({ success: true, tasks: tasksWithUsers });
        } catch (error) {
            console.error('Error obteniendo tareas:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static getByProject(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }
            
            const project = Project.getById(req.params.projectId);
            
            if (!project || !project.members.includes(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }
            
            const tasks = Task.getByProject(req.params.projectId);
            const tasksWithUsers = tasks.map(task => {
                const assignee = task.assignee ? User.findById(task.assignee) : null;
                const reporter = User.findById(task.reporter);
                return {
                    ...task,
                    assigneeData: assignee ? { id: assignee.id, name: assignee.name, avatar: assignee.avatar } : null,
                    reporterData: reporter ? { id: reporter.id, name: reporter.name, avatar: reporter.avatar } : null
                };
            });
            
            res.json({ success: true, tasks: tasksWithUsers });
        } catch (error) {
            console.error('Error obteniendo tareas:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static getById(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }
            
            const task = Task.getById(req.params.id);
            
            if (!task) {
                return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
            }
            
            const project = Project.getById(task.projectId);
            if (!project || !project.members.includes(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }
            
            const assignee = task.assignee ? User.findById(task.assignee) : null;
            const reporter = User.findById(task.reporter);
            
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

    static create(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }
            
            const { projectId, title, description, priority, dueDate, assignee } = req.body;
            
            if (!projectId || !title) {
                return res.status(400).json({ success: false, message: 'Proyecto y título son requeridos' });
            }
            
            const project = Project.getById(projectId);
            if (!project || !project.members.includes(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }
            
            const task = Task.create({
                projectId,
                title,
                description,
                priority,
                dueDate,
                assignee,
                reporter: req.session.userId
            });
            
            if (assignee) {
                NotificationService.sendTaskAssignment(task.id, assignee);
            }
            
            res.json({ success: true, task });
        } catch (error) {
            console.error('Error creando tarea:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static update(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }
            
            const task = Task.getById(req.params.id);
            
            if (!task) {
                return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
            }
            
            const project = Project.getById(task.projectId);
            if (!project || !project.members.includes(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }
            
            const previousAssignee = task.assignee;
            const updated = Task.update(req.params.id, req.body);
            
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

    static delete(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }
            
            const task = Task.getById(req.params.id);
            
            if (!task) {
                return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
            }
            
            const project = Project.getById(task.projectId);
            if (!project || !project.members.includes(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }
            
            Task.delete(req.params.id);
            
            res.json({ success: true });
        } catch (error) {
            console.error('Error eliminando tarea:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static addComment(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }
            
            const { text } = req.body;
            
            if (!text) {
                return res.status(400).json({ success: false, message: 'Texto requerido' });
            }
            
            const task = Task.getById(req.params.id);
            
            if (!task) {
                return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
            }
            
            const project = Project.getById(task.projectId);
            if (!project || !project.members.includes(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }
            
            const comment = Task.addComment(req.params.id, {
                author: req.session.userId,
                text
            });
            
            res.json({ success: true, comment });
        } catch (error) {
            console.error('Error agregando comentario:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static getStats(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }
            
            const stats = Task.getStats();
            
            res.json({ success: true, stats });
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static getMyTasks(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }
            
            const tasks = Task.getByUser(req.session.userId);
            const tasksWithProjects = tasks.map(task => {
                const project = Project.getById(task.projectId);
                return {
                    ...task,
                    projectData: project ? { id: project.id, name: project.name, key: project.key } : null
                };
            });
            
            res.json({ success: true, tasks: tasksWithProjects });
        } catch (error) {
            console.error('Error obteniendo tareas:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }
}

module.exports = TaskController;
