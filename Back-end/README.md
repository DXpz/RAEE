# 🌱 RAEE Backend API

Backend completo para el Sistema de Gestión de Relleno Sanitario RAEE, desarrollado con Node.js, Express, MongoDB Atlas y programación orientada a objetos. Sistema completamente funcional con datos reales, autenticación JWT, gestión de imágenes y conversión total a toneladas.

## 🚀 Características Principales

- **Arquitectura Orientada a Objetos**: Clases y servicios bien estructurados
- **Base de Datos**: MongoDB Atlas con Mongoose ODM
- **Autenticación**: JWT con roles y permisos granulares
- **API RESTful**: Endpoints completos para todas las funcionalidades
- **Gestión de Imágenes**: Upload y servido de comprobantes de pesaje
- **Sistema de Toneladas**: Conversión completa del sistema a toneladas
- **Cambio de Estados**: Funcionalidad completa para gestionar estados de entradas
- **Seguridad**: Helmet, CORS, Rate Limiting
- **Validación**: Validación robusta de datos con límites en toneladas
- **Logging**: Morgan para logging de requests
- **Seeding**: Script para poblar la base de datos con datos realistas

## 📋 Requisitos Previos

- Node.js >= 18.0.0
- MongoDB Atlas (cuenta gratuita)
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio y navegar al backend**:
```bash
cd Back-end
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
```bash
cp env.example .env
```

4. **Editar el archivo `.env`** con tus configuraciones:
```env
# Configuración del Servidor
PORT=5000
NODE_ENV=development

# Base de Datos MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/raee_db?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

5. **Crear directorio de uploads**:
```bash
mkdir uploads
```

6. **Poblar la base de datos con datos de prueba**:
```bash
npm run seed
```

7. **Iniciar el servidor**:
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🏗️ Arquitectura

### Estructura de Directorios

```
Back-end/
├── src/
│   ├── config/          # Configuraciones (DB, etc.)
│   ├── controllers/     # Controladores de rutas
│   │   ├── AuthController.js
│   │   └── DataController.js
│   ├── middleware/      # Middlewares personalizados
│   │   ├── auth.js
│   │   ├── permissions.js
│   │   └── upload.js
│   ├── models/          # Modelos de Mongoose
│   │   ├── User.js
│   │   ├── WasteEntry.js
│   │   ├── Alert.js
│   │   └── EnvironmentalIndicator.js
│   ├── routes/          # Definición de rutas
│   │   ├── auth.js
│   │   └── data.js
│   ├── services/        # Lógica de negocio
│   │   ├── AuthService.js
│   │   └── DataService.js
│   ├── scripts/         # Scripts utilitarios
│   │   └── seedDatabase.js
│   └── server.js        # Servidor principal
├── uploads/             # Directorio para imágenes
├── package.json
├── .env.example
└── README.md
```

### Modelos de Datos

#### User (Usuario)
- **Roles**: `guest`, `user`, `admin`
- **Campos**: username, password, fullName, role, email, isActive
- **Métodos**: comparePassword, hasPermission, canAccessModule
- **Permisos**: Sistema granular de permisos por rol

#### WasteEntry (Entrada de Residuos)
- **Tipos**: Peligroso, Reciclable, Orgánico, General
- **Campos**: transporterPlate, company, weights (en toneladas), wasteType, zone, status
- **Estados**: pending, processing, completed, rejected
- **Virtuals**: netWeight, formattedWeight (en toneladas)
- **Validaciones**: Máximo 100 toneladas por entrada
- **Imágenes**: Soporte para comprobantes de pesaje

#### Alert (Alertas)
- **Tipos**: capacity, incident, environmental, maintenance, security
- **Prioridades**: low, medium, high, critical
- **Campos**: type, priority, title, message, zone, isActive

#### EnvironmentalIndicator (Indicadores Ambientales)
- **Tipos**: methane, ph_leachate, temperature, humidity, air_quality, noise_level
- **Campos**: name, type, value, unit, status, thresholds

## 🔐 Autenticación y Autorización

### Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **Guest** | view_dashboard |
| **User** | view_dashboard, create_entry, view_reports, manage_entries |
| **Admin** | view_dashboard, create_entry, view_reports, manage_users, system_config, manage_entries |

### Usuarios de Prueba

Después de ejecutar `npm run seed`, tendrás estos usuarios disponibles:

| Username | Password | Rol | Descripción |
|----------|----------|-----|-------------|
| `admin` | `admin123` | Admin | Administrador del sistema |
| `usuario` | `user123` | User | Usuario operador |
| `invitado` | `guest123` | Guest | Usuario invitado |
| `operador1` | `op123` | User | Juan Pérez |
| `operador2` | `op123` | User | María García |

## 📡 API Endpoints

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| POST | `/login` | Login de usuario | Público |
| POST | `/logout` | Logout de usuario | Privado |
| GET | `/me` | Información del usuario actual | Privado |
| POST | `/register` | Registrar nuevo usuario | Admin |
| PUT | `/change-password` | Cambiar contraseña | Privado |
| GET | `/users` | Obtener todos los usuarios | Admin |
| PUT | `/users/:id/deactivate` | Desactivar usuario | Admin |
| GET | `/verify` | Verificar token | Privado |
| GET | `/test-users` | Usuarios de prueba | Público |
| GET | `/health` | Health check | Público |

### Datos (`/api/data`)

| Método | Endpoint | Descripción | Permiso |
|--------|----------|-------------|---------|
| GET | `/dashboard` | Datos completos del dashboard | view_dashboard |
| GET | `/weekly-waste` | Residuos semanales | view_dashboard |
| GET | `/monthly` | Datos mensuales | view_dashboard |
| GET | `/waste-distribution` | Distribución por tipo | view_dashboard |
| GET | `/capacity` | Capacidad por zona | view_dashboard |
| GET | `/environmental` | Indicadores ambientales | view_dashboard |
| GET | `/alerts` | Alertas activas | view_dashboard |
| GET | `/recent-entries` | Entradas recientes | view_dashboard |
| GET | `/today-stats` | Estadísticas de hoy | view_dashboard |
| POST | `/waste-entry` | Crear entrada de residuos | create_entry |
| GET | `/reports` | Reportes por fechas | view_reports |
| GET | `/stats-summary` | Resumen de estadísticas | view_dashboard |
| PUT | `/entry/:entryId/status` | Actualizar estado de entrada | manage_entries |
| GET | `/entry/:entryId/history` | Historial de entrada | manage_entries |

### Gestión de Imágenes

| Método | Endpoint | Descripción | Permiso |
|--------|----------|-------------|---------|
| POST | `/upload-image` | Subir imagen de comprobante | create_entry |
| GET | `/uploads/:filename` | Servir imagen estática | Público |

## 🔧 Servicios

### AuthService
- Manejo de autenticación JWT
- Validación de credenciales
- Gestión de usuarios y permisos
- Verificación de roles
- Registro de usuarios

### DataService
- Lógica de negocio para el dashboard
- Estadísticas y reportes en toneladas
- Gestión de entradas de residuos
- Cálculos de capacidad y distribución
- Cambio de estados de entradas
- Gestión de historial de cambios

## 🖼️ Sistema de Imágenes

### Configuración de Multer
- **Directorio**: `/uploads`
- **Tipos permitidos**: JPG, JPEG, PNG, GIF
- **Tamaño máximo**: 5MB
- **Naming**: Timestamp + nombre original

### Servido de Archivos Estáticos
```javascript
app.use('/uploads', express.static('uploads'))
```

### URLs de Imágenes
```
http://localhost:5000/uploads/1640995200000-comprobante.jpg
```

## ⚖️ Sistema de Toneladas

### Conversión Completa
- **Entrada de datos**: Directamente en toneladas
- **Validaciones**: Máximo 100 toneladas por entrada
- **Almacenamiento**: Valores en toneladas en la base de datos
- **Cálculos**: Todos los cálculos en toneladas
- **Visualización**: Formato limpio sin ceros innecesarios

### Validaciones de Peso
```javascript
grossWeight: {
  type: Number,
  required: true,
  min: [0.001, 'El peso bruto debe ser mayor a 0'],
  max: [100, 'El peso bruto no puede exceder 100 toneladas']
}
```

## 🔄 Sistema de Estados

### Estados de Entradas
- **pending**: Pendiente de procesamiento
- **processing**: En proceso
- **completed**: Procesado completamente
- **rejected**: Rechazado

### Cambio de Estados
- **Permisos**: Usuarios con `manage_entries`
- **Validaciones**: Estado válido y razón de rechazo
- **Historial**: Registro de cambios con usuario y fecha
- **Notificaciones**: Mensajes de confirmación

## 🛡️ Seguridad

- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configuración de origen cruzado
- **Rate Limiting**: Limitación de requests por IP
- **JWT**: Tokens seguros para autenticación
- **Bcrypt**: Hashing seguro de contraseñas
- **Validación**: Validación robusta de entrada de datos
- **Multer**: Validación de archivos subidos

## 📊 Monitoreo

### Health Check
```bash
GET /health
```

Respuesta:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "database": "connected",
  "version": "1.0.0"
}
```

### Logging
- **Morgan**: Logging de requests HTTP
- **Console**: Logs estructurados con emojis
- **Errores**: Manejo completo de errores con stack traces

## 🚀 Despliegue

### Variables de Entorno de Producción
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=super_secure_secret_for_production
FRONTEND_URL=https://your-frontend-domain.com
```

### Comandos de Producción
```bash
npm run build
npm start
```

## 🧪 Testing

### Usuarios de Prueba
```bash
npm run test-users
```

### Scripts de Debug
```bash
node debug-users.js
node test-auth-service.js
```

## 📝 Logs y Debug

### Estructura de Logs
```
🚀 Servidor RAEE Backend ejecutándose en puerto 5000
📊 Dashboard API: http://localhost:5000/api
🔍 Health Check: http://localhost:5000/health
✅ Conectado a MongoDB Atlas
🔐 Auth Request: POST /api/auth/login
✅ Login exitoso para admin (admin)
```

### Debug de Autenticación
- Logs de intentos de login
- Verificación de tokens
- Errores de permisos
- Registro de usuarios

## 🔧 Mantenimiento

### Seeding de Datos
```bash
npm run seed
```

### Backup de Base de Datos
```bash
mongodump --uri="mongodb+srv://..."
```

### Limpieza de Uploads
```bash
# Limpiar archivos antiguos
find uploads/ -type f -mtime +30 -delete
```

## 📚 Documentación Adicional

- **FRONTEND_INTEGRATION.md**: Guía de integración con el frontend
- **API.md**: Documentación completa de la API
- **DEPLOYMENT.md**: Guía de despliegue en producción

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

- **Backend Developer**: Sistema RAEE
- **Database Design**: MongoDB Atlas
- **API Design**: RESTful Architecture

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

---

**RAEE Backend API** - Sistema de Gestión de Relleno Sanitario 🌱 