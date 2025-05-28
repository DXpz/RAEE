import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Importar configuración de base de datos
import databaseConnection from './config/database.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';

// Cargar variables de entorno
dotenv.config();

/**
 * Clase principal del servidor
 */
class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 5000;
    this.apiPath = '/api';
    
    // Inicializar servidor
    this.connectDatabase();
    this.middlewares();
    this.routes();
    this.errorHandling();
  }

  /**
   * Conectar a la base de datos
   */
  async connectDatabase() {
    try {
      await databaseConnection.connect();
    } catch (error) {
      console.error('❌ Error fatal al conectar a la base de datos:', error);
      process.exit(1);
    }
  }

  /**
   * Configurar middlewares
   */
  middlewares() {
    // Seguridad
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // límite de requests por ventana
      message: {
        success: false,
        error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use(limiter);

    // CORS
    const corsOptions = {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    };
    this.app.use(cors(corsOptions));

    // Compresión
    this.app.use(compression());

    // Logging
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Parseo de JSON
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Servir archivos estáticos (uploads)
    this.app.use('/uploads', express.static('uploads'));

    // Headers de respuesta
    this.app.use((req, res, next) => {
      res.header('X-Powered-By', 'RAEE Backend API');
      next();
    });
  }

  /**
   * Configurar rutas
   */
  routes() {
    // Ruta de salud del servidor
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'RAEE Backend API está funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: databaseConnection.getConnectionStatus()
      });
    });

    // Rutas de la API
    this.app.use(`${this.apiPath}/auth`, authRoutes);
    this.app.use(`${this.apiPath}/data`, dataRoutes);

    // Ruta para manejar rutas no encontradas
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint no encontrado',
        path: req.originalUrl,
        method: req.method
      });
    });
  }

  /**
   * Manejo de errores
   */
  errorHandling() {
    // Manejo de errores de JSON malformado
    this.app.use((error, req, res, next) => {
      if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({
          success: false,
          error: 'JSON malformado en el cuerpo de la solicitud'
        });
      }
      next(error);
    });

    // Manejo global de errores
    this.app.use((error, req, res, next) => {
      console.error('❌ Error no manejado:', error);

      // Error de validación de Mongoose
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: errors
        });
      }

      // Error de duplicado de Mongoose
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({
          success: false,
          error: `El ${field} ya existe`
        });
      }

      // Error de cast de Mongoose (ID inválido)
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          error: 'ID inválido'
        });
      }

      // Error genérico
      res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' 
          ? error.message 
          : 'Error interno del servidor'
      });
    });
  }

  /**
   * Iniciar servidor
   */
  listen() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Servidor RAEE Backend ejecutándose en puerto ${this.port}`);
      console.log(`📊 Dashboard API: http://localhost:${this.port}${this.apiPath}`);
      console.log(`🔍 Health Check: http://localhost:${this.port}/health`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  }

  /**
   * Manejo de cierre graceful
   */
  setupGracefulShutdown() {
    const gracefulShutdown = async (signal) => {
      console.log(`\n📡 Señal ${signal} recibida. Cerrando servidor...`);
      
      try {
        await databaseConnection.disconnect();
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error al cerrar servidor:', error);
        process.exit(1);
      }
    };

    // Escuchar señales de cierre
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Manejo de errores no capturados
    process.on('uncaughtException', (error) => {
      console.error('❌ Excepción no capturada:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Promesa rechazada no manejada:', reason);
      gracefulShutdown('unhandledRejection');
    });
  }
}

// Crear e iniciar servidor
const server = new Server();
server.setupGracefulShutdown();
server.listen();

export default server; 