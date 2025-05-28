import { useState, useEffect } from "react"
import { 
  Menu, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Eye,
  EyeOff,
  Save,
  X,
  Shield,
  User,
  UserCheck,
  AlertTriangle
} from "lucide-react"
import { UserRole } from "../models/User.js"
import styles from "../styles/UserManagement.module.css"

export const UserManagement = ({ onToggleSidebar }) => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState("create") // "create" | "edit"
  const [selectedUser, setSelectedUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  // Estado del formulario
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    role: UserRole.USER,
    password: "",
    confirmPassword: ""
  })

  const [formErrors, setFormErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  // Datos simulados de usuarios
  const mockUsers = [
    {
      id: "1",
      username: "admin",
      fullName: "Administrador Principal",
      email: "admin@raee.com",
      role: UserRole.ADMIN,
      createdAt: "2024-01-01",
      lastLogin: "2024-01-15",
      status: "active"
    },
    {
      id: "2",
      username: "operador1",
      fullName: "Juan Pérez",
      email: "juan.perez@raee.com",
      role: UserRole.USER,
      createdAt: "2024-01-05",
      lastLogin: "2024-01-14",
      status: "active"
    },
    {
      id: "3",
      username: "operador2",
      fullName: "María García",
      email: "maria.garcia@raee.com",
      role: UserRole.USER,
      createdAt: "2024-01-08",
      lastLogin: "2024-01-13",
      status: "active"
    },
    {
      id: "4",
      username: "supervisor",
      fullName: "Carlos Rodríguez",
      email: "carlos.rodriguez@raee.com",
      role: UserRole.USER,
      createdAt: "2024-01-10",
      lastLogin: "2024-01-12",
      status: "active"
    },
    {
      id: "5",
      username: "invitado",
      fullName: "Usuario Invitado",
      email: "invitado@raee.com",
      role: UserRole.GUEST,
      createdAt: "2024-01-12",
      lastLogin: "2024-01-14",
      status: "inactive"
    }
  ]

  useEffect(() => {
    // Simular carga de usuarios
    setIsLoading(true)
    setTimeout(() => {
      setUsers(mockUsers)
      setFilteredUsers(mockUsers)
      setIsLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    // Filtrar usuarios
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedRole) {
      filtered = filtered.filter(user => user.role === selectedRole)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, selectedRole])

  const handleCreateUser = () => {
    setModalMode("create")
    setSelectedUser(null)
    setFormData({
      username: "",
      fullName: "",
      email: "",
      role: UserRole.USER,
      password: "",
      confirmPassword: ""
    })
    setFormErrors({})
    setIsModalOpen(true)
  }

  const handleEditUser = (user) => {
    setModalMode("edit")
    setSelectedUser(user)
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      password: "",
      confirmPassword: ""
    })
    setFormErrors({})
    setIsModalOpen(true)
  }

  const handleDeleteUser = (userId) => {
    setShowDeleteConfirm(userId)
  }

  const confirmDelete = () => {
    const userId = showDeleteConfirm
    setUsers(prev => prev.filter(user => user.id !== userId))
    setShowDeleteConfirm(null)
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.username.trim()) {
      errors.username = "El nombre de usuario es requerido"
    } else if (formData.username.length < 3) {
      errors.username = "El nombre de usuario debe tener al menos 3 caracteres"
    }

    if (!formData.fullName.trim()) {
      errors.fullName = "El nombre completo es requerido"
    }

    if (!formData.email.trim()) {
      errors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "El email no es válido"
    }

    if (modalMode === "create" || formData.password) {
      if (!formData.password) {
        errors.password = "La contraseña es requerida"
      } else if (formData.password.length < 6) {
        errors.password = "La contraseña debe tener al menos 6 caracteres"
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden"
      }
    }

    // Verificar username único
    const existingUser = users.find(user => 
      user.username === formData.username && 
      (modalMode === "create" || user.id !== selectedUser?.id)
    )
    if (existingUser) {
      errors.username = "Este nombre de usuario ya existe"
    }

    // Verificar email único
    const existingEmail = users.find(user => 
      user.email === formData.email && 
      (modalMode === "create" || user.id !== selectedUser?.id)
    )
    if (existingEmail) {
      errors.email = "Este email ya está registrado"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500))

      if (modalMode === "create") {
        const newUser = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString().split('T')[0],
          lastLogin: null,
          status: "active"
        }
        setUsers(prev => [...prev, newUser])
      } else {
        setUsers(prev => prev.map(user => 
          user.id === selectedUser.id 
            ? { ...user, ...formData, password: undefined, confirmPassword: undefined }
            : user
        ))
      }

      setIsModalOpen(false)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Shield size={16} className={styles.roleIconAdmin} />
      case UserRole.USER:
        return <UserCheck size={16} className={styles.roleIconUser} />
      case UserRole.GUEST:
        return <User size={16} className={styles.roleIconGuest} />
      default:
        return <User size={16} />
    }
  }

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case UserRole.ADMIN:
        return styles.roleAdmin
      case UserRole.USER:
        return styles.roleUser
      case UserRole.GUEST:
        return styles.roleGuest
      default:
        return styles.roleUser
    }
  }

  const getStatusBadgeClass = (status) => {
    return status === "active" ? styles.statusActive : styles.statusInactive
  }

  const getUserStats = () => {
    const total = users.length
    const admins = users.filter(u => u.role === UserRole.ADMIN).length
    const regularUsers = users.filter(u => u.role === UserRole.USER).length
    const guests = users.filter(u => u.role === UserRole.GUEST).length
    const active = users.filter(u => u.status === "active").length

    return { total, admins, regularUsers, guests, active }
  }

  const stats = getUserStats()

  return (
    <div className={styles.container}>
      {/* Header móvil */}
      <div className={styles.mobileHeader}>
        <div className={styles.mobileHeaderContent}>
          <h1 className={styles.mobileTitle}>Gestión de Usuarios</h1>
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
            <div>
              <h1 className={styles.desktopTitle}>Gestión de Usuarios</h1>
              <p className={styles.desktopSubtitle}>Administración de cuentas y permisos del sistema</p>
            </div>
            <button
              onClick={handleCreateUser}
              className={styles.createButton}
            >
              <Plus size={20} />
              Nuevo Usuario
            </button>
          </div>

          {/* Estadísticas */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>Total Usuarios</p>
                  <p className={styles.statValue}>{stats.total}</p>
                </div>
                <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                  <Users size={24} />
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>Administradores</p>
                  <p className={styles.statValue}>{stats.admins}</p>
                </div>
                <div className={`${styles.statIcon} ${styles.iconRed}`}>
                  <Shield size={24} />
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>Usuarios Regulares</p>
                  <p className={styles.statValue}>{stats.regularUsers}</p>
                </div>
                <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                  <UserCheck size={24} />
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>Usuarios Activos</p>
                  <p className={styles.statValue}>{stats.active}</p>
                </div>
                <div className={`${styles.statIcon} ${styles.iconYellow}`}>
                  <User size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className={styles.filtersCard}>
            <div className={styles.filtersContent}>
              <div className={styles.searchGroup}>
                <div className={styles.searchContainer}>
                  <Search size={20} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
              </div>

              <div className={styles.filterGroup}>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">Todos los roles</option>
                  <option value={UserRole.ADMIN}>Administrador</option>
                  <option value={UserRole.USER}>Usuario</option>
                  <option value={UserRole.GUEST}>Invitado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabla de usuarios */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h3 className={styles.tableTitle}>Lista de Usuarios</h3>
              <span className={styles.tableCount}>
                {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''}
              </span>
            </div>

            {isLoading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <span className={styles.loadingText}>Cargando usuarios...</span>
              </div>
            ) : (
              <div className={styles.tableContent}>
                <table className={styles.table}>
                  <thead className={styles.tableHead}>
                    <tr>
                      <th className={styles.tableHeadCell}>Usuario</th>
                      <th className={styles.tableHeadCell}>Rol</th>
                      <th className={styles.tableHeadCell}>Email</th>
                      <th className={styles.tableHeadCell}>Estado</th>
                      <th className={styles.tableHeadCell}>Último Acceso</th>
                      <th className={styles.tableHeadCell}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody className={styles.tableBody}>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className={styles.tableRow}>
                        <td className={styles.tableCell}>
                          <div className={styles.userInfo}>
                            <div className={styles.userAvatar}>
                              {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                              <p className={styles.userFullName}>{user.fullName}</p>
                              <p className={styles.userUsername}>@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className={styles.tableCell}>
                          <span className={`${styles.roleBadge} ${getRoleBadgeClass(user.role)}`}>
                            {getRoleIcon(user.role)}
                            {user.role}
                          </span>
                        </td>
                        <td className={styles.tableCell}>{user.email}</td>
                        <td className={styles.tableCell}>
                          <span className={`${styles.statusBadge} ${getStatusBadgeClass(user.status)}`}>
                            {user.status === "active" ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className={styles.tableCell}>
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('es-ES') : "Nunca"}
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.actionButtons}>
                            <button
                              onClick={() => handleEditUser(user)}
                              className={styles.editButton}
                              title="Editar usuario"
                            >
                              <Edit size={16} />
                            </button>
                            {user.username !== "admin" && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className={styles.deleteButton}
                                title="Eliminar usuario"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredUsers.length === 0 && (
                  <div className={styles.emptyState}>
                    <Users className={styles.emptyIcon} size={64} />
                    <h3 className={styles.emptyTitle}>No se encontraron usuarios</h3>
                    <p className={styles.emptyDescription}>
                      {searchTerm || selectedRole 
                        ? "Intenta ajustar los filtros de búsqueda"
                        : "Aún no hay usuarios registrados en el sistema"
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modal de crear/editar usuario */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modalMode === "create" ? "Crear Nuevo Usuario" : "Editar Usuario"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className={styles.modalCloseButton}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nombre de Usuario</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className={`${styles.formInput} ${formErrors.username ? styles.formInputError : ''}`}
                    placeholder="Ej: juan.perez"
                  />
                  {formErrors.username && (
                    <span className={styles.formError}>{formErrors.username}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nombre Completo</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className={`${styles.formInput} ${formErrors.fullName ? styles.formInputError : ''}`}
                    placeholder="Ej: Juan Pérez"
                  />
                  {formErrors.fullName && (
                    <span className={styles.formError}>{formErrors.fullName}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`${styles.formInput} ${formErrors.email ? styles.formInputError : ''}`}
                    placeholder="Ej: juan.perez@raee.com"
                  />
                  {formErrors.email && (
                    <span className={styles.formError}>{formErrors.email}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Rol</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className={styles.formSelect}
                  >
                    <option value={UserRole.USER}>Usuario</option>
                    <option value={UserRole.ADMIN}>Administrador</option>
                    <option value={UserRole.GUEST}>Invitado</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {modalMode === "create" ? "Contraseña" : "Nueva Contraseña (opcional)"}
                  </label>
                  <div className={styles.passwordContainer}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className={`${styles.formInput} ${formErrors.password ? styles.formInputError : ''}`}
                      placeholder={modalMode === "create" ? "Mínimo 6 caracteres" : "Dejar vacío para mantener actual"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.passwordToggle}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <span className={styles.formError}>{formErrors.password}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Confirmar Contraseña</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`${styles.formInput} ${formErrors.confirmPassword ? styles.formInputError : ''}`}
                    placeholder="Repetir contraseña"
                  />
                  {formErrors.confirmPassword && (
                    <span className={styles.formError}>{formErrors.confirmPassword}</span>
                  )}
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.cancelButton}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={styles.saveButton}
                >
                  <Save size={16} />
                  {isLoading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <div className={styles.confirmHeader}>
              <AlertTriangle className={styles.confirmIcon} size={48} />
              <h3 className={styles.confirmTitle}>Confirmar Eliminación</h3>
            </div>
            <p className={styles.confirmMessage}>
              ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
            </p>
            <div className={styles.confirmActions}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className={styles.confirmDeleteButton}
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 