/**
 * Utilidades y funciones helper para el backend
 */

/**
 * Formatear fecha a string legible
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Generar ID único
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Validar email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitizar string
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Convertir kg a toneladas
 */
export const kgToTonnes = (kg) => {
  return Math.round((kg / 1000) * 10) / 10;
};

/**
 * Calcular porcentaje
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Generar respuesta estándar de API
 */
export const apiResponse = (success, data = null, error = null, message = null) => {
  const response = { success };
  
  if (data !== null) response.data = data;
  if (error !== null) response.error = error;
  if (message !== null) response.message = message;
  
  return response;
};

/**
 * Validar ObjectId de MongoDB
 */
export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Obtener rango de fechas para consultas
 */
export const getDateRange = (period) => {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setDate(now.getDate() - 7);
  }
  
  return { start, end: now };
};

/**
 * Paginar resultados
 */
export const paginate = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

/**
 * Generar slug desde texto
 */
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Formatear número con separadores de miles
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat('es-ES').format(num);
};

/**
 * Obtener extensión de archivo
 */
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Validar tamaño de archivo
 */
export const isValidFileSize = (size, maxSize = 5 * 1024 * 1024) => {
  return size <= maxSize;
};

/**
 * Generar hash simple
 */
export const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

/**
 * Delay/sleep function
 */
export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Capitalizar primera letra
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Obtener IP del cliente
 */
export const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
};

/**
 * Validar rango de fechas
 */
export const isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return start instanceof Date && 
         end instanceof Date && 
         !isNaN(start) && 
         !isNaN(end) && 
         start <= end;
};

/**
 * Generar código alfanumérico
 */
export const generateCode = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}; 