import dotenv from 'dotenv';
import databaseConnection from '../config/database.js';
import User, { UserRole } from '../models/User.js';
import WasteEntry, { WasteType } from '../models/WasteEntry.js';
import Alert, { AlertType, AlertPriority } from '../models/Alert.js';
import EnvironmentalIndicator, { IndicatorType, IndicatorStatus } from '../models/EnvironmentalIndicator.js';

// Cargar variables de entorno
dotenv.config();

/**
 * Script para poblar la base de datos con datos de prueba
 */
class DatabaseSeeder {
  constructor() {
    this.users = [];
    this.wasteEntries = [];
    this.alerts = [];
    this.environmentalIndicators = [];
  }

  /**
   * Ejecutar el seeding completo
   */
  async run() {
    try {
      console.log('🌱 Iniciando seeding de la base de datos...');
      
      // Conectar a la base de datos
      await databaseConnection.connect();
      
      // Limpiar datos existentes
      await this.clearDatabase();
      
      // Crear datos de prueba
      await this.createUsers();
      await this.createWasteEntries();
      await this.createAlerts();
      await this.createEnvironmentalIndicators();
      
      console.log('✅ Seeding completado exitosamente');
      console.log(`👥 Usuarios creados: ${this.users.length}`);
      console.log(`📦 Entradas de residuos: ${this.wasteEntries.length}`);
      console.log(`🚨 Alertas: ${this.alerts.length}`);
      console.log(`🌍 Indicadores ambientales: ${this.environmentalIndicators.length}`);
      
      // Mostrar usuarios de prueba
      this.showTestUsers();
      
    } catch (error) {
      console.error('❌ Error durante el seeding:', error);
    } finally {
      await databaseConnection.disconnect();
      process.exit(0);
    }
  }

  /**
   * Limpiar base de datos
   */
  async clearDatabase() {
    console.log('🧹 Limpiando base de datos...');
    
    await Promise.all([
      User.deleteMany({}),
      WasteEntry.deleteMany({}),
      Alert.deleteMany({}),
      EnvironmentalIndicator.deleteMany({})
    ]);
    
    console.log('✅ Base de datos limpiada');
  }

  /**
   * Crear usuarios de prueba
   */
  async createUsers() {
    console.log('👥 Creando usuarios de prueba...');
    
    const usersData = [
      {
        username: 'admin',
        password: 'admin123',
        fullName: 'Administrador del Sistema',
        role: UserRole.ADMIN,
        email: 'admin@raee.com'
      },
      {
        username: 'usuario',
        password: 'user123',
        fullName: 'Usuario Operador',
        role: UserRole.USER,
        email: 'usuario@raee.com'
      },
      {
        username: 'invitado',
        password: 'guest123',
        fullName: 'Usuario Invitado',
        role: UserRole.GUEST,
        email: 'invitado@raee.com'
      },
      {
        username: 'operador1',
        password: 'op123',
        fullName: 'Juan Pérez',
        role: UserRole.USER,
        email: 'juan.perez@raee.com'
      },
      {
        username: 'operador2',
        password: 'op123',
        fullName: 'María García',
        role: UserRole.USER,
        email: 'maria.garcia@raee.com'
      }
    ];

    for (const userData of usersData) {
      const user = await User.createUser(userData);
      this.users.push(user);
    }
    
    console.log(`✅ ${this.users.length} usuarios creados`);
  }

  /**
   * Crear entradas de residuos de prueba
   */
  async createWasteEntries() {
    console.log('📦 Creando entradas de residuos...');
    
    const operators = this.users.filter(user => user.role === UserRole.USER || user.role === UserRole.ADMIN);
    const wasteTypes = Object.values(WasteType);
    const zones = ['Zona A', 'Zona B', 'Zona C', 'Zona D'];
    const companies = [
      'Transportes Ecológicos S.A.',
      'Residuos Industriales Ltda.',
      'EcoTransporte Colombia',
      'Gestión Ambiental S.A.S.',
      'Servicios Ambientales del Norte'
    ];

    // Crear entradas para los últimos 30 días
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const entriesPerDay = Math.floor(Math.random() * 8) + 3; // 3-10 entradas por día
      
      for (let j = 0; j < entriesPerDay; j++) {
        const entryDate = new Date(today);
        entryDate.setDate(today.getDate() - i);
        entryDate.setHours(
          Math.floor(Math.random() * 10) + 8, // Entre 8 AM y 6 PM
          Math.floor(Math.random() * 60),
          Math.floor(Math.random() * 60)
        );

        const grossWeight = Math.floor(Math.random() * 15000) + 5000; // 5-20 toneladas
        const tareWeight = Math.floor(Math.random() * 3000) + 2000; // 2-5 toneladas
        
        const entryData = {
          transporterPlate: this.generatePlate(),
          transporterCompany: companies[Math.floor(Math.random() * companies.length)],
          grossWeight,
          tareWeight,
          wasteType: wasteTypes[Math.floor(Math.random() * wasteTypes.length)],
          zone: zones[Math.floor(Math.random() * zones.length)],
          operatorId: operators[Math.floor(Math.random() * operators.length)]._id,
          status: Math.random() > 0.1 ? 'completed' : 'pending', // 90% completadas
          notes: Math.random() > 0.7 ? 'Entrada procesada sin observaciones' : undefined,
          createdAt: entryDate,
          updatedAt: entryDate
        };

        if (entryData.status === 'completed') {
          entryData.processedAt = new Date(entryDate.getTime() + Math.random() * 3600000); // Procesada dentro de 1 hora
        }

        const entry = new WasteEntry(entryData);
        await entry.save();
        this.wasteEntries.push(entry);
      }
    }
    
    console.log(`✅ ${this.wasteEntries.length} entradas de residuos creadas`);
  }

  /**
   * Crear alertas de prueba
   */
  async createAlerts() {
    console.log('🚨 Creando alertas...');
    
    const adminUser = this.users.find(user => user.role === UserRole.ADMIN);
    const zones = ['Zona A', 'Zona B', 'Zona C', 'Zona D', 'General'];
    
    const alertsData = [
      {
        type: AlertType.CAPACITY,
        priority: AlertPriority.HIGH,
        title: 'Capacidad Alta en Zona A',
        message: 'La Zona A está al 85% de su capacidad máxima',
        zone: 'Zona A',
        createdBy: adminUser._id,
        metadata: { percentage: 85 }
      },
      {
        type: AlertType.ENVIRONMENTAL,
        priority: AlertPriority.CRITICAL,
        title: 'Niveles Críticos de Metano',
        message: 'Los niveles de metano han superado el umbral crítico en la Zona B',
        zone: 'Zona B',
        createdBy: adminUser._id,
        metadata: { indicator: 'Metano', value: 28, threshold: 25 }
      },
      {
        type: AlertType.INCIDENT,
        priority: AlertPriority.MEDIUM,
        title: 'Incidente Reportado',
        message: 'Se reportó una fuga menor de lixiviados en la Zona C',
        zone: 'Zona C',
        createdBy: adminUser._id
      },
      {
        type: AlertType.MAINTENANCE,
        priority: AlertPriority.LOW,
        title: 'Mantenimiento Programado',
        message: 'Mantenimiento preventivo programado para equipos de monitoreo',
        zone: 'General',
        createdBy: adminUser._id
      },
      {
        type: AlertType.SECURITY,
        priority: AlertPriority.HIGH,
        title: 'Acceso No Autorizado',
        message: 'Se detectó un intento de acceso no autorizado en la Zona D',
        zone: 'Zona D',
        createdBy: adminUser._id
      }
    ];

    for (const alertData of alertsData) {
      const alert = new Alert(alertData);
      await alert.save();
      this.alerts.push(alert);
    }
    
    console.log(`✅ ${this.alerts.length} alertas creadas`);
  }

  /**
   * Crear indicadores ambientales de prueba
   */
  async createEnvironmentalIndicators() {
    console.log('🌍 Creando indicadores ambientales...');
    
    const operatorUser = this.users.find(user => user.role === UserRole.USER);
    const zones = ['Zona A', 'Zona B', 'Zona C', 'Zona D', 'General'];
    
    const indicatorsData = [
      {
        name: 'Concentración de Metano',
        type: IndicatorType.METHANE,
        value: 18.5,
        unit: '%',
        zone: 'Zona A',
        thresholds: { warning: 15, critical: 25 },
        recordedBy: operatorUser._id
      },
      {
        name: 'pH del Lixiviado',
        type: IndicatorType.PH_LEACHATE,
        value: 6.8,
        unit: '',
        zone: 'Zona B',
        thresholds: { warning: 8.5, critical: 9.5 },
        recordedBy: operatorUser._id
      },
      {
        name: 'Temperatura Ambiente',
        type: IndicatorType.TEMPERATURE,
        value: 24.2,
        unit: '°C',
        zone: 'General',
        thresholds: { warning: 30, critical: 40 },
        recordedBy: operatorUser._id
      },
      {
        name: 'Humedad Relativa',
        type: IndicatorType.HUMIDITY,
        value: 65.3,
        unit: '%',
        zone: 'General',
        thresholds: { warning: 80, critical: 90 },
        recordedBy: operatorUser._id
      },
      {
        name: 'Calidad del Aire',
        type: IndicatorType.AIR_QUALITY,
        value: 125.7,
        unit: 'AQI',
        zone: 'Zona C',
        thresholds: { warning: 150, critical: 300 },
        recordedBy: operatorUser._id
      },
      {
        name: 'Nivel de Ruido',
        type: IndicatorType.NOISE_LEVEL,
        value: 68.4,
        unit: 'dB',
        zone: 'Zona D',
        thresholds: { warning: 70, critical: 85 },
        recordedBy: operatorUser._id
      }
    ];

    for (const indicatorData of indicatorsData) {
      const indicator = new EnvironmentalIndicator(indicatorData);
      await indicator.save();
      this.environmentalIndicators.push(indicator);
    }
    
    console.log(`✅ ${this.environmentalIndicators.length} indicadores ambientales creados`);
  }

  /**
   * Generar placa de vehículo aleatoria
   */
  generatePlate() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    
    let plate = '';
    // 3 letras
    for (let i = 0; i < 3; i++) {
      plate += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    // 3 números
    for (let i = 0; i < 3; i++) {
      plate += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return plate;
  }

  /**
   * Mostrar usuarios de prueba creados
   */
  showTestUsers() {
    console.log('\n📋 Usuarios de prueba creados:');
    console.log('================================');
    
    this.users.forEach(user => {
      console.log(`👤 ${user.fullName}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Password: ${this.getPasswordForUser(user.username)}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log('');
    });
    
    console.log('💡 Usa estos usuarios para probar el sistema');
  }

  /**
   * Obtener contraseña para mostrar (solo para desarrollo)
   */
  getPasswordForUser(username) {
    const passwords = {
      'admin': 'admin123',
      'usuario': 'user123',
      'invitado': 'guest123',
      'operador1': 'op123',
      'operador2': 'op123'
    };
    
    return passwords[username] || 'N/A';
  }
}

// Ejecutar seeding si el script se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const seeder = new DatabaseSeeder();
  seeder.run();
}

export default DatabaseSeeder; 