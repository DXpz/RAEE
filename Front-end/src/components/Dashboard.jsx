import { useState, useEffect } from "react"
import { 
  Menu, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Activity, 
  Zap, 
  Truck, 
  Calendar, 
  Clock, 
  Weight,
  ImageIcon,
  Camera,
  Upload,
  FileText,
  Scale,
  Clipboard
} from "lucide-react"
import { DataService } from "../services/DataService.js"
import styles from "../styles/Dashboard.module.css"

export const Dashboard = ({ onToggleSidebar }) => {
  const [dashboardData, setDashboardData] = useState(null)
  const [monthlyData, setMonthlyData] = useState([])
  const [wasteDistribution, setWasteDistribution] = useState([])
  const [capacityByZone, setCapacityByZone] = useState([])
  const [recentEntries, setRecentEntries] = useState([])
  const [todayStats, setTodayStats] = useState(null)
  const [environmentalIndicators, setEnvironmentalIndicators] = useState([])
  const [alerts, setAlerts] = useState([])
  const [wasteReceived, setWasteReceived] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const dataService = DataService.getInstance()

  useEffect(() => {
    // Solo cargar datos del backend, no usar datos locales
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Verificar si hay token antes de hacer las llamadas
      const token = dataService.getAuthToken()
      
      if (!token) {
        setError('No hay token de autenticación. Por favor, inicie sesión.')
        setLoading(false)
        return
      }
      
      console.log(' Cargando datos del backend...')

      // Cargar todos los datos de forma paralela
      const [
        dashboard,
        monthly,
        wasteDistr,
        capacity,
        recent,
        today,
        environmental,
        alertsData,
        weeklyWaste
      ] = await Promise.allSettled([
        dataService.getDashboardData(),
        dataService.getMonthlyData(),
        dataService.getWasteTypeDistribution(),
        dataService.getCapacityByZone(),
        dataService.getRecentEntries(3),
        dataService.getTodayStats(),
        dataService.getEnvironmentalIndicators(),
        dataService.getActiveAlerts(),
        dataService.getWeeklyWasteData()
      ])

      // Procesar resultados - solo usar datos válidos del backend
      if (dashboard.status === 'fulfilled' && dashboard.value) {
        setDashboardData(dashboard.value)
        console.log(' Dashboard data actualizado desde backend')
      } else {
        console.warn(' No se pudieron cargar datos del dashboard:', dashboard.reason)
        setDashboardData(null)
      }

      if (monthly.status === 'fulfilled' && monthly.value) {
        setMonthlyData(monthly.value)
        console.log(' Datos mensuales actualizados desde backend')
      } else {
        console.warn(' No se pudieron cargar datos mensuales:', monthly.reason)
        setMonthlyData([])
      }

      if (wasteDistr.status === 'fulfilled' && wasteDistr.value) {
        setWasteDistribution(wasteDistr.value)
        console.log(' Distribución de residuos actualizada desde backend')
      } else {
        console.warn(' No se pudo cargar distribución de residuos:', wasteDistr.reason)
        setWasteDistribution([])
      }

      if (capacity.status === 'fulfilled' && capacity.value) {
        setCapacityByZone(capacity.value)
        console.log(' Capacidad por zona actualizada desde backend')
      } else {
        console.warn(' No se pudo cargar capacidad por zona:', capacity.reason)
        setCapacityByZone([])
      }

      if (recent.status === 'fulfilled' && recent.value) {
        setRecentEntries(recent.value)
        console.log('Entradas recientes actualizadas desde backend')
      } else {
        console.warn(' No se pudieron cargar entradas recientes:', recent.reason)
        setRecentEntries([])
      }

      if (today.status === 'fulfilled' && today.value) {
        setTodayStats(today.value)
        console.log(' Estadísticas de hoy actualizadas desde backend')
      } else {
        console.warn(' No se pudieron cargar estadísticas de hoy:', today.reason)
        setTodayStats(null)
      }

      if (environmental.status === 'fulfilled' && environmental.value) {
        setEnvironmentalIndicators(environmental.value)
        console.log(' Indicadores ambientales actualizados desde backend')
      } else {
        console.warn(' No se pudieron cargar indicadores ambientales:', environmental.reason)
        setEnvironmentalIndicators([])
      }

      if (alertsData.status === 'fulfilled' && alertsData.value) {
        setAlerts(alertsData.value)
        console.log(' Alertas actualizadas desde backend')
      } else {
        console.warn(' No se pudieron cargar alertas:', alertsData.reason)
        setAlerts([])
      }

      if (weeklyWaste.status === 'fulfilled' && weeklyWaste.value) {
        setWasteReceived(weeklyWaste.value)
        console.log(' Datos semanales actualizados desde backend')
      } else {
        console.warn(' No se pudieron cargar datos semanales:', weeklyWaste.reason)
        setWasteReceived([])
      }

      console.log(' Carga de datos del backend completada')
      
    } catch (error) {
      console.error(' Error al cargar datos del backend:', error.message)
      setError('Error al conectar con el servidor. Verifique su conexión.')
      
      // Limpiar todos los datos si hay error
      setDashboardData(null)
      setMonthlyData([])
      setWasteDistribution([])
      setCapacityByZone([])
      setRecentEntries([])
      setTodayStats(null)
      setEnvironmentalIndicators([])
      setAlerts([])
      setWasteReceived([])
    } finally {
      setLoading(false)
    }
  }

  // Datos calculados dinámicamente desde entradas reales
  const latestEntry = recentEntries && recentEntries.length > 0 ? recentEntries[0] : null
  
  const latestDangerousEntry = latestEntry ? {
    id: latestEntry._id,
    category: latestEntry.category || 'No especificada',
    wasteType: latestEntry.wasteType || 'No especificado',
    transporterPlate: latestEntry.transporterPlate || 'No especificada',
    transporterCompany: latestEntry.transporterCompany || 'No especificada',
    formattedWeight: `${parseFloat((latestEntry.grossWeight || 0).toFixed(3))} / ${parseFloat((latestEntry.tareWeight || 0).toFixed(3))} t`,
    netWeight: parseFloat((latestEntry.netWeight || (latestEntry.grossWeight - latestEntry.tareWeight) || 0).toFixed(3)),
    date: latestEntry.createdAt ? new Date(latestEntry.createdAt).toLocaleDateString() : 'Fecha no disponible',
    receiptPhoto: latestEntry.receiptPhoto || null
  } : null

  // Debug: Mostrar información de la última entrada
  console.log('🔍 Dashboard Debug - Latest Entry:', latestEntry)
  console.log('🔍 Dashboard Debug - Latest Dangerous Entry:', latestDangerousEntry)
  if (latestDangerousEntry?.receiptPhoto) {
    const imageUrl = `http://localhost:5000${latestDangerousEntry.receiptPhoto}`
    console.log('📸 Dashboard Debug - Receipt Photo Path:', latestDangerousEntry.receiptPhoto)
    console.log('📸 Dashboard Debug - Full Image URL:', imageUrl)
  }

  const days = ["L", "M", "X", "J", "V", "S", "D"]

  const getZoneProgressClass = (percentage) => {
    if (percentage > 85) return styles.progressRed
    if (percentage > 70) return styles.progressYellow
    return styles.progressGreen
  }

  const getZoneStatusClass = (percentage) => {
    if (percentage > 85) return styles.statusCriticalBg
    if (percentage > 70) return styles.statusWarningBg
    return styles.statusNormalBg
  }

  const getZoneStatusText = (percentage) => {
    if (percentage > 85) return "Crítico"
    if (percentage > 70) return "Alerta"
    return "Normal"
  }

  const getAlertClass = (priority) => {
    switch (priority) {
      case "high": return styles.alertHigh
      case "medium": return styles.alertMedium
      default: return styles.alertLow
    }
  }

  const getAlertIconClass = (priority) => {
    switch (priority) {
      case "high": return styles.alertIconHigh
      case "medium": return styles.alertIconMedium
      default: return styles.alertIconLow
    }
  }

  const getAlertPriorityClass = (priority) => {
    switch (priority) {
      case "high": return styles.priorityHigh
      case "medium": return styles.priorityMedium
      default: return styles.priorityLow
    }
  }

  const getAlertPriorityText = (priority) => {
    switch (priority) {
      case "high": return "Alta"
      case "medium": return "Media"
      default: return "Baja"
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingPulse}>
            <div className={styles.loadingTitle}></div>
            <div className={styles.loadingGrid}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.loadingCard}>
                  <div className={`${styles.loadingBar} ${styles.loadingBarShort}`}></div>
                  <div className={`${styles.loadingBar} ${styles.loadingBarMedium}`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Mostrar error si existe */}
      {error && (
        <div className={styles.errorBanner}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button 
            onClick={onToggleSidebar} 
            className={styles.menuButton}
          >
            <Menu size={20} />
          </button>
          <h1 className={styles.title}>Dashboard RAEE</h1>
        </div>
        <div className={styles.dateText}>
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </header>

      <div className={styles.content}>
        {/* Estadísticas del Día */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <p className={styles.statLabel}>Entradas Hoy</p>
                <p className={styles.statValue}>{todayStats?.totalEntries || 0}</p>
              </div>
              <Truck className={`${styles.statIcon} ${styles.iconBlue}`} />
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <p className={styles.statLabel}>Toneladas Hoy</p>
                <p className={styles.statValue}>{todayStats?.totalTonnage || 0}</p>
              </div>
              <Weight className={`${styles.statIcon} ${styles.iconGreen}`} />
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <p className={styles.statLabel}>Peso Promedio</p>
                <p className={styles.statValue}>{todayStats?.averageWeight || 0}t</p>
              </div>
              <Calendar className={`${styles.statIcon} ${styles.iconPurple}`} />
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <p className={styles.statLabel}>Hora Pico</p>
                <p className={styles.statValue}>{todayStats?.peakHour || "--:--"}</p>
              </div>
              <Clock className={`${styles.statIcon} ${styles.iconOrange}`} />
            </div>
          </div>
        </div>

        <div className={styles.mainGrid}>
          {/* Resumen Operativo */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Resumen Operativo</h2>

            {/* Residuos Recibidos Chart */}
            <div className={styles.chartContainer}>
              <h3 className={styles.cardSubtitle}>
                Residuos Recibidos (Semanal)
              </h3>
              <div className={styles.weeklyChart}>
                {wasteReceived && wasteReceived.length > 0 ? wasteReceived.map((value, index) => {
                  const maxValue = Math.max(...wasteReceived) || 1;
                  return (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        className={styles.chartBar}
                        style={{ height: `${(value / maxValue) * 100}%` }}
                      ></div>
                      <span className={styles.chartDay}>{days[index]}</span>
                    </div>
                  )
                }) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    No hay datos semanales disponibles
                  </div>
                )}
              </div>
            </div>

            {/* Indicadores Ambientales */}
            <div className={styles.indicatorsGrid}>
              {environmentalIndicators && environmentalIndicators.length > 0 ? environmentalIndicators.slice(0, 2).map((indicator, index) => (
                <div key={index} className={styles.indicator}>
                  <h4 className={styles.indicatorTitle}>
                    {indicator.name}
                  </h4>
                  <div className={styles.indicatorContent}>
                    <span className={styles.indicatorValue}>
                      {indicator.value}{indicator.unit}
                    </span>
                    {indicator.status === 'normal' && <TrendingUp className={`${styles.indicatorIcon} ${styles.statusNormal}`} />}
                    {indicator.status === 'warning' && <AlertTriangle className={`${styles.indicatorIcon} ${styles.statusWarning}`} />}
                  </div>
                </div>
              )) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No hay indicadores ambientales disponibles
                </div>
              )}
            </div>

            {/* Toneladas Procesadas vs. Capacidad Máxima */}
            <div className={styles.capacityContainer}>
              <h3 className={styles.cardSubtitle}>
                Toneladas Procesadas vs. Capacidad Máxima
              </h3>
              {dashboardData ? (
                <>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${dashboardData.capacityPercentage || 0}%` }}
                    ></div>
                  </div>
                  <div className={styles.progressLabels}>
                    <span>{dashboardData.processedTonnes || 0} toneladas</span>
                    <span>{dashboardData.maxCapacity || 0} toneladas</span>
                  </div>
                  <div className={styles.progressCenter}>
                    {(dashboardData.capacityPercentage || 0).toFixed(1)}% de capacidad utilizada
                  </div>
                </>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No hay datos de capacidad disponibles
                </div>
              )}
            </div>
          </div>

          {/* Procesamiento de Residuos */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Procesamiento de Residuos</h2>

            <div className={styles.entrySection}>
              <div>
                <h3 className={styles.cardSubtitle}>Última Entrada Registrada</h3>

                {latestDangerousEntry ? (
                  <div className={styles.entrySection}>
                    <div className={`${styles.entryCard} ${styles.entryCardBlue}`}>
                      <h4 className={styles.entryTitle}>Datos del Transportista</h4>
                      <p className={styles.entryValue}>
                        {latestDangerousEntry.transporterPlate} - {latestDangerousEntry.transporterCompany}
                      </p>
                    </div>

                    <div className={`${styles.entryCard} ${styles.entryCardGreen}`}>
                      <h4 className={styles.entryTitle}>Peso Bruto/Tara</h4>
                      <p className={styles.entryValue}>{latestDangerousEntry.formattedWeight}</p>
                      <div className={styles.entryWeightInfo}>
                        <span className={styles.weightLabel}>Peso Neto:</span>
                        <span className={styles.weightValue}>{latestDangerousEntry.netWeight} t</span>
                      </div>
                    </div>

                    <div className={`${styles.entryCard} ${styles.entryCardRed}`}>
                      <h4 className={styles.entryTitle}>Tipo de Residuo</h4>
                      <p className={styles.entryValue}>{latestDangerousEntry.wasteType}</p>
                    </div>

                    {/* Comprobante de Pesaje - Última Entrada */}
                    <div className={`${styles.entryCard} ${styles.entryCardGray}`}>
                      <h4 className={styles.entryTitle}>
                        Comprobante de Pesaje - Última Entrada
                        <span className={styles.entrySubtext} style={{display: 'block', marginTop: '0.25rem'}}>
                          {latestDangerousEntry.date}
                        </span>
                      </h4>
                      
                      {/* Foto del último registro */}
                      {latestDangerousEntry.receiptPhoto ? (
                        <div className={styles.photosDisplayGrid}>
                          <div className={styles.photoDisplayItem}>
                            <div className={styles.photoContainer}>
                              <img 
                                src={`http://localhost:5000${latestDangerousEntry.receiptPhoto}`}
                                alt="Comprobante de pesaje" 
                                className={styles.photoDisplay}
                                style={{
                                  width: '100%',
                                  height: '280px',
                                  objectFit: 'contain',
                                  borderRadius: '8px',
                                  border: '2px solid #e5e7eb',
                                  backgroundColor: '#f9fafb'
                                }}
                                onLoad={(e) => {
                                  console.log(' Imagen cargada correctamente:', e.target.src)
                                  console.log('Dimensiones:', e.target.naturalWidth, 'x', e.target.naturalHeight)
                                }}
                                onError={(e) => {
                                  console.error(' Error al cargar imagen:', e.target.src)
                                  console.error(' Error event:', e)
                                  e.target.style.display = 'none'
                                  const placeholder = e.target.nextElementSibling
                                  if (placeholder) {
                                    placeholder.style.display = 'flex'
                                  }
                                }}
                              />
                              <div className={styles.photoPlaceholder} style={{display: 'none', height: '280px'}}>
                                <Scale 
                                  size={32} 
                                  style={{color: '#3b82f6'}} 
                                />
                                <p style={{marginTop: '8px', fontSize: '12px', color: '#666'}}>
                                  Error al cargar imagen
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                          <FileText size={32} style={{ margin: '0 auto 10px', display: 'block' }} />
                          No hay comprobante de imagen para esta entrada
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                    <Clipboard size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.5 }} />
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>No hay entradas registradas</h4>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                      Las entradas aparecerán aquí una vez que se registren en el sistema
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Distribución por Tipo de Residuo y Tendencia Mensual */}
        <div className={styles.mainGrid}>
          {/* Distribución por Tipo */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              Distribución por Tipo de Residuo
            </h2>
            <div className={styles.distributionList}>
              {wasteDistribution && wasteDistribution.length > 0 ? wasteDistribution.map((item, index) => (
                <div key={index} className={styles.distributionItem}>
                  <div className={styles.distributionLeft}>
                    <div className={`${styles.colorIndicator} ${item.colorClass || styles.colorGray}`}></div>
                    <span className={styles.distributionType}>{item.type}</span>
                  </div>
                  <div className={styles.distributionRight}>
                    <span className={styles.distributionPercentage}>{item.percentage}%</span>
                    <p className={styles.distributionTonnage}>{item.tonnage}t</p>
                  </div>
                </div>
              )) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No hay datos de distribución disponibles
                </div>
              )}
            </div>
          </div>

          {/* Tendencia Mensual */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Tendencia Mensual de Residuos</h2>
            <div className={styles.monthlyChart}>
              {monthlyData && monthlyData.length > 0 ? monthlyData.map((data, index) => {
                const maxTonnage = Math.max(...monthlyData.map((d) => d.tonnage)) || 1
                const percentage = (data.tonnage / maxTonnage) * 100
                const isHighest = data.tonnage === maxTonnage
                
                const getTrendIcon = () => {
                  switch (data.trend) {
                    case "up": return <TrendingUp size={14} style={{color: '#10b981'}} />
                    case "down": return <TrendingDown size={14} style={{color: '#ef4444'}} />
                    default: return <Minus size={14} style={{color: '#6b7280'}} />
                  }
                }

                const getTrendText = () => {
                  switch (data.trend) {
                    case "up": return "↗ Incremento"
                    case "down": return "↘ Disminución"
                    default: return "→ Estable"
                  }
                }
                
                return (
                  <div key={index} className={styles.monthlyBarContainer}>
                    <div className={styles.monthlyTooltip}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem'}}>
                        {getTrendIcon()}
                        <span>{data.month} 2024: {data.tonnage}t</span>
                      </div>
                      <div style={{fontSize: '0.625rem', opacity: 0.8}}>
                        {getTrendText()}
                        {isHighest && " • Máximo del período"}
                      </div>
                    </div>
                    <div
                      className={styles.monthlyBar}
                      style={{ 
                        height: `${Math.max(percentage, 10)}%`,
                        background: isHighest 
                          ? 'linear-gradient(to top, #059669, #10b981)' 
                          : data.trend === 'up'
                            ? 'linear-gradient(to top, #3b82f6, #60a5fa)'
                            : data.trend === 'down'
                              ? 'linear-gradient(to top, #f59e0b, #fbbf24)'
                              : 'linear-gradient(to top, #6b7280, #9ca3af)'
                      }}
                    ></div>
                    <span className={styles.monthlyLabel}>{data.month}</span>
                    <span className={styles.monthlyValue}>{data.tonnage}t</span>
                  </div>
                )
              }) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No hay datos mensuales disponibles
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Capacidad por Zona y Entradas Recientes */}
        <div className={styles.mainGrid}>
          {/* Capacidad por Zona */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Capacidad por Zona</h2>
            <div className={styles.zoneList}>
              {capacityByZone && capacityByZone.length > 0 ? capacityByZone.map((zone, index) => (
                <div key={index} className={styles.zoneItem}>
                  <div className={styles.zoneHeader}>
                    <span className={styles.zoneName}>{zone.zone}</span>
                    <span className={styles.zoneCapacity}>
                      {zone.current}/{zone.maximum}t
                    </span>
                  </div>
                  <div className={styles.zoneProgress}>
                    <div
                      className={`${styles.zoneProgressFill} ${getZoneProgressClass(zone.percentage)}`}
                      style={{ width: `${zone.percentage}%` }}
                    ></div>
                  </div>
                  <div className={styles.zoneFooter}>
                    <div className={styles.zonePercentage}>{zone.percentage}% utilizado</div>
                    <div className={`${styles.zoneStatus} ${getZoneStatusClass(zone.percentage)}`}>
                      {getZoneStatusText(zone.percentage)}
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No hay datos de capacidad por zona disponibles
                </div>
              )}
            </div>
          </div>

          {/* Entradas Recientes */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Entradas Recientes</h2>
            <div className={styles.entriesList}>
              {recentEntries.map((entry, index) => {
                const netWeightTonnes = parseFloat((entry.netWeight || (entry.grossWeight - entry.tareWeight) || 0).toFixed(3))
                return (
                  <li key={entry._id || index} className={styles.entryItem}>
                    <span className={styles.entryType}>{entry.wasteType || 'No especificado'}</span>
                    <span className={styles.entryWeight}>{netWeightTonnes} t</span>
                    <span className={styles.entryDate}>
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'Fecha no disponible'}
                    </span>
                    {entry.receiptPhoto && <span className={styles.photoIndicator}>📷 Comprobante disponible</span>}
                  </li>
                )
              })}
            </div>
          </div>
        </div>

        {/* Alertas Prioritarias */}
        {alerts && alerts.length > 0 && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Alertas Prioritarias</h2>

            <div className={styles.alertsList}>
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`${styles.alert} ${getAlertClass(alert.priority)}`}
                >
                  <AlertTriangle
                    className={`${styles.alertIcon} ${getAlertIconClass(alert.priority)}`}
                  />
                  <div className={styles.alertContent}>
                    <span className={styles.alertMessage}>{alert.message}</span>
                    <p className={styles.alertTimestamp}>{new Date(alert.timestamp).toLocaleString("es-ES")}</p>
                  </div>
                  <span
                    className={`${styles.alertPriority} ${getAlertPriorityClass(alert.priority)}`}
                  >
                    {getAlertPriorityText(alert.priority)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}