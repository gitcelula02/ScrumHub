const { supabase } = require('../config/database');

const STATUS_TO_DB = { 'todo': 'TODO', 'in-progress': 'IN_PROGRESS', 'review': 'BLOCKED', 'done': 'DONE' };
const DB_TO_STATUS = { 'TODO': 'todo', 'IN_PROGRESS': 'in-progress', 'BLOCKED': 'review', 'DONE': 'done' };

const PRIORITY_TO_DB = { 'high': 1, 'medium': 2, 'low': 3 };
const DB_TO_PRIORITY = { 1: 'high', 2: 'medium', 3: 'low' };

function mapFromDB(dbRow) {
    if (!dbRow) return null;
    return {
        id: dbRow.id,
        projectId: dbRow.project_id,
        parentId: dbRow.parent_id,
        title: dbRow.title,
        description: dbRow.description || '',
        status: DB_TO_STATUS[dbRow.status] || 'todo',
        priority: DB_TO_PRIORITY[dbRow.priority] || 'medium',
        dueDate: dbRow.due_date,
        assignee: null,
        reporter: null,
        tags: [],
        subtasks: [],
        attachments: [],
        comments: [], // Comments are not supported in backlogitem currently
        type: dbRow.type
    };
}

class Task {
    static async getAll() {
        const { data, error } = await supabase.from('backlogitem').select('*').eq('type', 'TASK');
        if (error) throw error;
        return (data || []).map(mapFromDB);
    }

    static async getById(id) {
        const { data, error } = await supabase.from('backlogitem').select('*').eq('id', id).single();
        if (error && error.code !== 'PGRST116') throw error;
        return mapFromDB(data);
    }

    static async getByProject(projectId) {
        const { data, error } = await supabase.from('backlogitem').select('*').eq('project_id', projectId).eq('type', 'TASK');
        if (error) throw error;
        return (data || []).map(mapFromDB);
    }

    static async getByUser(userId) {
        const { data: memberProjects } = await supabase.from('projectuser').select('project_id').eq('user_id', userId);
        const projectIds = memberProjects ? memberProjects.map(mp => mp.project_id) : [];
        
        if (projectIds.length === 0) return [];
        
        const { data, error } = await supabase.from('backlogitem')
            .select('*')
            .eq('type', 'TASK')
            .in('project_id', projectIds);
            
        if (error) throw error;
        return (data || []).map(mapFromDB);
    }

    static async getByPriority(priority) {
        const mappedPri = PRIORITY_TO_DB[priority] || 2;
        const { data, error } = await supabase.from('backlogitem').select('*').eq('priority', mappedPri).eq('type', 'TASK');
        if (error) throw error;
        return (data || []).map(mapFromDB);
    }

    static async getOverdue() {
        const now = new Date().toISOString();
        const { data, error } = await supabase.from('backlogitem')
            .select('*')
            .eq('type', 'TASK')
            .neq('status', 'DONE')
            .not('due_date', 'is', null)
            .lt('due_date', now);
        if (error) throw error;
        return (data || []).map(mapFromDB);
    }

    static async create(taskData) {
        const newTask = {
            project_id: taskData.projectId,
            title: taskData.title,
            description: taskData.description || '',
            status: STATUS_TO_DB[taskData.status] || 'TODO',
            priority: PRIORITY_TO_DB[taskData.priority] || 2,
            due_date: taskData.dueDate || null,
            type: 'TASK'
        };
        const { data, error } = await supabase.from('backlogitem').insert([newTask]).select().single();
        if (error) throw error;
        return mapFromDB(data);
    }

    static async update(id, updateData) {
        const dbFields = {};
        if (updateData.title !== undefined) dbFields.title = updateData.title;
        if (updateData.description !== undefined) dbFields.description = updateData.description;
        if (updateData.status) dbFields.status = STATUS_TO_DB[updateData.status] || 'TODO';
        if (updateData.priority) dbFields.priority = PRIORITY_TO_DB[updateData.priority] || 2;
        if (updateData.dueDate !== undefined) dbFields.due_date = updateData.dueDate;

        const { data, error } = await supabase.from('backlogitem').update(dbFields).eq('id', id).select().single();
        if (error) throw error;
        return mapFromDB(data);
    }

    static async delete(id) {
        const { error } = await supabase.from('backlogitem').delete().eq('id', id);
        if (error) throw error;
        return true;
    }

    static async addComment(taskId, comment) {
        // Obviamos esto de forma temporal porque backlogitem no admite comentarios ni arreglos.
        return {
            id: Date.now().toString(),
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
            highPriority: tasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
            mediumPriority: tasks.filter(t => t.priority === 'medium' && t.status !== 'done').length,
            lowPriority: tasks.filter(t => t.priority === 'low' && t.status !== 'done').length,
            overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length
        };
    }

    static async getTreeByProject(projectId) {
        // Obtener todas las tareas del proyecto incluyendo parent_id
        const { data, error } = await supabase
            .from('backlogitem')
            .select('*')
            .eq('project_id', projectId)
            .eq('type', 'TASK')
            .order('order_index', { ascending: true });
        
        if (error) throw error;
        
        const tasks = (data || []).map(mapFromDB);
        
        // Construir árbol
        const taskMap = new Map();
        const rootTasks = [];
        
        // Primera pasada: crear map y estructura básica
        tasks.forEach(task => {
            task.children = [];
            taskMap.set(task.id, task);
        });
        
        // Segunda pasada: asignar hijos a padres
        tasks.forEach(task => {
            if (task.parentId && taskMap.has(task.parentId)) {
                const parent = taskMap.get(task.parentId);
                parent.children.push(task);
            } else {
                rootTasks.push(task);
            }
        });
        
        return rootTasks;
    }
}

module.exports = Task;