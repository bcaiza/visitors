import api from './api';

/**
 * User Service
 * Maneja todas las operaciones relacionadas con usuarios
 */

const userService = {
  // ==================== OPERACIONES CRUD ====================

  /**
   * Obtener todos los usuarios
   * GET /users
   * @param {Object} params - Parámetros de filtrado opcionales
   * @param {string} params.search - Búsqueda por nombre, email o username
   * @param {string} params.roleId - Filtrar por rol
   * @param {boolean} params.isActive - Filtrar por estado activo
   * @param {string} params.sortBy - Campo para ordenar
   * @param {string} params.sortOrder - Orden (asc/desc)
   * @param {number} params.page - Página actual (para paginación)
   * @param {number} params.limit - Registros por página
   * @returns {Promise<Object>} { users: Array, total: number, page: number, totalPages: number }
   */
  getUsers: async (params = {}) => {
    try {
      const response = await api.get('/users', { params });
      console.log('Users fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },

  /**
   * Obtener usuarios activos
   * GET /users/active
   * @returns {Promise<Array>} Lista de usuarios activos
   */
  getActiveUsers: async () => {
    try {
      const response = await api.get('/users/active');
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios activos:', error);
      throw error;
    }
  },

  /**
   * Obtener usuarios por rol
   * GET /users/role/:roleId
   * @param {string} roleId - ID del rol
   * @returns {Promise<Array>} Lista de usuarios con ese rol
   */
  getUsersByRole: async (roleId) => {
    try {
      const response = await api.get(`/users/role/${roleId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener usuarios del rol ${roleId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener un usuario por ID
   * GET /users/:id
   * @param {string} id - ID del usuario
   * @returns {Promise<Object>} Datos del usuario
   */
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener usuario ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear un nuevo usuario
   * POST /users
   * @param {Object} userData - Datos del usuario
   * @param {string} userData.name - Nombre completo
   * @param {string} userData.username - Nombre de usuario
   * @param {string} userData.email - Email
   * @param {string} userData.password - Contraseña
   * @param {string} userData.roleId - ID del rol
   * @param {boolean} userData.isActive - Estado activo/inactivo
   * @param {string} userData.phone - Teléfono (opcional)
   * @param {string} userData.department - Departamento (opcional)
   * @returns {Promise<Object>} Usuario creado
   */
  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  },

  /**
   * Actualizar un usuario
   * PUT /users/:id
   * @param {string} id - ID del usuario
   * @param {Object} userData - Datos actualizados del usuario
   * @returns {Promise<Object>} Usuario actualizado
   */
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar usuario ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar un usuario
   * DELETE /users/:id
   * @param {string} id - ID del usuario
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar usuario ${id}:`, error);
      throw error;
    }
  },

  // ==================== GESTIÓN DE CONTRASEÑAS ====================

  /**
   * Cambiar contraseña de un usuario
   * PUT /users/:id/change-password
   * @param {string} id - ID del usuario
   * @param {Object} passwordData - Datos de contraseña
   * @param {string} passwordData.currentPassword - Contraseña actual
   * @param {string} passwordData.newPassword - Nueva contraseña
   * @param {string} passwordData.confirmPassword - Confirmación de nueva contraseña
   * @returns {Promise<Object>} Confirmación del cambio
   */
  changePassword: async (id, passwordData) => {
    try {
      const response = await api.put(`/users/${id}/change-password`, passwordData);
      return response.data;
    } catch (error) {
      console.error(`Error al cambiar contraseña del usuario ${id}:`, error);
      throw error;
    }
  },

  /**
   * Resetear contraseña de un usuario (admin)
   * PUT /users/:id/reset-password
   * @param {string} id - ID del usuario
   * @param {Object} passwordData - Datos de contraseña
   * @param {string} passwordData.newPassword - Nueva contraseña
   * @returns {Promise<Object>} Confirmación del reset
   */
  resetPassword: async (id, passwordData) => {
    try {
      const response = await api.put(`/users/${id}/reset-password`, passwordData);
      return response.data;
    } catch (error) {
      console.error(`Error al resetear contraseña del usuario ${id}:`, error);
      throw error;
    }
  },

  // ==================== ESTADO DE USUARIO ====================

  /**
   * Cambiar estado activo/inactivo de un usuario
   * PATCH /users/:id/toggle-status
   * @param {string} id - ID del usuario
   * @returns {Promise<Object>} Usuario con estado actualizado
   */
  toggleUserStatus: async (id) => {
    try {
      const response = await api.patch(`/users/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error(`Error al cambiar estado del usuario ${id}:`, error);
      throw error;
    }
  },

  /**
   * Activar un usuario
   * @param {string} id - ID del usuario
   * @returns {Promise<Object>} Usuario activado
   */
  activateUser: async (id) => {
    try {
      const user = await userService.getUserById(id);
      if (user.isActive) {
        return user;
      }
      return await userService.toggleUserStatus(id);
    } catch (error) {
      console.error(`Error al activar usuario ${id}:`, error);
      throw error;
    }
  },

  /**
   * Desactivar un usuario
   * @param {string} id - ID del usuario
   * @returns {Promise<Object>} Usuario desactivado
   */
  deactivateUser: async (id) => {
    try {
      const user = await userService.getUserById(id);
      if (!user.isActive) {
        return user;
      }
      return await userService.toggleUserStatus(id);
    } catch (error) {
      console.error(`Error al desactivar usuario ${id}:`, error);
      throw error;
    }
  },

  // ==================== VALIDACIONES ====================

  /**
   * Validar datos de usuario
   * @param {Object} userData - Datos del usuario a validar
   * @param {boolean} isEdit - Si es edición (algunos campos son opcionales)
   * @returns {Object} { isValid: boolean, errors: Object }
   */
  validateUserData: (userData, isEdit = false) => {
    const errors = {};
    
    // Nombre
    if (!userData.name || userData.name.trim() === '') {
      errors.name = 'El nombre es requerido';
    } else if (userData.name.length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres';
    } else if (userData.name.length > 100) {
      errors.name = 'El nombre no puede tener más de 100 caracteres';
    }
    
    // Username
    if (!userData.username || userData.username.trim() === '') {
      errors.username = 'El nombre de usuario es requerido';
    } else if (userData.username.length < 3) {
      errors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    } else if (userData.username.length > 50) {
      errors.username = 'El nombre de usuario no puede tener más de 50 caracteres';
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(userData.username)) {
      errors.username = 'El nombre de usuario solo puede contener letras, números, guiones y puntos';
    }
    
    // Email
    if (!userData.email || userData.email.trim() === '') {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.email = 'El email no es válido';
    }
    
    // Password (solo requerido en creación)
    if (!isEdit) {
      if (!userData.password || userData.password.trim() === '') {
        errors.password = 'La contraseña es requerida';
      } else if (userData.password.length < 6) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
    }
    
    // Confirmación de contraseña
    if (userData.password && userData.password !== userData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    // Rol
    if (!userData.roleId || userData.roleId === '') {
      errors.roleId = 'Debe seleccionar un rol';
    }
    
    // Teléfono (opcional pero si existe debe ser válido)
    if (userData.phone && !/^[0-9+\s()-]{7,20}$/.test(userData.phone)) {
      errors.phone = 'El teléfono no es válido';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Validar cambio de contraseña
   * @param {Object} passwordData - Datos de contraseña
   * @returns {Object} { isValid: boolean, errors: Object }
   */
  validatePasswordChange: (passwordData) => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'La contraseña actual es requerida';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'La nueva contraseña es requerida';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    } else if (passwordData.newPassword === passwordData.currentPassword) {
      errors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Debe confirmar la nueva contraseña';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Verificar si un username ya existe
   * @param {string} username - Username a verificar
   * @param {string} excludeId - ID del usuario a excluir (para edición)
   * @returns {Promise<boolean>} true si existe, false si no
   */
  checkUsernameExists: async (username, excludeId = null) => {
    try {
      const users = await userService.getUsers({ search: username });
      
      if (!users || !users.users || !Array.isArray(users.users)) {
        return false;
      }
      
      const exists = users.users.some(user => 
        user.username.toLowerCase() === username.toLowerCase() && 
        user.id !== excludeId
      );
      
      return exists;
    } catch (error) {
      console.error('Error al verificar username:', error);
      return false;
    }
  },

  /**
   * Verificar si un email ya existe
   * @param {string} email - Email a verificar
   * @param {string} excludeId - ID del usuario a excluir (para edición)
   * @returns {Promise<boolean>} true si existe, false si no
   */
  checkEmailExists: async (email, excludeId = null) => {
    try {
      const users = await userService.getUsers({ search: email });
      
      if (!users || !users.users || !Array.isArray(users.users)) {
        return false;
      }
      
      const exists = users.users.some(user => 
        user.email.toLowerCase() === email.toLowerCase() && 
        user.id !== excludeId
      );
      
      return exists;
    } catch (error) {
      console.error('Error al verificar email:', error);
      return false;
    }
  },

  // ==================== UTILIDADES ====================

  /**
   * Formatear usuario para mostrar
   * @param {Object} user - Usuario del backend
   * @returns {Object} Usuario formateado
   */
  formatUser: (user) => {
    return {
      ...user,
      fullName: user.name,
      statusLabel: user.isActive ? 'Activo' : 'Inactivo',
      roleName: user.role?.name || 'Sin rol',
      createdAtFormatted: user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : '',
      lastLoginFormatted: user.lastLogin ? new Date(user.lastLogin).toLocaleString('es-ES') : 'Nunca',
    };
  },

  /**
   * Obtener estadísticas de usuarios
   * @returns {Promise<Object>} Estadísticas
   */
  getUserStats: async () => {
    try {
      const users = await userService.getUsers();
      
      const stats = {
        total: users.total || users.users?.length || 0,
        active: 0,
        inactive: 0,
        byRole: {}
      };
      
      if (users.users && Array.isArray(users.users)) {
        users.users.forEach(user => {
          if (user.isActive) {
            stats.active++;
          } else {
            stats.inactive++;
          }
          
          const roleName = user.role?.name || 'Sin rol';
          stats.byRole[roleName] = (stats.byRole[roleName] || 0) + 1;
        });
      }
      
      return stats;
    } catch (error) {
      console.error('Error al obtener estadísticas de usuarios:', error);
      throw error;
    }
  },

  /**
   * Generar username sugerido a partir del nombre
   * @param {string} name - Nombre completo
   * @returns {string} Username sugerido
   */
  generateUsername: (name) => {
    if (!name) return '';
    
    // Tomar primer nombre y primer apellido
    const parts = name.trim().toLowerCase().split(' ');
    let username = '';
    
    if (parts.length >= 2) {
      username = parts[0] + '.' + parts[1];
    } else {
      username = parts[0];
    }
    
    // Remover acentos y caracteres especiales
    username = username
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9.]/g, '');
    
    return username;
  },

  /**
   * Generar contraseña aleatoria
   * @param {number} length - Longitud de la contraseña (default: 8)
   * @returns {string} Contraseña generada
   */
  generateRandomPassword: (length = 8) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  },

  /**
   * Preparar datos de usuario para enviar al backend
   * @param {Object} formData - Datos del formulario
   * @param {boolean} isEdit - Si es edición
   * @returns {Object} Datos preparados
   */
  prepareUserData: (formData, isEdit = false) => {
    const data = {
      name: formData.name?.trim(),
      username: formData.username?.trim().toLowerCase(),
      email: formData.email?.trim().toLowerCase(),
      roleId: formData.roleId,
      isActive: formData.isActive !== undefined ? formData.isActive : true,
      phone: formData.phone?.trim() || null,
      department: formData.department?.trim() || null,
    };
    
    // Solo incluir password si no es edición o si se proporcionó una nueva
    if (!isEdit && formData.password) {
      data.password = formData.password;
    }
    
    return data;
  },

  /**
   * Filtrar usuarios por búsqueda local
   * @param {Array} users - Lista de usuarios
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Array} Usuarios filtrados
   */
  filterUsers: (users, searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return users;
    }
    
    const term = searchTerm.toLowerCase().trim();
    
    return users.filter(user => 
      user.name?.toLowerCase().includes(term) ||
      user.username?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.role?.name?.toLowerCase().includes(term) ||
      user.department?.toLowerCase().includes(term)
    );
  },

  /**
   * Ordenar usuarios
   * @param {Array} users - Lista de usuarios
   * @param {string} sortBy - Campo por el cual ordenar
   * @param {string} order - 'asc' o 'desc'
   * @returns {Array} Usuarios ordenados
   */
  sortUsers: (users, sortBy = 'name', order = 'asc') => {
    const sorted = [...users].sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];
      
      // Manejo especial para rol
      if (sortBy === 'role') {
        valueA = a.role?.name || '';
        valueB = b.role?.name || '';
      }
      
      // Manejo especial para fechas
      if (sortBy === 'createdAt' || sortBy === 'lastLogin') {
        valueA = new Date(valueA || 0);
        valueB = new Date(valueB || 0);
      }
      
      // Comparación
      if (valueA < valueB) return order === 'asc' ? -1 : 1;
      if (valueA > valueB) return order === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  },

  /**
   * Exportar usuarios a CSV
   * @param {Array} users - Lista de usuarios
   * @returns {string} Contenido CSV
   */
  exportToCSV: (users) => {
    const headers = ['Nombre', 'Usuario', 'Email', 'Rol', 'Departamento', 'Estado', 'Fecha Registro'];
    const rows = users.map(user => [
      user.name,
      user.username,
      user.email,
      user.role?.name || '',
      user.department || '',
      user.isActive ? 'Activo' : 'Inactivo',
      new Date(user.createdAt).toLocaleDateString('es-ES')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csvContent;
  },

  /**
   * Descargar usuarios como CSV
   * @param {Array} users - Lista de usuarios
   * @param {string} filename - Nombre del archivo (opcional)
   */
  downloadCSV: (users, filename = 'usuarios.csv') => {
    const csv = userService.exportToCSV(users);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export default userService;