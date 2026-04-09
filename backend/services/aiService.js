const db = require('../config/database');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

class AIService {
    static async parseCommand(userMessage, projectId, userId) {
        const message = userMessage.toLowerCase();
        
        if (message.includes('crear tarea') || message.includes('nueva tarea') || message.includes('crear task')) {
            return await this.parseCreateTask(userMessage, projectId, userId);
        }
        
        if (message.includes('actualizar tarea') || message.includes('cambiar tarea')) {
            return await this.parseUpdateTask(userMessage, projectId);
        }
        
        if (message.includes('asignar a') || message.includes('asignar tarea')) {
            return await this.parseAssignTask(userMessage, projectId);
        }
        
        if (message.includes('cambiar prioridad') || message.includes('prioridad')) {
            return await this.parseChangePriority(userMessage, projectId);
        }
        
        if (message.includes('fecha') || message.includes('vencimiento') || message.includes('due')) {
            return await this.parseSetDueDate(userMessage, projectId);
        }
        
        if (message.includes('crear proyecto') || message.includes('nuevo proyecto')) {
            return await this.parseCreateProject(userMessage, userId);
        }
        
        if (message.includes('buscar') || message.includes('mostrar')) {
            return await this.parseSearchTask(userMessage, projectId);
        }
        
        return {
            type: 'help',
            message: 'Puedo ayudarte con:\n' +
                '• "crear tarea [título]" - Crear una nueva tarea\n' +
                '• "asignar a [nombre]" - Asignar tarea\n' +
                '• "cambiar prioridad [alta/media/baja]" - Cambiar prioridad\n' +
                '• "fecha [dd/mm/aaaa]" - Establecer fecha de vencimiento\n' +
                '• "crear proyecto [nombre]" - Crear nuevo proyecto\n' +
                '• "buscar [texto]" - Buscar tareas'
        };
    }

    static async parseCreateTask(message, projectId, userId) {
        const patterns = [
            /crear tarea[:\s]+(.+)/i,
            /nueva tarea[:\s]+(.+)/i,
            /crear task[:\s]+(.+)/i,
            /nueva task[:\s]+(.+)/i
        ];
        
        let title = null;
        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match) {
                title = match[1].trim();
                break;
            }
        }
        
        if (!title) {
            const parts = message.split('tarea').pop()?.trim() || 
                         message.split('task').pop()?.trim();
            title = parts?.replace(/^(a|con|en)\s+/i, '').trim();
        }
        
        if (!title || title.length < 2) {
            return {
                type: 'error',
                message: 'No pude entender el título de la tarea. Prueba: "crear tarea [título]"'
            };
        }
        
        const priority = this.detectPriority(message);
        const dueDate = this.extractDate(message);
        const assignee = await this.extractAssignee(message);
        
        const task = await Task.create({
            projectId,
            title,
            priority,
            dueDate,
            assignee,
            reporter: userId
        });
        
        let response = `✅ Tarea creada exitosamente:\n`;
        response += `📋 **${task.title}**\n`;
        response += `🔢 ID: ${task.id}\n`;
        response += `⚡ Prioridad: ${task.priority}\n`;
        if (dueDate) response += `📅 Vence: ${dueDate}\n`;
        if (assignee) {
            const user = await User.findById(assignee);
            response += `👤 Asignado: ${user?.name || 'Usuario'}\n`;
        }
        
        return {
            type: 'task_created',
            task,
            message: response
        };
    }

    static async parseUpdateTask(message, projectId) {
        const idMatch = message.match(/#?(\d+)/);
        if (!idMatch) {
            return {
                type: 'error',
                message: 'No encontré el ID de la tarea. Ejemplo: "actualizar tarea #123"'
            };
        }
        
        const taskId = idMatch[1];
        const task = await Task.getById(taskId);
        
        if (!task) {
            return {
                type: 'error',
                message: `No encontré la tarea #${taskId}`
            };
        }
        
        const updates = {};
        
        if (message.includes('completar') || message.includes('done') || message.includes('terminar')) {
            updates.status = 'done';
        }
        
        if (message.includes('progreso') || message.includes('en curso')) {
            updates.status = 'in-progress';
        }
        
        if (this.detectPriority(message)) {
            updates.priority = this.detectPriority(message);
        }
        
        if (this.extractDate(message)) {
            updates.dueDate = this.extractDate(message);
        }
        
        const updated = await Task.update(taskId, updates);
        
        return {
            type: 'task_updated',
            task: updated,
            message: `✅ Tarea #${taskId} actualizada`
        };
    }

    static async parseAssignTask(message, projectId) {
        const idMatch = message.match(/#?(\d+)/);
        const users = await User.getAll();
        
        let assigneeId = null;
        let assigneeName = null;
        
        for (const user of users) {
            if (message.toLowerCase().includes(user.name.toLowerCase())) {
                assigneeId = user.id;
                assigneeName = user.name;
                break;
            }
        }
        
        if (!assigneeId) {
            return {
                type: 'error',
                message: 'No encontré ese usuario. Los usuarios disponibles son: ' + 
                    users.map(u => u.name).join(', ')
            };
        }
        
        if (idMatch) {
            const taskId = idMatch[1];
            const updated = await Task.update(taskId, { assignee: assigneeId });
            return {
                type: 'task_updated',
                task: updated,
                message: `✅ Tarea #${taskId} asignada a ${assigneeName}`
            };
        }
        
        return {
            type: 'awaiting_task_id',
            assignee: assigneeId,
            assigneeName: assigneeName,
            message: `¿A qué tarea quieres asignar a ${assigneeName}?`
        };
    }

    static async parseChangePriority(message, projectId) {
        const priority = this.detectPriority(message);
        const idMatch = message.match(/#?(\d+)/);
        
        if (!priority) {
            return {
                type: 'error',
                message: 'No entendí la prioridad. Usa: alta, media o baja'
            };
        }
        
        if (idMatch) {
            const taskId = idMatch[1];
            const updated = await Task.update(taskId, { priority });
            return {
                type: 'task_updated',
                task: updated,
                message: `✅ Prioridad de tarea #${taskId} cambiada a ${priority}`
            };
        }
        
        return {
            type: 'awaiting_task_id',
            pendingAction: 'priority',
            priority,
            message: `¿A qué tarea quieres cambiar la prioridad a ${priority}?`
        };
    }

    static async parseSetDueDate(message, projectId) {
        const date = this.extractDate(message);
        const idMatch = message.match(/#?(\d+)/);
        
        if (!date) {
            return {
                type: 'error',
                message: 'No pude entender la fecha. Formato: dd/mm/aaaa'
            };
        }
        
        if (idMatch) {
            const taskId = idMatch[1];
            const updated = await Task.update(taskId, { dueDate: date });
            return {
                type: 'task_updated',
                task: updated,
                message: `✅ Fecha de tarea #${taskId} establecida para ${date}`
            };
        }
        
        return {
            type: 'awaiting_task_id',
            pendingAction: 'dueDate',
            dueDate: date,
            message: `¿A qué tarea quieres establecer la fecha ${date}?`
        };
    }

    static async parseCreateProject(message, userId) {
        const patterns = [
            /crear proyecto[:\s]+(.+)/i,
            /nuevo proyecto[:\s]+(.+)/i,
            /crear espacio[:\s]+(.+)/i
        ];
        
        let name = null;
        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match) {
                name = match[1].trim();
                break;
            }
        }
        
        if (!name) {
            const parts = message.split('proyecto').pop()?.trim();
            name = parts?.replace(/^(a|con|en)\s+/i, '').trim();
        }
        
        if (!name || name.length < 2) {
            return {
                type: 'error',
                message: 'No pude entender el nombre del proyecto. Ejemplo: "crear proyecto MiApp"'
            };
        }
        
        const project = await Project.create({
            name,
            owner: userId
        });
        
        return {
            type: 'project_created',
            project,
            message: `✅ Proyecto creado:\n📁 **${project.name}**\n🔑 Key: ${project.key}\n\nAhora puedes agregar tareas usando el chat.`
        };
    }

    static async parseSearchTask(message, projectId) {
        const searchTerm = message
            .replace(/buscar/gi, '')
            .replace(/mostrar/gi, '')
            .replace(/tareas/gi, '')
            .trim();
        
        const tasks = projectId 
            ? await Task.getByProject(projectId) 
            : await Task.getAll();
        
        const filtered = tasks.filter(t => 
            t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (filtered.length === 0) {
            return {
                type: 'search_results',
                tasks: [],
                message: `No encontré tareas para "${searchTerm}"`
            };
        }
        
        let response = `🔍 Encontré ${filtered.length} tarea(s):\n\n`;
        filtered.slice(0, 5).forEach(t => {
            const status = t.status === 'done' ? '✅' : t.status === 'in-progress' ? '🔄' : '⏳';
            response += `${status} #${t.id} - ${t.title}\n`;
        });
        
        return {
            type: 'search_results',
            tasks: filtered,
            message: response
        };
    }

    static detectPriority(message) {
        const msg = message.toLowerCase();
        if (msg.includes('urgente') || msg.includes('critica') || msg.includes('alta') || msg.includes('high')) {
            return 'high';
        }
        if (msg.includes('media') || msg.includes('normal') || msg.includes('medium')) {
            return 'medium';
        }
        if (msg.includes('baja') || msg.includes('low')) {
            return 'low';
        }
        return null;
    }

    static extractDate(message) {
        const patterns = [
            /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
            /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/
        ];
        
        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match) {
                let day, month, year;
                if (match[1].length === 4) {
                    year = match[1];
                    month = match[2];
                    day = match[3];
                } else {
                    day = match[1];
                    month = match[2];
                    year = match[3];
                }
                const date = new Date(`${year}-${month}-${day}`);
                if (!isNaN(date.getTime())) {
                    return date.toISOString();
                }
            }
        }
        return null;
    }

    static async extractAssignee(message) {
        const users = await User.getAll();
        for (const user of users) {
            if (message.toLowerCase().includes(user.name.toLowerCase())) {
                return user.id;
            }
        }
        return null;
    }

    static async generateAlert(task) {
        const user = await User.findById(task.assignee);
        if (!user) return null;
        
        const project = await Project.getById(task.projectId);
        const now = new Date();
        const dueDate = new Date(task.dueDate);
        const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        
        let subject = '';
        let message = '';
        
        if (daysUntilDue < 0) {
            subject = `⚠️ [URGENTE] Tarea vencida: ${task.title}`;
            message = `
                La tarea "${task.title}" del proyecto ${project?.name || 'Unknown'} ha vencido.
                
                📋 Descripción: ${task.description}
                ⚡ Prioridad: ${task.priority}
                📅 Venció el: ${dueDate.toLocaleDateString()}
                
                Por favor, actualiza el estado de esta tarea lo antes posible.
            `;
        } else if (daysUntilDue <= 1) {
            subject = `⏰ [HOY/MANANA] Vence pronto: ${task.title}`;
            message = `
                La tarea "${task.title}" del proyecto ${project?.name || 'Unknown'} vence ${daysUntilDue === 0 ? 'hoy' : 'mañana'}.
                
                📋 Descripción: ${task.description}
                ⚡ Prioridad: ${task.priority}
                📅 Vence: ${dueDate.toLocaleDateString()}
            `;
        } else if (daysUntilDue <= 3) {
            subject = `📅 Recordatorio: ${task.title} vence pronto`;
            message = `
                La tarea "${task.title}" del proyecto ${project?.name || 'Unknown'} vence en ${daysUntilDue} días.
                
                📋 Descripción: ${task.description}
                ⚡ Prioridad: ${task.priority}
                📅 Vence: ${dueDate.toLocaleDateString()}
            `;
        }
        
        if (task.priority === 'high' && task.status !== 'done') {
            subject = `🔴 [ALTA PRIORIDAD] ${task.title}`;
            message = `
                Tienes una tarea de alta prioridad pendiente:
                
                "${task.title}"
                Proyecto: ${project?.name || 'Unknown'}
                📋 Descripción: ${task.description}
                ⚡ Prioridad: ALTA
                ${task.dueDate ? `📅 Vence: ${dueDate.toLocaleDateString()}` : ''}
                
                Completa esta tarea con la mayor brevedad posible.
            `;
        }
        
        return { to: user.email, subject, message };
    }

    static async checkAndGenerateAlerts() {
        const tasks = await Task.getAll();
        const alerts = [];
        
        for (const task of tasks) {
            if (task.status === 'done') continue;
            
            const alert = await AIService.generateAlert(task);
            if (alert && alert.subject) {
                alerts.push(alert);
            }
        }
        
        return alerts;
    }
}

module.exports = AIService;
