const { createClient } = require('@supabase/supabase-js');
const { Redis } = require('@upstash/redis');
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

// Configuración de Upstash Redis
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis = null;
if (redisUrl && redisToken) {
    redis = new Redis({
        url: redisUrl,
        token: redisToken,
    });
} else {
    console.error('⚠️ Redis credentials missing in environment variables');
}

const initDatabase = async () => {
    console.log('Iniciando conexión a bases de datos...');
    
    // Verificar conexión a Supabase
    if (supabase) {
        // Ejecutar una consulta simple para verificar la conexión
        // Se utiliza 'User' (no 'users') basado en el schema actual de Supabase
        const { data, error } = await supabase.from('User').select('id').limit(1);
        if (error) {
            console.error('❌ Error conectando a Supabase:', error.message);
        } else {
            console.log('✓ Conectado a Supabase correctamente');
        }
    }

    // Verificar conexión a Redis
    if (redis) {
        try {
            await redis.set('ping', 'pong');
            const pong = await redis.get('ping');
            if (pong === 'pong') {
                console.log('✓ Conectado a Upstash Redis correctamente');
            }
        } catch (error) {
            console.error('❌ Error conectando a Redis:', error.message);
        }
    }
};

module.exports = {
    initDatabase,
    supabase,
    redis
};
