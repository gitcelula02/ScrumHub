const { supabase } = require('../config/database');

// Colores e iconos por defecto (no existen en el schema, los generamos en runtime)
const DEFAULT_COLOR = '#667eea';
const DEFAULT_ICON = '📁';

function enrichProject(p) {
    if (!p) return null;
    return {
        ...p,
        owner: p.owner_id,
        color: DEFAULT_COLOR,
        icon: DEFAULT_ICON,
        status: 'active',
        members: p._members || [],
    };
}

class Project {
    static async getAll() {
        const { data, error } = await supabase
            .from('project')
            .select('*, projectuser(user_id)')
            .is('deleted_at', null);
        if (error) throw error;
        return (data || []).map(p => {
            const members = p.projectuser ? p.projectuser.map(pu => pu.user_id) : [];
            const { projectuser, ...rest } = p;
            return enrichProject({ ...rest, _members: members });
        });
    }

    static async getById(id) {
        if (!id) return null;
        const { data, error } = await supabase
            .from('project')
            .select('*, projectuser(user_id)')
            .eq('id', id)
            .is('deleted_at', null)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        if (!data) return null;
        const members = data.projectuser ? data.projectuser.map(pu => pu.user_id) : [];
        const { projectuser, ...rest } = data;
        return enrichProject({ ...rest, _members: members });
    }

    static async getByUser(userId) {
        if (!userId) return [];

        // Proyectos donde el usuario es miembro
        const { data: memberRows } = await supabase
            .from('projectuser')
            .select('project_id')
            .eq('user_id', userId);

        const memberProjectIds = (memberRows || []).map(r => r.project_id);

        // Traer proyectos propios + proyectos miembro
        let query = supabase
            .from('project')
            .select('*, projectuser(user_id)')
            .is('deleted_at', null);

        if (memberProjectIds.length > 0) {
            query = query.or(`owner_id.eq.${userId},id.in.(${memberProjectIds.join(',')})`);
        } else {
            query = query.eq('owner_id', userId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map(p => {
            const members = p.projectuser ? p.projectuser.map(pu => pu.user_id) : [];
            const { projectuser, ...rest } = p;
            return enrichProject({ ...rest, _members: members });
        });
    }

    static async create(projectData) {
        if (!projectData.name || !projectData.owner) {
            throw new Error('name y owner son requeridos para crear un proyecto');
        }

        const newProject = {
            name: projectData.name.trim(),
            description: projectData.description || '',
            owner_id: projectData.owner
        };

        console.log('Creando proyecto en Supabase:', newProject);

        const { data, error } = await supabase
            .from('project')
            .insert([newProject])
            .select()
            .single();

        if (error) {
            console.error('Error Supabase al crear proyecto:', error);
            throw error;
        }

        console.log('Proyecto creado:', data);

        // Agregar al dueño como miembro con rol PO
        const { error: memberError } = await supabase
            .from('projectuser')
            .insert([{
                project_id: data.id,
                user_id: projectData.owner,
                role: 'PO'
            }]);

        if (memberError) {
            console.error('Error al agregar miembro inicial:', memberError);
            // No lanzamos error aquí para no perder el proyecto ya creado
        }

        return enrichProject({ ...data, _members: [projectData.owner] });
    }

    static async update(id, updateData) {
        const dbFields = {};
        if (updateData.name) dbFields.name = updateData.name;
        if (updateData.description !== undefined) dbFields.description = updateData.description;

        const { data, error } = await supabase
            .from('project')
            .update(dbFields)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return enrichProject({ ...data, _members: [] });
    }

    static async delete(id) {
        // Soft delete
        const { error } = await supabase
            .from('project')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
        return true;
    }

    static async addMember(projectId, userId) {
        // Verificar si ya es miembro
        const { data: existing } = await supabase
            .from('projectuser')
            .select('id')
            .eq('project_id', projectId)
            .eq('user_id', userId)
            .single();

        if (existing) return true;

        const { error } = await supabase
            .from('projectuser')
            .insert([{ project_id: projectId, user_id: userId, role: 'DEV' }]);

        if (error) throw error;
        return true;
    }
}

module.exports = Project;
