const { supabase } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async getAll() {
        const { data, error } = await supabase.from('User').select('id, name, email, created_at');
        if (error) throw error;
        return (data || []).map(u => ({ ...u, role: 'member', avatar: '👤' }));
    }

    static async findById(id) {
        if (!id) return null;
        const { data, error } = await supabase
            .from('User')
            .select('id, name, email, created_at')
            .eq('id', id)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        if (data) return { ...data, role: 'member', avatar: '👤' };
        return null;
    }

    static async findByEmail(email) {
        if (!email) return null;
        const { data, error } = await supabase
            .from('User')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        if (data) return { ...data, role: 'member', avatar: '👤' };
        return null;
    }

    static async create(userData) {
        const newUser = {
            email: userData.email.toLowerCase().trim(),
            password_hash: bcrypt.hashSync(userData.password, 10),
            name: userData.name.trim()
        };
        const { data, error } = await supabase
            .from('User')
            .insert([newUser])
            .select('id, name, email, created_at')
            .single();
        if (error) throw error;
        return { ...data, role: 'member', avatar: '👤' };
    }

    static async update(id, updateData) {
        const fields = {};
        if (updateData.name) fields.name = updateData.name;
        if (updateData.avatar) fields.avatar = updateData.avatar; // guardado como texto si la columna existe

        const { data, error } = await supabase
            .from('User')
            .update(fields)
            .eq('id', id)
            .select('id, name, email, created_at')
            .single();
        if (error) throw error;
        return { ...data, role: 'member', avatar: updateData.avatar || '👤' };
    }

    static async delete(id) {
        const { error } = await supabase.from('User').delete().eq('id', id);
        if (error) throw error;
        return true;
    }

    static verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compareSync(plainPassword, hashedPassword);
    }
}

module.exports = User;
