const { createClient } = require('@supabase/supabase-js');
const mongoose = require('mongoose');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('⚠️ Supabase credentials missing in environment variables');
}

const supabase = supabaseUrl && supabaseKey 
    ? createClient(supabaseUrl, supabaseKey) 
    : null;

// Configuración de MongoDB
const mongodbUri = process.env.MONGODB_URI;

let mongodbConnected = false;

const initDatabase = async () => {
    console.log('Iniciando conexión a bases de datos...');
    
    // Verificar conexión a Supabase
    if (supabase) {
        console.log(`📡 Conectando a Supabase: ${supabaseUrl?.substring(0, 30)}...`);
        // Ejecutar una consulta simple para verificar la conexión
        // Se utiliza 'User' (no 'users') basado en el schema actual de Supabase
        const { data, error } = await supabase.from('User').select('id').limit(1);
        if (error) {
            console.error('❌ Error conectando a Supabase:', error.message);
            console.error('🔍 Detalles:', error);
        } else {
            console.log(`✓ Conectado a Supabase correctamente. Tabla User tiene ${data?.length || 0} registros`);
        }
    }

    // Verificar conexión a MongoDB (opcional, se omite si hay error)
    if (mongodbUri && false) { // Deshabilitado temporalmente
        try {
            await mongoose.connect(mongodbUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000,
                connectTimeoutMS: 5000
            });
            mongodbConnected = true;
            console.log('✓ Conectado a MongoDB correctamente');
        } catch (error) {
            console.error('❌ Error conectando a MongoDB:', error.message);
            console.log('⚠️ Continuando sin MongoDB');
        }
    } else {
        console.log('⚠️ MongoDB deshabilitado temporalmente');
    }
};

// Exportar mongoose para usarlo en modelos
module.exports = {
    initDatabase,
    supabase,
    mongoose,
    mongodbConnected: () => mongodbConnected
};