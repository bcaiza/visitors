import api from './api';

/**
 * Department Service
 * Maneja todas las operaciones relacionadas con departamentos
 */

const departmentService = {
  /**
   * Obtener todos los departamentos con paginación y filtros
   * @param {Object} params - Parámetros de búsqueda y paginación
   * @returns {Promise<Object>} { departments: [], pagination: {} }
   */
  getAll: async (params) => {
    try {
      const response = await api.get('/departments', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener departamentos:', error);
      throw error;
    }
  },

  /**
   * Obtener solo departamentos activos (sin paginación)
   * @returns {Promise<Array>} Array de departamentos activos
   */
  getActive: async () => {
    try {
      const response = await api.get('/departments/active');
      return response.data;
    } catch (error) {
      console.error('Error al obtener departamentos activos:', error);
      throw error;
    }
  },

  /**
   * Obtener un departamento por ID
   * @param {string} id - ID del departamento
   * @returns {Promise<Object>} Objeto departamento
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/departments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener departamento por ID:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo departamento
   * @param {Object} departmentData - { name, description, isActive }
   * @returns {Promise<Object>} Departamento creado
   */
  create: async (departmentData) => {
    try {
      const response = await api.post('/departments', departmentData);
      return response.data;
    } catch (error) {
      console.error('Error al crear departamento:', error);
      throw error;
    }
  },

  /**
   * Actualizar un departamento existente
   * @param {string} id - ID del departamento
   * @param {Object} departmentData - Datos a actualizar
   * @returns {Promise<Object>} Departamento actualizado
   */
  update: async (id, departmentData) => {
    try {
      const response = await api.put(`/departments/${id}`, departmentData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar departamento:', error);
      throw error;
    }
  },

  /**
   * Eliminar un departamento
   * @param {string} id - ID del departamento
   * @param {boolean} hardDelete - Si es true, elimina permanentemente
   * @returns {Promise<Object>} Mensaje de confirmación
   */
  delete: async (id, hardDelete = false) => {
    try {
      const response = await api.delete(`/departments/${id}`, {
        params: { hardDelete }
      });
      return response.data;
    } catch (error) {
      console.error('Error al eliminar departamento:', error);
      throw error;
    }
  },

  /**
   * Activar/Desactivar un departamento
   * @param {string} id - ID del departamento
   * @returns {Promise<Object>} Departamento con estado actualizado
   */
  toggleStatus: async (id) => {
    try {
      const response = await api.patch(`/departments/${id}/toggle`);
      return response.data;
    } catch (error) {
      console.error('Error al cambiar estado del departamento:', error);
      throw error;
    }
  },
};

export default departmentService;