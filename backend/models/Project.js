const { supabase } = require('../config/database');

const DEFAULT_COLOR = '#667eea';
const DEFAULT_ICON = '📁';

function enrichProject(p) {
    if (!p) return null;
    return {
        ...p,
        id: String(p.id),
        owner: p.owner_id ? String(p.owner_id) : null,
        color: p.color || DEFAULT_COLOR,
        icon: p.icon || DEFAULT_ICON,
        status: 'active',
        members: (p._members || []).map(String),
    };
}

class Project {
    static async getAll() {
        const { data, error } = await supabase
            .from('project')
            .select('*, projectuser(user_id)');
        if (error) throw error;
        return (data || []).map(p => {
            const members = p.projectuser ? p.projectuser.map(pu => pu.user_id) : [];
            const { projectuser, ...rest } = p;
            return enrichProject({ ...rest, _members: members });
        });
    }

    static async getById(id) {
        if (!id || id === 'undefined') return null;
        const { data, error } = await supabase
            .from('project')
            .select('*, projectuser(user_id)')
            .eq('id', id)
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
        const { data: memberRows, error: memberError } = await supabase
            .from('projectuser')
            .select('project_id')
            .eq('user_id', userId);

        if (memberError) {
            console.error('Error obteniendo proyectos miembro:', memberError.message);
        }

        const memberProjectIds = (memberRows || []).map(r => r.project_id);

        // Construir query: proyectos donde es owner O miembro
        let projectIds = [...new Set(memberProjectIds)];

        // Traer proyectos por owner_id
        const { data: ownedProjects, error: ownedError } = await supabase
            .from('project')
            .select('*, projectuser(user_id)')
            .eq('owner_id', userId);

        if (ownedError) {
            console.error('Error obteniendo proyectos propios:', ownedError.message);
        }

        // Traer proyectos donde es miembro (si hay alguno)
        let memberProjectsData = [];
        if (projectIds.length > 0) {
            const { data: mp, error: mpError } = await supabase
                .from('project')
                .select('*, projectuser(user_id)')
                .in('id', projectIds);
            if (!mpError) memberProjectsData = mp || [];
        }

        // Combinar y deduplicar
        const allProjects = [...(ownedProjects || []), ...memberProjectsData];
        const seen = new Set();
        const unique = allProjects.filter(p => {
            if (seen.has(p.id)) return false;
            seen.add(p.id);
            return true;
        });

        return unique.map(p => {
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
            console.error('Error al agregar miembro inicial:', memberError.message);
        }

        try {
            const Backlog = require('./Backlog');
            await Backlog.create(data.id, {
                name: 'Default Backlog',
                description: 'Backlog creado automáticamente con el proyecto',
                type: 'default',
                color: '#3B82F6',
                isDefault: true
            });
        } catch (backlogError) {
            console.error('Error creando backlog predeterminado:', backlogError.message);
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
            .select('*, projectuser(user_id)')
            .single();
        if (error) throw error;
        const members = data.projectuser ? data.projectuser.map(pu => pu.user_id) : [];
        const { projectuser, ...rest } = data;
        return enrichProject({ ...rest, _members: members });
    }

    static async delete(id) {
        // Hard delete (schema no tiene deleted_at)
        // Primero eliminar tareas asociadas
        await supabase.from('backlogitem').delete().eq('project_id', id);
        // Eliminar miembros
        await supabase.from('projectuser').delete().eq('project_id', id);
        // Eliminar proyecto
        const { error } = await supabase
            .from('project')
            .delete()
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
