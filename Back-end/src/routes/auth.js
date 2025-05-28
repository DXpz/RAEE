import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const authController = new AuthController();

/**
 * Middleware para logging de requests de auth
 */
router.use((req, res, next) => {
  console.log(`🔐 Auth Request: ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
});

/**
 * @route GET /api/auth/health
 * @desc Health check para el servicio de autenticación
 * @access Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Authentication Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * @route POST /api/auth/login
 * @desc Login de usuario - Mejorado para frontend
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route POST /api/auth/logout
 * @desc Logout de usuario
 * @access Private
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @route GET /api/auth/me
 * @desc Obtener información del usuario actual
 * @access Private
 */
router.get('/me', authenticateToken, authController.getMe);

/**
 * @route GET /api/auth/verify
 * @desc Verificar token de autenticación
 * @access Private
 */
router.get('/verify', authenticateToken, authController.verifyToken);

/**
 * @route POST /api/auth/register
 * @desc Registrar nuevo usuario (solo admins)
 * @access Private (Admin only)
 */
router.post('/register', authenticateToken, requireAdmin, authController.register);

/**
 * @route PUT /api/auth/change-password
 * @desc Cambiar contraseña del usuario actual
 * @access Private
 */
router.put('/change-password', authenticateToken, authController.changePassword);

/**
 * @route GET /api/auth/users
 * @desc Obtener todos los usuarios (solo admins)
 * @access Private (Admin only)
 */
router.get('/users', authenticateToken, requireAdmin, authController.getAllUsers);

/**
 * @route PUT /api/auth/users/:userId/deactivate
 * @desc Desactivar usuario (solo admins)
 * @access Private (Admin only)
 */
router.put('/users/:userId/deactivate', authenticateToken, requireAdmin, authController.deactivateUser);

/**
 * @route GET /api/auth/test-users
 * @desc Obtener usuarios de prueba disponibles
 * @access Public
 */
router.get('/test-users', authController.getTestUsers);

/**
 * @route POST /api/auth/test-login
 * @desc Endpoint de prueba para validar login desde frontend
 * @access Public
 */
router.post('/test-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log(`🧪 Test Login Request para: ${username}`);
    
    // Log detallado para debugging
    console.log('Request body:', { username: username || 'undefined', password: password ? '***' : 'undefined' });
    console.log('Request headers:', req.headers);
    
    // Usar el controlador estándar
    await authController.login(req, res);
    
  } catch (error) {
    console.error('💥 Error en test-login:', error);
    res.status(500).json({
      success: false,
      error: 'Error en endpoint de prueba',
      details: error.message
    });
  }
});

export default router; 