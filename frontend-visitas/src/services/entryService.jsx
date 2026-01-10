import api from './api';

/**
 * Entry Service
 * Maneja todas las operaciones relacionadas con entradas y salidas de visitantes
 */

const entryService = {
  /**
   * Registrar entrada (check-in)
   * POST /entries
   * @param {Object} entryData - Datos de la entrada
   * @param {string} entryData.visitor_id - ID del visitante (requerido)
   * @param {string} entryData.purpose - Motivo de la visita
   * @param {string} entryData.hostName - Persona a quien visita
   * @param {string} entryData.hostDepartment - Departamento del anfitrión
   * @param {string} entryData.badge - Número de gafete asignado
   * @param {string} entryData.vehiclePlate - Placa del vehículo
   * @param {number} entryData.temperature - Temperatura corporal
   * @param {string} entryData.entryNotes - Notas de entrada
   * @param {string} entryData.checkedInBy - Usuario que registra
   * @returns {Promise<Object>} Entrada creada con información del visitante
   */
  checkIn: async (entryData) => {
    try {
      const response = await api.post('/entries', entryData);
      return response.data;
    } catch (error) {
      console.error('Error al registrar entrada:', error);
      throw error;
    }
  },

  /**
   * Registrar salida (check-out)
   * PATCH /entries/:id/checkout
   * @param {string} entryId - ID de la entrada
   * @param {Object} data - Datos de la salida
   * @param {string} data.exitNotes - Notas de salida
   * @param {string} data.checkedOutBy - Usuario que registra la salida
   * @returns {Promise<Object>} Entrada actualizada
   */
  checkOut: async (entryId, data) => {
    try {
      const response = await api.patch(`/entries/${entryId}/checkout`, data);
      return response.data;
    } catch (error) {
      console.error('Error al registrar salida:', error);
      throw error;
    }
  },

  /**
   * Obtener todas las entradas con filtros y paginación
   * GET /entries
   * @param {Object} params - Parámetros de búsqueda
   * @param {number} params.page - Página actual
   * @param {number} params.limit - Límite de resultados por página
   * @param {string} params.status - Filtrar por estado (active, completed, cancelled)
   * @param {string} params.visitor_id - Filtrar por ID de visitante
   * @param {string} params.date - Fecha específica (YYYY-MM-DD)
   * @param {string} params.startDate - Fecha inicio del rango
   * @param {string} params.endDate - Fecha fin del rango
   * @param {string} params.hostName - Filtrar por nombre del anfitrión
   * @param {string} params.hostDepartment - Filtrar por departamento
   * @param {string} params.badge - Filtrar por gafete
   * @param {string} params.search - Búsqueda global en datos del visitante
   * @param {string} params.sortBy - Campo para ordenar (default: checkInTime)
   * @param {string} params.sortOrder - Orden (ASC o DESC, default: DESC)
   * @returns {Promise<Object>} { entries, pagination }
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/entries', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener entradas:', error);
      throw error;
    }
  },

  /**
   * Obtener visitantes activos (actualmente en las instalaciones)
   * GET /entries/active
   * @param {Object} params - Parámetros de paginación
   * @param {number} params.page - Página actual
   * @param {number} params.limit - Límite de resultados
   * @param {string} params.sortBy - Campo para ordenar
   * @param {string} params.sortOrder - Orden (ASC o DESC)
   * @returns {Promise<Object>} { activeVisitors, pagination }
   */
  getActive: async (params = {}) => {
    try {
      const response = await api.get('/entries/active', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener visitantes activos:', error);
      throw error;
    }
  },

  /**
   * Obtener entradas del día actual
   * GET /entries/today
   * @param {Object} params - Parámetros de búsqueda
   * @param {number} params.page - Página actual
   * @param {number} params.limit - Límite de resultados
   * @param {string} params.status - Filtrar por estado
   * @param {string} params.sortBy - Campo para ordenar
   * @param {string} params.sortOrder - Orden (ASC o DESC)
   * @returns {Promise<Object>} { entries, pagination }
   */
  getToday: async (params = {}) => {
    try {
      const response = await api.get('/entries/today', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener entradas de hoy:', error);
      throw error;
    }
  },

  /**
   * Obtener una entrada específica por ID
   * GET /entries/:id
   * @param {string} id - ID de la entrada
   * @returns {Promise<Object>} Entrada con información del visitante
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/entries/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener entrada por ID:', error);
      throw error;
    }
  },

  /**
   * Cancelar una entrada
   * PATCH /entries/:id/cancel
   * @param {string} id - ID de la entrada
   * @param {Object} data - Datos de cancelación
   * @param {string} data.cancelReason - Motivo de cancelación
   * @param {string} data.cancelledBy - Usuario que cancela
   * @returns {Promise<Object>} Entrada cancelada
   */
  cancel: async (id, data) => {
    try {
      const response = await api.patch(`/entries/${id}/cancel`, data);
      return response.data;
    } catch (error) {
      console.error('Error al cancelar entrada:', error);
      throw error;
    }
  },

  /**
   * Obtener historial de entradas de un visitante específico
   * GET /entries/visitor/:visitor_id
   * @param {string} visitorId - ID del visitante
   * @param {Object} params - Parámetros de búsqueda
   * @param {number} params.page - Página actual
   * @param {number} params.limit - Límite de resultados
   * @param {string} params.status - Filtrar por estado
   * @param {string} params.sortBy - Campo para ordenar
   * @param {string} params.sortOrder - Orden (ASC o DESC)
   * @returns {Promise<Object>} { entries, pagination }
   */
  getByVisitor: async (visitorId, params = {}) => {
    try {
      const response = await api.get(`/entries/visitor/${visitorId}`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial del visitante:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de entradas
   * GET /entries/stats
   * @param {Object} params - Parámetros de filtrado
   * @param {string} params.startDate - Fecha inicio (opcional)
   * @param {string} params.endDate - Fecha fin (opcional)
   * @returns {Promise<Object>} {
   *   totalEntries,
   *   activeEntries,
   *   completedEntries,
   *   cancelledEntries,
   *   averageStayMinutes,
   *   stats: { active, completed, cancelled }
   * }
   */
  getStats: async (params = {}) => {
    try {
      const response = await api.get('/entries/stats', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  },

  /**
   * Actualizar información de una entrada
   * PATCH /entries/:id
   * @param {string} id - ID de la entrada
   * @param {Object} data - Datos a actualizar
   * @param {string} data.purpose - Motivo de la visita
   * @param {string} data.hostName - Persona a quien visita
   * @param {string} data.hostDepartment - Departamento del anfitrión
   * @param {string} data.badge - Número de gafete
   * @param {string} data.vehiclePlate - Placa del vehículo
   * @param {number} data.temperature - Temperatura
   * @param {string} data.entryNotes - Notas de entrada
   * @param {string} data.exitNotes - Notas de salida
   * @returns {Promise<Object>} Entrada actualizada
   */
  update: async (id, data) => {
    try {
      const response = await api.patch(`/entries/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar entrada:', error);
      throw error;
    }
  },

  // ============ MÉTODOS AUXILIARES ============

  /**
   * Obtener el conteo rápido de visitantes activos
   * @returns {Promise<number>} Número de visitantes activos
   */
  getActiveCount: async () => {
    try {
      const response = await api.get('/entries/active', {
        params: { page: 1, limit: 1 },
      });
      return response.data.pagination.total;
    } catch (error) {
      console.error('Error al obtener conteo de activos:', error);
      throw error;
    }
  },

  /**
   * Verificar si un visitante tiene una entrada activa
   * @param {string} visitorId - ID del visitante
   * @returns {Promise<Object|null>} Entrada activa o null
   */
  hasActiveEntry: async (visitorId) => {
    try {
      const response = await api.get('/entries', {
        params: {
          visitor_id: visitorId,
          status: 'active',
          limit: 1,
        },
      });
      return response.data.entries.length > 0
        ? response.data.entries[0]
        : null;
    } catch (error) {
      console.error('Error al verificar entrada activa:', error);
      throw error;
    }
  },

  /**
   * Obtener entradas en un rango de fechas
   * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
   * @param {string} endDate - Fecha fin (YYYY-MM-DD)
   * @param {Object} additionalParams - Parámetros adicionales
   * @returns {Promise<Object>} { entries, pagination }
   */
  getByDateRange: async (startDate, endDate, additionalParams = {}) => {
    try {
      const response = await api.get('/entries', {
        params: {
          startDate,
          endDate,
          ...additionalParams,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener entradas por rango de fechas:', error);
      throw error;
    }
  },

  /**
   * Buscar entradas por múltiples criterios
   * @param {Object} searchCriteria - Criterios de búsqueda
   * @returns {Promise<Object>} { entries, pagination }
   */
  search: async (searchCriteria) => {
    try {
      const response = await api.get('/entries', {
        params: searchCriteria,
      });
      return response.data;
    } catch (error) {
      console.error('Error en la búsqueda de entradas:', error);
      throw error;
    }
  },

  /**
   * Exportar entradas (preparar datos para exportación)
   * @param {Object} filters - Filtros para la exportación
   * @returns {Promise<Array>} Array de entradas para exportar
   */
  prepareExport: async (filters = {}) => {
    try {
      // Obtener todas las entradas sin paginación
      const response = await api.get('/entries', {
        params: {
          ...filters,
          limit: 10000, // Límite alto para exportación
          page: 1,
        },
      });
      return response.data.entries;
    } catch (error) {
      console.error('Error al preparar exportación:', error);
      throw error;
    }
  },

  /**
   * Calcular duración de estancia
   * @param {Object} entry - Objeto de entrada
   * @returns {number|null} Duración en minutos o null si no ha salido
   */
  calculateStayDuration: (entry) => {
    if (!entry.checkOutTime) return null;
    const checkIn = new Date(entry.checkInTime);
    const checkOut = new Date(entry.checkOutTime);
    return Math.round((checkOut - checkIn) / 1000 / 60); // minutos
  },

  /**
   * Formatear duración en formato legible
   * @param {number} minutes - Duración en minutos
   * @returns {string} Duración formateada (ej: "2h 30m")
   */
  formatDuration: (minutes) => {
    if (!minutes || minutes < 0) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  },

  /**
   * Validar datos de entrada antes de enviar
   * @param {Object} entryData - Datos de entrada
   * @returns {Object} { isValid: boolean, errors: Array }
   */
  validateCheckInData: (entryData) => {
    const errors = [];

    if (!entryData.visitor_id) {
      errors.push('El ID del visitante es requerido');
    }

    if (entryData.temperature && (entryData.temperature < 35 || entryData.temperature > 42)) {
      errors.push('La temperatura debe estar entre 35°C y 42°C');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

export default entryService;