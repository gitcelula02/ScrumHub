const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

class ProjectController {
    static landingPage(req, res) {
        res.sendFile(__dirname + '/../../frontend/views/landing.html');
    }

    static dashboardPage(req, res) {
        if (!req.session.userId) {
            return res.redirect('/login');
        }
        res.sendFile(__dirname + '/../../frontend/views/dashboard.html');
    }

    static getAll(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }
            
            const projects = Project.getByUser(req.session.userId);
            
            const projectsWithData = projects.map(project => {
                const tasks = Task.getByProject(project.id);
                const members = project.members.map(mId => User.findById(mId)).filter(Boolean);
                const stats = Task.getStats(project.id);
                
                return {
                    ...project,
                    members: members.map(m => ({
                        id: m.id,
                        name: m.name,
                        avatar: m.avatar
                    })),
                    stats
                };
            });
            
            res.json({ success: true, projects: projectsWithData });
        } catch (error) {
            console.error('Error obteniendo proyectos:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static getById(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }
            
            const project = Project.getById(req.params.id);
            
            if (!project) {
                return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
            }
            
            if (!project.members.includes(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }
            
            const tasks = Task.getByProject(project.id);
            const members = project.members.map(mId => User.findById(mId)).filter(Boolean);
            const stats = Task.getStats(project.id);
            
            res.json({ 
                success: true, 
                project: {
                    ...project,
                    members: members.map(m => ({
                        id: m.id,
                        name: m.name,
                        email: m.email,
                        avatar: m.avatar
                    })),
                    tasks,
                    stats
                }
            });
        } catch (error) {
            console.error('Error obteniendo proyecto:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static create(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }
            
            const { name, description, color, icon } = req.body;
            
            if (!name) {
                return res.status(400).json({ success: false, message: 'El nombre es requerido' });
            }
            
            const project = Project.create({
                name,
                description,
                color,
                icon,
                owner: req.session.userId
            });
            
            res.json({ success: true, project });
        } catch (error) {
            console.error('Error creando proyecto:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static update(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }
            
            const project = Project.getById(req.params.id);
            
            if (!project) {
                return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
            }
            
            if (project.owner !== req.session.userId) {
                return res.status(403).json({ success: false, message: 'Solo el dueño puede editar' });
            }
            
            const updated = Project.update(req.params.id, req.body);
            
            res.json({ success: true, project: updated });
        } catch (error) {
            console.error('Error actualizando proyecto:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static delete(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }
            
            const project = Project.getById(req.params.id);
            
            if (!project) {
                return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
            }
            
            if (project.owner !== req.session.userId) {
                return res.status(403).json({ success: false, message: 'Solo el dueño puede eliminar' });
            }
            
            Project.delete(req.params.id);
            
            res.json({ success: true });
        } catch (error) {
            console.error('Error eliminando proyecto:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static addMember(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }
            
            const { email } = req.body;
            const user = User.findByEmail(email);
            
            if (!user) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }
            
            Project.addMember(req.params.id, user.id);
            
            res.json({ success: true });
        } catch (error) {
            console.error('Error agregando miembro:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }
}

module.exports = ProjectController;
