const Task = require('./Task');

class Epic {
    static async getByProject(projectId) {
        const tasks = await Task.getByProject(projectId);
        return tasks.filter(task => task.type?.toUpperCase() === 'EPIC');
    }

    static async getById(id) {
        const epic = await Task.getById(id);
        if (!epic || epic.type?.toUpperCase() !== 'EPIC') return null;
        const childTasks = await Task.getChildTasksByEpic(id);
        return {
            ...epic,
            tasks: childTasks
        };
    }

    static async create(projectId, epicData) {
        return Task.create({
            projectId,
            title: epicData.title,
            description: epicData.description || '',
            priority: epicData.priority || 'medium',
            dueDate: epicData.dueDate || null,
            type: 'EPIC',
            backlogId: epicData.backlogId || null
        });
    }

    static async update(id, updateData) {
        const epic = await Task.getById(id);
        if (!epic || epic.type?.toUpperCase() !== 'EPIC') {
            throw new Error('Epic not found');
        }
        return Task.update(id, updateData);
    }

    static async delete(id) {
        const childTasks = await Task.getChildTasksByEpic(id);
        for (const task of childTasks) {
            await Task.update(task.id, { epicId: null });
        }
        return Task.delete(id);
    }

    static async assignTasks(epicId, taskIds = []) {
        const assigned = [];
        for (const taskId of taskIds) {
            const updatedTask = await Task.update(taskId, { epicId });
            assigned.push(updatedTask);
        }
        return assigned;
    }
}

module.exports = Epic;
