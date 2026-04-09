const AIService = require('../services/aiService');
const NotificationService = require('../services/notificationService');

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
            
            // Log interaction to Upstash Redis
            const { redis } = require('../config/database');
            if (redis) {
                try {
                    const chatKey = `chat:${req.session.userId}:${projectId || 'global'}`;
                    const historyEntries = [
                        { role: 'user', text: message, timestamp: new Date().toISOString() },
                        { role: 'ai', text: result.message, type: result.type, timestamp: new Date().toISOString() }
                    ];
                    // Guardar serializado como JSON en Upstash Redis
                    await redis.rpush(chatKey, JSON.stringify(historyEntries[0]));
                    await redis.rpush(chatKey, JSON.stringify(historyEntries[1]));
                    
                    // Solo mantener los ultimos 50 mensajes por contexto
                    await redis.ltrim(chatKey, -50, -1);
                } catch (redisError) {
                    console.error('Error guardando historial de chat en Redis:', redisError);
                }
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
