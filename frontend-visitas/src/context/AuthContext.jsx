import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('visitors-user');
    const savedToken = localStorage.getItem('visitors-token');
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('visitors-user');
        localStorage.removeItem('visitors-token');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Credenciales inválidas');
      }

      const data = await response.json();
      
      setUser(data.user);
      setToken(data.token);
      
      // Guardar en localStorage
      localStorage.setItem('visitors-user', JSON.stringify(data.user));
      localStorage.setItem('visitors-token', data.token);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('visitors-user');
    localStorage.removeItem('visitors-token');
  };

  const hasPermission = (module, action) => {
    // Si no hay usuario o rol, no tiene permisos
    if (!user || !user.role || !user.role.permissions) {
      console.log('❌ No user, role or permissions');
      return false;
    }

    // Buscar el módulo específico
    const permission = user.role.permissions.find(
      p => p.module === module
    );

    console.log(`🔍 Checking ${module}.${action}:`, permission);

    if (!permission) {
      console.log(`❌ No permission found for module: ${module}`);
      return false;
    }

    // Verificar la acción específica
    switch (action) {
      case 'view':
        return permission.can_view === true;
      case 'create':
        return permission.can_create === true;
      case 'edit':
        return permission.can_edit === true;
      case 'delete':
        return permission.can_delete === true;
      default:
        console.log(`❌ Unknown action: ${action}`);
        return false;
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!token,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };