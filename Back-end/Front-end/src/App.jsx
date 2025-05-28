import { useState, useEffect } from "react"
import { AuthService } from "./services/AuthService.js"
import { Login } from "./components/Login.jsx"
import { Sidebar } from "./components/Sidebar.jsx"
import { Dashboard } from "./components/Dashboard.jsx"
import { ProcessingModule } from "./components/ProcessingModule.jsx"
import { Reports } from "./components/Reports.jsx"
import { UserManagement } from "./components/UserManagement.jsx"

function App() {
  const [user, setUser] = useState(null)
  const [activeModule, setActiveModule] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const authService = AuthService.getInstance()

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
  }, [authService])

  // Inicializar sidebar colapsado en móvil
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true)
      }
    }

    // Ejecutar al cargar
    handleResize()
    
    // Escuchar cambios de tamaño
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser)
  }

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    setActiveModule("dashboard")
  }

  const handleModuleChange = (module) => {
    if (user?.canAccessModule(module)) {
      setActiveModule(module)
    }
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard onToggleSidebar={toggleSidebar} />
      case "processing":
        return <ProcessingModule onToggleSidebar={toggleSidebar} />
      case "reports":
        return <Reports onToggleSidebar={toggleSidebar} />
      case "users":
        return <UserManagement onToggleSidebar={toggleSidebar} />
      case "settings":
        return (
          <div className="flex-1 bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-800">Configuración del Sistema</h1>
              <p className="text-gray-600 mt-2">En desarrollo...</p>
            </div>
          </div>
        )
      default:
        return <Dashboard onToggleSidebar={toggleSidebar} />
    }
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        user={user}
        activeModule={activeModule}
        onModuleChange={handleModuleChange}
        onLogout={handleLogout}
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />
      
      {/* Contenido principal con padding para el sidebar */}
      <div className={`
        transition-all duration-300 min-h-screen
        ${sidebarCollapsed 
          ? 'md:pl-16 pl-0' 
          : 'md:pl-64 pl-0'
        }
      `}>
        {renderModule()}
      </div>
    </div>
  )
}

export default App 