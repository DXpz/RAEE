# 🔗 Integración Frontend - Backend RAEE

## 📊 Estado del Backend

✅ **Servidor**: Funcionando en `http://localhost:5000`  
✅ **Base de datos**: MongoDB Atlas conectada  
✅ **Usuarios**: 5 usuarios de prueba creados  
✅ **Validación**: Endpoints probados y funcionando  

## 🔐 Endpoint de Login Mejorado

### **POST** `/api/auth/login`

**URL**: `http://localhost:5000/api/auth/login`

#### Request:
```javascript
{
  "username": "admin",
  "password": "admin123"
}
```

#### Response Exitoso (200):
```javascript
{
  "success": true,
  "message": "Login exitoso",
  "user": {
    "id": "64f123...",
    "username": "admin",
    "fullName": "Administrador del Sistema",
    "role": "admin",
    "email": "admin@raee.com",
    "lastLogin": "2024-05-27T22:30:00.000Z",
    "permissions": ["view_dashboard", "create_entry", "view_reports", "manage_users", "system_config"]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "7d",
  "timestamp": "2024-05-27T22:30:00.000Z"
}
```

#### Response Error (401):
```javascript
{
  "success": false,
  "error": "Contraseña incorrecta",
  "timestamp": "2024-05-27T22:30:00.000Z"
}
```

## 👥 Usuarios de Prueba

| Username | Password | Rol | Descripción |
|----------|----------|-----|-------------|
| `admin` | `admin123` | admin | Administrador completo |
| `usuario` | `user123` | user | Usuario operador |
| `invitado` | `guest123` | guest | Solo lectura |
| `operador1` | `op123` | user | Juan Pérez |
| `operador2` | `op123` | user | María García |

## 🛡️ Otros Endpoints Importantes

### **GET** `/api/auth/me`
Obtener información del usuario actual.

**Headers**: `Authorization: Bearer <token>`

**Response**:
```javascript
{
  "success": true,
  "user": {
    "id": "64f123...",
    "username": "admin",
    "fullName": "Administrador del Sistema",
    "role": "admin",
    "email": "admin@raee.com",
    "lastLogin": "2024-05-27T22:30:00.000Z",
    "permissions": ["view_dashboard", "create_entry", "view_reports", "manage_users", "system_config"],
    "modules": ["dashboard", "processing", "reports", "users", "settings"]
  },
  "timestamp": "2024-05-27T22:30:00.000Z"
}
```

### **GET** `/api/auth/verify`
Verificar si el token es válido.

**Headers**: `Authorization: Bearer <token>`

### **POST** `/api/auth/logout`
Cerrar sesión (invalidar token del lado cliente).

**Headers**: `Authorization: Bearer <token>`

### **GET** `/api/auth/health`
Health check del servicio de autenticación.

**Response**:
```javascript
{
  "success": true,
  "service": "Authentication Service",
  "status": "healthy",
  "timestamp": "2024-05-27T22:30:00.000Z",
  "version": "1.0.0"
}
```

## 🎨 Código de Ejemplo para React

### Hook de Autenticación
```javascript
// hooks/useAuth.js
import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const getCurrentUser = async () => {
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        return data.user;
      } else {
        logout(); // Token inválido
        return null;
      }
    } catch (error) {
      logout();
      return null;
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      // Verificar que el token siga siendo válido
      getCurrentUser();
    }
  }, []);

  return {
    user,
    token,
    loading,
    login,
    logout,
    getCurrentUser,
    isAuthenticated: !!user,
    hasPermission: (permission) => user?.permissions?.includes(permission) || false,
    hasRole: (role) => user?.role === role
  };
};
```

### Componente de Login
```javascript
// components/Login.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(credentials.username, credentials.password);
    
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Iniciar Sesión - Sistema RAEE</h2>
      
      {error && <div className="error">{error}</div>}
      
      <input
        type="text"
        placeholder="Usuario"
        value={credentials.username}
        onChange={(e) => setCredentials({...credentials, username: e.target.value})}
        required
      />
      
      <input
        type="password"
        placeholder="Contraseña"
        value={credentials.password}
        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
      </button>

      <div className="test-users">
        <h4>Usuarios de Prueba:</h4>
        <ul>
          <li><strong>admin</strong> / admin123 (Administrador)</li>
          <li><strong>usuario</strong> / user123 (Usuario)</li>
          <li><strong>invitado</strong> / guest123 (Invitado)</li>
        </ul>
      </div>
    </form>
  );
};

export default Login;
```

### Protección de Rutas
```javascript
// components/ProtectedRoute.jsx
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, requiredRole, requiredPermission }) => {
  const { isAuthenticated, hasRole, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <div>Debes iniciar sesión</div>;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <div>No tienes permisos para acceder a esta página</div>;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <div>No tienes los permisos necesarios</div>;
  }

  return children;
};

export default ProtectedRoute;
```

## 🚀 Pasos para Integrar

### 1. **Configurar Variables de Entorno en tu Frontend**
```javascript
// .env.local o .env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Sistema RAEE
```

### 2. **Configurar CORS (ya configurado en el backend)**
El backend ya tiene CORS configurado para `http://localhost:5173` (Vite default).

### 3. **Implementar Interceptores de Fetch**
```javascript
// utils/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (response.status === 401) {
    // Token expirado o inválido
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return response;
};
```

## 📊 Permisos por Rol

| Rol | Permisos |
|-----|----------|
| **guest** | `view_dashboard` |
| **user** | `view_dashboard`, `create_entry`, `view_reports` |
| **admin** | `view_dashboard`, `create_entry`, `view_reports`, `manage_users`, `system_config` |

## 🔧 Comandos para Desarrollo

```bash
# Iniciar backend
cd Back-end
node start-server.js

# Probar endpoints
node test-frontend-login.js

# Recrear usuarios
node create-users.js

# Ver usuarios en base de datos
node test-login.js
```

## ✅ Checklist de Integración

- [x] Backend funcionando en puerto 5000
- [x] MongoDB Atlas conectado
- [x] Usuarios de prueba creados
- [x] Endpoint de login validado
- [x] Tokens JWT funcionando
- [x] Middleware de autenticación activo
- [x] CORS configurado
- [x] Health checks funcionando
- [ ] Frontend conectado al backend
- [ ] Login implementado en React
- [ ] Protección de rutas implementada
- [ ] Manejo de estados de autenticación

## 🎯 Siguiente Paso

**Implementar el hook `useAuth` en tu frontend React** y conectar el componente de login al endpoint `/api/auth/login`. 