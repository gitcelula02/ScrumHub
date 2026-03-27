const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataPath = path.join(__dirname, '../../data');

if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
}

const initFile = (filename, defaultData = []) => {
    const filePath = path.join(dataPath, filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
    return filePath;
};

const initDatabase = () => {
    const adminPassword = bcrypt.hashSync('admin123', 10);
    
    initFile('users.json', [
        {
            id: '1',
            email: 'admin@proyecto.com',
            password: adminPassword,
            name: 'Administrador',
            role: 'admin',
            avatar: '👨‍💼',
            createdAt: new Date().toISOString()
        }
    ]);
    initFile('projects.json', []);
    initFile('tasks.json', []);
    initFile('comments.json', []);
    initFile('activities.json', []);
    
    console.log('✓ Base de datos inicializada');
};

module.exports = {
    initDatabase,
    readJSON: (filename) => {
        const filePath = path.join(dataPath, filename);
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    },
    writeJSON: (filename, data) => {
        const filePath = path.join(dataPath, filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
};
