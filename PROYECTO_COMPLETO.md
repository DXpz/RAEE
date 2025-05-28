# 🌱 Sistema RAEE - Proyecto Completo

## 📋 Resumen del Proyecto

El Sistema RAEE (Relleno Sanitario) es una aplicación completa de gestión ambiental desarrollada desde cero con tecnologías modernas. El proyecto incluye un frontend React con JSX y CSS Modules, un backend Node.js con MongoDB Atlas, sistema completo de autenticación, gestión de imágenes, gráficas interactivas y conversión total a toneladas.

### Características Principales del Sistema
- **Frontend**: React 19 + Vite + JSX + CSS Modules
- **Backend**: Node.js + Express + MongoDB Atlas
- **Arquitectura**: Programación Orientada a Objetos
- **Base de Datos**: MongoDB Atlas con datos reales y seeding
- **Autenticación**: JWT con roles y permisos granulares
- **Gestión de Imágenes**: Upload y visualización de comprobantes
- **Sistema de Toneladas**: Conversión completa del sistema
- **Gráficas Interactivas**: Recharts para visualización de datos
- **Cambio de Estados**: Gestión completa de estados de entradas

## 🏗️ Arquitectura del Sistema

```
RAEE/
├── Front-end/          # React + Vite + JSX + CSS Modules
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   │   ├── Login.jsx           # Autenticación
│   │   │   ├── Sidebar.jsx         # Navegación
│   │   │   ├── Dashboard.jsx       # Panel principal
│   │   │   ├── ProcessingModule.jsx # Gestión de entradas
│   │   │   └── Reports.jsx         # Reportes y gráficas
│   │   ├── services/       # Servicios de API
│   │   │   ├── AuthService.js      # Autenticación JWT
│   │   │   └── DataService.js      # Comunicación con backend
│   │   ├── models/         # Modelos de datos
│   │   │   ├── User.js
│   │   │   ├── WasteEntry.js
│   │   │   └── Dashboard.js
│   │   ├── styles/         # CSS Modules
│   │   │   ├── Login.module.css
│   │   │   ├── Dashboard.module.css
│   │   │   ├── ProcessingModule.module.css
│   │   │   └── Reports.module.css
│   │   └── assets/         # Recursos estáticos
│   ├── package.json
│   └── README.md
│
└── Back-end/           # Node.js + Express + MongoDB
    ├── src/
    │   ├── models/         # Modelos Mongoose
    │   │   ├── User.js             # Usuario con roles
    │   │   ├── WasteEntry.js       # Entradas de residuos
    │   │   ├── Alert.js            # Sistema de alertas
    │   │   └── EnvironmentalIndicator.js
    │   ├── controllers/    # Controladores
    │   │   ├── AuthController.js   # Autenticación
    │   │   └── DataController.js   # Datos y operaciones
    │   ├── services/       # Lógica de negocio
    │   │   ├── AuthService.js      # Servicios de auth
    │   │   └── DataService.js      # Servicios de datos
    │   ├── routes/         # Rutas de API
    │   │   ├── auth.js             # Rutas de autenticación
    │   │   └── data.js             # Rutas de datos
    │   ├── middleware/     # Middlewares
    │   │   ├── auth.js             # Autenticación JWT
    │   │   ├── permissions.js      # Control de permisos
    │   │   └── upload.js           # Upload de imágenes
    │   ├── config/         # Configuraciones
    │   ├── utils/          # Utilidades
    │   └── scripts/        # Scripts de seeding
    ├── uploads/            # Directorio de imágenes
    ├── package.json
    └── README.md
```

## 🚀 Características Implementadas

### Frontend (React + JSX + CSS Modules)
- ✅ **Dashboard Interactivo**: Gráficos y estadísticas en tiempo real con datos reales
- ✅ **Sistema de Login**: Autenticación JWT con roles (Guest, User, Admin)
- ✅ **Módulo de Procesamiento**: Registro completo de entradas de residuos
- ✅ **Módulo de Reportes**: Análisis con gráficas interactivas (Recharts)
- ✅ **Sidebar Responsivo**: Navegación adaptativa para móviles y desktop
- ✅ **CSS Modules**: Estilos modulares y encapsulados
- ✅ **Gestión de Imágenes**: Upload y visualización de comprobantes de pesaje
- ✅ **Sistema de Toneladas**: Conversión completa con formato limpio
- ✅ **Cambio de Estados**: Gestión de estados de entradas con modal
- ✅ **Responsive Design**: Adaptativo para todos los dispositivos
- ✅ **Gráficas Interactivas**: Barras y líneas con datos reales
- ✅ **Manejo de Errores**: Estados de error y fallbacks

### Backend (Node.js + Express + MongoDB)
- ✅ **API RESTful Completa**: Endpoints para todas las funcionalidades
- ✅ **Autenticación JWT**: Tokens seguros con roles y permisos granulares
- ✅ **Base de Datos MongoDB**: Modelos optimizados con Mongoose ODM
- ✅ **Programación Orientada a Objetos**: Clases y servicios estructurados
- ✅ **Middleware de Seguridad**: Helmet, CORS, Rate Limiting
- ✅ **Validación de Datos**: Validación robusta en modelos y servicios
- ✅ **Seeding de Datos**: Script para poblar con datos realistas
- ✅ **Manejo de Errores**: Sistema completo de manejo de errores
- ✅ **Gestión de Imágenes**: Upload con Multer y servido estático
- ✅ **Sistema de Toneladas**: Validaciones y cálculos en toneladas
- ✅ **Cambio de Estados**: API para gestionar estados de entradas
- ✅ **Logging Completo**: Logs estructurados con Morgan

## 🔐 Sistema de Autenticación

### Roles y Permisos

| Rol | Permisos | Descripción |
|-----|----------|-------------|
| **Guest** | `view_dashboard` | Solo visualización del dashboard |
| **User** | `view_dashboard`, `create_entry`, `view_reports`, `manage_entries` | Operador completo del sistema |
| **Admin** | Todos los permisos + `manage_users`, `system_config` | Administrador completo |

### Usuarios de Prueba

| Username | Password | Rol | Descripción |
|----------|----------|-----|-------------|
| `admin` | `admin123` | Admin | Administrador del sistema |
| `usuario` | `user123` | User | Usuario operador |
| `invitado` | `guest123` | Guest | Usuario invitado |
| `operador1` | `op123` | User | Juan Pérez |
| `operador2` | `op123` | User | María García |

## 📊 Modelos de Datos

### User (Usuario)
```javascript
{
  username: String,      // Único, 3-20 caracteres
  password: String,      // Hasheado con bcrypt
  fullName: String,      // Nombre completo
  role: String,          // guest, user, admin
  email: String,         // Email opcional
  isActive: Boolean,     // Estado del usuario
  lastLogin: Date        // Último acceso
}
```

### WasteEntry (Entrada de Residuos)
```javascript
{
  transporterPlate: String,    // Placa del vehículo
  transporterCompany: String,  // Empresa transportista
  grossWeight: Number,         // Peso bruto (toneladas)
  tareWeight: Number,          // Peso tara (toneladas)
  wasteType: String,          // Tipo de residuo
  zone: String,               // Zona de disposición
  status: String,             // pending, processing, completed, rejected
  operatorId: ObjectId,       // Referencia al operador
  receiptPhoto: String,       // URL de la foto del comprobante
  notes: String,              // Observaciones
  rejectedReason: String,     // Razón de rechazo (si aplica)
  processedAt: Date,          // Fecha de procesamiento
  processedBy: ObjectId       // Usuario que procesó
}
```

### Alert (Alertas)
```javascript
{
  type: String,        // capacity, incident, environmental, maintenance, security
  priority: String,    // low, medium, high, critical
  title: String,       // Título de la alerta
  message: String,     // Mensaje descriptivo
  zone: String,        // Zona afectada
  isActive: Boolean,   // Estado de la alerta
  createdBy: ObjectId  // Usuario que creó la alerta
}
```

### EnvironmentalIndicator (Indicadores Ambientales)
```javascript
{
  name: String,           // Nombre del indicador
  type: String,           // methane, ph_leachate, temperature, humidity, air_quality, noise_level
  value: Number,          // Valor medido
  unit: String,           // Unidad de medida
  status: String,         // normal, warning, critical
  thresholds: Object,     // Umbrales de alerta
  zone: String,           // Zona de medición
  recordedBy: ObjectId    // Usuario que registró
}
```

## 🌐 API Endpoints

### Autenticación (`/api/auth`)
- `POST /login` - Login de usuario con JWT
- `GET /me` - Información del usuario actual
- `POST /register` - Registrar usuario (Solo Admin)
- `PUT /change-password` - Cambiar contraseña
- `GET /users` - Listar usuarios (Solo Admin)
- `GET /test-users` - Usuarios de prueba
- `GET /health` - Health check del servicio

### Datos (`/api/data`)
- `GET /dashboard` - Datos completos del dashboard
- `GET /weekly-waste` - Residuos semanales
- `GET /monthly` - Datos mensuales
- `GET /waste-distribution` - Distribución por tipo
- `GET /capacity` - Capacidad por zona
- `GET /environmental` - Indicadores ambientales
- `GET /alerts` - Alertas activas
- `POST /waste-entry` - Crear entrada de residuos
- `GET /reports` - Reportes por fechas con filtros
- `GET /recent-entries` - Entradas recientes
- `GET /today-stats` - Estadísticas del día
- `PUT /entry/:entryId/status` - Cambiar estado de entrada
- `GET /entry/:entryId/history` - Historial de entrada

### Gestión de Imágenes
- `POST /upload-image` - Subir imagen de comprobante
- `GET /uploads/:filename` - Servir imagen estática

## 🛠️ Instalación y Configuración

### 1. Requisitos Previos
```bash
# Verificar versiones
node --version  # >= 18.0.0
npm --version   # >= 8.0.0
```

### 2. Configuración del Backend

```bash
# Navegar al backend
cd Back-end

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env
# Editar .env con tu MongoDB URI

# Crear directorio de uploads
mkdir uploads

# Poblar base de datos con datos de prueba
npm run seed

# Iniciar servidor de desarrollo
npm run dev
```

**Configuración de MongoDB Atlas:**
1. Crear cuenta gratuita en MongoDB Atlas
2. Crear cluster M0 (gratuito)
3. Configurar usuario y contraseña
4. Obtener connection string
5. Agregar IP a whitelist

### 3. Configuración del Frontend

```bash
# Navegar al frontend
cd Front-end

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

**URLs del Sistema:**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## 🎨 Tecnologías Utilizadas

### Frontend
- **React 19.1.0**: Biblioteca de UI con JSX
- **Vite 6.3.5**: Build tool y dev server
- **CSS Modules**: Estilos encapsulados
- **Lucide React**: Iconografía moderna
- **Recharts**: Gráficas interactivas
- **ESLint**: Linting de código

### Backend
- **Node.js**: Runtime de JavaScript
- **Express**: Framework web
- **MongoDB**: Base de datos NoSQL
- **Mongoose**: ODM para MongoDB
- **JWT**: Autenticación con tokens
- **Bcrypt**: Hashing de contraseñas
- **Multer**: Upload de archivos
- **Morgan**: Logging de requests
- **Helmet**: Seguridad HTTP
- **CORS**: Cross-Origin Resource Sharing

## 🖼️ Sistema de Imágenes

### Características
- **Upload**: Comprobantes de pesaje hasta 5MB
- **Formatos**: JPG, JPEG, PNG, GIF
- **Storage**: Directorio local `/uploads`
- **Servido**: Express static middleware
- **Preview**: Vista previa en frontend
- **Modal**: Visualización en grande
- **Error Handling**: Manejo de errores de carga

### Flujo de Imágenes
1. Usuario selecciona imagen en formulario
2. Preview se muestra antes del envío
3. Imagen se sube al backend con Multer
4. URL se almacena en base de datos
5. Imagen se muestra en lista de entradas
6. Click abre modal con imagen completa

## ⚖️ Sistema de Toneladas

### Conversión Completa
- **Frontend**: Formularios en toneladas (14.320 t)
- **Backend**: Validaciones en toneladas (máx 100 t)
- **Base de Datos**: Almacenamiento en toneladas
- **Cálculos**: Peso neto automático
- **Visualización**: Formato limpio (5.2 t, no 5.200 t)

### Validaciones Implementadas
```javascript
// Backend - WasteEntry.js
grossWeight: {
  type: Number,
  required: true,
  min: [0.001, 'El peso bruto debe ser mayor a 0'],
  max: [100, 'El peso bruto no puede exceder 100 toneladas']
}

// Frontend - Formato limpio
parseFloat((weight).toFixed(3)) // 5.200 → 5.2
```

## 🔄 Sistema de Estados

### Estados de Entradas
- **pending**: Pendiente de procesamiento (amarillo)
- **processing**: En proceso (azul)
- **completed**: Procesado completamente (verde)
- **rejected**: Rechazado con razón (rojo)

### Funcionalidades
- **Modal de Cambio**: Interfaz intuitiva
- **Validaciones**: Estado requerido y razón de rechazo
- **Permisos**: Solo usuarios con `manage_entries`
- **Historial**: Registro de cambios con usuario y fecha
- **Notificaciones**: Feedback inmediato

## 📈 Sistema de Gráficas

### Gráficas Implementadas
1. **Gráfica de Barras**: Distribución por tipo de residuo
   - Ejes duales: Peso total y número de entradas
   - Colores diferenciados por tipo
   - Tooltips interactivos

2. **Gráfica de Líneas**: Tendencia temporal
   - Evolución diaria del peso
   - Número de entradas por día
   - Datos ordenados cronológicamente

### Tecnología Recharts
- **Responsive**: Adaptación automática
- **Interactiva**: Tooltips y leyendas
- **Customizable**: Colores y estilos personalizados
- **Performance**: Optimizada para grandes datasets

## 🛡️ Seguridad Implementada

### Backend
- **JWT**: Tokens seguros con expiración
- **Bcrypt**: Hashing de contraseñas con salt
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configuración de origen cruzado
- **Rate Limiting**: Limitación de requests por IP
- **Validación**: Sanitización de datos de entrada
- **Permisos**: Control granular por endpoint

### Frontend
- **Token Verification**: Verificación en cada request
- **Role-based Access**: Control de acceso por rol
- **Input Validation**: Validación en tiempo real
- **Error Handling**: Manejo seguro de errores
- **XSS Protection**: Sanitización de contenido

## 🚀 Performance y Optimización

### Frontend
- **Vite**: Build rápido con HMR
- **CSS Modules**: Carga selectiva de estilos
- **Lazy Loading**: Carga diferida de componentes
- **Bundle Splitting**: División automática de código
- **Memoización**: Optimización de re-renders

### Backend
- **MongoDB Indexing**: Índices optimizados
- **Mongoose Virtuals**: Cálculos eficientes
- **Caching**: Estrategias de cache
- **Compression**: Compresión de responses
- **Connection Pooling**: Pool de conexiones DB

## 🧪 Testing y Calidad

### Herramientas de Debug
- **React DevTools**: Inspección de componentes
- **MongoDB Compass**: Exploración de base de datos
- **Postman**: Testing de API endpoints
- **Browser DevTools**: Network y performance

### Scripts de Testing
```bash
# Backend
npm run test-users      # Verificar usuarios de prueba
node debug-users.js     # Debug de autenticación

# Frontend
npm run dev            # Desarrollo con hot reload
npm run build          # Build de producción
npm run preview        # Preview de build
```

## 📊 Métricas del Proyecto

### Líneas de Código
- **Frontend**: ~3,500 líneas (JSX + CSS)
- **Backend**: ~2,800 líneas (JavaScript)
- **Total**: ~6,300 líneas de código

### Archivos Principales
- **Componentes React**: 5 componentes principales
- **Servicios**: 2 servicios (Auth + Data)
- **Modelos**: 4 modelos de datos
- **Endpoints**: 25+ endpoints de API
- **Estilos**: 5 archivos CSS Modules

### Funcionalidades
- ✅ **Autenticación completa** con JWT
- ✅ **Dashboard en tiempo real** con datos reales
- ✅ **Gestión de entradas** con imágenes
- ✅ **Sistema de reportes** con gráficas
- ✅ **Cambio de estados** con historial
- ✅ **Sistema de toneladas** completo
- ✅ **Responsive design** adaptativo

## 🔧 Configuración de Producción

### Variables de Entorno

**Backend (.env)**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/raee_db
JWT_SECRET=super_secure_secret_for_production
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend (.env.local)**
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

### Despliegue

**Backend (Heroku/Railway)**
```bash
# Build y deploy automático
git push heroku main

# Configurar variables de entorno
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_production_uri
```

**Frontend (Netlify/Vercel)**
```bash
# Build automático
npm run build

# Configurar redirects para SPA
echo "/*    /index.html   200" > dist/_redirects
```

## 📚 Documentación del Proyecto

### Archivos de Documentación
- **README.md** (Backend): Documentación completa del backend
- **README.md** (Frontend): Documentación completa del frontend
- **PROYECTO_COMPLETO.md**: Este archivo - documentación global
- **FRONTEND_INTEGRATION.md**: Guía de integración
- **MIGRACION_CSS_MODULES.md**: Migración de Tailwind a CSS Modules

### Evolución del Proyecto

#### Fase 1: Migración a Datos Reales
- Eliminación de datos hardcodeados
- Integración completa con backend
- Estados de loading y error

#### Fase 2: Sistema de Imágenes
- Upload de comprobantes de pesaje
- Servido de archivos estáticos
- Modal de visualización

#### Fase 3: Conversión a Toneladas
- Migración completa del sistema
- Validaciones actualizadas
- Formato limpio de números

#### Fase 4: Gráficas Interactivas
- Implementación de Recharts
- Gráficas de barras y líneas
- Datos reales en tiempo real

#### Fase 5: Cambio de Estados
- Modal de gestión de estados
- Validaciones y permisos
- Historial de cambios

## 🤝 Contribución

### Guía de Contribución
1. **Fork** del repositorio
2. **Crear rama** feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Desarrollar** la funcionalidad
4. **Testing** manual y automático
5. **Commit** con mensaje descriptivo
6. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
7. **Pull Request** con descripción detallada

### Estándares de Código
- **ESLint**: Configuración estricta
- **Prettier**: Formateo automático
- **Naming**: Convenciones claras
- **Comments**: Documentación en código
- **Git**: Commits descriptivos

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT** - ver el archivo [LICENSE](LICENSE) para detalles.

## 🔗 Enlaces Útiles

### Desarrollo
- **Frontend Dev**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health
- **MongoDB Atlas**: https://cloud.mongodb.com

### Documentación
- **React**: https://react.dev
- **Vite**: https://vitejs.dev
- **Express**: https://expressjs.com
- **MongoDB**: https://docs.mongodb.com
- **Recharts**: https://recharts.org

### Herramientas
- **VS Code**: Editor recomendado
- **MongoDB Compass**: GUI para MongoDB
- **Postman**: Testing de APIs
- **Git**: Control de versiones

## 🎯 Próximas Funcionalidades

### Roadmap
- [ ] **Módulo de Usuarios**: Gestión completa de usuarios
- [ ] **Módulo de Configuración**: Configuraciones del sistema
- [ ] **Exportación de Reportes**: PDF y Excel
- [ ] **Notificaciones Push**: Alertas en tiempo real
- [ ] **Dashboard Avanzado**: Más métricas y KPIs
- [ ] **API Documentation**: Swagger/OpenAPI
- [ ] **Testing Automatizado**: Jest y Cypress
- [ ] **Docker**: Containerización del proyecto

### Mejoras Técnicas
- [ ] **TypeScript**: Migración gradual a TypeScript
- [ ] **PWA**: Progressive Web App
- [ ] **Offline Support**: Funcionalidad offline
- [ ] **Real-time Updates**: WebSockets
- [ ] **Caching**: Redis para cache
- [ ] **Monitoring**: Logs y métricas avanzadas

---

**Desarrollado con ❤️ para la gestión eficiente de rellenos sanitarios** 