import AuthService from '../services/AuthService.js';

/**
 * Controlador de Autenticación
 * Maneja todas las operaciones relacionadas con autenticación y usuarios
 */
class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Login de usuario - Mejorado para frontend
   */
  login = async (req, res) => {
    try {
      const { username, password } = req.body;

      // Validación detallada de entrada
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: 'Username y password son requeridos',
          details: {
            username: !username ? 'Username es requerido' : null,
            password: !password ? 'Password es requerido' : null
          }
        });
      }

      // Validación de formato
      if (typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Formato de credenciales inválido'
        });
      }

      // Limpiar espacios en blanco
      const cleanUsername = username.trim();
      const cleanPassword = password.trim();

      if (cleanUsername.length === 0 || cleanPassword.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Las credenciales no pueden estar vacías'
        });
      }

      console.log(`🔍 Intento de login para usuario: ${cleanUsername}`);

      // Intentar login
      const result = await this.authService.login(cleanUsername, cleanPassword);

      if (!result.success) {
        console.log(` Login fallido para ${cleanUsername}: ${result.error}`);
        return res.status(401).json({
          success: false,
          error: result.error,
          timestamp: new Date().toISOString()
        });
      }

      console.log(` Login exitoso para ${cleanUsername} (${result.user.role})`);

      // Respuesta exitosa con información detallada
      return res.status(200).json({
        success: true,
        message: 'Login exitoso',
        user: {
          id: result.user.id,
          username: result.user.username,
          fullName: result.user.fullName,
          role: result.user.role,
          email: result.user.email,
          lastLogin: result.user.lastLogin,
          permissions: this.getUserPermissions(result.user.role)
        },
        token: result.token,
        expiresIn: process.env.JWT_EXPIRE || '7d',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(' Error crítico en login:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        timestamp: new Date().toISOString()
      });
    }
  };

  /**
   * Obtener información del usuario actual 
   */
  getMe = async (req, res) => {
    try {
      const user = req.user;
      
      // Verificar que el usuario existe
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      // Respuesta detallada del usuario actual
      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          email: user.email,
          lastLogin: user.lastLogin,
          permissions: this.getUserPermissions(user.role),
          modules: this.getUserModules(user.role)
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Verificar token 
   */
  verifyToken = async (req, res) => {
    try {
      const user = req.user;
      
      return res.status(200).json({
        success: true,
        valid: true,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          permissions: this.getUserPermissions(user.role)
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error al verificar token:', error);
      return res.status(401).json({
        success: false,
        valid: false,
        error: 'Token inválido'
      });
    }
  };

  /**
   * Registrar nuevo usuario (solo admins)
   */
  register = async (req, res) => {
    try {
      const { username, password, fullName, role, email } = req.body;

      if (!username || !password || !fullName) {
        return res.status(400).json({
          success: false,
          error: 'Username, password y fullName son requeridos'
        });
      }

      const userData = {
        username,
        password,
        fullName,
        role: role || 'user',
        email
      };

      const result = await this.authService.register(userData, req.user.id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        user: result.user
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Cambiar contraseña
   */
  changePassword = async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Contraseña actual y nueva contraseña son requeridas'
        });
      }

      const result = await this.authService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener todos los usuarios (solo admins)
   */
  getAllUsers = async (req, res) => {
    try {
      const users = await this.authService.getAllUsers(req.user.id);

      res.json({
        success: true,
        users: users.map(user => ({
          ...user.toJSON(),
          permissions: this.getUserPermissions(user.role)
        }))
      });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  };

  /**
   * Desactivar usuario (solo admins)
   */
  deactivateUser = async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'ID de usuario requerido'
        });
      }

      const result = await this.authService.deactivateUser(userId, req.user.id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Error al desactivar usuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Logout (invalidar token del lado del cliente)
   */
  logout = async (req, res) => {
    try {
      console.log(` Usuario ${req.user.username} ha cerrado sesión`);
      
      res.json({
        success: true,
        message: 'Logout exitoso',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener usuarios de prueba disponibles
   */
  getTestUsers = async (req, res) => {
    try {
      const testUsers = this.authService.getAvailableTestUsers();

      res.json({
        success: true,
        testUsers,
        message: 'Usuarios de prueba disponibles'
      });
    } catch (error) {
      console.error('Error al obtener usuarios de prueba:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };

  /**
   * Obtener permisos por rol
   */
  getUserPermissions(role) {
    const permissions = {
      guest: ['view_dashboard'],
      user: ['view_dashboard', 'create_entry', 'view_reports'],
      admin: ['view_dashboard', 'create_entry', 'view_reports', 'manage_users', 'system_config']
    };

    return permissions[role] || [];
  }

  /**
   * Obtener módulos accesibles por rol
   */
  getUserModules(role) {
    const modules = {
      guest: ['dashboard'],
      user: ['dashboard', 'processing', 'reports'],
      admin: ['dashboard', 'processing', 'reports', 'users', 'settings']
    };

    return modules[role] || [];
  }
}

export default AuthController; 