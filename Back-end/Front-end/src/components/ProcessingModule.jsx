import { useState, useEffect } from "react"
import { Menu, Truck, Scale, Calendar, Camera, Save, CheckCircle, AlertCircle, X, Edit3 } from "lucide-react"
import { DataService } from "../services/DataService.js"
import { WasteType, WasteEntry } from "../models/WasteEntry.js"
import styles from "../styles/ProcessingModule.module.css"

export const ProcessingModule = ({ onToggleSidebar }) => {
  const [recentEntries, setRecentEntries] = useState([])
  const [todayStats, setTodayStats] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImageUrl, setSelectedImageUrl] = useState('')
  const dataService = DataService.getInstance()

  // Form state
  const [formData, setFormData] = useState({
    transporterPlate: "",
    transporterCompany: "",
    grossWeight: "",
    tareWeight: "",
    wasteType: WasteType.GENERAL,
    zone: "Zona A"
  })

  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  // Estados para el modal de cambio de estado
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [statusNotes, setStatusNotes] = useState('')
  const [rejectedReason, setRejectedReason] = useState('')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    loadProcessingData()
  }, [])

  const loadProcessingData = async () => {
    try {
      setLoading(true)
      console.log(' Cargando datos del ProcessingModule...')
      
      const token = dataService.getAuthToken()
      
      if (!token) {
        console.warn(' No hay token de autenticación')
        // Cargar datos locales como fallback
        const entries = dataService.getLocalRecentEntries()
        const stats = dataService.getLocalTodayStats()
        setRecentEntries(entries.slice(0, 10))
        setTodayStats(stats)
        setLoading(false)
        return
      }

      // Cargar datos reales del backend
      const [entriesData, statsData] = await Promise.allSettled([
        dataService.getRecentEntries(10),
        dataService.getTodayStats()
      ])

      if (entriesData.status === 'fulfilled' && entriesData.value) {
        console.log(' Entradas recientes cargadas:', entriesData.value.length)
        setRecentEntries(entriesData.value)
      } else {
        console.warn(' Error cargando entradas recientes:', entriesData.reason)
        setRecentEntries([])
      }

      if (statsData.status === 'fulfilled' && statsData.value) {
        console.log(' Estadísticas de hoy cargadas:', statsData.value)
        setTodayStats(statsData.value)
      } else {
        console.warn(' Error cargando estadísticas:', statsData.reason)
        setTodayStats(null)
      }

    } catch (error) {
      console.error(' Error al cargar datos del ProcessingModule:', error)
      // Fallback a datos locales
      const entries = dataService.getLocalRecentEntries()
      const stats = dataService.getLocalTodayStats()
      setRecentEntries(entries.slice(0, 10))
      setTodayStats(stats)
    } finally {
      setLoading(false)
    }
  }

  const getWasteTypeBadgeClass = (wasteType) => {
    switch (wasteType) {
      case WasteType.DANGEROUS:
        return styles.badgeDangerous
      case WasteType.RECYCLABLE:
        return styles.badgeRecyclable
      case WasteType.ORGANIC:
        return styles.badgeOrganic
      case WasteType.GENERAL:
        return styles.badgeGeneral
      default:
        return styles.badgeGeneral
    }
  }

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedPhoto({
          file: file,
          preview: e.target.result,
          name: file.name
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setSelectedPhoto(null)
  }

  const resetForm = () => {
    setFormData({
      transporterPlate: "",
      transporterCompany: "",
      grossWeight: "",
      tareWeight: "",
      wasteType: WasteType.GENERAL,
      zone: "Zona A"
    })
    setSelectedPhoto(null)
    setMessage({ type: "", text: "" })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ type: "", text: "" })

    try {
      // Validaciones
      if (!formData.transporterPlate.trim()) {
        throw new Error("La placa del transportista es requerida")
      }
      if (!formData.transporterCompany.trim()) {
        throw new Error("La empresa transportista es requerida")
      }
      if (!formData.grossWeight || parseFloat(formData.grossWeight) <= 0) {
        throw new Error("El peso bruto debe ser mayor a 0")
      }
      if (!formData.tareWeight || parseFloat(formData.tareWeight) <= 0) {
        throw new Error("La tara debe ser mayor a 0")
      }
      if (parseFloat(formData.grossWeight) <= parseFloat(formData.tareWeight)) {
        throw new Error("El peso bruto debe ser mayor que la tara")
      }

      let receiptPhotoUrl = null

      // Subir imagen si existe
      if (selectedPhoto?.file) {
        try {
          console.log(' Subiendo imagen...')
          const uploadResult = await dataService.uploadImage(selectedPhoto.file)
          receiptPhotoUrl = uploadResult.imageUrl
          console.log(' Imagen subida:', receiptPhotoUrl)
        } catch (uploadError) {
          console.warn(' Error al subir imagen:', uploadError.message)
          // Continuar sin imagen si falla la subida
        }
      }

      // Datos de la entrada - enviando directamente en toneladas
      const entryData = {
        transporterPlate: formData.transporterPlate.trim(),
        transporterCompany: formData.transporterCompany.trim(),
        grossWeight: parseFloat(formData.grossWeight), // Directamente en toneladas
        tareWeight: parseFloat(formData.tareWeight),   // Directamente en toneladas
        wasteType: formData.wasteType,
        zone: formData.zone,
        receiptPhoto: receiptPhotoUrl,
        notes: ''
      }

      console.log(' Enviando entrada al backend (en toneladas):', entryData)

      // Crear la entrada en el backend
      const result = await dataService.createWasteEntry(entryData)

      if (result.success) {
        const netWeightTonnes = entryData.grossWeight - entryData.tareWeight
        
        setMessage({ 
          type: "success", 
          text: ` Entrada registrada exitosamente! Peso neto: ${parseFloat(netWeightTonnes.toFixed(3))} t` 
        })

        console.log(' Recargando datos después de registrar entrada...')
        
        // Recargar datos reales del backend en lugar de actualizar localmente
        await loadProcessingData()

        // Reset form después de un delay
        setTimeout(() => {
          resetForm()
          setShowModal(false)
        }, 2000)
      } else {
        throw new Error(result.error || 'Error al crear la entrada')
      }

    } catch (error) {
      console.error(' Error al registrar entrada:', error)
      setMessage({ 
        type: "error", 
        text: error.message || "Error al registrar la entrada" 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cálculo del peso neto en tiempo real (en toneladas)
  const netWeight = formData.grossWeight && formData.tareWeight 
    ? parseFloat(formData.grossWeight) - parseFloat(formData.tareWeight)
    : 0

  const openImageModal = (imageUrl) => {
    setSelectedImageUrl(imageUrl)
    setShowImageModal(true)
  }

  const closeImageModal = () => {
    setShowImageModal(false)
    setSelectedImageUrl('')
  }

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

      // Recargar datos después del cambio
      await loadProcessingData()

      closeStatusModal()
      setMessage({ 
        type: "success", 
        text: result.message || 'Estado actualizado exitosamente'
      })

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setMessage({ type: "", text: "" })
      }, 3000)
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      setMessage({ 
        type: "error", 
        text: error.message || 'Error al actualizar estado'
      })
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
    // Permitir a admin y user (que incluye operadores) cambiar estados
    return ['admin', 'user'].includes(user.role)
  }

  return (
    <div className={styles.container}>
      {/* Header móvil */}
      <div className={styles.mobileHeader}>
        <div className={styles.mobileHeaderContent}>
          <h1 className={styles.mobileTitle}>Procesamiento</h1>
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
            <h1 className={styles.desktopTitle}>Módulo de Procesamiento</h1>
            <p className={styles.desktopSubtitle}>Gestión y registro de residuos entrantes</p>
          </div>

          {/* Today's Stats */}
          {todayStats && (
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statContent}>
                  <div className={styles.statInfo}>
                    <p className={styles.statLabel}>Entradas Hoy</p>
                    <p className={styles.statValue}>{todayStats.totalEntries}</p>
                  </div>
                  <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                    <Truck size={24} />
                  </div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statContent}>
                  <div className={styles.statInfo}>
                    <p className={styles.statLabel}>Tonelaje Total</p>
                    <p className={styles.statValue}>{todayStats.totalTonnage} ton</p>
                  </div>
                  <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                    <Scale size={24} />
                  </div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statContent}>
                  <div className={styles.statInfo}>
                    <p className={styles.statLabel}>Peso Promedio</p>
                    <p className={styles.statValue}>{todayStats.averageWeight} ton</p>
                  </div>
                  <div className={`${styles.statIcon} ${styles.iconYellow}`}>
                    <Scale size={24} />
                  </div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statContent}>
                  <div className={styles.statInfo}>
                    <p className={styles.statLabel}>Hora Pico</p>
                    <p className={styles.statValue}>{todayStats.peakHour}</p>
                  </div>
                  <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                    <Calendar size={24} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Entries */}
          <div className={styles.entriesCard}>
            <div className={styles.entriesHeader}>
              <h2 className={styles.entriesTitle}>Entradas Recientes</h2>
              <button 
                className={styles.newEntryButton}
                onClick={() => setShowModal(true)}
              >
                Nueva Entrada
              </button>
            </div>
            <div className={styles.entriesContent}>
              {loading ? (
                <div className={styles.loadingState}>
                  <div className={styles.loadingSpinner}></div>
                  <p>Cargando entradas...</p>
                </div>
              ) : recentEntries && recentEntries.length > 0 ? (
                <div className={styles.entriesList}>
                  {recentEntries.map((entry) => (
                    <div key={entry.id || entry._id} className={styles.entryItem}>
                      <div className={styles.entryHeader}>
                        <div className={styles.entryCompanyInfo}>
                          <div className={styles.entryIconContainer}>
                            <Truck size={20} />
                          </div>
                          <div className={styles.entryCompanyDetails}>
                            <p className={styles.entryCompany}>{entry.transporterPlate}</p>
                            <p className={styles.entryPlate}>{entry.transporterCompany}</p>
                          </div>
                        </div>
                        <span className={`${styles.entryBadge} ${getWasteTypeBadgeClass(entry.wasteType)}`}>
                          {entry.wasteType}
                        </span>
                      </div>
                      
                      <div className={styles.entryDetails}>
                        <div className={styles.entryDetailItem}>
                          <p className={styles.entryDetailLabel}>Peso Bruto</p>
                          <p className={styles.entryDetailValue}>{parseFloat((entry.grossWeight || 0).toFixed(3))} t</p>
                        </div>
                        <div className={styles.entryDetailItem}>
                          <p className={styles.entryDetailLabel}>Peso Tara</p>
                          <p className={styles.entryDetailValue}>{parseFloat((entry.tareWeight || 0).toFixed(3))} t</p>
                        </div>
                        <div className={styles.entryDetailItem}>
                          <p className={styles.entryDetailLabel}>Peso Neto</p>
                          <p className={`${styles.entryDetailValue} ${styles.entryDetailValueGreen}`}>
                            {parseFloat((entry.netWeight || (entry.grossWeight - entry.tareWeight) || 0).toFixed(3))} t
                          </p>
                        </div>
                        <div className={styles.entryDetailItem}>
                          <p className={styles.entryDetailLabel}>Fecha/Hora</p>
                          <p className={styles.entryDetailValue}>
                            {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : 
                             entry.timestamp ? entry.timestamp.toLocaleString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      {entry.receiptPhoto && (
                        <div 
                          className={`${styles.entryPhoto} ${styles.entryPhotoClickable}`}
                          onClick={() => openImageModal(`http://localhost:5000${entry.receiptPhoto}`)}
                        >
                          <Camera size={16} />
                           Comprobante disponible
                        </div>
                      )}

                      {/* Sección de estado y acciones */}
                      <div className={styles.entryActions}>
                        <div className={styles.entryStatus}>
                          <span className={styles.entryStatusLabel}>Estado:</span>
                          <span className={`${styles.entryStatusValue} ${styles[`status${entry.status}`]}`}>
                            {getStatusDisplayName(entry.status)}
                          </span>
                          <button 
                            className={styles.entryActionButton}
                            onClick={() => openStatusModal(entry)}
                            title="Cambiar estado de la entrada"
                          >
                            <Edit3 size={14} />
                            Cambiar Estado
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <Truck className={styles.emptyIcon} size={48} />
                  <h3 className={styles.emptyTitle}>No hay entradas registradas</h3>
                  <p className={styles.emptyDescription}>
                    {dataService.getAuthToken() ? 
                      'Comience registrando una nueva entrada de residuos' : 
                      'Inicie sesión para ver las entradas registradas'}
                  </p>
                  <button 
                    className={styles.emptyButton}
                    onClick={() => setShowModal(true)}
                    disabled={!dataService.getAuthToken()}
                  >
                    <Truck size={16} />
                    Nueva Entrada
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Modal para Nueva Entrada */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                <Truck size={20} />
                Registro de Nueva Entrada
              </h2>
              <button 
                className={styles.modalCloseButton}
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {message.text && (
                <div className={message.type === "success" ? styles.successMessage : styles.errorMessage}>
                  {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Placa del Transportista</label>
                    <input
                      type="text"
                      value={formData.transporterPlate}
                      onChange={(e) => setFormData({ ...formData, transporterPlate: e.target.value })}
                      className={styles.input}
                      placeholder="ABC1234"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Empresa Transportista</label>
                    <input
                      type="text"
                      value={formData.transporterCompany}
                      onChange={(e) => setFormData({ ...formData, transporterCompany: e.target.value })}
                      className={styles.input}
                      placeholder="Transportes S.A."
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={`${styles.label} ${styles.labelWithIcon}`}>
                      <Scale size={16} />
                      Peso Bruto (t)
                    </label>
                    <input
                      type="number"
                      value={formData.grossWeight}
                      onChange={(e) => setFormData({ ...formData, grossWeight: e.target.value })}
                      className={styles.input}
                      placeholder="14.320"
                      min="0"
                      step="0.001"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={`${styles.label} ${styles.labelWithIcon}`}>
                      <Scale size={16} />
                      Tara (t)
                    </label>
                    <input
                      type="number"
                      value={formData.tareWeight}
                      onChange={(e) => setFormData({ ...formData, tareWeight: e.target.value })}
                      className={styles.input}
                      placeholder="5.620"
                      min="0"
                      step="0.001"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Tipo de Residuo</label>
                  <select
                    value={formData.wasteType}
                    onChange={(e) => setFormData({ ...formData, wasteType: e.target.value })}
                    className={styles.select}
                    disabled={isSubmitting}
                  >
                    {Object.values(WasteType).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Zona de Disposición</label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className={styles.select}
                    disabled={isSubmitting}
                  >
                    <option value="Zona A">Zona A</option>
                    <option value="Zona B">Zona B</option>
                    <option value="Zona C">Zona C</option>
                    <option value="Zona D">Zona D</option>
                  </select>
                </div>

                <div className={styles.photoUpload}>
                  <label className={`${styles.label} ${styles.labelWithIcon}`}>
                    <Camera size={16} />
                    Fotografía del Comprobante
                  </label>
                  
                  {selectedPhoto ? (
                    <div className={styles.photoPreview}>
                      <img 
                        src={selectedPhoto.preview} 
                        alt="Comprobante" 
                        className={styles.photoImage}
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className={styles.photoRemoveButton}
                      >
                        ×
                      </button>
                      <p className={styles.photoName}>{selectedPhoto.name}</p>
                    </div>
                  ) : (
                    <label className={styles.uploadArea}>
                      <Camera className={styles.uploadIcon} size={32} />
                      <p className={styles.uploadText}>Haz clic para subir una imagen</p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className={styles.hiddenInput}
                        onChange={handlePhotoUpload}
                        disabled={isSubmitting}
                      />
                    </label>
                  )}
                </div>

                {netWeight > 0 && (
                  <div className={styles.netWeightCard}>
                    <h3 className={styles.netWeightTitle}>Peso Neto Calculado</h3>
                    <p className={styles.netWeightValue}>
                      {netWeight.toFixed(3)} t
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  <Save size={20} />
                  {isSubmitting ? "Registrando..." : "Registrar Entrada"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Ver Imagen */}
      {showImageModal && (
        <div className={styles.imageModalOverlay} onClick={closeImageModal}>
          <div className={styles.imageModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.imageModalHeader}>
              <h3 className={styles.imageModalTitle}>
                <Camera size={20} />
                Comprobante de Pesaje
              </h3>
              <button 
                className={styles.imageModalCloseButton}
                onClick={closeImageModal}
              >
                <X size={24} />
              </button>
            </div>
            <div className={styles.imageModalBody}>
              <img 
                src={selectedImageUrl}
                alt="Comprobante de pesaje" 
                className={styles.imageModalImage}
                onError={(e) => {
                  console.error(' Error al cargar imagen en modal:', e.target.src)
                  e.target.style.display = 'none'
                  const errorDiv = e.target.nextElementSibling
                  if (errorDiv) {
                    errorDiv.style.display = 'flex'
                  }
                }}
              />
              <div className={styles.imageModalError} style={{display: 'none'}}>
                <Camera size={48} style={{color: '#6b7280'}} />
                <p>Error al cargar la imagen</p>
              </div>
            </div>
          </div>
        </div>
      )}

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