import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Clase para manejar la conexión a MongoDB Atlas
 */
class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  /**
   * Conectar a MongoDB Atlas
   */
  async connect() {
    try {
      if (this.isConnected) {
        console.log('Ya existe una conexión activa a MongoDB');
        return this.connection;
      }

      const mongoUri = process.env.MONGODB_URI;
      
      if (!mongoUri) {
        throw new Error('MONGODB_URI no está definida en las variables de entorno');
      }

      // Configuración de conexión
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Mantener hasta 10 conexiones socket
        serverSelectionTimeoutMS: 5000, // Mantener intentando enviar operaciones por 5 segundos
        socketTimeoutMS: 45000, // Cerrar sockets después de 45 segundos de inactividad
        family: 4 // Usar IPv4, omitir IPv6
      };

      this.connection = await mongoose.connect(mongoUri, options);
      this.isConnected = true;

      console.log(` Conectado a MongoDB Atlas: ${this.connection.connection.host}`);
      
      // Event listeners para la conexión
      mongoose.connection.on('error', (error) => {
        console.error(' Error de conexión a MongoDB:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log(' Desconectado de MongoDB');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log(' Reconectado a MongoDB');
        this.isConnected = true;
      });

      return this.connection;
    } catch (error) {
      console.error(' Error al conectar a MongoDB:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Desconectar de MongoDB
   */
  async disconnect() {
    try {
      if (this.connection && this.isConnected) {
        await mongoose.connection.close();
        this.isConnected = false;
        console.log(' Desconectado de MongoDB');
      }
    } catch (error) {
      console.error(' Error al desconectar de MongoDB:', error.message);
      throw error;
    }
  }

  /**
   * Verificar el estado de la conexión
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    };
  }

  /**
   * Obtener estadísticas de la base de datos
   */
  async getDatabaseStats() {
    try {
      if (!this.isConnected) {
        throw new Error('No hay conexión activa a la base de datos');
      }

      const admin = mongoose.connection.db.admin();
      const stats = await admin.serverStatus();
      
      return {
        version: stats.version,
        uptime: stats.uptime,
        connections: stats.connections,
        memory: stats.mem,
        network: stats.network
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de la base de datos:', error);
      throw error;
    }
  }
}

// Crear instancia singleton
const databaseConnection = new DatabaseConnection();

export default databaseConnection; 