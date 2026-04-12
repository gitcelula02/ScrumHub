const { supabase } = require('../config/database');

class Project {
    static async getAll() {
        const { data, error } = await supabase.from('project').select('*, projectuser(user_id)');
        if (error) throw error;
        return (data || []).map(p => {
            p.owner = p.owner_id;
            p.members = p.projectuser ? p.projectuser.map(pu => pu.user_id) : [];
            p.color = '#667eea'; p.icon = '📁'; p.status = 'active'; // dummy values
            delete p.projectuser;
            return p;
        });
    }

    static async getById(id) {
        const { data, error } = await supabase.from('project').select('*, projectuser(user_id)').eq('id', id).single();
        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
            data.owner = data.owner_id;
            data.members = data.projectuser ? data.projectuser.map(pu => pu.user_id) : [];
            data.color = '#667eea'; data.icon = '📁'; data.status = 'active';
            delete data.projectuser;
        }
        return data;
    }

    static async getByUser(userId) {
        // Find projects where user is member
        const { data: memberProjects } = await supabase.from('projectuser').select('project_id').eq('user_id', userId);
        const projectIds = memberProjects ? memberProjects.map(mp => mp.project_id) : [];
        
        let query = supabase.from('project').select('*, projectuser(user_id)');
        if (projectIds.length > 0) {
            query = query.or(`owner_id.eq.${userId},id.in.(${projectIds.join(',')})`);
        } else {
            query = query.eq('owner_id', userId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map(p => {
            p.owner = p.owner_id;
            p.members = p.projectuser ? p.projectuser.map(pu => pu.user_id) : [];
            p.color = '#667eea'; p.icon = '📁'; p.status = 'active';
            delete p.projectuser;
            return p;
        });
    }

    static async create(projectData) {
        const newProject = {
            name: projectData.name,
            description: projectData.description || '',
            owner_id: projectData.owner
        };
        const { data, error } = await supabase.from('project').insert([newProject]).select().single();
        if (error) throw error;
        
        // Add owner as a member (PO)
        await supabase.from('projectuser').insert([{
            project_id: data.id,
            user_id: projectData.owner,
            role: 'PO'
        }]);

        data.owner = data.owner_id;
        data.members = [projectData.owner];
        data.color = '#667eea'; data.icon = '📁'; data.status = 'active';
        return data;
    }

    static async update(id, updateData) {
        const dbFields = {};
        if (updateData.name) dbFields.name = updateData.name;
        if (updateData.description !== undefined) dbFields.description = updateData.description;
        
        const { data, error } = await supabase.from('project').update(dbFields).eq('id', id).select().single();
        if (error) throw error;
        
        if (data) {
            data.owner = data.owner_id;
            data.color = '#667eea'; data.icon = '📁'; data.status = 'active';
        }
        return data;
    }

    static async delete(id) {
        const { error } = await supabase.from('project').delete().eq('id', id);
        if (error) throw error;
        
        // Asumiendo que backlogitem se borra en cascada, de lo contrario esto podría fallar, pero limpiamos por si a caso.
        await supabase.from('backlogitem').delete().eq('project_id', id);
        
        return true;
    }

    static async addMember(projectId, userId) {
        // Verificar si ya es miembro
        const { data } = await supabase.from('projectuser').select('id').eq('project_id', projectId).eq('user_id', userId).single();
        if (data) return true; // Ya existe

        const { error } = await supabase.from('projectuser').insert([{
            project_id: projectId,
            user_id: userId,
            role: 'DEV'
        }]);
        return !error;
    }
}

module.exports = Project;