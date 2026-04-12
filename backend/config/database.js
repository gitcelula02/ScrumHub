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
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null;

// Configuración de MongoDB
const mongodbUri = process.env.MONGODB_URI;
let mongodbConnected = false;

const initDatabase = async () => {
    console.log('Iniciando conexión a bases de datos...');

    // Verificar conexión a Supabase
    if (supabase) {
        console.log(`📡 Conectando a Supabase: ${supabaseUrl?.substring(0, 40)}...`);
        try {
            // Verificar con la tabla User (mayúscula, según schema real)
            const { data, error } = await supabase.from('User').select('id').limit(1);
            if (error) {
                console.error('❌ Error conectando a Supabase:', error.message);
                console.error('🔍 Detalles:', JSON.stringify(error));
            } else {
                console.log(`✅ Conectado a Supabase correctamente.`);
            }
        } catch (err) {
            console.error('❌ Excepción al conectar Supabase:', err.message);
        }
    } else {
        console.error('❌ No se pudo crear cliente Supabase. Verifica las variables de entorno.');
    }

    // Conectar a MongoDB para historial de chat
    if (mongodbUri) {
        try {
            await mongoose.connect(mongodbUri, {
                serverSelectionTimeoutMS: 5000,
                connectTimeoutMS: 5000
            });
            mongodbConnected = true;
            console.log('✅ Conectado a MongoDB correctamente');
        } catch (error) {
            console.error('❌ Error conectando a MongoDB:', error.message);
            console.log('⚠️ Continuando sin MongoDB (historial de chat no disponible)');
        }
    } else {
        console.log('⚠️ MONGODB_URI no configurado, saltando conexión MongoDB');
    }
};

module.exports = {
    initDatabase,
    supabase,
    mongoose,
    mongodbConnected: () => mongodbConnected
};
