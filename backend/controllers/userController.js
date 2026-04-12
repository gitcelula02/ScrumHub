const User = require('../models/User');

class UserController {
    static async getAll(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }
            
            const users = await User.getAll();
            const safeUsers = users.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                avatar: u.avatar,
                role: u.role
            }));
            
            res.json({ success: true, users: safeUsers });
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static async getById(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }
            
            const user = await User.findById(req.params.id);
            
            if (!user) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }
            
            res.json({ 
                success: true, 
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role,
                    createdAt: user.createdAt
                }
            });
        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static async updateProfile(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }
            
            const { name, avatar } = req.body;
            
            const updated = await User.update(req.session.userId, { name, avatar });
            
            if (!updated) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }
            
            res.json({ 
                success: true, 
                user: {
                    id: updated.id,
                    name: updated.name,
                    email: updated.email,
                    avatar: updated.avatar,
                    role: updated.role
                }
            });
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }
}

module.exports = UserController;
