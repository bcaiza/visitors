import api from './api';

/**
 * Visit Purpose Service
 * Maneja todas las operaciones relacionadas con motivos de visita
 */

const visitPurposeService = {
  /**
   * Obtener todos los motivos de visita con paginación y filtros
   * @param {Object} params - Parámetros de búsqueda y paginación
   * @returns {Promise<Object>} { visitPurposes: [], pagination: {} }
   */
  getAll: async (params) => {
    try {
      const response = await api.get('/visit-purposes', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener motivos de visita:', error);
      throw error;
    }
  },

  /**
   * Obtener solo motivos de visita activos (sin paginación)
   * @returns {Promise<Array>} Array de motivos de visita activos
   */
  getActive: async () => {
    try {
      const response = await api.get('/visit-purposes/active');
      return response.data;
    } catch (error) {
      console.error('Error al obtener motivos de visita activos:', error);
      throw error;
    }
  },

  /**
   * Obtener un motivo de visita por ID
   * @param {string} id - ID del motivo de visita
   * @returns {Promise<Object>} Objeto motivo de visita
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/visit-purposes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener motivo de visita por ID:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo motivo de visita
   * @param {Object} visitPurposeData - { name, description, isActive }
   * @returns {Promise<Object>} Motivo de visita creado
   */
  create: async (visitPurposeData) => {
    try {
      const response = await api.post('/visit-purposes', visitPurposeData);
      return response.data;
    } catch (error) {
      console.error('Error al crear motivo de visita:', error);
      throw error;
    }
  },

  /**
   * Actualizar un motivo de visita existente
   * @param {string} id - ID del motivo de visita
   * @param {Object} visitPurposeData - Datos a actualizar
   * @returns {Promise<Object>} Motivo de visita actualizado
   */
  update: async (id, visitPurposeData) => {
    try {
      const response = await api.put(`/visit-purposes/${id}`, visitPurposeData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar motivo de visita:', error);
      throw error;
    }
  },

  /**
   * Eliminar un motivo de visita
   * @param {string} id - ID del motivo de visita
   * @param {boolean} hardDelete - Si es true, elimina permanentemente
   * @returns {Promise<Object>} Mensaje de confirmación
   */
  delete: async (id, hardDelete = false) => {
    try {
      const response = await api.delete(`/visit-purposes/${id}`, {
        params: { hardDelete }
      });
      return response.data;
    } catch (error) {
      console.error('Error al eliminar motivo de visita:', error);
      throw error;
    }
  },

  /**
   * Activar/Desactivar un motivo de visita
   * @param {string} id - ID del motivo de visita
   * @returns {Promise<Object>} Motivo de visita con estado actualizado
   */
  toggleStatus: async (id) => {
    try {
      const response = await api.patch(`/visit-purposes/${id}/toggle`);
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado del motivo de visita:', error);
      throw error;
    }
  },
};

export default visitPurposeService;