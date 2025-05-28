import mongoose from 'mongoose';
import AuthService from '../src/services/AuthService.js';
import User from '../src/models/User.js';


async function testAuthService() {
  try {
    console.log('🔍 Conectando a MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');

    const authService = new AuthService();

    // Test 1: Verificar que el usuario admin existe
    console.log('\n🧪 Test 1: Verificar usuario admin');
    console.log('================================');
    
    const adminUser = await User.findByUsername('admin');
    if (adminUser) {
      console.log(`✅ Usuario admin encontrado: ${adminUser.fullName}`);
      console.log(`   - Username: ${adminUser.username}`);
      console.log(`   - Activo: ${adminUser.isActive}`);
      console.log(`   - Rol: ${adminUser.role}`);
    } else {
      console.log('❌ Usuario admin no encontrado');
      return;
    }

    // Test 2: Probar comparePassword directamente
    console.log('\n🧪 Test 2: Probar comparePassword directamente');
    console.log('==============================================');
    
    const isPasswordValid = await adminUser.comparePassword('admin123');
    console.log(`Resultado comparePassword: ${isPasswordValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);

    // Test 3: Probar AuthService.login paso a paso
    console.log('\n🧪 Test 3: Probar AuthService.login paso a paso');
    console.log('===============================================');
    
    console.log('Paso 1: Validar username...');
    const usernameValidation = authService.validateUsername('admin');
    console.log(`Username válido: ${usernameValidation.isValid ? '✅' : '❌'}`);
    if (!usernameValidation.isValid) {
      console.log(`Error: ${usernameValidation.error}`);
    }

    console.log('Paso 2: Validar password...');
    const passwordValidation = authService.validatePassword('admin123');
    console.log(`Password válido: ${passwordValidation.isValid ? '✅' : '❌'}`);
    if (!passwordValidation.isValid) {
      console.log(`Error: ${passwordValidation.error}`);
    }

    console.log('Paso 3: Buscar usuario...');
    const foundUser = await User.findByUsername('admin');
    console.log(`Usuario encontrado: ${foundUser ? '✅' : '❌'}`);

    if (foundUser) {
      console.log('Paso 4: Verificar si está activo...');
      console.log(`Usuario activo: ${foundUser.isActive ? '✅' : '❌'}`);

      console.log('Paso 5: Verificar contraseña...');
      const passwordCheck = await foundUser.comparePassword('admin123');
      console.log(`Contraseña correcta: ${passwordCheck ? '✅' : '❌'}`);
    }

    // Test 4: Probar login completo
    console.log('\n🧪 Test 4: Probar login completo con AuthService');
    console.log('===============================================');
    
    const loginResult = await authService.login('admin', 'admin123');
    console.log(`Login exitoso: ${loginResult.success ? '✅' : '❌'}`);
    
    if (loginResult.success) {
      console.log(`✅ Login exitoso para: ${loginResult.user.fullName}`);
      console.log(`   - Token generado: ${loginResult.token ? 'Sí' : 'No'}`);
    } else {
      console.log(`❌ Login fallido: ${loginResult.error}`);
    }

    // Test 5: Probar con diferentes variaciones
    console.log('\n🧪 Test 5: Probar variaciones de credenciales');
    console.log('============================================');
    
    const testCases = [
      { username: 'admin', password: 'admin123', expected: true },
      { username: 'ADMIN', password: 'admin123', expected: true },
      { username: ' admin ', password: 'admin123', expected: true },
      { username: 'admin', password: ' admin123 ', expected: true },
      { username: 'admin', password: 'wrong', expected: false },
      { username: 'wrong', password: 'admin123', expected: false }
    ];

    for (const testCase of testCases) {
      const result = await authService.login(testCase.username, testCase.password);
      const success = result.success === testCase.expected;
      console.log(`${success ? '✅' : '❌'} "${testCase.username}" / "${testCase.password}" → ${result.success ? 'Éxito' : result.error}`);
    }

    console.log('\n🎯 Diagnóstico completado');

  } catch (error) {
    console.error('💥 Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
  }
}

testAuthService(); 