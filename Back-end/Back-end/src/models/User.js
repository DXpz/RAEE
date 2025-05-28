import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Enum para roles de usuario
 */
export const UserRole = {
  GUEST: 'guest',
  USER: 'user',
  ADMIN: 'admin'
};

/**
 * Schema de Usuario para MongoDB
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'El nombre de usuario es requerido'],
    unique: true,
    trim: true,
    minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres'],
    maxlength: [20, 'El nombre de usuario no puede exceder 20 caracteres'],
    match: [/^[a-zA-Z0-9_]+$/, 'El nombre de usuario solo puede contener letras, números y guiones bajos']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [4, 'La contraseña debe tener al menos 4 caracteres']
  },
  fullName: {
    type: String,
    required: [true, 'El nombre completo es requerido'],
    trim: true,
    maxlength: [100, 'El nombre completo no puede exceder 100 caracteres']
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
    required: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

/**
 * Middleware para hashear la contraseña antes de guardar
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Método para comparar contraseñas
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Limpiar espacios en blanco de la contraseña candidata
  const cleanPassword = candidatePassword ? candidatePassword.trim() : '';
  return await bcrypt.compare(cleanPassword, this.password);
};

/**
 * Método para verificar permisos
 */
userSchema.methods.hasPermission = function(permission) {
  const permissions = {
    [UserRole.GUEST]: ['view_dashboard'],
    [UserRole.USER]: ['view_dashboard', 'create_entry', 'view_reports', 'manage_entries'],
    [UserRole.ADMIN]: ['view_dashboard', 'create_entry', 'view_reports', 'manage_users', 'system_config', 'manage_entries']
  };

  return permissions[this.role]?.includes(permission) || false;
};

/**
 * Método para verificar acceso a módulos
 */
userSchema.methods.canAccessModule = function(module) {
  const modulePermissions = {
    dashboard: 'view_dashboard',
    processing: 'create_entry',
    reports: 'view_reports',
    users: 'manage_users',
    settings: 'system_config'
  };

  return this.hasPermission(modulePermissions[module] || '');
};

/**
 * Método estático para obtener permisos por rol
 */
userSchema.statics.getPermissionsByRole = function(role) {
  const permissions = {
    [UserRole.GUEST]: ['view_dashboard'],
    [UserRole.USER]: ['view_dashboard', 'create_entry', 'view_reports', 'manage_entries'],
    [UserRole.ADMIN]: ['view_dashboard', 'create_entry', 'view_reports', 'manage_users', 'system_config', 'manage_entries']
  };

  return permissions[role] || [];
};

/**
 * Método estático para validar datos de usuario
 */
userSchema.statics.validateUserData = function(userData) {
  const errors = [];

  if (!userData.username || userData.username.trim().length === 0) {
    errors.push('El nombre de usuario es requerido');
  } else if (userData.username.length < 3) {
    errors.push('El nombre de usuario debe tener al menos 3 caracteres');
  } else if (userData.username.length > 20) {
    errors.push('El nombre de usuario no puede exceder 20 caracteres');
  } else if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
    errors.push('El nombre de usuario solo puede contener letras, números y guiones bajos');
  }

  if (!userData.password || userData.password.trim().length === 0) {
    errors.push('La contraseña es requerida');
  } else if (userData.password.length < 4) {
    errors.push('La contraseña debe tener al menos 4 caracteres');
  }

  if (!userData.fullName || userData.fullName.trim().length === 0) {
    errors.push('El nombre completo es requerido');
  }

  if (userData.role && !Object.values(UserRole).includes(userData.role)) {
    errors.push('Rol de usuario inválido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Índices para optimizar consultas
 */
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

/**
 * Clase User que extiende el modelo de Mongoose
 */
class UserClass {
  /**
   * Obtener usuario por username
   */
  static async findByUsername(username) {
    return await this.findOne({ 
      username: username.toLowerCase(),
      isActive: true 
    });
  }

  /**
   * Obtener usuarios por rol
   */
  static async findByRole(role) {
    return await this.find({ 
      role,
      isActive: true 
    }).sort({ createdAt: -1 });
  }

  /**
   * Crear usuario con validación
   */
  static async createUser(userData, createdBy = null) {
    const validation = this.validateUserData(userData);
    
    if (!validation.isValid) {
      const error = new Error('Datos de usuario inválidos');
      error.details = validation.errors;
      throw error;
    }

    // Verificar si el username ya existe
    const existingUser = await this.findOne({ 
      username: userData.username.toLowerCase() 
    });
    
    if (existingUser) {
      throw new Error('El nombre de usuario ya existe');
    }

    const user = new this({
      ...userData,
      username: userData.username.toLowerCase(),
      createdBy
    });

    return await user.save();
  }

  /**
   * Actualizar último login
   */
  async updateLastLogin() {
    this.lastLogin = new Date();
    return await this.save();
  }

  /**
   * Desactivar usuario
   */
  async deactivate() {
    this.isActive = false;
    return await this.save();
  }

  /**
   * Activar usuario
   */
  async activate() {
    this.isActive = true;
    return await this.save();
  }
}

// Aplicar la clase al schema
userSchema.loadClass(UserClass);

const User = mongoose.model('User', userSchema);

export default User; 