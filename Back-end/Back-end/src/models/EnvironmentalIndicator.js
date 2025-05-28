import mongoose from 'mongoose';

/**
 * Enum para tipos de indicadores ambientales
 */
export const IndicatorType = {
  METHANE: 'methane',
  PH_LEACHATE: 'ph_leachate',
  TEMPERATURE: 'temperature',
  HUMIDITY: 'humidity',
  AIR_QUALITY: 'air_quality',
  NOISE_LEVEL: 'noise_level'
};

/**
 * Enum para estados de indicadores
 */
export const IndicatorStatus = {
  NORMAL: 'normal',
  WARNING: 'warning',
  CRITICAL: 'critical'
};

/**
 * Schema de Indicadores Ambientales para MongoDB
 */
const environmentalIndicatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del indicador es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  type: {
    type: String,
    enum: Object.values(IndicatorType),
    required: [true, 'El tipo de indicador es requerido']
  },
  value: {
    type: Number,
    required: [true, 'El valor del indicador es requerido'],
    min: [0, 'El valor debe ser mayor o igual a 0']
  },
  unit: {
    type: String,
    required: [true, 'La unidad de medida es requerida'],
    trim: true,
    maxlength: [20, 'La unidad no puede exceder 20 caracteres']
  },
  status: {
    type: String,
    enum: Object.values(IndicatorStatus),
    default: IndicatorStatus.NORMAL
  },
  zone: {
    type: String,
    enum: ['Zona A', 'Zona B', 'Zona C', 'Zona D', 'General'],
    default: 'General'
  },
  thresholds: {
    warning: {
      type: Number,
      required: true
    },
    critical: {
      type: Number,
      required: true
    }
  },
  sensorId: {
    type: String,
    trim: true
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    maxlength: [500, 'Las notas no pueden exceder 500 caracteres']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

/**
 * Middleware para calcular el status basado en los thresholds
 */
environmentalIndicatorSchema.pre('save', function(next) {
  if (this.value >= this.thresholds.critical) {
    this.status = IndicatorStatus.CRITICAL;
  } else if (this.value >= this.thresholds.warning) {
    this.status = IndicatorStatus.WARNING;
  } else {
    this.status = IndicatorStatus.NORMAL;
  }
  next();
});

/**
 * Índices para optimizar consultas
 */
environmentalIndicatorSchema.index({ type: 1 });
environmentalIndicatorSchema.index({ status: 1 });
environmentalIndicatorSchema.index({ zone: 1 });
environmentalIndicatorSchema.index({ createdAt: -1 });
environmentalIndicatorSchema.index({ isActive: 1 });

/**
 * Clase EnvironmentalIndicator que extiende el modelo de Mongoose
 */
class EnvironmentalIndicatorClass {
  /**
   * Obtener indicadores activos
   */
  static async getActiveIndicators() {
    return await this.find({ isActive: true })
      .populate('recordedBy', 'username fullName')
      .sort({ createdAt: -1 });
  }

  /**
   * Obtener últimos indicadores por tipo
   */
  static async getLatestByType(type, limit = 10) {
    return await this.find({ type, isActive: true })
      .populate('recordedBy', 'username fullName')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Obtener indicadores por zona
   */
  static async getByZone(zone) {
    return await this.find({ zone, isActive: true })
      .populate('recordedBy', 'username fullName')
      .sort({ createdAt: -1 });
  }

  /**
   * Obtener indicadores críticos
   */
  static async getCriticalIndicators() {
    return await this.find({ 
      status: IndicatorStatus.CRITICAL,
      isActive: true 
    })
    .populate('recordedBy', 'username fullName')
    .sort({ createdAt: -1 });
  }

  /**
   * Obtener resumen de indicadores actuales
   */
  static async getCurrentSummary() {
    const indicators = await this.aggregate([
      { $match: { isActive: true } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$type',
          latest: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$latest' }
      }
    ]);

    return indicators.map(indicator => ({
      name: this.getIndicatorDisplayName(indicator.type),
      value: indicator.value,
      unit: indicator.unit,
      status: indicator.status,
      zone: indicator.zone,
      timestamp: indicator.createdAt
    }));
  }

  /**
   * Obtener estadísticas por rango de fechas
   */
  static async getStatsByDateRange(type, startDate, endDate) {
    const stats = await this.aggregate([
      {
        $match: {
          type,
          createdAt: {
            $gte: startDate,
            $lte: endDate
          },
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$value' },
          minimum: { $min: '$value' },
          maximum: { $max: '$value' },
          count: { $sum: 1 }
        }
      }
    ]);

    return stats[0] || {
      average: 0,
      minimum: 0,
      maximum: 0,
      count: 0
    };
  }

  /**
   * Crear registro de indicador con validación
   */
  static async createReading(indicatorData, recordedBy = null) {
    const indicator = new this({
      ...indicatorData,
      recordedBy
    });

    return await indicator.save();
  }

  /**
   * Obtener nombre de display para el tipo de indicador
   */
  static getIndicatorDisplayName(type) {
    const displayNames = {
      [IndicatorType.METHANE]: 'Metano',
      [IndicatorType.PH_LEACHATE]: 'pH Lixiviado',
      [IndicatorType.TEMPERATURE]: 'Temperatura',
      [IndicatorType.HUMIDITY]: 'Humedad',
      [IndicatorType.AIR_QUALITY]: 'Calidad del Aire',
      [IndicatorType.NOISE_LEVEL]: 'Nivel de Ruido'
    };

    return displayNames[type] || type;
  }

  /**
   * Obtener configuración de thresholds por defecto
   */
  static getDefaultThresholds(type) {
    const defaultThresholds = {
      [IndicatorType.METHANE]: { warning: 15, critical: 25 },
      [IndicatorType.PH_LEACHATE]: { warning: 8.5, critical: 9.5 },
      [IndicatorType.TEMPERATURE]: { warning: 30, critical: 40 },
      [IndicatorType.HUMIDITY]: { warning: 80, critical: 90 },
      [IndicatorType.AIR_QUALITY]: { warning: 150, critical: 300 },
      [IndicatorType.NOISE_LEVEL]: { warning: 70, critical: 85 }
    };

    return defaultThresholds[type] || { warning: 50, critical: 100 };
  }

  /**
   * Verificar si necesita generar alerta
   */
  needsAlert() {
    return this.status === IndicatorStatus.WARNING || this.status === IndicatorStatus.CRITICAL;
  }

  /**
   * Desactivar indicador
   */
  async deactivate() {
    this.isActive = false;
    return await this.save();
  }
}

// Aplicar la clase al schema
environmentalIndicatorSchema.loadClass(EnvironmentalIndicatorClass);

const EnvironmentalIndicator = mongoose.model('EnvironmentalIndicator', environmentalIndicatorSchema);

export default EnvironmentalIndicator; 