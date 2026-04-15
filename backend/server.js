require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const aiRoutes = require('./routes/ai');
const NotificationService = require('./services/notificationService');

initDatabase();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
})); //Cors Policy

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//app.use(express.static(path.join(__dirname, '../frontend/public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key_12345',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    }
}));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);

setInterval(() => {
    NotificationService.checkAllTasksAndNotify();
}, 60 * 60 * 1000);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚀 Proyecto Jira running on port ${PORT}         ║
║                                                   ║
║   📁 http://localhost:${PORT}                       ║
║   📋 http://localhost:${PORT}/dashboard             ║
║   👤 http://localhost:${PORT}/login                 ║
║                                                   ║
║   Demo: admin@proyecto.com / admin123             ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
    `);
});

module.exports = app;
