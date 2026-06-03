const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// Comparar IDs de forma segura (pueden venir como number o string)
function isMember(members, userId) {
    const uid = String(userId);
    return members.some(m => String(m) === uid);
}

class ProjectController {
    static async getAll(req, res) {
        try {
            if (!req.session || !req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const projects = await Project.getByUser(req.session.userId);

            const projectsWithData = await Promise.all(projects.map(async project => {
                try {
                    const memberIds = Array.isArray(project.members) ? project.members : [];
                    const membersResult = await Promise.all(memberIds.map(mId => User.findById(mId)));
                    const members = membersResult.filter(Boolean);
                    const stats = await Task.getStats(project.id);

                    return {
                        ...project,
                        members: members.map(m => ({
                            id: String(m.id),
                            name: m.name,
                            avatar: m.avatar
                        })),
                        stats
                    };
                } catch (err) {
                    console.error(`Error enriching project ${project.id}:`, err.message);
                    return {
                        ...project,
                        members: [],
                        stats: { total: 0, todo: 0, inProgress: 0, review: 0, done: 0, overdue: 0 }
                    };
                }
            }));

            res.json({ success: true, projects: projectsWithData });
        } catch (error) {
            console.error('Error obteniendo proyectos:', error);
            res.status(500).json({ success: false, message: 'Error del servidor: ' + error.message });
        }
    }

    static async getById(req, res) {
        try {
            if (!req.session || !req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const project = await Project.getById(req.params.id);

            if (!project) {
                return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
            }

            // Verificar que el usuario tenga acceso (como miembro o dueño)
            if (!isMember(project.members, req.session.userId) &&
                String(project.owner) !== String(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const tasks = await Task.getByProject(project.id);
            const memberIds = Array.isArray(project.members) ? project.members : [];
            const membersResult = await Promise.all(memberIds.map(mId => User.findById(mId)));
            const members = membersResult.filter(Boolean);
            const stats = await Task.getStats(project.id);

            res.json({
                success: true,
                project: {
                    ...project,
                    members: members.map(m => ({
                        id: String(m.id),
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
            res.status(500).json({ success: false, message: 'Error del servidor: ' + error.message });
        }
    }

    static async create(req, res) {
        try {
            if (!req.session || !req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const { name, description, color, icon } = req.body;

            if (!name || name.trim() === '') {
                return res.status(400).json({ success: false, message: 'El nombre es requerido' });
            }

            console.log(`Creando proyecto "${name}" para usuario ${req.session.userId}`);

            const project = await Project.create({
                name: name.trim(),
                description: description || '',
                color,
                icon,
                owner: req.session.userId
            });

            console.log('Proyecto creado exitosamente:', project.id);
            res.json({ success: true, project });
        } catch (error) {
            console.error('Error creando proyecto:', error);
            res.status(500).json({ success: false, message: 'Error del servidor: ' + error.message });
        }
    }

    static async update(req, res) {
        try {
            if (!req.session || !req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const project = await Project.getById(req.params.id);
            if (!project) {
                return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
            }
            if (String(project.owner) !== String(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Solo el dueño puede editar' });
            }

            const updated = await Project.update(req.params.id, req.body);
            res.json({ success: true, project: updated });
        } catch (error) {
            console.error('Error actualizando proyecto:', error);
            res.status(500).json({ success: false, message: 'Error del servidor: ' + error.message });
        }
    }

    static async delete(req, res) {
        try {
            if (!req.session || !req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const project = await Project.getById(req.params.id);
            if (!project) {
                return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
            }
            if (String(project.owner) !== String(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Solo el dueño puede eliminar' });
            }

            await Project.delete(req.params.id);
            res.json({ success: true });
        } catch (error) {
            console.error('Error eliminando proyecto:', error);
            res.status(500).json({ success: false, message: 'Error del servidor: ' + error.message });
        }
    }

    static async addMember(req, res) {
        try {
            if (!req.session || !req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const { email } = req.body;
            const user = await User.findByEmail(email);

            if (!user) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            await Project.addMember(req.params.id, user.id);
            res.json({ success: true });
        } catch (error) {
            console.error('Error agregando miembro:', error);
            res.status(500).json({ success: false, message: 'Error del servidor: ' + error.message });
        }
    }

    static async getTree(req, res) {
        try {
            if (!req.session || !req.session.userId) {
                return res.status(401).json({ success: false, message: 'No autenticado' });
            }

            const project = await Project.getById(req.params.id);

            if (!project) {
                return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
            }

            if (!isMember(project.members, req.session.userId) &&
                String(project.owner) !== String(req.session.userId)) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }

            const tree = await Task.getTreeByProject(req.params.id);
            res.json({ success: true, tree });
        } catch (error) {
            console.error('Error obteniendo árbol de tareas:', error);
            res.status(500).json({ success: false, message: 'Error del servidor: ' + error.message });
        }
    }
}

module.exports = ProjectController;
