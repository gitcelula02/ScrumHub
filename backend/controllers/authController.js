const User = require('../models/User');

class AuthController {
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email y contraseña son requeridos' 
                });
            }
            
            const user = await User.findByEmail(email);
            
            if (!user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Credenciales inválidas. Verifica tu email y contraseña.' 
                });
            }
            
            const isValidPassword = User.verifyPassword(password, user.password_hash);
            
            if (!isValidPassword) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Credenciales inválidas. Verifica tu email y contraseña.' 
                });
            }
            
            req.session.userId = user.id;
            
            res.json({ 
                success: true, 
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar
                }
            });
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error del servidor. Intenta de nuevo.' 
            });
        }
    }

    static async register(req, res) {
        try {
            const { name, email, password } = req.body;
            
            if (!name || !email || !password) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Todos los campos son requeridos' 
                });
            }
            
            if (password.length < 6) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'La contraseña debe tener al menos 6 caracteres' 
                });
            }
            
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'El email ya está registrado' 
                });
            }
            
            const user = await User.create({ name, email, password });
            
            req.session.userId = user.id;
            
            res.json({ 
                success: true, 
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar
                }
            });
        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error del servidor. Intenta de nuevo.' 
            });
        }
    }

    static logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
            }
            res.json({ success: true });
        });
    }

    static async getCurrentUser(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'No autenticado' 
                });
            }
            
            const user = await User.findById(req.session.userId);
            
            if (!user) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Usuario no encontrado' 
                });
            }
            
            res.json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar
                }
            });
        } catch (error) {
            console.error('Error obteniendo usuario actual:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error del servidor. Intenta de nuevo.' 
            });
        }
    }
}

module.exports = AuthController;
