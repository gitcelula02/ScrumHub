const { supabase } = require('../config/database');
const Task = require('./Task');

function mapFromDB(row) {
    if (!row) return null;
    return {
        id: String(row.id),
        projectId: String(row.project_id),
        name: row.name,
        goal: row.goal || '',
        status: row.status || 'planning',
        startDate: row.start_date,
        endDate: row.end_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

class Sprint {
    static async getByProject(projectId) {
        if (!projectId) return [];
        const { data, error } = await supabase
            .from('sprints')
            .select('*')
            .eq('project_id', projectId)
            .order('start_date', { ascending: false });
        if (error) throw error;
        return (data || []).map(mapFromDB);
    }

    static async getById(id) {
        if (!id) return null;
        const { data, error } = await supabase
            .from('sprints')
            .select('*')
            .eq('id', id)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return mapFromDB(data);
    }

    static async create(projectId, sprintData) {
        const insertData = {
            project_id: projectId,
            name: sprintData.name,
            goal: sprintData.goal || '',
            status: sprintData.status || 'planning',
            start_date: sprintData.startDate || null,
            end_date: sprintData.endDate || null
        };

        const { data, error } = await supabase
            .from('sprints')
            .insert([insertData])
            .select()
            .single();
        if (error) throw error;
        return mapFromDB(data);
    }

    static async update(id, updateData) {
        const dbFields = {};
        if (updateData.name !== undefined) dbFields.name = updateData.name;
        if (updateData.goal !== undefined) dbFields.goal = updateData.goal;
        if (updateData.status !== undefined) dbFields.status = updateData.status;
        if (updateData.startDate !== undefined) dbFields.start_date = updateData.startDate;
        if (updateData.endDate !== undefined) dbFields.end_date = updateData.endDate;

        const { data, error } = await supabase
            .from('sprints')
            .update(dbFields)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapFromDB(data);
    }

    static async activate(id) {
        const sprint = await Sprint.getById(id);
        if (!sprint) throw new Error('Sprint not found');
        if (sprint.status === 'active') return sprint;

        const { data: activeSprints, error: activeError } = await supabase
            .from('sprints')
            .select('id')
            .eq('project_id', sprint.projectId)
            .eq('status', 'active');
        if (activeError) throw activeError;
        if (activeSprints && activeSprints.length > 0) {
            throw new Error('Another active sprint already exists for this project');
        }

        const { data, error } = await supabase
            .from('sprints')
            .update({ status: 'active' })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return mapFromDB(data);
    }

    static async complete(id, targetSprintId = null) {
        const sprint = await Sprint.getById(id);
        if (!sprint) throw new Error('Sprint not found');
        if (sprint.status === 'completed') return sprint;

        const sprintTasks = await Task.getBySprint(id);
        const incompleteTasks = sprintTasks.filter(task => task.status?.toLowerCase() !== 'done');
        const movedTasks = [];

        for (const task of incompleteTasks) {
            const updated = await Task.update(task.id, {
                sprintId: targetSprintId || null
            });
            movedTasks.push(updated);
        }

        const { data, error } = await supabase
            .from('sprints')
            .update({ status: 'completed', end_date: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return {
            sprint: mapFromDB(data),
            movedTasksCount: movedTasks.length,
            movedTasks: movedTasks.map(task => task.id)
        };
    }

    static async assignTasks(id, taskIds = []) {
        if (!id) throw new Error('Sprint id is required');
        const sprint = await Sprint.getById(id);
        if (!sprint) throw new Error('Sprint not found');

        const assignedTasks = [];
        for (const taskId of taskIds) {
            const updatedTask = await Task.update(taskId, { sprintId: id });
            assignedTasks.push(updatedTask);
        }

        return assignedTasks;
    }
}

module.exports = Sprint;
