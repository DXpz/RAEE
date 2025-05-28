import WasteEntry, { WasteType } from '../models/WasteEntry.js';
import Alert, { AlertType, AlertPriority } from '../models/Alert.js';
import EnvironmentalIndicator, { IndicatorType } from '../models/EnvironmentalIndicator.js';
import User from '../models/User.js';

/**
 * Servicio de Datos
 * Maneja toda la lógica de negocio relacionada con datos del dashboard y estadísticas
 */
class DataService {
  constructor() {
    this.maxCapacity = 2000; // Capacidad máxima total en toneladas
  }

  /**
   * Obtener datos completos del dashboard
   */
  async getDashboardData() {
    try {
      const [
        weeklyWaste,
        monthlyData,
        wasteDistribution,
        capacityData,
        environmentalIndicators,
        activeAlerts,
        todayStats,
        latestEntry
      ] = await Promise.all([
        this.getWeeklyWasteReceived(),
        this.getMonthlyData(),
        this.getWasteTypeDistribution(),
        this.getCapacityByZone(),
        this.getCurrentEnvironmentalIndicators(),
        this.getActiveAlerts(),
        this.getTodayStats(),
        this.getLatestWasteEntry()
      ]);

      return {
        weeklyWaste,
        monthlyData,
        wasteDistribution,
        capacity: capacityData,
        environmentalIndicators,
        alerts: activeAlerts,
        todayStats,
        latestEntry,
        totalProcessed: await this.getTotalProcessedTonnes(),
        maxCapacity: this.maxCapacity
      };
    } catch (error) {
      console.error('Error al obtener datos del dashboard:', error);
      throw new Error('Error al cargar datos del dashboard');
    }
  }

  /**
   * Obtener residuos recibidos semanalmente
   */
  async getWeeklyWasteReceived() {
    try {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);

      const dailyData = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);

        const entries = await WasteEntry.find({
          createdAt: {
            $gte: date,
            $lt: nextDay
          },
          status: 'completed'
        });

        const totalTonnage = entries.reduce((sum, entry) => sum + entry.netWeight, 0) / 1000;

        dailyData.push({
          day: date.toLocaleDateString('es-ES', { weekday: 'short' }),
          date: date.toISOString().split('T')[0],
          tonnage: Math.round(totalTonnage * 10) / 10,
          entries: entries.length
        });
      }

      return dailyData;
    } catch (error) {
      console.error('Error al obtener datos semanales:', error);
      throw error;
    }
  }

  /**
   * Obtener datos mensuales
   */
  async getMonthlyData() {
    try {
      const today = new Date();
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);

      const entries = await WasteEntry.find({
        createdAt: {
          $gte: monthAgo,
          $lte: today
        },
        status: 'completed'
      });

      const totalTonnage = entries.reduce((sum, entry) => sum + entry.netWeight, 0) / 1000;
      const averageDaily = totalTonnage / 30;

      return {
        totalTonnage: Math.round(totalTonnage * 10) / 10,
        totalEntries: entries.length,
        averageDaily: Math.round(averageDaily * 10) / 10,
        period: '30 días'
      };
    } catch (error) {
      console.error('Error al obtener datos mensuales:', error);
      throw error;
    }
  }

  /**
   * Obtener distribución por tipo de residuo
   */
  async getWasteTypeDistribution() {
    try {
      return await WasteEntry.getWasteTypeDistribution();
    } catch (error) {
      console.error('Error al obtener distribución de residuos:', error);
      throw error;
    }
  }

  /**
   * Obtener capacidad por zona
   */
  async getCapacityByZone() {
    try {
      return await WasteEntry.getCapacityByZone();
    } catch (error) {
      console.error('Error al obtener capacidad por zona:', error);
      throw error;
    }
  }

  /**
   * Obtener indicadores ambientales actuales
   */
  async getCurrentEnvironmentalIndicators() {
    try {
      return await EnvironmentalIndicator.getCurrentSummary();
    } catch (error) {
      console.error('Error al obtener indicadores ambientales:', error);
      throw error;
    }
  }

  /**
   * Obtener alertas activas
   */
  async getActiveAlerts() {
    try {
      const alerts = await Alert.getActiveAlerts();
      return alerts.slice(0, 5); // Últimas 5 alertas
    } catch (error) {
      console.error('Error al obtener alertas:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de hoy
   */
  async getTodayStats() {
    try {
      return await WasteEntry.getTodayStats();
    } catch (error) {
      console.error('Error al obtener estadísticas de hoy:', error);
      throw error;
    }
  }

  /**
   * Obtener última entrada de residuos
   */
  async getLatestWasteEntry() {
    try {
      const entry = await WasteEntry.findOne()
        .populate('operatorId', 'username fullName')
        .sort({ createdAt: -1 });

      if (!entry) return null;

      return {
        _id: entry._id,
        id: entry._id,
        transporterPlate: entry.transporterPlate,
        transporterCompany: entry.transporterCompany,
        grossWeight: entry.grossWeight,
        tareWeight: entry.tareWeight,
        netWeight: entry.netWeight,
        wasteType: entry.wasteType,
        zone: entry.zone,
        status: entry.status,
        receiptPhoto: entry.receiptPhoto,
        operator: entry.operatorId?.fullName || 'N/A',
        createdAt: entry.createdAt
      };
    } catch (error) {
      console.error('Error al obtener última entrada:', error);
      throw error;
    }
  }

  /**
   * Obtener entradas recientes
   */
  async getRecentEntries(limit = 10) {
    try {
      const entries = await WasteEntry.find()
        .populate('operatorId', 'username fullName')
        .sort({ createdAt: -1 })
        .limit(limit);

      return entries.map(entry => ({
        _id: entry._id,
        id: entry._id,
        transporterPlate: entry.transporterPlate,
        transporterCompany: entry.transporterCompany,
        grossWeight: entry.grossWeight,
        tareWeight: entry.tareWeight,
        netWeight: entry.netWeight,
        wasteType: entry.wasteType,
        zone: entry.zone,
        status: entry.status,
        receiptPhoto: entry.receiptPhoto,
        operator: entry.operatorId?.fullName || 'N/A',
        createdAt: entry.createdAt
      }));
    } catch (error) {
      console.error('Error al obtener entradas recientes:', error);
      throw error;
    }
  }

  /**
   * Obtener total de toneladas procesadas
   */
  async getTotalProcessedTonnes() {
    try {
      const result = await WasteEntry.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: null,
            totalWeight: { $sum: '$netWeight' }
          }
        }
      ]);

      const totalKg = result[0]?.totalWeight || 0;
      return Math.round((totalKg / 1000) * 10) / 10; // Convertir a toneladas
    } catch (error) {
      console.error('Error al obtener total procesado:', error);
      return 0;
    }
  }

  /**
   * Crear nueva entrada de residuos
   */
  async createWasteEntry(entryData, operatorId) {
    try {
      const entry = await WasteEntry.createEntry(entryData, operatorId);
      
      // Verificar si necesita generar alertas de capacidad
      await this.checkCapacityAlerts();
      
      return entry;
    } catch (error) {
      console.error('Error al crear entrada de residuos:', error);
      throw error;
    }
  }

  /**
   * Verificar alertas de capacidad
   */
  async checkCapacityAlerts() {
    try {
      const capacityData = await this.getCapacityByZone();
      const adminUser = await User.findOne({ role: 'admin' });

      if (!adminUser) return;

      for (const zone of capacityData) {
        if (zone.percentage >= 80) {
          // Verificar si ya existe una alerta activa para esta zona
          const existingAlert = await Alert.findOne({
            type: AlertType.CAPACITY,
            zone: zone.zone,
            isActive: true
          });

          if (!existingAlert) {
            await Alert.createCapacityAlert(
              zone.zone,
              zone.percentage,
              adminUser._id
            );
          }
        }
      }
    } catch (error) {
      console.error('Error al verificar alertas de capacidad:', error);
    }
  }

  /**
   * Obtener reportes por rango de fechas
   */
  async getReportsByDateRange(startDate, endDate, filters = {}) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const query = {
        createdAt: {
          $gte: start,
          $lte: end
        },
        ...filters
      };

      const entries = await WasteEntry.find(query)
        .populate('operatorId', 'username fullName')
        .sort({ createdAt: -1 });

      const summary = {
        totalEntries: entries.length,
        totalTonnage: entries.reduce((sum, entry) => sum + entry.netWeight, 0) / 1000,
        byType: {},
        byZone: {},
        byStatus: {}
      };

      // Agrupar por tipo
      Object.values(WasteType).forEach(type => {
        const typeEntries = entries.filter(entry => entry.wasteType === type);
        summary.byType[type] = {
          count: typeEntries.length,
          tonnage: typeEntries.reduce((sum, entry) => sum + entry.netWeight, 0) / 1000
        };
      });

      // Agrupar por zona
      ['Zona A', 'Zona B', 'Zona C', 'Zona D'].forEach(zone => {
        const zoneEntries = entries.filter(entry => entry.zone === zone);
        summary.byZone[zone] = {
          count: zoneEntries.length,
          tonnage: zoneEntries.reduce((sum, entry) => sum + entry.netWeight, 0) / 1000
        };
      });

      // Agrupar por estado
      ['pending', 'processing', 'completed', 'rejected'].forEach(status => {
        const statusEntries = entries.filter(entry => entry.status === status);
        summary.byStatus[status] = statusEntries.length;
      });

      return {
        entries: entries.map(entry => ({
          id: entry._id,
          transporterPlate: entry.transporterPlate,
          transporterCompany: entry.transporterCompany,
          netWeight: entry.netWeight,
          wasteType: entry.wasteType,
          zone: entry.zone,
          status: entry.status,
          operator: entry.operatorId?.fullName || 'N/A',
          createdAt: entry.createdAt
        })),
        summary
      };
    } catch (error) {
      console.error('Error al obtener reportes:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de una entrada de residuos
   */
  async updateEntryStatus(entryId, newStatus, userId, notes = null, rejectedReason = null) {
    try {
      const entry = await WasteEntry.findById(entryId);
      
      if (!entry) {
        throw new Error('Entrada no encontrada');
      }

      const previousStatus = entry.status;
      
      // Actualizar campos
      entry.status = newStatus;
      
      if (notes) {
        entry.notes = notes;
      }
      
      if (newStatus === 'rejected' && rejectedReason) {
        entry.rejectedReason = rejectedReason;
      }
      
      if (newStatus === 'completed') {
        entry.processedAt = new Date();
      }

      await entry.save();

      // Crear registro de historial (opcional - podrías crear un modelo StatusHistory)
      console.log(`Estado actualizado: ${entryId} de ${previousStatus} a ${newStatus} por usuario ${userId}`);

      // Retornar entrada actualizada con información del operador
      const updatedEntry = await WasteEntry.findById(entryId)
        .populate('operatorId', 'username fullName');

      return {
        _id: updatedEntry._id,
        id: updatedEntry._id,
        transporterPlate: updatedEntry.transporterPlate,
        transporterCompany: updatedEntry.transporterCompany,
        grossWeight: updatedEntry.grossWeight,
        tareWeight: updatedEntry.tareWeight,
        netWeight: updatedEntry.netWeight,
        wasteType: updatedEntry.wasteType,
        zone: updatedEntry.zone,
        status: updatedEntry.status,
        notes: updatedEntry.notes,
        rejectedReason: updatedEntry.rejectedReason,
        processedAt: updatedEntry.processedAt,
        receiptPhoto: updatedEntry.receiptPhoto,
        operator: updatedEntry.operatorId?.fullName || 'N/A',
        createdAt: updatedEntry.createdAt,
        updatedAt: updatedEntry.updatedAt
      };
    } catch (error) {
      console.error('Error al actualizar estado de entrada:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de cambios de estado (simulado)
   * En una implementación completa, esto requeriría un modelo StatusHistory
   */
  async getEntryStatusHistory(entryId) {
    try {
      const entry = await WasteEntry.findById(entryId)
        .populate('operatorId', 'username fullName');
      
      if (!entry) {
        throw new Error('Entrada no encontrada');
      }

      // Por ahora, retornamos el estado actual
      // En una implementación completa, consultarías una tabla de historial
      const history = [
        {
          status: 'pending',
          timestamp: entry.createdAt,
          user: entry.operatorId?.fullName || 'Sistema',
          notes: 'Entrada creada'
        }
      ];

      if (entry.status !== 'pending') {
        history.push({
          status: entry.status,
          timestamp: entry.processedAt || entry.updatedAt,
          user: 'Usuario', // En implementación completa, guardarías quién hizo el cambio
          notes: entry.notes || entry.rejectedReason || 'Estado actualizado'
        });
      }

      return {
        entryId: entry._id,
        currentStatus: entry.status,
        history
      };
    } catch (error) {
      console.error('Error al obtener historial de entrada:', error);
      throw error;
    }
  }

  /**
   * Obtener resumen de estadísticas
   */
  async getStatsSummary() {
    try {
      const [
        todayStats,
        totalProcessed,
        capacityData,
        wasteDistribution
      ] = await Promise.all([
        this.getTodayStats(),
        this.getTotalProcessedTonnes(),
        this.getCapacityByZone(),
        this.getWasteTypeDistribution()
      ]);

      const summary = {
        today: todayStats,
        totalProcessed,
        capacity: capacityData,
        wasteDistribution,
        maxCapacity: this.maxCapacity,
        capacityPercentage: (totalProcessed / this.maxCapacity) * 100
      };

      return summary;
    } catch (error) {
      console.error('Error al obtener resumen de estadísticas:', error);
      throw error;
    }
  }
}

export default DataService; 