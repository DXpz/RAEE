import mongoose from 'mongoose';
import User from '../src/models/User.js';
import bcrypt from 'bcrypt';

async function testPasswordSpaces() {
  try {
    console.log('🔍 Conectando a MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');

    // Obtener usuario admin
    const adminUser = await User.findByUsername('admin');
    
    if (!adminUser) {
      console.log('❌ Usuario admin no encontrado');
      return;
    }

    console.log('\n🧪 Test de contraseñas con espacios');
    console.log('==================================');
    

    for (const testPassword of testPasswords) {
      console.log(`\n🔑 Probando: "${testPassword}"`);
      
      // Test 1: comparePassword directo
      const directResult = await adminUser.comparePassword(testPassword);
      console.log(`   comparePassword directo: ${directResult ? '✅' : '❌'}`);
      
      // Test 2: comparePassword con trim
      const trimmedResult = await adminUser.comparePassword(testPassword.trim());
      console.log(`   comparePassword con trim: ${trimmedResult ? '✅' : '❌'}`);
      
      // Test 3: bcrypt directo
      const bcryptResult = await bcrypt.compare(testPassword, adminUser.password);
      console.log(`   bcrypt directo: ${bcryptResult ? '✅' : '❌'}`);
      
      // Test 4: bcrypt con trim
      const bcryptTrimResult = await bcrypt.compare(testPassword.trim(), adminUser.password);
      console.log(`   bcrypt con trim: ${bcryptTrimResult ? '✅' : '❌'}`);
    }

    // Verificar cómo se creó la contraseña original
    console.log('\n🔍 Verificando hash original');
    console.log('============================');
    console.log(`Hash almacenado: ${adminUser.password}`);
    
    // Crear un nuevo hash con admin123 para comparar
    const newHash = await bcrypt.hash('admin123', 12);
    console.log(`Nuevo hash generado: ${newHash}`);
    
    const newHashTest = await bcrypt.compare('admin123', newHash);
    console.log(`Nuevo hash funciona: ${newHashTest ? '✅' : '❌'}`);

    console.log('\n🎯 Diagnóstico completado');

  } catch (error) {
    console.error('💥 Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
  }
}

testPasswordSpaces(); 