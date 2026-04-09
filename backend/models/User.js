const { supabase } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async getAll() {
        const { data, error } = await supabase.from('User').select('*');
        if (error) throw error;
        return data || [];
    }

    static async findById(id) {
        const { data, error } = await supabase.from('User').select('*').eq('id', id).single();
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found
        // Return dummy role/avatar so frontend doesn't break
        if (data) Object.assign(data, { role: 'member', avatar: '👤' });
        return data;
    }

    static async findByEmail(email) {
        const { data, error } = await supabase.from('User').select('*').eq('email', email).single();
        if (error && error.code !== 'PGRST116') throw error;
        if (data) Object.assign(data, { role: 'member', avatar: '👤' });
        return data;
    }

    static async create(userData) {
        const newUser = {
            email: userData.email,
            password_hash: bcrypt.hashSync(userData.password, 10),
            name: userData.name
        };
        const { data, error } = await supabase.from('User').insert([newUser]).select().single();
        if (error) throw error;
        if (data) Object.assign(data, { role: 'member', avatar: '👤' });
        return data;
    }

    static async update(id, updateData) {
        const { data, error } = await supabase.from('User').update(updateData).eq('id', id).select().single();
        if (error) throw error;
        if (data) Object.assign(data, { role: 'member', avatar: '👤' });
        return data;
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
