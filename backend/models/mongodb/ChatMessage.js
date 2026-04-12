const mongoose = require('mongoose');
const { mongoose: db } = require('../../config/database');

const chatMessageSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    projectId: {
        type: String,
        index: true,
        default: null
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'ai']
    },
    text: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'message'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Índice para búsquedas por usuario y proyecto
chatMessageSchema.index({ userId: 1, projectId: 1, timestamp: -1 });

// Método estático para guardar un mensaje
chatMessageSchema.statics.saveMessage = async function(userId, projectId, role, text, type = 'message', metadata = {}) {
    try {
        const message = new this({
            userId,
            projectId: projectId || null,
            role,
            text,
            type,
            metadata,
            timestamp: new Date()
        });
        await message.save();
        return message;
    } catch (error) {
        console.error('Error guardando mensaje de chat:', error);
        throw error;
    }
};

// Método estático para obtener historial de chat
chatMessageSchema.statics.getChatHistory = async function(userId, projectId = null, limit = 50) {
    try {
        const query = { userId };
        if (projectId) {
            query.projectId = projectId;
        } else {
            query.projectId = null;
        }
        
        const messages = await this.find(query)
            .sort({ timestamp: -1 })
            .limit(limit)
            .select('role text type timestamp metadata')
            .lean();
        
        // Ordenar cronológicamente (más antiguo primero)
        return messages.reverse();
    } catch (error) {
        console.error('Error obteniendo historial de chat:', error);
        return [];
    }
};

// Método estático para limpiar historial antiguo (mantener últimos N mensajes)
chatMessageSchema.statics.cleanOldMessages = async function(userId, projectId = null, keepLast = 50) {
    try {
        const query = { userId };
        if (projectId) {
            query.projectId = projectId;
        } else {
            query.projectId = null;
        }
        
        const count = await this.countDocuments(query);
        if (count <= keepLast) return;
        
        const messagesToDelete = await this.find(query)
            .sort({ timestamp: 1 }) // Más antiguos primero
            .limit(count - keepLast)
            .select('_id');
        
        const idsToDelete = messagesToDelete.map(msg => msg._id);
        await this.deleteMany({ _id: { $in: idsToDelete } });
        
        console.log(`🧹 Limpiados ${idsToDelete.length} mensajes antiguos para usuario ${userId}`);
    } catch (error) {
        console.error('Error limpiando mensajes antiguos:', error);
    }
};

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;