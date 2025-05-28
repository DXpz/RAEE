/**
 * Script para iniciar el servidor RAEE Backend
 * Configura variables de entorno y inicia el servidor
 */

// Configurar variables de entorno directamente
process.env.PORT = '5000';
process.env.NODE_ENV = 'development';

process.env.JWT_SECRET = 'raee_super_secret_key_2024_hector';
process.env.JWT_EXPIRE = '7d';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';

console.log('🚀 Iniciando servidor RAEE Backend...');
console.log('⚙️ Variables de entorno configuradas');
console.log(`📊 MongoDB: ${process.env.MONGODB_URI.substring(0, 50)}...`);
console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET.substring(0, 10)}...`);
console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);

// Importar y ejecutar servidor
import('../src/server.js').then(() => {
  console.log('✅ Servidor iniciado correctamente');
}).catch((error) => {
  console.error('❌ Error al iniciar servidor:', error);
  process.exit(1);
}); 