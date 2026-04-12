function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.status(401).json({ success: false, message: 'No autenticado' });
}

function isAdmin(req, res, next) {
    const User = require('../models/User');
    const user = User.findById(req.session.userId);
    if (user && user.role === 'admin') {
        return next();
    }
    res.status(403).json({ success: false, message: 'Acceso denegado' });
}

module.exports = { isAuthenticated, isAdmin };
