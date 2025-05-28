import { useEffect } from "react"
import { LayoutDashboard, Truck, FileText, Users, Settings, LogOut, Menu, X } from "lucide-react"
import styles from "../styles/Sidebar.module.css"

export const Sidebar = ({
  user,
  activeModule,
  onModuleChange,
  onLogout,
  isCollapsed,
  onToggle,
}) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, permission: "view_dashboard" },
    { id: "processing", label: "Procesamiento", icon: <Truck size={20} />, permission: "create_entry" },
    { id: "reports", label: "Reportes", icon: <FileText size={20} />, permission: "view_reports" },
    { id: "users", label: "Usuarios", icon: <Users size={20} />, permission: "manage_users" },
    { id: "settings", label: "Configuración", icon: <Settings size={20} />, permission: "system_config" },
  ]

  const availableItems = menuItems.filter((item) => user.hasPermission(item.permission))

  // Cerrar sidebar en móvil al hacer clic en un item del menú
  const handleMenuClick = (moduleId) => {
    onModuleChange(moduleId)
    // En móvil, cerrar el sidebar después de seleccionar
    if (window.innerWidth < 768 && !isCollapsed) {
      onToggle()
    }
  }

  // Manejar escape key para cerrar sidebar en móvil
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && window.innerWidth < 768 && !isCollapsed) {
        onToggle()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isCollapsed, onToggle])

  // Prevenir scroll del body cuando el sidebar está abierto en móvil
  useEffect(() => {
    if (window.innerWidth < 768) {
      if (!isCollapsed) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'unset'
      }
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isCollapsed])

  return (
    <>
      {/* Overlay para móvil */}
      {!isCollapsed && (
        <div 
          className={styles.overlay}
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}`}>
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            {!isCollapsed && (
              <div className={styles.logoSection}>
                <div className={styles.logoIcon}>
                  <span>R</span>
                </div>
                <div>
                  <h2 className={styles.logoTitle}>RAEE System</h2>
                  <p className={styles.logoSubtitle}>Relleno Sanitario</p>
                </div>
              </div>
            )}
            <button 
              onClick={onToggle} 
              className={styles.toggleButton}
              aria-label={isCollapsed ? "Abrir menú" : "Cerrar menú"}
            >
              {isCollapsed ? (
                <Menu size={20} />
              ) : (
                <>
                  <X size={20} className={styles.visibleOnMobile} />
                  <Menu size={20} className={styles.hiddenOnMobile} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <div className={styles.navList}>
            {availableItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`${styles.navItem} ${activeModule === item.id ? styles.navItemActive : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className={styles.navIcon}>
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <span className={styles.navLabel}>{item.label}</span>
                )}
                
                {/* Indicador activo cuando collapsed */}
                {isCollapsed && activeModule === item.id && (
                  <div className={styles.activeIndicator} />
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* User info y logout - Pegado al fondo */}
        <div className={styles.footer}>
          {!isCollapsed && (
            <div className={styles.userInfo}>
              <div className={styles.userContent}>
                <div className={styles.userAvatar}>
                  <span className={styles.userAvatarText}>
                    {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div className={styles.userDetails}>
                  <p className={styles.userName}>{user.fullName}</p>
                  <p className={styles.userRole}>{user.role}</p>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={onLogout}
            className={styles.logoutButton}
            title={isCollapsed ? "Cerrar Sesión" : undefined}
          >
            <LogOut size={20} className={styles.logoutIcon} />
            {!isCollapsed && <span className={styles.logoutText}>Cerrar Sesión</span>}
          </button>
        </div>
      </div>
    </>
  )
} 