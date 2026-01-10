import api from './api';

/**
 * Role Service
 * Maneja todas las operaciones relacionadas con roles y permisos
 */

const roleService = {
  // ==================== OPERACIONES CRUD ====================

  /**
   * Obtener todos los roles
   * GET /roles
   * @param {Object} params - Parámetros de filtrado opcionales
   * @param {string} params.search - Búsqueda por nombre
   * @param {boolean} params.isActive - Filtrar por estado activo
   * @param {string} params.sortBy - Campo para ordenar
   * @param {string} params.sortOrder - Orden (asc/desc)
   * @returns {Promise<Array>} Lista de roles
   */
  getRoles: async (params = {}) => {
    try {
      const response = await api.get('/roles', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener roles:', error);
      throw error;
    }
  },

  /**
   * Obtener un rol por ID
   * GET /roles/:id
   * @param {string} id - ID del rol
   * @returns {Promise<Object>} Datos del rol
   */
  getRoleById: async (id) => {
    try {
      const response = await api.get(`/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener rol ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear un nuevo rol
   * POST /roles
   * @param {Object} roleData - Datos del rol
   * @param {string} roleData.name - Nombre del rol
   * @param {string} roleData.description - Descripción del rol
   * @param {boolean} roleData.isActive - Estado activo/inactivo
   * @returns {Promise<Object>} Rol creado
   */
  createRole: async (roleData) => {
    try {
      const response = await api.post('/roles', roleData);
      return response.data;
    } catch (error) {
      console.error('Error al crear rol:', error);
      throw error;
    }
  },

  /**
   * Actualizar un rol
   * PUT /roles/:id
   * @param {string} id - ID del rol
   * @param {Object} roleData - Datos actualizados del rol
   * @returns {Promise<Object>} Rol actualizado
   */
  updateRole: async (id, roleData) => {
    try {
      const response = await api.put(`/roles/${id}`, roleData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar rol ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar un rol
   * DELETE /roles/:id
   * @param {string} id - ID del rol
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  deleteRole: async (id) => {
    try {
      const response = await api.delete(`/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar rol ${id}:`, error);
      throw error;
    }
  },

  // ==================== PERMISOS ====================

  /**
   * Obtener los permisos de un rol
   * GET /roles/:id/permissions
   * @param {string} id - ID del rol
   * @returns {Promise<Object>} Permisos del rol organizados por módulo
   */
  getRolePermissions: async (id) => {
    try {
      const response = await api.get(`/roles/${id}/permissions`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener permisos del rol ${id}:`, error);
      throw error;
    }
  },

  /**
   * Actualizar los permisos de un rol
   * PUT /roles/:id/permissions
   * @param {string} id - ID del rol
   * @param {Object} permissions - Permisos a actualizar
   * @param {Object} permissions.dashboard - Permisos del módulo dashboard
   * @param {Object} permissions.visitors - Permisos del módulo visitantes
   * @param {Object} permissions.entries - Permisos del módulo entradas
   * @param {Object} permissions.users - Permisos del módulo usuarios
   * @param {Object} permissions.roles - Permisos del módulo roles
   * @returns {Promise<Object>} Permisos actualizados
   */
  updateRolePermissions: async (id, permissions) => {
    try {
      const response = await api.put(`/roles/${id}/permissions`, { permissions });
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar permisos del rol ${id}:`, error);
      throw error;
    }
  },

  // ==================== UTILIDADES ====================

  /**
   * Verificar si un nombre de rol ya existe
   * @param {string} name - Nombre del rol a verificar
   * @param {string} excludeId - ID del rol a excluir (para edición)
   * @returns {Promise<boolean>} true si existe, false si no
   */
  checkRoleNameExists: async (name, excludeId = null) => {
    try {
      const roles = await roleService.getRoles({ search: name });
      
      if (!roles || !Array.isArray(roles)) {
        return false;
      }
      
      const exists = roles.some(role => 
        role.name.toLowerCase() === name.toLowerCase() && 
        role.id !== excludeId
      );
      
      return exists;
    } catch (error) {
      console.error('Error al verificar nombre de rol:', error);
      return false;
    }
  },

  /**
   * Obtener roles activos
   * @returns {Promise<Array>} Lista de roles activos
   */
  getActiveRoles: async () => {
    try {
      const response = await api.get('/roles', { 
        params: { isActive: true } 
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener roles activos:', error);
      throw error;
    }
  },

  /**
   * Obtener módulos disponibles con sus permisos
   * @returns {Array} Lista de módulos y permisos disponibles
   */
  getAvailableModules: () => {
    return [
      {
        key: 'dashboard',
        name: 'Dashboard',
        description: 'Acceso al panel de control y estadísticas',
        permissions: ['view']
      },
      {
        key: 'visitors',
        name: 'Visitantes',
        description: 'Gestión de visitantes',
        permissions: ['view', 'create', 'edit', 'delete']
      },
      {
        key: 'entries',
        name: 'Entradas/Salidas',
        description: 'Registro de entradas y salidas',
        permissions: ['view', 'create', 'edit', 'delete']
      },
      {
        key: 'users',
        name: 'Usuarios',
        description: 'Administración de usuarios del sistema',
        permissions: ['view', 'create', 'edit', 'delete']
      },
      {
        key: 'roles',
        name: 'Roles',
        description: 'Gestión de roles y permisos',
        permissions: ['view', 'create', 'edit', 'delete']
      }
    ];
  },

  /**
   * Formatear permisos para enviar al backend
   * @param {Object} formPermissions - Permisos del formulario
   * @returns {Object} Permisos formateados
   */
  formatPermissionsForBackend: (formPermissions) => {
    const formatted = {};
    
    Object.keys(formPermissions).forEach(module => {
      formatted[module] = {};
      Object.keys(formPermissions[module]).forEach(permission => {
        formatted[module][permission] = formPermissions[module][permission] || false;
      });
    });
    
    return formatted;
  },

  /**
   * Validar datos de rol
   * @param {Object} roleData - Datos del rol a validar
   * @returns {Object} { isValid: boolean, errors: Object }
   */
  validateRoleData: (roleData) => {
    const errors = {};
    
    if (!roleData.name || roleData.name.trim() === '') {
      errors.name = 'El nombre del rol es requerido';
    } else if (roleData.name.length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres';
    } else if (roleData.name.length > 50) {
      errors.name = 'El nombre no puede tener más de 50 caracteres';
    }
    
    if (roleData.description && roleData.description.length > 200) {
      errors.description = 'La descripción no puede tener más de 200 caracteres';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Contar usuarios por rol
   * @param {string} roleId - ID del rol
   * @returns {Promise<number>} Cantidad de usuarios con ese rol
   */
  countUsersByRole: async (roleId) => {
    try {
      // Esto dependerá de tu endpoint en el backend
      const response = await api.get(`/roles/${roleId}/users/count`);
      return response.data.count || 0;
    } catch (error) {
      console.error(`Error al contar usuarios del rol ${roleId}:`, error);
      return 0;
    }
  },

  /**
   * Obtener roles con conteo de usuarios
   * @returns {Promise<Array>} Roles con cantidad de usuarios
   */
  getRolesWithUserCount: async () => {
    try {
      const roles = await roleService.getRoles();
      
      // Agregar conteo de usuarios a cada rol
      const rolesWithCount = await Promise.all(
        roles.map(async (role) => {
          try {
            const count = await roleService.countUsersByRole(role.id);
            return { ...role, userCount: count };
          } catch (error) {
            console.error(`Error al obtener conteo para rol ${role.id}:`, error);
            return { ...role, userCount: 0 };
          }
        })
      );
      
      return rolesWithCount;
    } catch (error) {
      console.error('Error al obtener roles con conteo:', error);
      throw error;
    }
  },

  // ==================== ROLES PREDETERMINADOS ====================

  /**
   * Verificar si un rol es del sistema (no se puede eliminar)
   * @param {string} roleName - Nombre del rol
   * @returns {boolean} true si es rol del sistema
   */
  isSystemRole: (roleName) => {
    const systemRoles = ['Administrador', 'Admin', 'SuperAdmin', 'Super Administrador'];
    return systemRoles.some(sr => sr.toLowerCase() === roleName.toLowerCase());
  },

  /**
   * Crear estructura de permisos vacía
   * @returns {Object} Estructura de permisos con todos en false
   */
  createEmptyPermissions: () => {
    const modules = roleService.getAvailableModules();
    const permissions = {};
    
    modules.forEach(module => {
      permissions[module.key] = {};
      module.permissions.forEach(permission => {
        permissions[module.key][permission] = false;
      });
    });
    
    return permissions;
  },

  /**
   * Crear permisos completos (todos en true)
   * @returns {Object} Estructura de permisos con todos en true
   */
  createFullPermissions: () => {
    const modules = roleService.getAvailableModules();
    const permissions = {};
    
    modules.forEach(module => {
      permissions[module.key] = {};
      module.permissions.forEach(permission => {
        permissions[module.key][permission] = true;
      });
    });
    
    return permissions;
  },

  /**
   * Comparar dos conjuntos de permisos
   * @param {Object} permissions1 - Primer conjunto de permisos
   * @param {Object} permissions2 - Segundo conjunto de permisos
   * @returns {boolean} true si son iguales
   */
  comparePermissions: (permissions1, permissions2) => {
    if (!permissions1 || !permissions2) return false;
    
    const keys1 = Object.keys(permissions1);
    const keys2 = Object.keys(permissions2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (const module of keys1) {
      if (!permissions2[module]) return false;
      
      const modulePerms1 = permissions1[module];
      const modulePerms2 = permissions2[module];
      
      const permKeys1 = Object.keys(modulePerms1);
      const permKeys2 = Object.keys(modulePerms2);
      
      if (permKeys1.length !== permKeys2.length) return false;
      
      for (const perm of permKeys1) {
        if (modulePerms1[perm] !== modulePerms2[perm]) return false;
      }
    }
    
    return true;
  }
};

export default roleService;