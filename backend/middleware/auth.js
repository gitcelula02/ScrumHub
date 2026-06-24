function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.status(401).json({ success: false, message: 'No autenticado' });
}

async function isAdmin(req, res, next) {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(401).json({ success: false, message: 'No autenticado' });
        }
        if (user.role === 'admin') {
            return next();
        }
        res.status(403).json({ success: false, message: 'Acceso denegado' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error interno' });
    }
}

module.exports = { isAuthenticated, isAdmin };
