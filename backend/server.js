require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const { initDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const aiRoutes = require('./routes/ai');
const NotificationService = require('./services/notificationService');

// Inicializar base de datos
(async () => {
    try {
        await initDatabase();
        console.log('✅ Bases de datos inicializadas');
    } catch (error) {
        console.error('⚠️ Error inicializando bases de datos:', error.message);
        console.log('⚠️ Continuando sin bases de datos...');
    }
})();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../frontend/public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key_12345',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.sendFile(path.join(__dirname, '../frontend/views/landing.html'));
    }
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/register.html'));
});

app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../frontend/views/dashboard.html'));
});

app.get('/project/:id', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../frontend/views/project.html'));
});

app.get('/profile', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, '../frontend/views/profile.html'));
});

app.get('/landing', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/landing.html'));
});

setInterval(() => {
    NotificationService.checkAllTasksAndNotify();
}, 60 * 60 * 1000);

app.listen(PORT, () => {
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
