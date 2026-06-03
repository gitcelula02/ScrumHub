const { supabase } = require('../config/database');

// Mapeo de estados frontend <-> DB
const STATUS_TO_DB = {
    'todo': 'TODO',
    'in-progress': 'IN_PROGRESS',
    'review': 'BLOCKED',
    'done': 'DONE'
};
const DB_TO_STATUS = {
    'TODO': 'todo',
    'IN_PROGRESS': 'in-progress',
    'BLOCKED': 'review',
    'DONE': 'done'
};

// Mapeo de prioridad frontend <-> DB (el schema usa integer)
const PRIORITY_TO_DB = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 };
const DB_TO_PRIORITY = { 0: 'urgent', 1: 'high', 2: 'medium', 3: 'low' };

function mapFromDB(row) {
    if (!row) return null;
    return {
        id: String(row.id),
        projectId: String(row.project_id),
        parentId: row.parent_id ? String(row.parent_id) : null,
        backlogId: row.backlog_id ? String(row.backlog_id) : null,
        sprintId: row.sprint_id ? String(row.sprint_id) : null,
        epicId: row.epic_id ? String(row.epic_id) : null,
        title: row.title,
        description: row.description || '',
        status: DB_TO_STATUS[row.status] || 'todo',
        priority: DB_TO_PRIORITY[row.priority] ?? 'medium',
        dueDate: row.due_date || null,
        assignee: row.assignee_id ? String(row.assignee_id) : null,
        reporter: row.reporter_id ? String(row.reporter_id) : null,
        tags: [],
        subtasks: [],
        attachments: [],
        comments: [],
        type: row.type || 'TASK',
        createdAt: row.created_at,
        orderIndex: row.order_index || 0
    };
}

class Task {
    static async getAll() {
        const { data, error } = await supabase
            .from('backlogitem')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(mapFromDB);
    }

    static async getById(id) {
        if (!id) return null;
        const { data, error } = await supabase
            .from('backlogitem')
            .select('*')
            .eq('id', id)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return mapFromDB(data);
    }

    static async getByProject(projectId) {
        if (!projectId) return [];
        const { data, error } = await supabase
            .from('backlogitem')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: true });
        if (error) throw error;
        return (data || []).map(mapFromDB);
    }

    static async getBySprint(sprintId) {
        if (!sprintId) return [];
        const { data, error } = await supabase
            .from('backlogitem')
            .select('*')
            .eq('sprint_id', sprintId)
            .order('created_at', { ascending: true });
        if (error) throw error;
        return (data || []).map(mapFromDB);
    }

    static async getChildTasksByEpic(epicId) {
        if (!epicId) return [];
        const { data, error } = await supabase
            .from('backlogitem')
            .select('*')
            .or(`parent_id.eq.${epicId},epic_id.eq.${epicId}`)
            .order('created_at', { ascending: true });
        if (error) throw error;
        return (data || []).map(mapFromDB);
    }

    static async getByUser(userId) {
        if (!userId) return [];
        const { data: memberProjects } = await supabase
            .from('projectuser')
            .select('project_id')
            .eq('user_id', userId);
        const projectIds = (memberProjects || []).map(mp => mp.project_id);
        if (projectIds.length === 0) return [];

        const { data, error } = await supabase
            .from('backlogitem')
            .select('*')
            .in('project_id', projectIds)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(mapFromDB);
    }

    static async create(taskData) {
        const newTask = {
            project_id: taskData.projectId,
            parent_id: taskData.parentId || null,
            backlog_id: taskData.backlogId || null,
            sprint_id: taskData.sprintId || null,
            epic_id: taskData.epicId || null,
            title: taskData.title,
            description: taskData.description || '',
            status: STATUS_TO_DB[taskData.status] || 'TODO',
            priority: PRIORITY_TO_DB[taskData.priority] ?? 2,
            due_date: taskData.dueDate || null,
            assignee_id: taskData.assignee || null,
            reporter_id: taskData.reporter || null,
            type: taskData.type ? taskData.type.toUpperCase() : 'TASK'
        };
        const { data, error } = await supabase
            .from('backlogitem')
            .insert([newTask])
            .select()
            .single();
        if (error) throw error;
        return mapFromDB(data);
    }

    static async update(id, updateData) {
        const dbFields = {};
        if (updateData.title !== undefined) dbFields.title = updateData.title;
        if (updateData.description !== undefined) dbFields.description = updateData.description;
        if (updateData.parentId !== undefined) dbFields.parent_id = updateData.parentId;
        if (updateData.backlogId !== undefined) dbFields.backlog_id = updateData.backlogId;
        if (updateData.sprintId !== undefined) dbFields.sprint_id = updateData.sprintId;
        if (updateData.epicId !== undefined) dbFields.epic_id = updateData.epicId;
        if (updateData.assignee !== undefined) dbFields.assignee_id = updateData.assignee;
        if (updateData.reporter !== undefined) dbFields.reporter_id = updateData.reporter;
        if (updateData.type !== undefined) dbFields.type = updateData.type.toUpperCase();
        if (updateData.status) dbFields.status = STATUS_TO_DB[updateData.status] || updateData.status;
        if (updateData.priority !== undefined) {
            dbFields.priority = PRIORITY_TO_DB[updateData.priority] ?? 2;
        }
        if (updateData.dueDate !== undefined) dbFields.due_date = updateData.dueDate;

        const { data, error } = await supabase
            .from('backlogitem')
            .update(dbFields)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return mapFromDB(data);
    }

    static async delete(id) {
        const { error } = await supabase
            .from('backlogitem')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    }

    static async addComment(taskId, comment) {
        return {
            id: require('crypto').randomUUID(),
            author: comment.author,
            text: comment.text,
            createdAt: new Date().toISOString()
        };
    }

    static async getStats(projectId = null) {
        const tasks = projectId
            ? await Task.getByProject(projectId)
            : await Task.getAll();

        return {
            total: tasks.length,
            todo: tasks.filter(t => t.status === 'todo').length,
            inProgress: tasks.filter(t => t.status === 'in-progress').length,
            review: tasks.filter(t => t.status === 'review').length,
            done: tasks.filter(t => t.status === 'done').length,
            highPriority: tasks.filter(t => (t.priority === 'high' || t.priority === 'urgent') && t.status !== 'done').length,
            mediumPriority: tasks.filter(t => t.priority === 'medium' && t.status !== 'done').length,
            lowPriority: tasks.filter(t => t.priority === 'low' && t.status !== 'done').length,
            overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length
        };
    }

    static async getTreeByProject(projectId) {
        const tasks = await Task.getByProject(projectId);
        const taskMap = new Map();
        const rootTasks = [];

        tasks.forEach(task => {
            task.children = [];
            taskMap.set(task.id, task);
        });

        tasks.forEach(task => {
            if (task.parentId && taskMap.has(task.parentId)) {
                taskMap.get(task.parentId).children.push(task);
            } else {
                rootTasks.push(task);
            }
        });

        return rootTasks;
    }
}

module.exports = Task;
