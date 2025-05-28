import AuthService from '../services/AuthService.js';

const authService = new AuthService();

/**
 * Middleware para verificar autenticación JWT
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de acceso requerido'
      });
    }

    const user = await authService.getUserByToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Token inválido o expirado'
    });
  }
};

/**
 * Middleware para verificar permisos específicos
 */
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      const hasPermission = await authService.checkPermission(req.user.id, permission);
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para realizar esta acción'
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Error al verificar permisos'
      });
    }
  };
};

/**
 * Middleware para verificar acceso a módulos
 */
export const requireModuleAccess = (module) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      const hasAccess = await authService.checkModuleAccess(req.user.id, module);
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: `No tienes acceso al módulo ${module}`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Error al verificar acceso al módulo'
      });
    }
  };
};

/**
 * Middleware para verificar rol de administrador
 */
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Se requieren permisos de administrador'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error al verificar permisos de administrador'
    });
  }
};

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const user = await authService.getUserByToken(token);
        req.user = user;
      } catch (error) {
        // Token inválido, pero continuamos sin usuario
        req.user = null;
      }
    }

    next();
  } catch (error) {
    next();
  }
}; 