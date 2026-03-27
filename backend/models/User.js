const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static getAll() {
        return db.readJSON('users.json');
    }

    static findById(id) {
        const users = db.readJSON('users.json');
        return users.find(u => u.id === id);
    }

    static findByEmail(email) {
        const users = db.readJSON('users.json');
        return users.find(u => u.email === email);
    }

    static create(userData) {
        const users = db.readJSON('users.json');
        const newUser = {
            id: Date.now().toString(),
            email: userData.email,
            password: bcrypt.hashSync(userData.password, 10),
            name: userData.name,
            role: userData.role || 'member',
            avatar: userData.avatar || '👤',
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        db.writeJSON('users.json', users);
        return newUser;
    }

    static update(id, data) {
        const users = db.readJSON('users.json');
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...data };
            db.writeJSON('users.json', users);
            return users[index];
        }
        return null;
    }

    static delete(id) {
        const users = db.readJSON('users.json');
        const filtered = users.filter(u => u.id !== id);
        db.writeJSON('users.json', filtered);
    }

    static verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compareSync(plainPassword, hashedPassword);
    }
}

module.exports = User;
