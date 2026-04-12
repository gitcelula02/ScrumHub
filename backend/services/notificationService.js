const nodemailer = require('nodemailer');
const db = require('../config/database');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const AIService = require('./aiService');

class NotificationService {
    static transporter = null;

    static initTransporter() {
        if (!this.transporter) {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
        }
        return this.transporter;
    }

    static async sendEmail(to, subject, text) {
        try {
            const transporter = this.initTransporter();
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to,
                subject,
                text
            });
            console.log(`✅ Email enviado a ${to}: ${subject}`);
            return true;
        } catch (error) {
            console.error(`❌ Error enviando email a ${to}:`, error.message);
            return false;
        }
    }

    static async sendTaskAssignment(taskId, userId) {
        const task = await Task.getById(taskId);
        const user = await User.findById(userId);
        const project = await Project.getById(task.projectId);
        
        if (!user || !task) return false;
        
        const subject = `📋 Nueva tarea asignada: ${task.title}`;
        const message = `
            Hola ${user.name},
            
            Se te ha asignado una nueva tarea:
            
            📋 Tarea: ${task.title}
            📁 Proyecto: ${project?.name || 'Sin proyecto'}
            ⚡ Prioridad: ${task.priority}
            ${task.dueDate ? `📅 Vence: ${new Date(task.dueDate).toLocaleDateString()}` : ''}
            📝 Descripción: ${task.description || 'Sin descripción'}
            
            Accede a la plataforma para ver más detalles.
        `;
        
        return await this.sendEmail(user.email, subject, message);
    }

    static async sendTaskUpdate(taskId) {
        const task = await Task.getById(taskId);
        if (!task || !task.assignee) return false;
        
        const user = await User.findById(task.assignee);
        const project = await Project.getById(task.projectId);
        
        if (!user) return false;
        
        const subject = `🔄 Tarea actualizada: ${task.title}`;
        const message = `
            Hola ${user.name},
            
            La tarea "${task.title}" ha sido actualizada:
            
            📁 Proyecto: ${project?.name || 'Sin proyecto'}
            📌 Estado: ${this.formatStatus(task.status)}
            ⚡ Prioridad: ${task.priority}
            ${task.dueDate ? `📅 Vence: ${new Date(task.dueDate).toLocaleDateString()}` : ''}
            
            Accede a la plataforma para ver los cambios.
        `;
        
        return await this.sendEmail(user.email, subject, message);
    }

    static async sendTaskDueReminder(taskId) {
        const task = await Task.getById(taskId);
        if (!task || !task.assignee) return false;
        
        const user = await User.findById(task.assignee);
        const project = await Project.getById(task.projectId);
        
        if (!user) return false;
        
        const alert = await AIService.generateAlert(task);
        if (alert) {
            return await this.sendEmail(alert.to, alert.subject, alert.message);
        }
        return false;
    }

    static async sendProjectInvitation(projectId, email, invitedBy) {
        const project = await Project.getById(projectId);
        const inviter = await User.findById(invitedBy);
        
        if (!project) return false;
        
        const subject = `📁 Invitación al proyecto: ${project.name}`;
        const message = `
            Hola,
            
            ${inviter?.name || 'Un usuario'} te ha invitado a unirte al proyecto "${project.name}".
            
            Descripción: ${project.description || 'Sin descripción'}
            Código del proyecto: ${project.key}
            
            Accede a la plataforma para aceptar la invitación.
        `;
        
        return await this.sendEmail(email, subject, message);
    }

    static async checkAllTasksAndNotify() {
        console.log('🔔 Verificando tareas para notificaciones...');
        
        const tasks = await Task.getAll();
        const now = new Date();
        
        for (const task of tasks) {
            if (task.status === 'done') continue;
            
            if (!task.dueDate) continue;
            
            const dueDate = new Date(task.dueDate);
            const daysUntil = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
            
            if (daysUntil <= 0 || daysUntil <= 1 || daysUntil <= 3) {
                await this.sendTaskDueReminder(task.id);
            }
        }
        
        console.log('✅ Verificación de notificaciones completada');
    }

    static formatStatus(status) {
        const statusMap = {
            'todo': 'Por hacer',
            'in-progress': 'En progreso',
            'review': 'En revisión',
            'done': 'Completada'
        };
        return statusMap[status] || status;
    }
}

module.exports = NotificationService;
