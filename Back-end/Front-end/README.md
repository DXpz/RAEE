# 🌱 Sistema RAEE - Frontend

Frontend completo para el Sistema de Gestión de Relleno Sanitario RAEE, desarrollado con React 19, Vite, JSX y CSS Modules. Sistema completamente funcional con datos reales, autenticación JWT, gestión de imágenes, gráficas interactivas y conversión total a toneladas.

## 🚀 Características Principales

- **React 19.1.0** con JSX puro (sin TypeScript)
- **Vite** para bundling y desarrollo rápido con Hot Module Replacement
- **CSS Modules** para estilos encapsulados y mantenibles
- **Lucide React** para iconografía moderna y consistente
- **Recharts** para gráficas interactivas y visualización de datos
- **Sistema de Autenticación** completo con roles y permisos
- **Gestión de Imágenes** con upload y visualización de comprobantes
- **Sistema de Toneladas** con conversión completa y formato limpio
- **Cambio de Estados** para gestión de entradas de residuos
- **Responsive Design** adaptativo para móviles y desktop

## 🏗️ Arquitectura

### Estructura de Directorios

```
Front-end/
├── src/
│   ├── components/        # Componentes React en JSX
│   │   ├── Login.jsx           # Autenticación de usuarios
│   │   ├── Sidebar.jsx         # Navegación lateral
│   │   ├── Dashboard.jsx       # Panel principal con datos reales
│   │   ├── ProcessingModule.jsx # Gestión de entradas de residuos
│   │   └── Reports.jsx         # Módulo de reportes con gráficas
│   ├── services/         # Servicios de datos y autenticación
│   │   ├── AuthService.js      # Manejo de autenticación JWT
│   │   └── DataService.js      # Comunicación con API backend
│   ├── models/           # Modelos de datos (sin tipos TypeScript)
│   │   ├── User.js             # Modelo de usuario
│   │   ├── WasteEntry.js       # Modelo de entrada de residuos
│   │   └── Dashboard.js        # Modelo de datos del dashboard
│   ├── styles/           # CSS Modules
│   │   ├── Login.module.css
│   │   ├── Sidebar.module.css
│   │   ├── Dashboard.module.css
│   │   ├── ProcessingModule.module.css
│   │   └── Reports.module.css
│   ├── App.jsx          # Componente principal
│   ├── main.jsx         # Punto de entrada
│   └── index.css        # Estilos globales y utilitarios
├── public/              # Archivos estáticos
├── package.json
├── vite.config.js
└── README.md
```

### Diferencias con la Versión TypeScript Original

1. **Sin Tipos**: Eliminación completa de TypeScript y sus tipos
2. **CSS Modules**: Reemplazo de Tailwind CSS por CSS Modules para estilos encapsulados
3. **JSX**: Archivos .jsx en lugar de .tsx
4. **JavaScript Puro**: Clases y servicios en JavaScript vanilla
5. **Datos Reales**: Migración completa de datos hardcodeados a API backend
6. **Sistema de Toneladas**: Conversión total del sistema a toneladas

## 📋 Requisitos Previos

- Node.js >= 18.0.0
- npm o yarn
- Backend RAEE ejecutándose en puerto 5000

## 🛠️ Instalación

### 1. Clonar y Navegar al Frontend

```bash
cd Front-end
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno (Opcional)

```bash
# Crear archivo .env.local si necesitas configuraciones específicas
echo "VITE_API_BASE_URL=http://localhost:5000/api" > .env.local
```

### 4. Iniciar en Modo Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 5. Build para Producción

```bash
npm run build
```

### 6. Vista Previa de Producción

```bash
npm run preview
```

## 🔐 Sistema de Autenticación

### Usuarios de Prueba

Después de ejecutar el seeding en el backend, tendrás estos usuarios disponibles:

| Username | Password | Rol | Descripción | Permisos |
|----------|----------|-----|-------------|----------|
| `admin` | `admin123` | Admin | Administrador del sistema | Todos los permisos |
| `usuario` | `user123` | User | Usuario operador | Dashboard, entradas, reportes, cambio de estados |
| `invitado` | `guest123` | Guest | Usuario invitado | Solo visualización del dashboard |
| `operador1` | `op123` | User | Juan Pérez | Dashboard, entradas, reportes, cambio de estados |
| `operador2` | `op123` | User | María García | Dashboard, entradas, reportes, cambio de estados |

### Flujo de Autenticación

1. **Login**: Validación de credenciales con el backend
2. **Token JWT**: Almacenamiento seguro en localStorage
3. **Verificación**: Validación automática del token en cada request
4. **Permisos**: Control granular basado en roles
5. **Logout**: Limpieza de token y redirección

## 📊 Módulos Disponibles

### 1. Dashboard - Monitoreo en Tiempo Real
- **Estadísticas de Hoy**: Entradas, tonelaje, peso promedio, hora pico
- **Última Entrada Registrada**: Información detallada con imagen de comprobante
- **Entradas Recientes**: Lista de las últimas 3 entradas
- **Capacidad por Zona**: Visualización del uso de cada zona
- **Distribución de Residuos**: Gráfico de tipos de residuos
- **Indicadores Ambientales**: Monitoreo de parámetros ambientales
- **Alertas Activas**: Sistema de notificaciones

### 2. Procesamiento - Gestión de Entradas de Residuos
- **Estadísticas del Día**: Resumen de entradas y tonelaje
- **Registro de Nuevas Entradas**: Formulario completo con validaciones
- **Upload de Imágenes**: Comprobantes de pesaje con preview
- **Lista de Entradas Recientes**: Últimas 10 entradas con detalles
- **Cambio de Estados**: Gestión de estados de entradas (pending, processing, completed, rejected)
- **Visualización de Comprobantes**: Modal para ver imágenes en grande
- **Cálculo Automático**: Peso neto calculado en tiempo real

### 3. Reportes - Análisis y Gráficas
- **Filtros por Fecha**: Selección de rango de fechas
- **Tabla de Reportes**: Lista detallada de entradas con paginación
- **Gráfica de Barras**: Distribución por tipo de residuo
- **Gráfica de Líneas**: Tendencia temporal de residuos
- **Cambio de Estados**: Gestión de estados desde reportes
- **Exportación**: Funcionalidad de exportación de datos

## 🎨 CSS Modules

Los estilos están organizados por componente usando CSS Modules para encapsulación:

### Ventajas de CSS Modules
- **Encapsulación**: Estilos locales por componente
- **No Conflictos**: Nombres de clase únicos automáticamente
- **Mantenibilidad**: Estilos organizados por funcionalidad
- **Performance**: Solo se cargan los estilos necesarios

### Estructura de Estilos
```css
/* Login.module.css */
.container { /* Estilos del contenedor de login */ }
.form { /* Estilos del formulario */ }
.button { /* Estilos de botones */ }

/* Dashboard.module.css */
.dashboard { /* Estilos del dashboard */ }
.statCard { /* Estilos de tarjetas de estadísticas */ }
.chartContainer { /* Estilos de contenedores de gráficas */ }
```

## 📈 Sistema de Gráficas

### Recharts Integration
- **Gráfica de Barras**: Distribución por tipo de residuo con ejes duales
- **Gráfica de Líneas**: Tendencia temporal con datos acumulados
- **Responsive**: Adaptación automática a diferentes tamaños de pantalla
- **Interactiva**: Tooltips y leyendas dinámicas
- **Colores**: Esquema de colores consistente por tipo de residuo

### Tipos de Gráficas Implementadas
```javascript
// Gráfica de Barras - Distribución por Tipo
<BarChart data={wasteTypeData}>
  <Bar dataKey="totalWeight" fill="#3b82f6" />
  <Bar dataKey="entryCount" fill="#10b981" />
</BarChart>

// Gráfica de Líneas - Tendencia Temporal
<LineChart data={temporalData}>
  <Line dataKey="dailyWeight" stroke="#3b82f6" />
  <Line dataKey="dailyEntries" stroke="#10b981" />
</LineChart>
```

## 🖼️ Sistema de Imágenes

### Upload de Comprobantes
- **Tipos Soportados**: JPG, JPEG, PNG, GIF
- **Tamaño Máximo**: 5MB
- **Preview**: Vista previa antes de enviar
- **Validación**: Verificación de tipo y tamaño

### Visualización de Imágenes
- **Modal de Imagen**: Visualización en grande
- **Indicador Visual**: "📷 Comprobante disponible"
- **Error Handling**: Manejo de errores de carga
- **Responsive**: Adaptación a diferentes pantallas

## ⚖️ Sistema de Toneladas

### Conversión Completa
- **Entrada de Datos**: Formularios en toneladas (ej: 14.320 t)
- **Validaciones**: Límites en toneladas (máximo 100 t)
- **Visualización**: Formato limpio sin ceros innecesarios
- **Cálculos**: Peso neto automático en toneladas
- **Consistencia**: Todo el sistema unificado en toneladas

### Formato de Números
```javascript
// Formato limpio de toneladas
parseFloat((weight).toFixed(3)) // 5.200 → 5.2
```

## 🔄 Sistema de Estados

### Estados de Entradas
- **Pending**: Pendiente (amarillo)
- **Processing**: En Proceso (azul)
- **Completed**: Procesado (verde)
- **Rejected**: Rechazado (rojo)

### Cambio de Estados
- **Modal de Cambio**: Interfaz intuitiva para cambiar estados
- **Validaciones**: Estado requerido y razón de rechazo
- **Permisos**: Solo usuarios con `manage_entries`
- **Feedback**: Mensajes de confirmación y error

## 🔧 Servicios

### AuthService
```javascript
class AuthService {
  async login(username, password)     // Login de usuario
  async logout()                      // Logout y limpieza
  getCurrentUser()                    // Usuario actual
  getAuthToken()                      // Token JWT
  isAuthenticated()                   // Estado de autenticación
  hasPermission(permission)           // Verificación de permisos
}
```

### DataService
```javascript
class DataService {
  // Dashboard
  async getDashboardData()            // Datos completos del dashboard
  async getTodayStats()               // Estadísticas de hoy
  async getRecentEntries(limit)       // Entradas recientes
  
  // Entradas de Residuos
  async createWasteEntry(data)        // Crear nueva entrada
  async updateEntryStatus(id, status) // Cambiar estado
  
  // Imágenes
  async uploadImage(file)             // Subir imagen
  
  // Reportes
  async getReports(startDate, endDate) // Obtener reportes
}
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Adaptaciones
- **Sidebar**: Colapsible en móviles
- **Gráficas**: Redimensionamiento automático
- **Tablas**: Scroll horizontal en móviles
- **Formularios**: Layout adaptativo
- **Modales**: Tamaño responsivo

## 🛡️ Seguridad

### Validaciones del Frontend
- **Autenticación**: Verificación de token en cada request
- **Permisos**: Control de acceso por rol
- **Validación de Formularios**: Validación en tiempo real
- **Sanitización**: Limpieza de datos de entrada
- **CORS**: Configuración de origen cruzado

### Manejo de Errores
- **Estados de Error**: Manejo graceful de errores
- **Fallbacks**: Estados alternativos cuando fallan las APIs
- **Retry Logic**: Reintento automático en algunos casos
- **User Feedback**: Mensajes claros de error

## 🚀 Performance

### Optimizaciones
- **Vite**: Build rápido con Hot Module Replacement
- **CSS Modules**: Carga solo de estilos necesarios
- **Lazy Loading**: Carga diferida de componentes
- **Memoización**: Optimización de re-renders
- **Bundle Splitting**: División de código automática

### Métricas
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: Optimizado para web

## 🧪 Testing y Debug

### Herramientas de Debug
- **React DevTools**: Inspección de componentes
- **Console Logs**: Logs estructurados para debug
- **Network Tab**: Monitoreo de requests API
- **Error Boundaries**: Captura de errores de React

### Testing Manual
```bash
# Verificar autenticación
1. Login con diferentes roles
2. Verificar permisos por módulo
3. Probar funcionalidades específicas

# Verificar datos reales
1. Comprobar conexión con backend
2. Verificar carga de datos
3. Probar operaciones CRUD
```

## 🔧 Configuración de Desarrollo

### Vite Configuration
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
```

### ESLint Configuration
```javascript
// eslint.config.js
export default [
  js.configs.recommended,
  ...fixupConfigRules(reactHooks.configs.recommended),
  ...fixupConfigRules(reactRefresh.configs.recommended)
]
```

## 📦 Dependencias Principales

### Producción
```json
{
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "lucide-react": "^0.468.0",
  "recharts": "^2.15.0"
}
```

### Desarrollo
```json
{
  "@vitejs/plugin-react": "^4.3.4",
  "vite": "^6.3.5",
  "eslint": "^9.17.0"
}
```

## 🚀 Despliegue

### Build de Producción
```bash
npm run build
```

### Variables de Entorno de Producción
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

### Despliegue en Netlify/Vercel
```bash
# Build automático
npm run build

# Configurar redirects para SPA
echo "/*    /index.html   200" > dist/_redirects
```

## 📚 Documentación Adicional

- **MIGRACION_CSS_MODULES.md**: Guía de migración de Tailwind a CSS Modules
- **DASHBOARD_MEJORADO.md**: Documentación del dashboard mejorado
- **COMPONENTES.md**: Documentación de componentes individuales

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🔗 Enlaces Útiles

- **Backend API**: http://localhost:5000/api
- **Frontend Dev**: http://localhost:5173
- **Health Check**: http://localhost:5000/health
- **MongoDB Atlas**: https://cloud.mongodb.com 