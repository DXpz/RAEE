import mongoose from 'mongoose';

/**
 * Enum para tipos de alertas
 */
export const AlertType = {
  CAPACITY: 'capacity',
  INCIDENT: 'incident',
  ENVIRONMENTAL: 'environmental',
  MAINTENANCE: 'maintenance',
  SECURITY: 'security'
};

/**
 * Enum para prioridades de alertas
 */
export const AlertPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Schema de Alertas para MongoDB
 */
const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(AlertType),
    required: [true, 'El tipo de alerta es requerido']
  },
  priority: {
    type: String,
    enum: Object.values(AlertPriority),
    required: [true, 'La prioridad de la alerta es requerida']
  },
  title: {
    type: String,
    required: [true, 'El título de la alerta es requerido'],
    trim: true,
    maxlength: [100, 'El título no puede exceder 100 caracteres']
  },
  message: {
    type: String,
    required: [true, 'El mensaje de la alerta es requerido'],
    trim: true,
    maxlength: [500, 'El mensaje no puede exceder 500 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  zone: {
    type: String,
    enum: ['Zona A', 'Zona B', 'Zona C', 'Zona D', 'General'],
    default: 'General'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolutionNotes: {
    type: String,
    maxlength: [500, 'Las notas de resolución no pueden exceder 500 caracteres']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

/**
 * Índices para optimizar consultas
 */
alertSchema.index({ type: 1 });
alertSchema.index({ priority: 1 });
alertSchema.index({ isActive: 1 });
alertSchema.index({ isRead: 1 });
alertSchema.index({ zone: 1 });
alertSchema.index({ createdAt: -1 });

/**
 * Clase Alert que extiende el modelo de Mongoose
 */
class AlertClass {
  /**
   * Obtener alertas activas
   */
  static async getActiveAlerts() {
    return await this.find({ isActive: true })
      .populate('createdBy', 'username fullName')
      .populate('resolvedBy', 'username fullName')
      .sort({ priority: -1, createdAt: -1 });
  }

  /**
   * Obtener alertas por prioridad
   */
  static async getAlertsByPriority(priority) {
    return await this.find({ priority, isActive: true })
      .populate('createdBy', 'username fullName')
      .sort({ createdAt: -1 });
  }

  /**
   * Obtener alertas críticas
   */
  static async getCriticalAlerts() {
    return await this.find({ 
      priority: { $in: [AlertPriority.HIGH, AlertPriority.CRITICAL] },
      isActive: true 
    })
    .populate('createdBy', 'username fullName')
    .sort({ priority: -1, createdAt: -1 });
  }

  /**
   * Obtener alertas por zona
   */
  static async getAlertsByZone(zone) {
    return await this.find({ zone, isActive: true })
      .populate('createdBy', 'username fullName')
      .sort({ priority: -1, createdAt: -1 });
  }

  /**
   * Crear alerta automática de capacidad
   */
  static async createCapacityAlert(zone, percentage, createdBy) {
    let priority = AlertPriority.LOW;
    let title = 'Capacidad Normal';
    let message = `La zona ${zone} está al ${percentage}% de su capacidad`;

    if (percentage >= 90) {
      priority = AlertPriority.CRITICAL;
      title = 'Capacidad Crítica';
      message = `¡URGENTE! La zona ${zone} está al ${percentage}% de su capacidad máxima`;
    } else if (percentage >= 80) {
      priority = AlertPriority.HIGH;
      title = 'Capacidad Alta';
      message = `La zona ${zone} está al ${percentage}% de su capacidad. Se requiere atención`;
    } else if (percentage >= 70) {
      priority = AlertPriority.MEDIUM;
      title = 'Capacidad Media';
      message = `La zona ${zone} está al ${percentage}% de su capacidad`;
    }

    return await this.create({
      type: AlertType.CAPACITY,
      priority,
      title,
      message,
      zone,
      createdBy,
      metadata: { percentage }
    });
  }

  /**
   * Crear alerta ambiental
   */
  static async createEnvironmentalAlert(indicator, value, threshold, createdBy) {
    let priority = AlertPriority.MEDIUM;
    let title = 'Indicador Ambiental';
    let message = `${indicator}: ${value}`;

    if (value > threshold * 1.5) {
      priority = AlertPriority.CRITICAL;
      title = 'Alerta Ambiental Crítica';
      message = `¡CRÍTICO! ${indicator} está en ${value}, muy por encima del umbral (${threshold})`;
    } else if (value > threshold) {
      priority = AlertPriority.HIGH;
      title = 'Alerta Ambiental';
      message = `${indicator} está en ${value}, por encima del umbral normal (${threshold})`;
    }

    return await this.create({
      type: AlertType.ENVIRONMENTAL,
      priority,
      title,
      message,
      createdBy,
      metadata: { indicator, value, threshold }
    });
  }

  /**
   * Marcar como leída
   */
  async markAsRead() {
    this.isRead = true;
    return await this.save();
  }

  /**
   * Resolver alerta
   */
  async resolve(resolvedBy, resolutionNotes = '') {
    this.isActive = false;
    this.resolvedAt = new Date();
    this.resolvedBy = resolvedBy;
    this.resolutionNotes = resolutionNotes;
    return await this.save();
  }

  /**
   * Reactivar alerta
   */
  async reactivate() {
    this.isActive = true;
    this.resolvedAt = null;
    this.resolvedBy = null;
    this.resolutionNotes = '';
    return await this.save();
  }
}

// Aplicar la clase al schema
alertSchema.loadClass(AlertClass);

const Alert = mongoose.model('Alert', alertSchema);

export default Alert; 