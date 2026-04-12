const AIService = require('../services/aiService');
const NotificationService = require('../services/notificationService');
const ChatMessage = require('../models/mongodb/ChatMessage');

class AIController {
    static async chat(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }
            
            const { message, projectId } = req.body;
            
            if (!message) {
                return res.status(400).json({ success: false, message: 'Mensaje requerido' });
            }
            
            const result = await AIService.parseCommand(message, projectId, req.session.userId);
            
            if (result && result.task) {
                if (projectId) {
                    NotificationService.sendTaskAssignment(result.task.id, result.task.assignee);
                }
            }
            
            if (result && result.project) {
                NotificationService.sendProjectInvitation(
                    result.project.id,
                    req.body.email || 'test@example.com',
                    req.session.userId
                );
            }
            
            // Guardar interacción en MongoDB
            try {
                // Guardar mensaje del usuario
                await ChatMessage.saveMessage(
                    req.session.userId,
                    projectId || null,
                    'user',
                    message,
                    'user_message'
                );
                
                // Guardar respuesta de la IA
                await ChatMessage.saveMessage(
                    req.session.userId,
                    projectId || null,
                    'ai',
                    result.message,
                    result.type || 'ai_response',
                    { commandType: result.type }
                );
                
                // Limpiar mensajes antiguos (mantener solo los últimos 50 por contexto)
                await ChatMessage.cleanOldMessages(req.session.userId, projectId || null, 50);
            } catch (mongoError) {
                console.error('Error guardando historial de chat en MongoDB:', mongoError);
            }

            
            res.json({ success: true, result });
        } catch (error) {
            console.error('Error en chat IA:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static async checkAlerts(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }
            
            const alerts = await AIService.checkAndGenerateAlerts();
            
            for (const alert of alerts) {
                await NotificationService.sendEmail(alert.to, alert.subject, alert.message);
            }
            
            res.json({ success: true, alertsGenerated: alerts.length, alerts });
        } catch (error) {
            console.error('Error verificando alertas:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }
}

module.exports = AIController;
