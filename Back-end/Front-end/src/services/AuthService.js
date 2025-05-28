import { User, UserRole } from "../models/User.js"

// Configuración del API
const API_BASE = 'http://localhost:5000/api'

export class AuthService {
  static instance = null
  currentUser = null
  token = null

  static getInstance() {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  constructor() {
    // Cargar usuario y token desde localStorage al inicializar
    this.loadFromStorage()
  }

  /**
   * Cargar datos desde localStorage
   */
  loadFromStorage() {
    try {
      const storedUser = localStorage.getItem("currentUser")
      const storedToken = localStorage.getItem("authToken")
      
      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser)
        this.currentUser = new User(userData.id, userData.username, userData.role, userData.fullName)
        this.token = storedToken
      }
    } catch (error) {
      console.error('Error al cargar datos del localStorage:', error)
      this.clearStorage()
    }
  }

  /**
   * Limpiar localStorage
   */
  clearStorage() {
    localStorage.removeItem("currentUser")
    localStorage.removeItem("authToken")
    this.currentUser = null
    this.token = null
  }

  /**
   * Login con backend real
   */
  async login(username, password) {
    try {
      console.log(` Intentando login para: ${username}`)
      
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log(` Login exitoso para: ${data.user.username}`)
        
        // Crear objeto User compatible con el frontend
        this.currentUser = new User(
          data.user.id,
          data.user.username,
          data.user.role,
          data.user.fullName
        )
        
        this.token = data.token

        // Guardar en localStorage
        localStorage.setItem("currentUser", JSON.stringify({
          id: data.user.id,
          username: data.user.username,
          role: data.user.role,
          fullName: data.user.fullName,
          email: data.user.email,
          permissions: data.user.permissions
        }))
        localStorage.setItem("authToken", data.token)

        return { 
          success: true, 
          user: this.currentUser,
          token: data.token,
          permissions: data.user.permissions
        }
      } else {
        console.log(` Login fallido: ${data.error}`)
        return { 
          success: false, 
          error: data.error || 'Error en el inicio de sesión' 
        }
      }
    } catch (error) {
      console.error(' Error de conexión:', error)
      return { 
        success: false, 
        error: 'Error de conexión con el servidor. Verifique que el backend esté ejecutándose en puerto 5000.' 
      }
    }
  }

  /**
   * Logout
   */
  async logout() {
    try {
      // Intentar notificar al backend (opcional)
      if (this.token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        })
      }
    } catch (error) {
      console.log('Error al notificar logout al backend:', error)
    } finally {
      // Limpiar datos locales
      this.clearStorage()
      console.log('👋 Logout completado')
    }
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser() {
    return this.currentUser
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated() {
    return this.currentUser !== null && this.token !== null
  }

  /**
   * Obtener token actual
   */
  getToken() {
    return this.token
  }

  /**
   * Verificar token con el backend
   */
  async verifyToken() {
    if (!this.token) {
      return false
    }

    try {
      const response = await fetch(`${API_BASE}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        return true
      } else {
        // Token inválido, limpiar datos
        this.clearStorage()
        return false
      }
    } catch (error) {
      console.error('Error al verificar token:', error)
      return false
    }
  }

  /**
   * Obtener información actualizada del usuario
   */
  async refreshUserInfo() {
    if (!this.token) {
      return null
    }

    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        // Actualizar usuario actual
        this.currentUser = new User(
          data.user.id,
          data.user.username,
          data.user.role,
          data.user.fullName
        )
        
        // Actualizar localStorage
        localStorage.setItem("currentUser", JSON.stringify({
          id: data.user.id,
          username: data.user.username,
          role: data.user.role,
          fullName: data.user.fullName,
          email: data.user.email,
          permissions: data.user.permissions
        }))

        return this.currentUser
      } else {
        this.clearStorage()
        return null
      }
    } catch (error) {
      console.error('Error al actualizar información del usuario:', error)
      return null
    }
  }

  /**
   * Obtener usuarios de prueba del backend
   */
  async getAvailableUsers() {
    try {
      const response = await fetch(`${API_BASE}/auth/test-users`)
      const data = await response.json()
      
      if (data.success) {
        return data.testUsers
      } else {
        // Fallback a usuarios locales si el backend no está disponible
        return [
          { username: 'admin', role: 'admin', fullName: 'Administrador' },
          { username: 'usuario', role: 'user', fullName: 'Usuario Común' },
          { username: 'invitado', role: 'guest', fullName: 'Usuario Invitado' }
        ]
      }
    } catch (error) {
      console.error('Error al obtener usuarios de prueba:', error)
      // Fallback a usuarios locales
      return [
        { username: 'admin', role: 'admin', fullName: 'Administrador' },
        { username: 'usuario', role: 'user', fullName: 'Usuario Común' },
        { username: 'invitado', role: 'guest', fullName: 'Usuario Invitado' }
      ]
    }
  }

  /**
   * Hacer request autenticado al API
   */
  async authenticatedRequest(endpoint, options = {}) {
    if (!this.token) {
      throw new Error('No hay token de autenticación')
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config)
    
    if (response.status === 401) {
      // Token expirado o inválido
      this.clearStorage()
      throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.')
    }

    return response
  }
} 