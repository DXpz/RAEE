import DataService from '../services/DataService.js';

/**
 * Controlador de Datos
 * Maneja todas las operaciones relacionadas con datos del dashboard y estadísticas
 */
class DataController {
  constructor() {
    this.dataService = new DataService();
  }

  /**
   * Obtener datos completos del dashboard
   */
  getDashboardData = async (req, res) => {
    try {
      const dashboardData = await this.dataService.getDashboardData();

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('Error al obtener datos del dashboard:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al cargar datos del dashboard'
      });
    }
  };

  /**
   * Obtener residuos recibidos semanalmente
   */
  getWeeklyWasteReceived = async (req, res) => {
    try {
      const weeklyData = await this.dataService.getWeeklyWasteReceived();

      res.json({
        success: true,
        data: weeklyData
      });
    } catch (error) {
      console.error('Error al obtener datos semanales:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener datos semanales'
      });
    }
  };

  /**
   * Obtener datos mensuales
   */
  getMonthlyData = async (req, res) => {
    try {
      const monthlyData = await this.dataService.getMonthlyData();

      res.json({
        success: true,
        data: monthlyData
      });
    } catch (error) {
      console.error('Error al obtener datos mensuales:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener datos mensuales'
      });
    }
  };

  /**
   * Obtener distribución por tipo de residuo
   */
  getWasteTypeDistribution = async (req, res) => {
    try {
      const distribution = await this.dataService.getWasteTypeDistribution();

      res.json({
        success: true,
        data: distribution
      });
    } catch (error) {
      console.error('Error al obtener distribución de residuos:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener distribución de residuos'
      });
    }
  };

  /**
   * Obtener capacidad por zona
   */
  getCapacityByZone = async (req, res) => {
    try {
      const capacityData = await this.dataService.getCapacityByZone();

      res.json({
        success: true,
        data: capacityData
      });
    } catch (error) {
      console.error('Error al obtener capacidad por zona:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener capacidad por zona'
      });
    }
  };

  /**
   * Obtener indicadores ambientales actuales
   */
  getEnvironmentalIndicators = async (req, res) => {
    try {
      const indicators = await this.dataService.getCurrentEnvironmentalIndicators();

      res.json({
        success: true,
        data: indicators
      });
    } catch (error) {
      console.error('Error al obtener indicadores ambientales:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener indicadores ambientales'
      });
    }
  };

  /**
   * Obtener alertas activas
   */
  getActiveAlerts = async (req, res) => {
    try {
      const alerts = await this.dataService.getActiveAlerts();

      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      console.error('Error al obtener alertas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener alertas'
      });
    }
  };

  /**
   * Obtener última entrada de residuos
   */
  getLatestWasteEntry = async (req, res) => {
    try {
      const latestEntry = await this.dataService.getLatestWasteEntry();

      res.json({
        success: true,
        data: latestEntry
      });
    } catch (error) {
      console.error('Error al obtener última entrada:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener última entrada'
      });
    }
  };

  /**
   * Obtener entradas recientes
   */
  getRecentEntries = async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const entries = await this.dataService.getRecentEntries(limit);

      res.json({
        success: true,
        data: entries
      });
    } catch (error) {
      console.error('Error al obtener entradas recientes:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener entradas recientes'
      });
    }
  };

  /**
   * Obtener estadísticas de hoy
   */
  getTodayStats = async (req, res) => {
    try {
      const stats = await this.dataService.getTodayStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de hoy:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas de hoy'
      });
    }
  };

  /**
   * Subir imagen de comprobante
   */
  uploadImage = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No se ha proporcionado ningún archivo'
        });
      }

      // Construir URL de la imagen
      const imageUrl = `/uploads/${req.file.filename}`;

      console.log(`📸 Imagen subida exitosamente: ${req.file.filename}`);

      res.json({
        success: true,
        imageUrl: imageUrl,
        message: 'Imagen subida exitosamente'
      });
    } catch (error) {
      console.error('Error al subir imagen:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al subir imagen'
      });
    }
  };

  /**
   * Crear nueva entrada de residuos
   */
  createWasteEntry = async (req, res) => {
    try {
      const {
        transporterPlate,
        transporterCompany,
        grossWeight,
        tareWeight,
        wasteType,
        zone,
        receiptPhoto,
        notes
      } = req.body;

      // Validar campos requeridos
      if (!transporterPlate || !transporterCompany || !grossWeight || !tareWeight || !wasteType || !zone) {
        return res.status(400).json({
          success: false,
          error: 'Todos los campos requeridos deben ser proporcionados'
        });
      }

      const entryData = {
        transporterPlate,
        transporterCompany,
        grossWeight: parseFloat(grossWeight),
        tareWeight: parseFloat(tareWeight),
        wasteType,
        zone,
        receiptPhoto,
        notes
      };

      const newEntry = await this.dataService.createWasteEntry(entryData, req.user.id);

      res.status(201).json({
        success: true,
        data: newEntry,
        message: 'Entrada de residuos creada exitosamente'
      });
    } catch (error) {
      console.error('Error al crear entrada de residuos:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Error al crear entrada de residuos'
      });
    }
  };

  /**
   * Obtener reportes por rango de fechas
   */
  getReports = async (req, res) => {
    try {
      const { startDate, endDate, wasteType, zone, status } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Fecha de inicio y fin son requeridas'
        });
      }

      const filters = {};
      if (wasteType) filters.wasteType = wasteType;
      if (zone) filters.zone = zone;
      if (status) filters.status = status;

      const reports = await this.dataService.getReportsByDateRange(
        startDate,
        endDate,
        filters
      );

      res.json({
        success: true,
        data: reports
      });
    } catch (error) {
      console.error('Error al obtener reportes:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al generar reportes'
      });
    }
  };

  /**
   * Obtener resumen de estadísticas
   */
  getStatsSummary = async (req, res) => {
    try {
      const summary = await this.dataService.getStatsSummary();

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error al obtener resumen de estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener resumen de estadísticas'
      });
    }
  };

  /**
   * Actualizar estado de una entrada de residuos
   * Solo admin y operadores pueden modificar estados
   */
  updateEntryStatus = async (req, res) => {
    try {
      const { entryId } = req.params;
      const { status, notes, rejectedReason } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Verificar permisos
      if (!['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para modificar el estado de las entradas'
        });
      }

      // Validar estado
      const validStatuses = ['pending', 'processing', 'completed', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Estado inválido. Estados válidos: ' + validStatuses.join(', ')
        });
      }

      // Si el estado es rejected, la razón es requerida
      if (status === 'rejected' && (!rejectedReason || rejectedReason.trim().length === 0)) {
        return res.status(400).json({
          success: false,
          error: 'La razón de rechazo es requerida cuando el estado es "rejected"'
        });
      }

      const updatedEntry = await this.dataService.updateEntryStatus(
        entryId, 
        status, 
        userId, 
        notes, 
        rejectedReason
      );

      res.json({
        success: true,
        data: updatedEntry,
        message: `Estado actualizado a "${status}" exitosamente`
      });
    } catch (error) {
      console.error('Error al actualizar estado de entrada:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al actualizar estado de entrada'
      });
    }
  };

  /**
   * Obtener historial de cambios de estado de una entrada
   */
  getEntryStatusHistory = async (req, res) => {
    try {
      const { entryId } = req.params;
      const userRole = req.user.role;

      // Verificar permisos
      if (!['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para ver el historial de entradas'
        });
      }

      const history = await this.dataService.getEntryStatusHistory(entryId);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Error al obtener historial de entrada:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener historial de entrada'
      });
    }
  };
}

export default DataController; 