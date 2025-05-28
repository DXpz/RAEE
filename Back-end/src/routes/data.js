import express from 'express';
import DataController from '../controllers/DataController.js';
import { authenticateToken, requirePermission, requireModuleAccess } from '../middleware/auth.js';
import { uploadReceiptPhoto, handleUploadError } from '../middleware/upload.js';

const router = express.Router();
const dataController = new DataController();

/**
 * @route GET /api/data/dashboard
 * @desc Obtener datos completos del dashboard
 * @access Private (view_dashboard permission)
 */
router.get('/dashboard', 
  authenticateToken, 
  requireModuleAccess('dashboard'), 
  dataController.getDashboardData
);

/**
 * @route GET /api/data/weekly-waste
 * @desc Obtener residuos recibidos semanalmente
 * @access Private (view_dashboard permission)
 */
router.get('/weekly-waste', 
  authenticateToken, 
  requirePermission('view_dashboard'), 
  dataController.getWeeklyWasteReceived
);

/**
 * @route GET /api/data/monthly
 * @desc Obtener datos mensuales
 * @access Private (view_dashboard permission)
 */
router.get('/monthly', 
  authenticateToken, 
  requirePermission('view_dashboard'), 
  dataController.getMonthlyData
);

/**
 * @route GET /api/data/waste-distribution
 * @desc Obtener distribución por tipo de residuo
 * @access Private (view_dashboard permission)
 */
router.get('/waste-distribution', 
  authenticateToken, 
  requirePermission('view_dashboard'), 
  dataController.getWasteTypeDistribution
);

/**
 * @route GET /api/data/capacity
 * @desc Obtener capacidad por zona
 * @access Private (view_dashboard permission)
 */
router.get('/capacity', 
  authenticateToken, 
  requirePermission('view_dashboard'), 
  dataController.getCapacityByZone
);

/**
 * @route GET /api/data/environmental
 * @desc Obtener indicadores ambientales actuales
 * @access Private (view_dashboard permission)
 */
router.get('/environmental', 
  authenticateToken, 
  requirePermission('view_dashboard'), 
  dataController.getEnvironmentalIndicators
);

/**
 * @route GET /api/data/alerts
 * @desc Obtener alertas activas
 * @access Private (view_dashboard permission)
 */
router.get('/alerts', 
  authenticateToken, 
  requirePermission('view_dashboard'), 
  dataController.getActiveAlerts
);

/**
 * @route GET /api/data/latest-entry
 * @desc Obtener última entrada de residuos
 * @access Private (view_dashboard permission)
 */
router.get('/latest-entry', 
  authenticateToken, 
  requirePermission('view_dashboard'), 
  dataController.getLatestWasteEntry
);

/**
 * @route GET /api/data/recent-entries
 * @desc Obtener entradas recientes
 * @access Private (view_dashboard permission)
 */
router.get('/recent-entries', 
  authenticateToken, 
  requirePermission('view_dashboard'), 
  dataController.getRecentEntries
);

/**
 * @route GET /api/data/today-stats
 * @desc Obtener estadísticas de hoy
 * @access Private (view_dashboard permission)
 */
router.get('/today-stats', 
  authenticateToken, 
  requirePermission('view_dashboard'), 
  dataController.getTodayStats
);

/**
 * @route POST /api/data/upload-image
 * @desc Subir imagen de comprobante
 * @access Private (create_entry permission)
 */
router.post('/upload-image', 
  authenticateToken, 
  requirePermission('create_entry'),
  uploadReceiptPhoto,
  handleUploadError,
  dataController.uploadImage
);

/**
 * @route POST /api/data/waste-entry
 * @desc Crear nueva entrada de residuos
 * @access Private (create_entry permission)
 */
router.post('/waste-entry', 
  authenticateToken, 
  requirePermission('create_entry'), 
  dataController.createWasteEntry
);

/**
 * @route GET /api/data/reports
 * @desc Obtener reportes por rango de fechas
 * @access Private (view_reports permission)
 */
router.get('/reports', 
  authenticateToken, 
  requirePermission('view_reports'), 
  dataController.getReports
);

/**
 * @route GET /api/data/stats-summary
 * @desc Obtener resumen de estadísticas
 * @access Private (view_dashboard permission)
 */
router.get('/stats-summary', 
  authenticateToken, 
  requirePermission('view_dashboard'), 
  dataController.getStatsSummary
);

/**
 * @route PUT /api/data/entry/:entryId/status
 * @desc Actualizar estado de una entrada de residuos
 * @access Private (admin or operator roles)
 */
router.put('/entry/:entryId/status', 
  authenticateToken, 
  requirePermission('manage_entries'), 
  dataController.updateEntryStatus
);

/**
 * @route GET /api/data/entry/:entryId/history
 * @desc Obtener historial de cambios de estado de una entrada
 * @access Private (admin or operator roles)
 */
router.get('/entry/:entryId/history', 
  authenticateToken, 
  requirePermission('manage_entries'), 
  dataController.getEntryStatusHistory
);

export default router; 