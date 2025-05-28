import { useState, useEffect } from "react"
import { 
  Menu, 
  Filter, 
  BarChart3, 
  Download, 
  RefreshCw, 
  FileText,
  Truck,
  Scale,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Search,
  Eye,
  Printer
} from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { WasteType } from "../models/WasteEntry.js"
import { DataService } from "../services/DataService.js"
import styles from "../styles/Reports.module.css"

export const Reports = ({ onToggleSidebar }) => {
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    wasteType: "",
    transporterCompany: "",
    status: ""
  })

  const [reportData, setReportData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [error, setError] = useState(null)
  const dataService = DataService.getInstance()

  // Estados para el modal de cambio de estado
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [statusNotes, setStatusNotes] = useState('')
  const [rejectedReason, setRejectedReason] = useState('')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    // Establecer fechas por defecto (último mes)
    const today = new Date()
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
    
    setFilters(prev => ({
      ...prev,
      dateFrom: lastMonth.toISOString().split('T')[0],
      dateTo: today.toISOString().split('T')[0]
    }))
  }, [])

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGenerateReport = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Verificar token de autenticación
      const token = dataService.getAuthToken()
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicie sesión.')
      }

      // Validar fechas
      if (!filters.dateFrom || !filters.dateTo) {
        throw new Error('Las fechas de inicio y fin son requeridas')
      }

      if (new Date(filters.dateFrom) > new Date(filters.dateTo)) {
        throw new Error('La fecha de inicio no puede ser mayor que la fecha de fin')
      }

      console.log(' Generando reporte con filtros:', filters)

      // Preparar filtros para el backend
      const backendFilters = {}
      if (filters.wasteType) backendFilters.wasteType = filters.wasteType
      if (filters.status) backendFilters.status = filters.status
      if (filters.transporterCompany) backendFilters.transporterCompany = filters.transporterCompany

      // Obtener datos del backend
      const reportResult = await dataService.getReports(
        filters.dateFrom,
        filters.dateTo,
        backendFilters
      )

      console.log(' Reporte generado exitosamente:', reportResult)

      // Transformar datos para el frontend
      const transformedData = {
        summary: {
          totalEntries: reportResult.summary.totalEntries,
          totalWeight: parseFloat(reportResult.summary.totalTonnage.toFixed(3)),
          averageWeight: reportResult.summary.totalEntries > 0 
            ? parseFloat((reportResult.summary.totalTonnage / reportResult.summary.totalEntries).toFixed(3))
            : 0,
          dangerousWaste: reportResult.summary.byType?.['Peligroso']?.count || 0
        },
        entries: reportResult.entries.map(entry => ({
          id: entry.id,
          date: entry.createdAt,
          transporterPlate: entry.transporterPlate,
          transporterCompany: entry.transporterCompany,
          wasteType: entry.wasteType,
          grossWeight: entry.grossWeight || 0,
          tareWeight: entry.tareWeight || 0,
          netWeight: parseFloat((entry.netWeight || 0).toFixed(3)),
          status: entry.status === 'completed' ? 'Procesado' : 
                  entry.status === 'pending' ? 'Pendiente' :
                  entry.status === 'processing' ? 'En Proceso' : 'Rechazado',
          operator: entry.operator
        })),
        rawSummary: reportResult.summary // Para análisis adicionales
      }
      
      setReportData(transformedData)
      setHasGenerated(true)
    } catch (error) {
      console.error(' Error al generar reporte:', error)
      setError(error.message || 'Error al generar el reporte')
      setReportData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportReport = (format) => {
    if (!reportData) return
    
    // Simular exportación
    console.log(`Exportando reporte en formato ${format}`)
    alert(`Reporte exportado en formato ${format.toUpperCase()}`)
  }

  const handleClearFilters = () => {
    const today = new Date()
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
    
    setFilters({
      dateFrom: lastMonth.toISOString().split('T')[0],
      dateTo: today.toISOString().split('T')[0],
      wasteType: "",
      transporterCompany: "",
      status: ""
    })
    setReportData(null)
    setHasGenerated(false)
    setError(null)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Procesado":
        return styles.statusProcessed
      case "Pendiente":
        return styles.statusPending
      case "Rechazado":
        return styles.statusRejected
      default:
        return styles.statusPending
    }
  }

  const getWasteTypeBadgeClass = (wasteType) => {
    switch (wasteType) {
      case WasteType.DANGEROUS:
        return `${styles.statusBadge} ${styles.statusRejected}`
      case WasteType.RECYCLABLE:
        return `${styles.statusBadge} ${styles.statusProcessed}`
      case WasteType.ORGANIC:
        return `${styles.statusBadge} ${styles.statusPending}`
      case WasteType.GENERAL:
        return `${styles.statusBadge} ${styles.statusProcessed}`
      default:
        return `${styles.statusBadge} ${styles.statusPending}`
    }
  }

  // Procesar datos para gráfica de distribución por tipo
  const getWasteTypeDistributionData = () => {
    if (!reportData || !reportData.entries) return []
    
    const typeCount = {}
    const typeWeight = {}
    
    reportData.entries.forEach(entry => {
      const type = entry.wasteType
      typeCount[type] = (typeCount[type] || 0) + 1
      typeWeight[type] = (typeWeight[type] || 0) + entry.netWeight
    })
    
    return Object.keys(typeCount).map(type => ({
      tipo: type,
      entradas: typeCount[type],
      peso: parseFloat(typeWeight[type].toFixed(3)),
      color: getTypeColor(type)
    }))
  }

  // Procesar datos para gráfica de tendencia temporal
  const getTemporalTrendData = () => {
    if (!reportData || !reportData.entries) return []
    
    const dailyData = {}
    
    reportData.entries.forEach(entry => {
      const date = new Date(entry.date).toLocaleDateString('es-ES')
      if (!dailyData[date]) {
        dailyData[date] = { fecha: date, entradas: 0, peso: 0 }
      }
      dailyData[date].entradas += 1
      dailyData[date].peso += entry.netWeight
    })
    
    return Object.values(dailyData)
      .map(day => ({
        ...day,
        peso: parseFloat(day.peso.toFixed(3))
      }))
      .sort((a, b) => new Date(a.fecha.split('/').reverse().join('-')) - new Date(b.fecha.split('/').reverse().join('-')))
  }

  // Obtener color por tipo de residuo
  const getTypeColor = (type) => {
    switch (type) {
      case WasteType.DANGEROUS:
        return '#ef4444' // rojo
      case WasteType.RECYCLABLE:
        return '#3b82f6' // azul
      case WasteType.ORGANIC:
        return '#22c55e' // verde
      case WasteType.GENERAL:
        return '#6b7280' // gris
      default:
        return '#8b5cf6' // púrpura
    }
  }

  // Colores para las gráficas
  const CHART_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899']

  // Funciones para el modal de cambio de estado
  const openStatusModal = (entry) => {
    setSelectedEntry(entry)
    setNewStatus(entry.status)
    setStatusNotes('')
    setRejectedReason('')
    setShowStatusModal(true)
  }

  const closeStatusModal = () => {
    setShowStatusModal(false)
    setSelectedEntry(null)
    setNewStatus('')
    setStatusNotes('')
    setRejectedReason('')
  }

  const handleStatusUpdate = async () => {
    if (!selectedEntry || !newStatus) return

    setIsUpdatingStatus(true)
    
    try {
      const result = await dataService.updateEntryStatus(
        selectedEntry.id,
        newStatus,
        statusNotes || null,
        newStatus === 'rejected' ? rejectedReason : null
      )

      // Actualizar la entrada en los datos del reporte
      if (reportData) {
        const updatedEntries = reportData.entries.map(entry => 
          entry.id === selectedEntry.id 
            ? { ...entry, status: getStatusDisplayName(newStatus) }
            : entry
        )
        setReportData({
          ...reportData,
          entries: updatedEntries
        })
      }

      closeStatusModal()
      alert(result.message || 'Estado actualizado exitosamente')
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      alert(error.message || 'Error al actualizar estado')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Obtener nombre de estado para mostrar
  const getStatusDisplayName = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'processing': return 'En Proceso'
      case 'completed': return 'Procesado'
      case 'rejected': return 'Rechazado'
      default: return status
    }
  }

  // Verificar si el usuario puede cambiar estados
  const canManageEntries = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return ['admin', 'user'].includes(user.role) // user role incluye operadores
  }

  return (
    <div className={styles.container}>
      {/* Header móvil */}
      <div className={styles.mobileHeader}>
        <div className={styles.mobileHeaderContent}>
          <h1 className={styles.mobileTitle}>Reportes</h1>
          <button
            onClick={onToggleSidebar}
            className={styles.mobileMenuButton}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.contentWrapper}>
          
          {/* Header */}
          <div className={styles.desktopHeader}>
            <h1 className={styles.desktopTitle}>Módulo de Reportes</h1>
            <p className={styles.desktopSubtitle}>Análisis y reportes de gestión de residuos</p>
          </div>

          {/* Filtros */}
          <div className={styles.filtersCard}>
            <h2 className={styles.filtersTitle}>
              <Filter size={20} />
              Filtros de Búsqueda
            </h2>
            
            <div className={styles.filtersGrid}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Fecha Desde</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className={styles.filterInput}
                />
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Fecha Hasta</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className={styles.filterInput}
                />
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Tipo de Residuo</label>
                <select
                  value={filters.wasteType}
                  onChange={(e) => handleFilterChange('wasteType', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">Todos los tipos</option>
                  {Object.values(WasteType).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Empresa Transportista</label>
                <input
                  type="text"
                  value={filters.transporterCompany}
                  onChange={(e) => handleFilterChange('transporterCompany', e.target.value)}
                  className={styles.filterInput}
                  placeholder="Buscar empresa..."
                />
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">Todos los estados</option>
                  <option value="Procesado">Procesado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Rechazado">Rechazado</option>
                </select>
              </div>
            </div>

            <div className={styles.filtersActions}>
              <button
                onClick={handleClearFilters}
                className={styles.clearButton}
              >
                <RefreshCw size={16} />
                Limpiar
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={isLoading}
                className={styles.generateButton}
              >
                <BarChart3 size={16} />
                {isLoading ? "Generando..." : "Generar Reporte"}
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className={styles.errorContainer}>
              <div className={styles.errorContent}>
                <AlertTriangle className={styles.errorIcon} size={24} />
                <div className={styles.errorText}>
                  <h3 className={styles.errorTitle}>Error al generar reporte</h3>
                  <p className={styles.errorMessage}>{error}</p>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className={styles.errorCloseButton}
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <span className={styles.loadingText}>Generando reporte...</span>
            </div>
          )}

          {/* Resumen */}
          {reportData && (
            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryContent}>
                  <div className={styles.summaryInfo}>
                    <p className={styles.summaryLabel}>Total Entradas</p>
                    <p className={styles.summaryValue}>{reportData.summary.totalEntries}</p>
                  </div>
                  <div className={`${styles.summaryIcon} ${styles.iconBlue}`}>
                    <Truck size={24} />
                  </div>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.summaryContent}>
                  <div className={styles.summaryInfo}>
                    <p className={styles.summaryLabel}>Peso Total</p>
                    <p className={styles.summaryValue}>{reportData.summary.totalWeight} t</p>
                  </div>
                  <div className={`${styles.summaryIcon} ${styles.iconGreen}`}>
                    <Scale size={24} />
                  </div>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.summaryContent}>
                  <div className={styles.summaryInfo}>
                    <p className={styles.summaryLabel}>Peso Promedio</p>
                    <p className={styles.summaryValue}>{reportData.summary.averageWeight} t</p>
                  </div>
                  <div className={`${styles.summaryIcon} ${styles.iconYellow}`}>
                    <TrendingUp size={24} />
                  </div>
                </div>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.summaryContent}>
                  <div className={styles.summaryInfo}>
                    <p className={styles.summaryLabel}>Residuos Peligrosos</p>
                    <p className={styles.summaryValue}>{reportData.summary.dangerousWaste}</p>
                  </div>
                  <div className={`${styles.summaryIcon} ${styles.iconRed}`}>
                    <AlertTriangle size={24} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gráficos */}
          {reportData && (
            <div className={styles.chartsGrid}>
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Distribución por Tipo de Residuo</h3>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getWasteTypeDistributionData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="tipo" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        yAxisId="left"
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Peso (t)', angle: -90, position: 'insideLeft' }}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right"
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Entradas', angle: 90, position: 'insideRight' }}
                      />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'peso' ? `${value} t` : value,
                          name === 'peso' ? 'Peso Total' : 'Número de Entradas'
                        ]}
                        labelFormatter={(label) => `Tipo: ${label}`}
                      />
                      <Legend />
                      <Bar 
                        yAxisId="left"
                        dataKey="peso" 
                        fill="#3b82f6" 
                        name="Peso (t)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        yAxisId="right"
                        dataKey="entradas" 
                        fill="#22c55e" 
                        name="Entradas"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Tendencia Temporal</h3>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getTemporalTrendData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="fecha" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        yAxisId="left"
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Peso (t)', angle: -90, position: 'insideLeft' }}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right"
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Entradas', angle: 90, position: 'insideRight' }}
                      />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'peso' ? `${value} t` : value,
                          name === 'peso' ? 'Peso Total' : 'Número de Entradas'
                        ]}
                        labelFormatter={(label) => `Fecha: ${label}`}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="peso" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        name="Peso (t)"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="entradas" 
                        stroke="#22c55e" 
                        strokeWidth={3}
                        dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                        name="Entradas"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Tabla de Datos */}
          {reportData && (
            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <h3 className={styles.tableTitle}>Detalle de Entradas</h3>
                <div className={styles.tableActions}>
                  <button 
                    className={styles.tableButton}
                    onClick={() => handleExportReport('pdf')}
                  >
                    <FileText size={14} />
                    PDF
                  </button>
                  <button 
                    className={styles.tableButton}
                    onClick={() => handleExportReport('excel')}
                  >
                    <Download size={14} />
                    Excel
                  </button>
                  <button 
                    className={styles.tableButton}
                    onClick={() => window.print()}
                  >
                    <Printer size={14} />
                    Imprimir
                  </button>
                </div>
              </div>

              <div className={styles.tableContent}>
                <table className={styles.table}>
                  <thead className={styles.tableHead}>
                    <tr>
                      <th className={styles.tableHeadCell}>Fecha</th>
                      <th className={styles.tableHeadCell}>Placa</th>
                      <th className={styles.tableHeadCell}>Empresa</th>
                      <th className={styles.tableHeadCell}>Tipo</th>
                      <th className={styles.tableHeadCell}>Peso Neto (t)</th>
                      <th className={styles.tableHeadCell}>Estado</th>
                      <th className={styles.tableHeadCell}>Operador</th>
                      <th className={styles.tableHeadCell}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody className={styles.tableBody}>
                    {reportData.entries.map((entry) => (
                      <tr key={entry.id} className={styles.tableRow}>
                        <td className={styles.tableCell}>
                          {new Date(entry.date).toLocaleDateString('es-ES')}
                        </td>
                        <td className={styles.tableCell}>{entry.transporterPlate}</td>
                        <td className={styles.tableCell}>{entry.transporterCompany}</td>
                        <td className={styles.tableCell}>
                          <span className={getWasteTypeBadgeClass(entry.wasteType)}>
                            {entry.wasteType}
                          </span>
                        </td>
                        <td className={`${styles.tableCell} ${styles.tableCellRight}`}>
                          {entry.netWeight} t
                        </td>
                        <td className={styles.tableCell}>
                          <span className={`${styles.statusBadge} ${getStatusBadgeClass(entry.status)}`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className={styles.tableCell}>{entry.operator}</td>
                        <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                          {canManageEntries() ? (
                            <button 
                              className={styles.tableButton}
                              onClick={() => openStatusModal(entry)}
                            >
                              <Eye size={14} />
                              Cambiar Estado
                            </button>
                          ) : (
                            <button className={styles.tableButton}>
                              <Eye size={14} />
                              Ver
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!hasGenerated && !isLoading && !error && (
            <div className={styles.emptyState}>
              <FileText className={styles.emptyIcon} size={64} />
              <h3 className={styles.emptyTitle}>No hay reportes generados</h3>
              <p className={styles.emptyDescription}>
                Configure los filtros y haga clic en "Generar Reporte" para ver los datos
              </p>
              <button 
                onClick={handleGenerateReport}
                className={styles.emptyAction}
              >
                Generar Primer Reporte
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Modal de cambio de estado */}
      {showStatusModal && (
        <div className={styles.statusModal}>
          <div className={styles.statusModalContent}>
            <h2 className={styles.statusModalTitle}>
              Cambiar Estado - {selectedEntry?.transporterPlate}
            </h2>
            
            <div className={styles.statusField}>
              <label className={styles.statusLabel}>Estado:</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className={styles.statusSelect}
              >
                <option value="">Seleccionar estado</option>
                <option value="pending">Pendiente</option>
                <option value="processing">En Proceso</option>
                <option value="completed">Procesado</option>
                <option value="rejected">Rechazado</option>
              </select>
            </div>

            <div className={styles.statusField}>
              <label className={styles.statusLabel}>Notas (opcional):</label>
              <textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Agregar notas sobre el cambio de estado..."
                className={styles.statusNotes}
              />
            </div>

            {newStatus === 'rejected' && (
              <div className={styles.statusField}>
                <label className={styles.statusLabel}>Razón de Rechazo *:</label>
                <input
                  type="text"
                  value={rejectedReason}
                  onChange={(e) => setRejectedReason(e.target.value)}
                  placeholder="Especificar razón del rechazo..."
                  className={styles.statusReason}
                  required
                />
              </div>
            )}

            <div className={styles.statusActions}>
              <button
                onClick={closeStatusModal}
                className={styles.statusCancel}
              >
                Cancelar
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdatingStatus || !newStatus || (newStatus === 'rejected' && !rejectedReason)}
                className={styles.statusUpdate}
              >
                {isUpdatingStatus ? "Actualizando..." : "Actualizar Estado"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 