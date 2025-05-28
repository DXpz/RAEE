import mongoose from 'mongoose';
import User from '../src/models/User.js';
import AuthService from '../src/services/AuthService.js';


async function testLogin() {
  try {
    console.log('🔍 Conectando a MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');

    const authService = new AuthService();

    // Usuarios de prueba
    const testUsers = [
      { username: 'admin', password: 'admin123' },
      { username: 'usuario', password: 'user123' },
      { username: 'invitado', password: 'guest123' },
      { username: 'operador1', password: 'op123' }
    ];

    console.log('\n🧪 Probando login de usuarios...');
    console.log('==================================');

    for (const userData of testUsers) {
      console.log(`\n👤 Probando: ${userData.username}`);
      
      try {
        const result = await authService.login(userData.username, userData.password);
        
        if (result.success) {
          console.log(`✅ Login exitoso para ${userData.username}`);
          console.log(`   - Rol: ${result.user.role}`);
          console.log(`   - Nombre: ${result.user.fullName}`);
          console.log(`   - Token generado: Sí`);
        } else {
          console.log(`❌ Login fallido para ${userData.username}: ${result.error}`);
        }
      } catch (error) {
        console.log(`❌ Error en login para ${userData.username}: ${error.message}`);
      }
    }

    // Verificar usuarios en la base de datos
    console.log('\n📊 Usuarios en la base de datos:');
    console.log('================================');
    const users = await User.find({ isActive: true }).select('username fullName role');
    users.forEach(user => {
      console.log(`👤 ${user.username} - ${user.fullName} (${user.role})`);
    });

    console.log('\n🎉 Prueba completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
  }
}

testLogin(); 