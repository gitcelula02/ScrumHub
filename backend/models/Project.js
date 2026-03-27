const db = require('../config/database');

class Project {
    static getAll() {
        return db.readJSON('projects.json');
    }

    static getById(id) {
        const projects = db.readJSON('projects.json');
        return projects.find(p => p.id === id);
    }

    static getByUser(userId) {
        const projects = db.readJSON('projects.json');
        return projects.filter(p => p.members.includes(userId));
    }

    static create(projectData) {
        const projects = db.readJSON('projects.json');
        const newProject = {
            id: Date.now().toString(),
            name: projectData.name,
            description: projectData.description || '',
            key: projectData.key || generateKey(projectData.name),
            owner: projectData.owner,
            members: projectData.members || [projectData.owner],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active',
            color: projectData.color || '#667eea',
            icon: projectData.icon || '📁'
        };
        projects.push(newProject);
        db.writeJSON('projects.json', projects);
        return newProject;
    }

    static update(id, data) {
        const projects = db.readJSON('projects.json');
        const index = projects.findIndex(p => p.id === id);
        if (index !== -1) {
            projects[index] = { 
                ...projects[index], 
                ...data, 
                updatedAt: new Date().toISOString() 
            };
            db.writeJSON('projects.json', projects);
            return projects[index];
        }
        return null;
    }

    static delete(id) {
        const projects = db.readJSON('projects.json');
        const filtered = projects.filter(p => p.id !== id);
        db.writeJSON('projects.json', filtered);
        
        const tasks = db.readJSON('tasks.json');
        db.writeJSON('tasks.json', tasks.filter(t => t.projectId !== id));
    }

    static addMember(projectId, userId) {
        const projects = db.readJSON('projects.json');
        const index = projects.findIndex(p => p.id === projectId);
        if (index !== -1 && !projects[index].members.includes(userId)) {
            projects[index].members.push(userId);
            projects[index].updatedAt = new Date().toISOString();
            db.writeJSON('projects.json', projects);
            return true;
        }
        return false;
    }
}

function generateKey(name) {
    return name.split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 3)
        .join('') + '-' + Math.floor(Math.random() * 1000);
}

module.exports = Project;
