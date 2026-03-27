const db = require('../config/database');

class Task {
    static getAll() {
        return db.readJSON('tasks.json');
    }

    static getById(id) {
        const tasks = db.readJSON('tasks.json');
        return tasks.find(t => t.id === id);
    }

    static getByProject(projectId) {
        const tasks = db.readJSON('tasks.json');
        return tasks.filter(t => t.projectId === projectId);
    }

    static getByUser(userId) {
        const tasks = db.readJSON('tasks.json');
        return tasks.filter(t => t.assignee === userId);
    }

    static getByPriority(priority) {
        const tasks = db.readJSON('tasks.json');
        return tasks.filter(t => t.priority === priority);
    }

    static getOverdue() {
        const tasks = db.readJSON('tasks.json');
        const now = new Date();
        return tasks.filter(t => 
            t.dueDate && 
            new Date(t.dueDate) < now && 
            t.status !== 'done'
        );
    }

    static create(taskData) {
        const tasks = db.readJSON('tasks.json');
        const newTask = {
            id: Date.now().toString(),
            projectId: taskData.projectId,
            title: taskData.title,
            description: taskData.description || '',
            status: taskData.status || 'todo',
            priority: taskData.priority || 'medium',
            assignee: taskData.assignee || null,
            reporter: taskData.reporter,
            dueDate: taskData.dueDate || null,
            tags: taskData.tags || [],
            subtasks: taskData.subtasks || [],
            attachments: [],
            comments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        tasks.push(newTask);
        db.writeJSON('tasks.json', tasks);
        return newTask;
    }

    static update(id, data) {
        const tasks = db.readJSON('tasks.json');
        const index = tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            tasks[index] = { 
                ...tasks[index], 
                ...data, 
                updatedAt: new Date().toISOString() 
            };
            db.writeJSON('tasks.json', tasks);
            return tasks[index];
        }
        return null;
    }

    static delete(id) {
        const tasks = db.readJSON('tasks.json');
        const filtered = tasks.filter(t => t.id !== id);
        db.writeJSON('tasks.json', filtered);
    }

    static addComment(taskId, comment) {
        const tasks = db.readJSON('tasks.json');
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            const newComment = {
                id: Date.now().toString(),
                author: comment.author,
                text: comment.text,
                createdAt: new Date().toISOString()
            };
            tasks[index].comments.push(newComment);
            tasks[index].updatedAt = new Date().toISOString();
            db.writeJSON('tasks.json', tasks);
            return newComment;
        }
        return null;
    }

    static getStats(projectId = null) {
        const tasks = projectId 
            ? Task.getByProject(projectId) 
            : Task.getAll();
        
        return {
            total: tasks.length,
            todo: tasks.filter(t => t.status === 'todo').length,
            inProgress: tasks.filter(t => t.status === 'in-progress').length,
            review: tasks.filter(t => t.status === 'review').length,
            done: tasks.filter(t => t.status === 'done').length,
            highPriority: tasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
            mediumPriority: tasks.filter(t => t.priority === 'medium' && t.status !== 'done').length,
            lowPriority: tasks.filter(t => t.priority === 'low' && t.status !== 'done').length,
            overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length
        };
    }
}

module.exports = Task;
