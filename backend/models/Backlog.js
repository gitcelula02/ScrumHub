const { supabase } = require('../config/database');

function mapFromDB(row) {
    if (!row) return null;
    return {
        id: String(row.id),
        projectId: String(row.project_id),
        name: row.name,
        description: row.description || '',
        type: row.type || 'custom',
        color: row.color || '#3B82F6',
        orderIndex: row.order_index ?? 0,
        isDefault: row.is_default ?? false,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

class Backlog {
    static async getByProject(projectId) {
        if (!projectId || projectId === 'undefined') return [];
        const { data, error } = await supabase
            .from('backlogs')
            .select('*')
            .eq('project_id', projectId)
            .order('order_index', { ascending: true });
        if (error) throw error;
        return (data || []).map(mapFromDB);
    }

    static async getById(id) {
        if (!id || id === 'undefined') return null;
        const { data, error } = await supabase
            .from('backlogs')
            .select('*')
            .eq('id', id)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return mapFromDB(data);
    }

    static async create(projectId, backlogData) {
        if (!projectId || projectId === 'undefined') {
            throw new Error('Invalid projectId for backlog creation');
        }

        const newBacklog = {
            project_id: projectId,
            name: backlogData.name,
            description: backlogData.description || '',
            type: backlogData.type || 'custom',
            color: backlogData.color || '#3B82F6',
            order_index: backlogData.orderIndex ?? 0,
            is_default: backlogData.isDefault ?? false
        };

        const { data, error } = await supabase
            .from('backlogs')
            .insert([newBacklog])
            .select()
            .single();
        if (error) throw error;
        return mapFromDB(data);
    }

    static async update(id, updateData) {
        const dbFields = {};
        if (updateData.name !== undefined) dbFields.name = updateData.name;
        if (updateData.description !== undefined) dbFields.description = updateData.description;
        if (updateData.type !== undefined) dbFields.type = updateData.type;
        if (updateData.color !== undefined) dbFields.color = updateData.color;
        if (updateData.orderIndex !== undefined) dbFields.order_index = updateData.orderIndex;
        if (updateData.isDefault !== undefined) dbFields.is_default = updateData.isDefault;

        const { data, error } = await supabase
            .from('backlogs')
            .update(dbFields)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return mapFromDB(data);
    }

    static async delete(id) {
        if (!id) return false;

        let taskData = [];
        let taskError = null;

        const tasksResult = await supabase
            .from('tasks')
            .select('id')
            .eq('backlog_id', id)
            .limit(1);

        taskData = tasksResult.data;
        taskError = tasksResult.error;

        if (taskError && taskError.code === 'PGRST116') {
            const fallback = await supabase
                .from('backlogitem')
                .select('id')
                .eq('backlog_id', id)
                .limit(1);
            if (fallback.error) throw fallback.error;
            taskData = fallback.data;
        } else if (taskError) {
            throw taskError;
        }

        if (taskData && taskData.length > 0) {
            throw new Error('Cannot delete backlog with existing tasks');
        }

        const { error } = await supabase
            .from('backlogs')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    }
}

module.exports = Backlog;
