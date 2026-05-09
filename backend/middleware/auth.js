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
    if (user && user.role === 'admin') {
      return next();
    }
    res.status(403).json({ success: false, message: 'Acceso denegado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking admin status' });
  }
}

module.exports = { isAuthenticated, isAdmin };
