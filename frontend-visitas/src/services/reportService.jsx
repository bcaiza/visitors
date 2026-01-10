import api from './api';

/**
 * Report Service
 * Maneja todas las operaciones relacionadas con reportes y exportaciones
 */

const reportService = {
  // ==================== EXPORTACIÓN ====================

  /**
   * Exportar visitantes a Excel
   * GET /reports/visitors/excel
   * @param {Object} params - Parámetros de filtrado
   * @param {string} params.startDate - Fecha inicio (YYYY-MM-DD)
   * @param {string} params.endDate - Fecha fin (YYYY-MM-DD)
   * @returns {Promise<Blob>} Archivo Excel
   */
  exportVisitorsToExcel: async (params = {}) => {
    try {
      const response = await api.get('/reports/visitors/excel', {
        params,
        responseType: 'blob',
      });
      
      // Crear un link de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `visitantes_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error) {
      console.error('Error al exportar visitantes a Excel:', error);
      throw error;
    }
  },

  /**
   * Exportar visitantes a CSV
   * GET /reports/visitors/csv
   * @param {Object} params - Parámetros de filtrado
   * @returns {Promise<Blob>} Archivo CSV
   */
  exportVisitorsToCSV: async (params = {}) => {
    try {
      const response = await api.get('/reports/visitors/csv', {
        params,
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `visitantes_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error) {
      console.error('Error al exportar visitantes a CSV:', error);
      throw error;
    }
  },

  /**
   * Exportar entradas a Excel
   * GET /reports/entries/excel
   * @param {Object} params - Parámetros de filtrado
   * @param {string} params.startDate - Fecha inicio
   * @param {string} params.endDate - Fecha fin
   * @param {string} params.status - Estado (active, completed, cancelled)
   * @returns {Promise<Blob>} Archivo Excel
   */
  exportEntriesToExcel: async (params = {}) => {
    try {
      const response = await api.get('/reports/entries/excel', {
        params,
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `entradas_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error) {
      console.error('Error al exportar entradas a Excel:', error);
      throw error;
    }
  },

  /**
   * Exportar entradas a CSV
   * GET /reports/entries/csv
   * @param {Object} params - Parámetros de filtrado
   * @returns {Promise<Blob>} Archivo CSV
   */
  exportEntriesToCSV: async (params = {}) => {
    try {
      const response = await api.get('/reports/entries/csv', {
        params,
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `entradas_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error) {
      console.error('Error al exportar entradas a CSV:', error);
      throw error;
    }
  },

  /**
   * Exportar dashboard completo a Excel con gráficos
   * GET /reports/dashboard/export-excel
   * @param {Object} params - Parámetros de filtrado y opciones
   * @returns {Promise<Blob>} Archivo Excel con múltiples hojas y gráficos
   */
  exportDashboardToExcel: async (params = {}) => {
    try {
      const response = await api.get('/reports/dashboard/export-excel', {
        params,
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dashboard_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error) {
      console.error('Error al exportar dashboard a Excel:', error);
      throw error;
    }
  },

  // ==================== DASHBOARD ====================

  /**
   * Obtener estadísticas generales del dashboard
   * GET /reports/dashboard/overview
   * @param {Object} params - Parámetros de filtrado
   * @param {string} params.startDate - Fecha inicio (opcional)
   * @param {string} params.endDate - Fecha fin (opcional)
   * @returns {Promise<Object>} {
   *   period: { startDate, endDate },
   *   totals: { visitors, entries, active, completed, cancelled },
   *   metrics: { averageStayMinutes, averageStayFormatted }
   * }
   */
  getDashboardOverview: async (params = {}) => {
    try {
      const response = await api.get('/reports/dashboard/overview', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener overview del dashboard:', error);
      throw error;
    }
  },

  /**
   * Obtener entradas por día
   * GET /reports/dashboard/entries-by-day
   * @param {Object} params - Parámetros de filtrado
   * @param {string} params.startDate - Fecha inicio
   * @param {string} params.endDate - Fecha fin
   * @returns {Promise<Object>} { data: [{ date, count }] }
   */
  getEntriesByDay: async (params = {}) => {
    try {
      const response = await api.get('/reports/dashboard/entries-by-day', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener entradas por día:', error);
      throw error;
    }
  },

  /**
   * Obtener visitantes más frecuentes
   * GET /reports/dashboard/top-visitors
   * @param {Object} params - Parámetros
   * @param {number} params.limit - Límite de resultados (default: 10)
   * @param {string} params.startDate - Fecha inicio (opcional)
   * @param {string} params.endDate - Fecha fin (opcional)
   * @returns {Promise<Object>} { topVisitors: [{ visitor, visitCount }] }
   */
  getTopVisitors: async (params = {}) => {
    try {
      const response = await api.get('/reports/dashboard/top-visitors', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener visitantes frecuentes:', error);
      throw error;
    }
  },

  /**
   * Obtener visitas por departamento
   * GET /reports/dashboard/by-department
   * @param {Object} params - Parámetros de filtrado
   * @returns {Promise<Object>} { departments: [{ department, count }] }
   */
  getEntriesByDepartment: async (params = {}) => {
    try {
      const response = await api.get('/reports/dashboard/by-department', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener entradas por departamento:', error);
      throw error;
    }
  },

  /**
   * Obtener visitas por motivo
   * GET /reports/dashboard/by-purpose
   * @param {Object} params - Parámetros de filtrado
   * @param {number} params.limit - Límite de resultados (default: 10)
   * @returns {Promise<Object>} { purposes: [{ purpose, count }] }
   */
  getEntriesByPurpose: async (params = {}) => {
    try {
      const response = await api.get('/reports/dashboard/by-purpose', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener entradas por motivo:', error);
      throw error;
    }
  },

  /**
   * Obtener horas pico de entrada
   * GET /reports/dashboard/peak-hours
   * @param {Object} params - Parámetros de filtrado
   * @returns {Promise<Object>} { hours: [{ hour, count }] }
   */
  getPeakHours: async (params = {}) => {
    try {
      const response = await api.get('/reports/dashboard/peak-hours', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener horas pico:', error);
      throw error;
    }
  },

  /**
   * Obtener comparación mensual
   * GET /reports/dashboard/monthly-comparison
   * @param {Object} params - Parámetros
   * @param {number} params.months - Cantidad de meses (default: 6)
   * @returns {Promise<Object>} { months: [{ month, count }] }
   */
  getMonthlyComparison: async (params = {}) => {
    try {
      const response = await api.get('/reports/dashboard/monthly-comparison', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener comparación mensual:', error);
      throw error;
    }
  },

  // ==================== UTILIDADES ====================

  /**
   * Obtener todas las estadísticas del dashboard de una vez
   * @param {Object} params - Parámetros de filtrado
   * @returns {Promise<Object>} Objeto con todas las estadísticas
   */
  getAllDashboardData: async (params = {}) => {
    try {
      const [
        overview,
        entriesByDay,
        topVisitors,
        byDepartment,
        byPurpose,
        peakHours,
        monthlyComparison,
      ] = await Promise.all([
        reportService.getDashboardOverview(params),
        reportService.getEntriesByDay(params),
        reportService.getTopVisitors(params),
        reportService.getEntriesByDepartment(params),
        reportService.getEntriesByPurpose(params),
        reportService.getPeakHours(params),
        reportService.getMonthlyComparison(params),
      ]);

      return {
        overview,
        entriesByDay,
        topVisitors,
        byDepartment,
        byPurpose,
        peakHours,
        monthlyComparison,
      };
    } catch (error) {
      console.error('Error al obtener datos del dashboard:', error);
      throw error;
    }
  },

  /**
   * Exportar datos con opciones personalizadas
   * @param {string} type - Tipo de exportación ('visitors' o 'entries')
   * @param {string} format - Formato ('excel' o 'csv')
   * @param {Object} params - Parámetros de filtrado
   */
  export: async (type, format, params = {}) => {
    const exportFunctions = {
      visitors: {
        excel: reportService.exportVisitorsToExcel,
        csv: reportService.exportVisitorsToCSV,
      },
      entries: {
        excel: reportService.exportEntriesToExcel,
        csv: reportService.exportEntriesToCSV,
      },
    };

    const exportFunction = exportFunctions[type]?.[format];
    if (!exportFunction) {
      throw new Error(`Tipo de exportación no válido: ${type} - ${format}`);
    }

    return exportFunction(params);
  },
};

export default reportService;