import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear directorio de uploads si no existe
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Generar nombre único: timestamp + random + extensión original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `receipt-${uniqueSuffix}${extension}`);
  }
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
  // Verificar que sea una imagen
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 1 // Solo un archivo por request
  }
});

/**
 * Middleware para subir imagen de comprobante
 */
export const uploadReceiptPhoto = upload.single('image');

/**
 * Middleware para manejar errores de multer
 */
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'El archivo es demasiado grande. Máximo 5MB permitido.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Solo se permite un archivo por solicitud.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Campo de archivo no esperado.'
      });
    }
  }
  
  if (error.message === 'Solo se permiten archivos de imagen') {
    return res.status(400).json({
      success: false,
      error: 'Solo se permiten archivos de imagen (jpg, png, gif, etc.).'
    });
  }
  
  next(error);
};

/**
 * Utilidad para eliminar archivo
 */
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(` Archivo eliminado: ${filePath}`);
    }
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
  }
};

export default upload; 