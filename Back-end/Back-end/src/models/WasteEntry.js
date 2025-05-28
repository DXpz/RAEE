import mongoose from 'mongoose';

/**
 * Enum para tipos de residuos
 */
export const WasteType = {
  DANGEROUS: 'Peligroso',
  RECYCLABLE: 'Reciclable',
  ORGANIC: 'Orgánico',
  GENERAL: 'General'
};

/**
 * Schema de Entrada de Residuos para MongoDB
 */
const wasteEntrySchema = new mongoose.Schema({
  transporterPlate: {
    type: String,
    required: [true, 'La placa del transportista es requerida'],
    trim: true,
    uppercase: true,
    maxlength: [10, 'La placa no puede exceder 10 caracteres']
  },
  transporterCompany: {
    type: String,
    required: [true, 'La empresa transportista es requerida'],
    trim: true,
    maxlength: [100, 'El nombre de la empresa no puede exceder 100 caracteres']
  },
  grossWeight: {
    type: Number,
    required: [true, 'El peso bruto es requerido'],
    min: [0, 'El peso bruto debe ser mayor a 0'],
    max: [100, 'El peso bruto no puede exceder 100 toneladas']
  },
  tareWeight: {
    type: Number,
    required: [true, 'El peso tara es requerido'],
    min: [0, 'El peso tara debe ser mayor a 0'],
    max: [50, 'El peso tara no puede exceder 50 toneladas']
  },
  wasteType: {
    type: String,
    enum: Object.values(WasteType),
    required: [true, 'El tipo de residuo es requerido']
  },
  receiptPhoto: {
    type: String,
    trim: true
  },
  zone: {
    type: String,
    enum: ['Zona A', 'Zona B', 'Zona C', 'Zona D'],
    required: [true, 'La zona de disposición es requerida']
  },
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El operador es requerido']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: [500, 'Las notas no pueden exceder 500 caracteres']
  },
  processedAt: {
    type: Date
  },
  rejectedReason: {
    type: String,
    maxlength: [200, 'La razón de rechazo no puede exceder 200 caracteres']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Virtual para calcular peso neto
 */
wasteEntrySchema.virtual('netWeight').get(function() {
  return this.grossWeight - this.tareWeight;
});

/**
 * Virtual para formato de peso
 */
wasteEntrySchema.virtual('formattedWeight').get(function() {
  return `${parseFloat(this.grossWeight.toFixed(3))} / ${parseFloat(this.tareWeight.toFixed(3))} t`;
});

/**
 * Virtual para obtener información del operador
 */
wasteEntrySchema.virtual('operator', {
  ref: 'User',
  localField: 'operatorId',
  foreignField: '_id',
  justOne: true
});

/**
 * Middleware para validar que el peso tara no sea mayor al peso bruto
 */
wasteEntrySchema.pre('save', function(next) {
  if (this.tareWeight >= this.grossWeight) {
    const error = new Error('El peso tara no puede ser mayor o igual al peso bruto');
    return next(error);
  }
  
  // Actualizar processedAt cuando el status cambia a completed
  if (this.isModified('status') && this.status === 'completed' && !this.processedAt) {
    this.processedAt = new Date();
  }
  
  next();
});

/**
 * Método estático para validar datos de entrada
 */
wasteEntrySchema.statics.validateEntryData = function(entryData) {
  const errors = [];

  if (!entryData.transporterPlate || entryData.transporterPlate.trim().length === 0) {
    errors.push('La placa del transportista es requerida');
  }

  if (!entryData.transporterCompany || entryData.transporterCompany.trim().length === 0) {
    errors.push('La empresa transportista es requerida');
  }

  if (!entryData.grossWeight || entryData.grossWeight <= 0) {
    errors.push('El peso bruto debe ser mayor a 0');
  }

  if (!entryData.tareWeight || entryData.tareWeight <= 0) {
    errors.push('El peso tara debe ser mayor a 0');
  }

  if (entryData.grossWeight && entryData.tareWeight && entryData.tareWeight >= entryData.grossWeight) {
    errors.push('El peso tara no puede ser mayor o igual al peso bruto');
  }

  if (!entryData.wasteType || !Object.values(WasteType).includes(entryData.wasteType)) {
    errors.push('Tipo de residuo inválido');
  }

  if (!entryData.zone || !['Zona A', 'Zona B', 'Zona C', 'Zona D'].includes(entryData.zone)) {
    errors.push('Zona de disposición inválida');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Índices para optimizar consultas
 */
wasteEntrySchema.index({ transporterPlate: 1 });
wasteEntrySchema.index({ wasteType: 1 });
wasteEntrySchema.index({ zone: 1 });
wasteEntrySchema.index({ status: 1 });
wasteEntrySchema.index({ operatorId: 1 });
wasteEntrySchema.index({ createdAt: -1 });
wasteEntrySchema.index({ processedAt: -1 });

/**
 * Clase WasteEntry que extiende el modelo de Mongoose
 */
class WasteEntryClass {
  /**
   * Obtener entradas por tipo de residuo
   */
  static async findByWasteType(wasteType) {
    return await this.find({ wasteType })
      .populate('operatorId', 'username fullName')
      .sort({ createdAt: -1 });
  }

  /**
   * Obtener entradas por zona
   */
  static async findByZone(zone) {
    return await this.find({ zone })
      .populate('operatorId', 'username fullName')
      .sort({ createdAt: -1 });
  }

  /**
   * Obtener entradas por operador
   */
  static async findByOperator(operatorId) {
    return await this.find({ operatorId })
      .populate('operatorId', 'username fullName')
      .sort({ createdAt: -1 });
  }

  /**
   * Obtener entradas por rango de fechas
   */
  static async findByDateRange(startDate, endDate) {
    return await this.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .populate('operatorId', 'username fullName')
    .sort({ createdAt: -1 });
  }

  /**
   * Obtener estadísticas de hoy
   */
  static async getTodayStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayEntries = await this.find({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });

    const totalEntries = todayEntries.length;
    const totalTonnage = todayEntries.reduce((sum, entry) => sum + entry.netWeight, 0); // Ya en toneladas
    const averageWeight = totalEntries > 0 ? totalTonnage / totalEntries : 0;

    // Calcular hora pico (hora con más entradas)
    const hourCounts = {};
    todayEntries.forEach(entry => {
      const hour = entry.createdAt.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHour = Object.keys(hourCounts).reduce((a, b) => 
      hourCounts[a] > hourCounts[b] ? a : b, '0'
    );

    return {
      totalEntries,
      totalTonnage: Math.round(totalTonnage * 10) / 10,
      averageWeight: Math.round(averageWeight * 10) / 10,
      peakHour: `${peakHour.padStart(2, '0')}:00`
    };
  }

  /**
   * Obtener distribución por tipo de residuo
   */
  static async getWasteTypeDistribution(startDate = null, endDate = null) {
    const matchStage = {};
    
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const distribution = await this.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$wasteType',
          count: { $sum: 1 },
          totalWeight: { $sum: '$netWeight' }
        }
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          tonnage: '$totalWeight',
          _id: 0
        }
      }
    ]);

    const totalTonnage = distribution.reduce((sum, item) => sum + item.tonnage, 0);

    return distribution.map(item => ({
      ...item,
      percentage: totalTonnage > 0 ? Math.round((item.tonnage / totalTonnage) * 100) : 0,
      tonnage: Math.round(item.tonnage * 10) / 10
    }));
  }

  /**
   * Obtener capacidad por zona
   */
  static async getCapacityByZone() {
    const zoneCapacities = {
      'Zona A': 500,
      'Zona B': 500,
      'Zona C': 500,
      'Zona D': 500
    };

    const zoneUsage = await this.aggregate([
      {
        $match: {
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$zone',
          totalWeight: { $sum: '$netWeight' }
        }
      }
    ]);

    return Object.keys(zoneCapacities).map(zone => {
      const usage = zoneUsage.find(u => u._id === zone);
      const current = usage ? Math.round(usage.totalWeight * 10) / 10 : 0; // Ya en toneladas
      const maximum = zoneCapacities[zone];
      const percentage = Math.round((current / maximum) * 100);

      return {
        zone,
        current,
        maximum,
        percentage
      };
    });
  }

  /**
   * Crear entrada con validación
   */
  static async createEntry(entryData, operatorId) {
    const validation = this.validateEntryData(entryData);
    
    if (!validation.isValid) {
      const error = new Error('Datos de entrada inválidos');
      error.details = validation.errors;
      throw error;
    }

    const entry = new this({
      ...entryData,
      operatorId,
      transporterPlate: entryData.transporterPlate.toUpperCase()
    });

    return await entry.save();
  }

  /**
   * Procesar entrada (cambiar status a completed)
   */
  async process() {
    this.status = 'completed';
    this.processedAt = new Date();
    return await this.save();
  }

  /**
   * Rechazar entrada
   */
  async reject(reason) {
    this.status = 'rejected';
    this.rejectedReason = reason;
    return await this.save();
  }

  /**
   * Obtener información completa con operador
   */
  async getFullInfo() {
    await this.populate('operatorId', 'username fullName');
    return this;
  }
}

// Aplicar la clase al schema
wasteEntrySchema.loadClass(WasteEntryClass);

const WasteEntry = mongoose.model('WasteEntry', wasteEntrySchema);

export default WasteEntry; 