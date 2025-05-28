import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/User.js';

/**
 * Servicio de Autenticación
 * Maneja login, logout, validación de tokens y gestión de usuarios
 */
class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'default_secret_key';
    this.jwtExpire = process.env.JWT_EXPIRE || '7d';
  }

  /**
   * Generar token JWT
   */
  generateToken(userId) {
    return jwt.sign(
      { userId },
      this.jwtSecret,
      { expiresIn: this.jwtExpire }
    );
  }

  /**
   * Verificar token JWT
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  /**
   * Login de usuario
   */
  async login(username, password) {
    try {
      // Validar formato de credenciales
      const usernameValidation = this.validateUsername(username);
      if (!usernameValidation.isValid) {
        return {
          success: false,
          error: usernameValidation.error
        };
      }

      const passwordValidation = this.validatePassword(password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: passwordValidation.error
        };
      }

      // Buscar usuario en la base de datos
      const user = await User.findByUsername(username);
      if (!user) {
        return {
          success: false,
          error: 'Usuario no encontrado'
        };
      }

      // Verificar si el usuario está activo
      if (!user.isActive) {
        return {
          success: false,
          error: 'Usuario desactivado'
        };
      }

      // Verificar contraseña
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Contraseña incorrecta'
        };
      }

      // Actualizar último login
      await user.updateLastLogin();

      // Generar token
      const token = this.generateToken(user._id);

      return {
        success: true,
        user: {
          id: user._id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          email: user.email,
          lastLogin: user.lastLogin
        },
        token
      };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        error: 'Error interno del servidor'
      };
    }
  }

  /**
   * Obtener usuario por token
   */
  async getUserByToken(token) {
    try {
      const decoded = this.verifyToken(token);
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        throw new Error('Usuario no encontrado o inactivo');
      }

      return {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        email: user.email,
        lastLogin: user.lastLogin
      };
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  /**
   * Registrar nuevo usuario (solo para admins)
   */
  async register(userData, createdBy) {
    try {
      // Verificar que el creador sea admin
      const creator = await User.findById(createdBy);
      if (!creator || creator.role !== UserRole.ADMIN) {
        return {
          success: false,
          error: 'Solo los administradores pueden crear usuarios'
        };
      }

      // Crear usuario
      const user = await User.createUser(userData, createdBy);

      return {
        success: true,
        user: {
          id: user._id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          email: user.email
        }
      };
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        error: error.message || 'Error al crear usuario'
      };
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          error: 'Usuario no encontrado'
        };
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          error: 'Contraseña actual incorrecta'
        };
      }

      // Validar nueva contraseña
      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: passwordValidation.error
        };
      }

      // Actualizar contraseña
      user.password = newPassword;
      await user.save();

      return {
        success: true,
        message: 'Contraseña actualizada correctamente'
      };
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return {
        success: false,
        error: 'Error interno del servidor'
      };
    }
  }

  /**
   * Obtener todos los usuarios (solo para admins)
   */
  async getAllUsers(requesterId) {
    try {
      const requester = await User.findById(requesterId);
      if (!requester || requester.role !== UserRole.ADMIN) {
        throw new Error('Solo los administradores pueden ver todos los usuarios');
      }

      const users = await User.find({ isActive: true })
        .select('-password')
        .sort({ createdAt: -1 });

      return users;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener usuarios');
    }
  }

  /**
   * Desactivar usuario (solo para admins)
   */
  async deactivateUser(userId, requesterId) {
    try {
      const requester = await User.findById(requesterId);
      if (!requester || requester.role !== UserRole.ADMIN) {
        return {
          success: false,
          error: 'Solo los administradores pueden desactivar usuarios'
        };
      }

      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          error: 'Usuario no encontrado'
        };
      }

      // No permitir que se desactive a sí mismo
      if (userId === requesterId) {
        return {
          success: false,
          error: 'No puedes desactivar tu propia cuenta'
        };
      }

      await user.deactivate();

      return {
        success: true,
        message: 'Usuario desactivado correctamente'
      };
    } catch (error) {
      console.error('Error al desactivar usuario:', error);
      return {
        success: false,
        error: 'Error interno del servidor'
      };
    }
  }

  /**
   * Validación de formato de username
   */
  validateUsername(username) {
    if (!username || username.trim().length === 0) {
      return { isValid: false, error: 'El nombre de usuario es requerido' };
    }
    
    // Limpiar espacios para validación
    const cleanUsername = username.trim();
    
    if (cleanUsername.length < 3) {
      return { isValid: false, error: 'El nombre de usuario debe tener al menos 3 caracteres' };
    }
    if (cleanUsername.length > 20) {
      return { isValid: false, error: 'El nombre de usuario no puede exceder 20 caracteres' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      return { isValid: false, error: 'El nombre de usuario solo puede contener letras, números y guiones bajos' };
    }
    return { isValid: true };
  }

  /**
   * Validación de formato de password
   */
  validatePassword(password) {
    if (!password || password.trim().length === 0) {
      return { isValid: false, error: 'La contraseña es requerida' };
    }
    
    // Limpiar espacios para validación
    const cleanPassword = password.trim();
    
    if (cleanPassword.length < 4) {
      return { isValid: false, error: 'La contraseña debe tener al menos 4 caracteres' };
    }
    return { isValid: true };
  }

  /**
   * Verificar permisos de usuario
   */
  async checkPermission(userId, permission) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.isActive) {
        return false;
      }

      return user.hasPermission(permission);
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      return false;
    }
  }

  /**
   * Verificar acceso a módulo
   */
  async checkModuleAccess(userId, module) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.isActive) {
        return false;
      }

      return user.canAccessModule(module);
    } catch (error) {
      console.error('Error al verificar acceso a módulo:', error);
      return false;
    }
  }

  /**
   * Obtener usuarios disponibles para desarrollo/testing
   */
  getAvailableTestUsers() {
    return [
      {
        username: 'invitado',
        role: UserRole.GUEST,
        fullName: 'Usuario Invitado',
        permissions: User.getPermissionsByRole(UserRole.GUEST)
      },
      {
        username: 'usuario',
        role: UserRole.USER,
        fullName: 'Usuario Común',
        permissions: User.getPermissionsByRole(UserRole.USER)
      },
      {
        username: 'admin',
        role: UserRole.ADMIN,
        fullName: 'Administrador',
        permissions: User.getPermissionsByRole(UserRole.ADMIN)
      }
    ];
  }
}

export default AuthService; 