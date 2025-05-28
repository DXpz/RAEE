import { DashboardData } from "../models/Dashboard.js"
import { WasteEntry, WasteType } from "../models/WasteEntry.js"

// Configuración del API
const API_BASE = 'http://localhost:5000/api'

export class DataService {
  static instance = null

  static getInstance() {
    if (!DataService.instance) {
      DataService.instance = new DataService()
    }
    return DataService.instance
  }

  /**
   * Obtener token de autenticación desde localStorage
   */
  getAuthToken() {
    return localStorage.getItem('authToken')
  }

  /**
   * Crear nueva entrada de residuos en el backend
   */
  async createWasteEntry(entryData) {
    try {
      const token = this.getAuthToken()
      
      if (!token) {
        throw new Error('Token de autenticación no encontrado')
      }

      console.log('📦 Enviando entrada de residuos al backend:', entryData)

      const response = await fetch(`${API_BASE}/data/waste-entry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(entryData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log('✅ Entrada creada exitosamente:', data.data)
        return { 
          success: true, 
          data: data.data,
          message: data.message
        }
      } else {
        console.error('❌ Error al crear entrada:', data.error)
        throw new Error(data.error || 'Error al crear entrada de residuos')
      }
    } catch (error) {
      console.error('💥 Error de conexión al crear entrada:', error)
      
      if (error.message.includes('401') || error.message.includes('token')) {
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.')
      }
      
      throw new Error(error.message || 'Error de conexión con el servidor')
    }
  }

  /**
   * Subir imagen al servidor
   */
  async uploadImage(imageFile) {
    try {
      const token = this.getAuthToken()
      
      if (!token) {
        throw new Error('Token de autenticación no encontrado')
      }

      const formData = new FormData()
      formData.append('image', imageFile)

      console.log('📸 Subiendo imagen al servidor...')

      const response = await fetch(`${API_BASE}/data/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log('✅ Imagen subida exitosamente:', data.imageUrl)
        return { 
          success: true, 
          imageUrl: data.imageUrl
        }
      } else {
        console.error('❌ Error al subir imagen:', data.error)
        throw new Error(data.error || 'Error al subir imagen')
      }
    } catch (error) {
      console.error('💥 Error al subir imagen:', error)
      throw new Error(error.message || 'Error al subir imagen')
    }
  }

  /**
   * Realizar solicitud autenticada al backend
   */
  async authenticatedRequest(endpoint, options = {}) {
    const token = this.getAuthToken()
    
    if (!token) {
      throw new Error('Token de autenticación no encontrado')
    }

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.')
      }
      throw new Error(data.error || `Error ${response.status}`)
    }

    return data
  }

  /**
   * Obtener datos completos del dashboard desde el backend
   */
  async getDashboardData() {
    try {
      console.log('📊 Obteniendo datos del dashboard desde el backend...')
      const data = await this.authenticatedRequest('/data/dashboard')
      console.log('✅ Datos del dashboard obtenidos:', data)
      return data.data
    } catch (error) {
      console.error('❌ Error al obtener datos del dashboard:', error)
      // Fallback a datos locales en caso de error
      return this.getLocalDashboardData()
    }
  }

  /**
   * Obtener datos semanales de residuos desde el backend
   */
  async getWeeklyWasteData() {
    try {
      console.log('📈 Obteniendo datos semanales desde el backend...')
      const data = await this.authenticatedRequest('/data/weekly-waste')
      console.log('✅ Datos semanales obtenidos:', data)
      return data.data
    } catch (error) {
      console.error('❌ Error al obtener datos semanales:', error)
      return [35, 40, 55, 35, 65, 55, 70] // Fallback
    }
  }

  /**
   * Obtener datos mensuales desde el backend
   */
  async getMonthlyData() {
    try {
      console.log('📅 Obteniendo datos mensuales desde el backend...')
      const data = await this.authenticatedRequest('/data/monthly')
      console.log('✅ Datos mensuales obtenidos:', data)
      return data.data
    } catch (error) {
      console.error('❌ Error al obtener datos mensuales:', error)
      return this.getLocalMonthlyData()
    }
  }

  /**
   * Obtener distribución por tipo de residuo desde el backend
   */
  async getWasteTypeDistribution() {
    try {
      console.log('📊 Obteniendo distribución de residuos desde el backend...')
      const data = await this.authenticatedRequest('/data/waste-distribution')
      console.log('✅ Distribución de residuos obtenida:', data)
      return data.data
    } catch (error) {
      console.error('❌ Error al obtener distribución de residuos:', error)
      return this.getLocalWasteTypeDistribution()
    }
  }

  /**
   * Obtener capacidad por zona desde el backend
   */
  async getCapacityByZone() {
    try {
      console.log('🏗️ Obteniendo capacidad por zona desde el backend...')
      const data = await this.authenticatedRequest('/data/capacity')
      console.log('✅ Capacidad por zona obtenida:', data)
      return data.data
    } catch (error) {
      console.error('❌ Error al obtener capacidad por zona:', error)
      return this.getLocalCapacityByZone()
    }
  }

  /**
   * Obtener indicadores ambientales desde el backend
   */
  async getEnvironmentalIndicators() {
    try {
      console.log('🌱 Obteniendo indicadores ambientales desde el backend...')
      const data = await this.authenticatedRequest('/data/environmental')
      console.log('✅ Indicadores ambientales obtenidos:', data)
      return data.data
    } catch (error) {
      console.error('❌ Error al obtener indicadores ambientales:', error)
      return this.getLocalEnvironmentalIndicators()
    }
  }

  /**
   * Obtener alertas activas desde el backend
   */
  async getActiveAlerts() {
    try {
      console.log('🚨 Obteniendo alertas activas desde el backend...')
      const data = await this.authenticatedRequest('/data/alerts')
      console.log('✅ Alertas activas obtenidas:', data)
      return data.data
    } catch (error) {
      console.error('❌ Error al obtener alertas activas:', error)
      return this.getLocalActiveAlerts()
    }
  }

  /**
   * Obtener última entrada de residuos desde el backend
   */
  async getLatestWasteEntry() {
    try {
      console.log('📦 Obteniendo última entrada desde el backend...')
      const data = await this.authenticatedRequest('/data/latest-entry')
      console.log('✅ Última entrada obtenida:', data)
      return data.data
    } catch (error) {
      console.error('❌ Error al obtener última entrada:', error)
      return this.getLocalLatestWasteEntry()
    }
  }

  /**
   * Obtener entradas recientes desde el backend
   */
  async getRecentEntries(limit = 10) {
    try {
      console.log('📋 Obteniendo entradas recientes desde el backend...')
      const data = await this.authenticatedRequest(`/data/recent-entries?limit=${limit}`)
      console.log('✅ Entradas recientes obtenidas:', data)
      return data.data
    } catch (error) {
      console.error('❌ Error al obtener entradas recientes:', error)
      return this.getLocalRecentEntries()
    }
  }

  /**
   * Obtener estadísticas de hoy desde el backend
   */
  async getTodayStats() {
    try {
      console.log('📊 Obteniendo estadísticas de hoy desde el backend...')
      const data = await this.authenticatedRequest('/data/today-stats')
      console.log('✅ Estadísticas de hoy obtenidas:', data)
      return data.data
    } catch (error) {
      console.error('❌ Error al obtener estadísticas de hoy:', error)
      return this.getLocalTodayStats()
    }
  }

  /**
   * Obtener reportes por rango de fechas
   */
  async getReports(startDate, endDate, filters = {}) {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        ...filters
      });

      const response = await fetch(`${API_BASE}/data/reports?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Error al obtener reportes');
      }

      return data.data;
    } catch (error) {
      console.error('Error al obtener reportes:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de una entrada de residuos
   */
  async updateEntryStatus(entryId, status, notes = null, rejectedReason = null) {
    try {
      const token = this.getAuthToken()
      
      if (!token) {
        throw new Error('Token de autenticación no encontrado')
      }

      console.log('🔄 Actualizando estado de entrada:', { entryId, status, notes, rejectedReason })

      const response = await fetch(`${API_BASE}/data/entry/${entryId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          notes,
          rejectedReason
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log(' Estado actualizado exitosamente:', data.data)
        return { 
          success: true, 
          data: data.data,
          message: data.message
        }
      } else {
        console.error(' Error al actualizar estado:', data.error)
        throw new Error(data.error || 'Error al actualizar estado de entrada')
      }
    } catch (error) {
      console.error(' Error de conexión al actualizar estado:', error)
      
      if (error.message.includes('401') || error.message.includes('token')) {
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.')
      }
      
      if (error.message.includes('403')) {
        throw new Error('No tienes permisos para modificar el estado de las entradas.')
      }
      
      throw new Error(error.message || 'Error de conexión con el servidor')
    }
  }

  /**
   * Obtener historial de cambios de estado de una entrada
   */
  async getEntryStatusHistory(entryId) {
    try {
      const token = this.getAuthToken()
      
      if (!token) {
        throw new Error('Token de autenticación no encontrado')
      }

      console.log(' Obteniendo historial de entrada:', entryId)

      const response = await fetch(`${API_BASE}/data/entry/${entryId}/history`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log(' Historial obtenido exitosamente:', data.data)
        return data.data
      } else {
        console.error(' Error al obtener historial:', data.error)
        throw new Error(data.error || 'Error al obtener historial de entrada')
      }
    } catch (error) {
      console.error(' Error de conexión al obtener historial:', error)
      
      if (error.message.includes('401') || error.message.includes('token')) {
        throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.')
      }
      
      if (error.message.includes('403')) {
        throw new Error('No tienes permisos para ver el historial de entradas.')
      }
      
      throw new Error(error.message || 'Error de conexión con el servidor')
    }
  }

  // === MÉTODOS FALLBACK (datos locales) ===

  getLocalDashboardData() {
    const wasteReceived = [35, 40, 55, 35, 65, 55, 70] // L, M, X, J, V, S, D
    const processedTonnes = 1250
    const maxCapacity = 2000

    const environmentalIndicators = [
      { name: "Metano", value: 17, unit: "%", status: "warning" },
      { name: "pH Lixiviado", value: 6.8, unit: "", status: "normal" },
      { name: "Temperatura", value: 24, unit: "°C", status: "normal" },
      { name: "Humedad", value: 65, unit: "%", status: "normal" },
    ]

    const alerts = [
      {
        id: "1",
        type: "capacity",
        message: "Zonas del relleno cerca de su capacidad",
        priority: "high",
        timestamp: new Date(),
      },
      {
        id: "2",
        type: "incident",
        message: "Incidentes reportados (ej: fugas de líquidos)",
        priority: "high",
        timestamp: new Date(),
      },
      {
        id: "3",
        type: "environmental",
        message: "Niveles de metano por encima del promedio",
        priority: "medium",
        timestamp: new Date(),
      },
    ]

    return new DashboardData(wasteReceived, processedTonnes, maxCapacity, environmentalIndicators, alerts)
  }

  getLocalMonthlyData() {
    return [
      { month: "Ene", tonnage: 1150 },
      { month: "Feb", tonnage: 1200 },
      { month: "Mar", tonnage: 1180 },
      { month: "Abr", tonnage: 1250 },
      { month: "May", tonnage: 1300 },
      { month: "Jun", tonnage: 1250 },
    ]
  }

  getLocalWasteTypeDistribution() {
    return [
      { type: "Orgánico", percentage: 45, tonnage: 562, color: "bg-green-500" },
      { type: "Reciclable", percentage: 25, tonnage: 312, color: "bg-blue-500" },
      { type: "General", percentage: 20, tonnage: 250, color: "bg-gray-500" },
      { type: "Peligroso", percentage: 10, tonnage: 125, color: "bg-red-500" },
    ]
  }

  getLocalCapacityByZone() {
    return [
      { zone: "Zona A", current: 450, maximum: 500, percentage: 90 },
      { zone: "Zona B", current: 380, maximum: 500, percentage: 76 },
      { zone: "Zona C", current: 420, maximum: 500, percentage: 84 },
      { zone: "Zona D", current: 200, maximum: 500, percentage: 40 },
    ]
  }

  getLocalEnvironmentalIndicators() {
    return [
      { name: "Metano", value: 17, unit: "%", status: "warning" },
      { name: "pH Lixiviado", value: 6.8, unit: "", status: "normal" },
      { name: "Temperatura", value: 24, unit: "°C", status: "normal" },
      { name: "Humedad", value: 65, unit: "%", status: "normal" },
    ]
  }

  getLocalActiveAlerts() {
    return [
      {
        id: "1",
        type: "capacity",
        message: "Zonas del relleno cerca de su capacidad",
        priority: "high",
        timestamp: new Date(),
      },
      {
        id: "2",
        type: "incident",
        message: "Incidentes reportados (ej: fugas de líquidos)",
        priority: "high",
        timestamp: new Date(),
      },
      {
        id: "3",
        type: "environmental",
        message: "Niveles de metano por encima del promedio",
        priority: "medium",
        timestamp: new Date(),
      },
    ]
  }

  getLocalLatestWasteEntry() {
    return new WasteEntry("1", "ABC1234", "Transportes S.A.", 14320, 5620, WasteType.DANGEROUS, new Date())
  }

  getLocalRecentEntries() {
    return [
      new WasteEntry("1", "ABC1234", "Transportes S.A.", 14320, 5620, WasteType.DANGEROUS, new Date()),
      new WasteEntry(
        "2",
        "XYZ5678",
        "EcoTransport Ltda.",
        12500,
        4800,
        WasteType.RECYCLABLE,
        new Date(Date.now() - 3600000),
      ),
      new WasteEntry(
        "3",
        "DEF9012",
        "Residuos del Norte",
        18200,
        6200,
        WasteType.ORGANIC,
        new Date(Date.now() - 7200000),
      ),
    ]
  }

  getLocalTodayStats() {
    return {
      totalEntries: 12,
      totalTonnage: 156.8,
      averageWeight: 13.1,
      peakHour: "14:00",
    }
  }
} 