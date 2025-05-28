import { useState, useEffect } from "react"
import { AuthService } from "../services/AuthService.js"
import { LogIn, Eye, Info, AlertCircle, CheckCircle } from "lucide-react"
import styles from "../styles/Login.module.css"

export const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [backendStatus, setBackendStatus] = useState("checking") // checking, online, offline
  const authService = AuthService.getInstance()

  // Verificar estado del backend al cargar
  useEffect(() => {
    checkBackendStatus()
  }, [])

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/health')
      if (response.ok) {
        setBackendStatus("online")
      } else {
        setBackendStatus("offline")
      }
    } catch (error) {
      setBackendStatus("offline")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log(` Intentando login con: ${username}`)
      
      const result = await authService.login(username, password)
      
      if (result.success && result.user) {
        console.log(` Login exitoso para: ${result.user.fullName}`)
        onLogin(result.user)
      } else {
        console.log(` Login fallido: ${result.error}`)
        setError(result.error || "Error en el inicio de sesión")
      }
    } catch (err) {
      console.error(' Error inesperado:', err)
      setError("Error inesperado durante el inicio de sesión")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setError("")
    setIsLoading(true)
    
    try {
      console.log(' Intentando login como invitado')
      
      const result = await authService.login("invitado", "guest123")
      
      if (result.success && result.user) {
        console.log(` Login como invitado exitoso`)
        onLogin(result.user)
      } else {
        console.log(` Login como invitado fallido: ${result.error}`)
        setError(result.error || "Error al iniciar sesión como invitado")
      }
    } catch (err) {
      console.error(' Error en login de invitado:', err)
      setError("Error al iniciar sesión como invitado")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value)
    if (error) setError("") // Limpiar error al escribir
  }

  const handleQuickLogin = async (testUsername, testPassword) => {
    setUsername(testUsername)
    setPassword(testPassword)
    setError("")
    setIsLoading(true)

    try {
      const result = await authService.login(testUsername, testPassword)
      
      if (result.success && result.user) {
        onLogin(result.user)
      } else {
        setError(result.error || "Error en el inicio de sesión")
      }
    } catch (err) {
      setError("Error inesperado durante el inicio de sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Sistema RAEE</h1>
          <p className={styles.subtitle}>Relleno Sanitario - Iniciar Sesión</p>
          
          {/* Estado del backend */}
          <div className={styles.backendStatus}>
            {backendStatus === "checking" && (
              <div className={styles.statusChecking}>
                <div className={styles.spinner}></div>
                Verificando conexión...
              </div>
            )}
            {backendStatus === "online" && (
              <div className={styles.statusOnline}>
                <CheckCircle size={16} />
                Backend conectado
              </div>
            )}
            {backendStatus === "offline" && (
              <div className={styles.statusOffline}>
                <AlertCircle size={16} />
                Backend desconectado - Verifique que esté ejecutándose en puerto 5000
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={handleInputChange(setUsername)}
              className={styles.input}
              placeholder="Ingrese su usuario"
              disabled={isLoading || backendStatus === "offline"}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={handleInputChange(setPassword)}
              className={styles.input}
              placeholder="Ingrese su contraseña"
              disabled={isLoading || backendStatus === "offline"}
              required
            />
          </div>

          {error && (
            <div className={styles.error}>
              <AlertCircle size={16} />
              <div className={styles.errorText}>{error}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || backendStatus === "offline"}
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            <LogIn size={20} />
            {isLoading ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className={styles.divider}>
          <button
            onClick={handleGuestLogin}
            disabled={isLoading || backendStatus === "offline"}
            className={`${styles.button} ${styles.buttonSecondary}`}
          >
            <Eye size={20} />
            Acceso como Invitado
          </button>
        </div>

        {/* Información de usuarios de prueba */}
        <div className={styles.infoBox}>
          <div className={styles.infoCard}>
            <div className={styles.infoContent}>
              <Info size={16} />
              <div className={styles.infoText}>
                <p className={styles.infoTitle}>Usuarios de prueba:</p>
                <div className={styles.userList}>
                  <div className={styles.userItem}>
                    <span><strong>admin</strong> / admin123 - Administrador</span>
                    <button 
                      onClick={() => handleQuickLogin("admin", "admin123")}
                      disabled={isLoading || backendStatus === "offline"}
                      className={styles.quickLoginBtn}
                    >
                      Usar
                    </button>
                  </div>
                  <div className={styles.userItem}>
                    <span><strong>usuario</strong> / user123 - Usuario común</span>
                    <button 
                      onClick={() => handleQuickLogin("usuario", "user123")}
                      disabled={isLoading || backendStatus === "offline"}
                      className={styles.quickLoginBtn}
                    >
                      Usar
                    </button>
                  </div>
                  <div className={styles.userItem}>
                    <span><strong>invitado</strong> / guest123 - Solo lectura</span>
                    <button 
                      onClick={() => handleQuickLogin("invitado", "guest123")}
                      disabled={isLoading || backendStatus === "offline"}
                      className={styles.quickLoginBtn}
                    >
                      Usar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  )
} 