import api from './api';

/**
 * Visitor Service
 * Maneja todas las operaciones relacionadas con visitantes
 * Incluye manejo de archivos (fotos y documentos)
 */

const visitorService = {
  /**
   * Obtener todos los visitantes con paginación y filtros
   * @param {Object} params - Parámetros de búsqueda y paginación
   * @returns {Promise<Object>} { visitors: [], pagination: {} }
   */
  getAll: async (params) => {
    try {
      const response = await api.get('/visitors', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener visitantes:', error);
      throw error;
    }
  },

  /**
   * Obtener un visitante por ID
   * @param {string} id - ID del visitante
   * @returns {Promise<Object>} Objeto visitante completo
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/visitors/${id}`);
      // El backend retorna el visitante directamente, no { data: visitor }
      return response.data;
    } catch (error) {
      console.error('Error al obtener visitante por ID:', error);
      throw error;
    }
  },

  /**
   * Obtener un visitante por número de identificación
   * @param {string} idNumber - Número de identificación
   * @returns {Promise<Object>} Objeto visitante
   */
  getByIdNumber: async (idNumber) => {
    try {
      const response = await api.get(`/visitors/id-number/${idNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener visitante por número de ID:', error);
      throw error;
    }
  },

  /**
   * Buscar visitantes
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Promise<Array>} Array de visitantes
   */
  search: async (searchTerm) => {
    try {
      const response = await api.get('/visitors/search', {
        params: { search: searchTerm },
      });
      return response.data;
    } catch (error) {
      console.error('Error al buscar visitantes:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo visitante
   * @param {Object} visitorData - Datos del visitante (incluye photo y idDocument como File)
   * @returns {Promise<Object>} Visitante creado
   */
  create: async (visitorData) => {
    try {
      const formData = new FormData();
      
      // Agregar todos los campos al FormData
      Object.keys(visitorData).forEach(key => {
        if (visitorData[key] !== null && visitorData[key] !== undefined) {
          // Los archivos se agregan directamente
          if (key === 'photo' || key === 'idDocument') {
            if (visitorData[key] instanceof File) {
              formData.append(key, visitorData[key]);
            }
          } else {
            // Los demás campos como texto
            formData.append(key, visitorData[key]);
          }
        }
      });

      const response = await api.post('/visitors', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al crear visitante:', error);
      throw error;
    }
  },

  /**
   * Actualizar un visitante existente
   * @param {string} id - ID del visitante
   * @param {Object} visitorData - Datos a actualizar (incluye photo y idDocument opcionales)
   * @returns {Promise<Object>} Visitante actualizado
   */
  update: async (id, visitorData) => {
    try {
      const formData = new FormData();
      
      // Agregar todos los campos al FormData
      Object.keys(visitorData).forEach(key => {
        if (visitorData[key] !== null && visitorData[key] !== undefined) {
          // Los archivos se agregan solo si son File objects (nuevos archivos)
          if (key === 'photo' || key === 'idDocument') {
            if (visitorData[key] instanceof File) {
              formData.append(key, visitorData[key]);
            }
            // Si no es File, no se envía (mantiene el existente)
          } else {
            // Los demás campos como texto
            formData.append(key, visitorData[key]);
          }
        }
      });

      const response = await api.put(`/visitors/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al actualizar visitante:', error);
      throw error;
    }
  },

  /**
   * Eliminar un visitante
   * @param {string} id - ID del visitante
   * @returns {Promise<Object>} Mensaje de confirmación
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/visitors/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar visitante:', error);
      throw error;
    }
  },

  /**
   * Eliminar un archivo específico (foto o documento)
   * @param {string} id - ID del visitante
   * @param {string} fileType - Tipo de archivo: 'photo' o 'idDocument'
   * @returns {Promise<Object>} Mensaje de confirmación
   */
  deleteFile: async (id, fileType) => {
    try {
      if (fileType !== 'photo' && fileType !== 'idDocument') {
        throw new Error('Tipo de archivo inválido. Use "photo" o "idDocument".');
      }
      
      const response = await api.delete(`/visitors/${id}/file/${fileType}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      throw error;
    }
  },
};

export default visitorService;