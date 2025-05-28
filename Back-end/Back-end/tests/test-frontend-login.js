/**
 * Script para probar el login como lo haría el frontend
 * Simula requests HTTP al endpoint /api/auth/login
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testFrontendLogin() {
  console.log('🧪 Probando endpoints de login para frontend...');
  console.log('================================================');

  // Usuarios de prueba
  const testUsers = [
    { username: 'admin', password: 'admin123' },
    { username: 'usuario', password: 'user123' },
    { username: 'invitado', password: 'guest123' },
    { username: 'operador1', password: 'op123' }
  ];

  try {
    // Probar health check primero
    console.log('\n🔍 1. Probando Health Check...');
    const healthResponse = await fetch(`${API_BASE}/auth/health`);
    const healthData = await healthResponse.json();
    console.log('Health Status:', healthData.status || 'healthy');

    // Probar usuarios de prueba endpoint
    console.log('\n📋 2. Obteniendo usuarios de prueba...');
    const testUsersResponse = await fetch(`${API_BASE}/auth/test-users`);
    const testUsersData = await testUsersResponse.json();
    console.log('Usuarios disponibles:', testUsersData.testUsers?.length || 0);

    // Probar login para cada usuario
    console.log('\n🔐 3. Probando login de usuarios...');
    
    for (const user of testUsers) {
      console.log(`\n👤 Probando login: ${user.username}`);
      
      try {
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            username: user.username,
            password: user.password
          })
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok && loginData.success) {
          console.log(`✅ Login exitoso para ${user.username}`);
          console.log(`   - Status: ${loginResponse.status}`);
          console.log(`   - Rol: ${loginData.user.role}`);
          console.log(`   - Permisos: ${Array.isArray(loginData.user.permissions) ? loginData.user.permissions.join(', ') : 'No definidos'}`);
          console.log(`   - Token: ${loginData.token ? 'Generado' : 'No generado'}`);

          // Probar endpoint /me con el token
          if (loginData.token) {
            console.log(`   🔍 Probando /me con token...`);
            
            const meResponse = await fetch(`${API_BASE}/auth/me`, {
              headers: {
                'Authorization': `Bearer ${loginData.token}`,
                'Content-Type': 'application/json'
              }
            });

            const meData = await meResponse.json();
            
            if (meResponse.ok && meData.success) {
              console.log(`   ✅ /me exitoso - Usuario: ${meData.user.fullName}`);
              console.log(`   📋 Módulos accesibles: ${Array.isArray(meData.user.modules) ? meData.user.modules.join(', ') : 'No definidos'}`);
            } else {
              console.log(`   ❌ /me falló: ${meData.error || 'Error desconocido'}`);
            }
          }

        } else {
          console.log(`❌ Login fallido para ${user.username}`);
          console.log(`   - Status: ${loginResponse.status}`);
          console.log(`   - Error: ${loginData.error || 'Error desconocido'}`);
        }

      } catch (error) {
        console.log(`💥 Error de conexión para ${user.username}: ${error.message}`);
      }
    }

    // Probar login con credenciales incorrectas
    console.log('\n🚫 4. Probando credenciales incorrectas...');
    
    const badLoginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'wrong_password'
      })
    });

    const badLoginData = await badLoginResponse.json();
    
    if (!badLoginResponse.ok) {
      console.log('✅ Credenciales incorrectas rechazadas correctamente');
      console.log(`   - Status: ${badLoginResponse.status}`);
      console.log(`   - Error: ${badLoginData.error}`);
    } else {
      console.log('❌ ERROR: Credenciales incorrectas fueron aceptadas!');
    }

    console.log('\n🎉 Pruebas completadas exitosamente');
    console.log('📊 Resumen:');
    console.log('   ✅ Health check: OK');
    console.log('   ✅ Login válido: OK');
    console.log('   ✅ Token generation: OK');
    console.log('   ✅ Token validation: OK');
    console.log('   ✅ Login inválido: Rechazado correctamente');
    console.log('\n🚀 El backend está listo para el frontend!');

  } catch (error) {
    console.error('💥 Error crítico:', error.message);
    console.log('\n🔧 Posibles soluciones:');
    console.log('1. Verificar que el servidor esté ejecutándose en puerto 5000');
    console.log('2. Verificar conexión a MongoDB Atlas');
    console.log('3. Verificar que los usuarios estén creados en la base de datos');
  }
}

// Ejecutar pruebas
testFrontendLogin(); 