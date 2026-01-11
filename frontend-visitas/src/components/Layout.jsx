import React, { useState, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { Layout, Menu, Button, Avatar, Space, Tooltip, Divider } from 'antd';
import {
  LayoutDashboard,
  UserCheck,
  ClipboardList,
  BarChart3,
  Users,
  ShieldCheck,
  LogOut,
  Menu as MenuIcon,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Building2,
  FileText,
  LogIn,
} from "lucide-react";
import { useAuth } from "../context/useAuth";
import { useTheme } from '../context/useTheme.jsx';

const { Sider, Content, Header } = Layout;

const LayoutComponent = ({ children }) => {
  const { user, logout, hasPermission } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const allMenuItems = [
    {
      key: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      label: <Link to="/dashboard">Dashboard</Link>,
      module: "dashboard",
    },
    {
      key: "/visitors",
      icon: <UserCheck size={20} />,
      label: <Link to="/visitors">Visitantes</Link>,
      module: "visitors",
    },
    {
      key: "/entries",
      icon: <LogIn size={20} />,
      label: <Link to="/entries">Entradas/Salidas</Link>,
      module: "entries",
    },
    {
      key: "configuration",
      icon: <BarChart3 size={20} />,
      label: "Configuración",
      children: [
        {
          key: "/department",
          icon: <Building2 size={18} />,
          label: <Link to="/department">Departamentos</Link>,
          module: "department",
        },
        {
          key: "/visit-purposes",
          icon: <FileText size={18} />,
          label: <Link to="/visit-purposes">Motivos de Visita</Link>,
          module: "visit-purposes",
        },
      ],
    },
    {
      key: "admin",
      icon: <ShieldCheck size={20} />,
      label: "Administración",
      children: [
        {
          key: "/users",
          icon: <Users size={18} />,
          label: <Link to="/users">Usuarios</Link>,
          module: "users",
        },
        {
          key: "/roles",
          icon: <ShieldCheck size={18} />,
          label: <Link to="/roles">Roles</Link>,
          module: "roles",
        },
      ],
    },
  ];

  const filterMenuByPermissions = (menuItems) => {
    return menuItems
      .map((menu) => {
        if (menu.children) {
          const allowedChildren = menu.children.filter((child) =>
            child.module ? hasPermission(child.module, "view") : true
          );

          if (allowedChildren.length > 0) {
            return {
              ...menu,
              children: allowedChildren,
            };
          }
          return null;
        }

        return menu.module && hasPermission(menu.module, "view") ? menu : null;
      })
      .filter(Boolean);
  };

  const menuItems = useMemo(() => {
    return filterMenuByPermissions(allMenuItems);
  }, [hasPermission]);

  const getSelectedKeys = () => {
    const currentPath = location.pathname;
    
    // Manejo especial para rutas dinámicas
    if (currentPath.startsWith('/entries/edit/') || 
        currentPath.startsWith('/entries/new') ||
        currentPath.match(/^\/entries\/[^/]+$/)) {
      return ['/entries'];
    }
    if (currentPath.startsWith('/visitors/edit/') || 
        currentPath === '/visitors/new') {
      return ['/visitors'];
    }
    if (currentPath.startsWith('/users/edit/') ||
        currentPath === '/users/new') {
      return ['/users'];
    }
    if (currentPath.startsWith('/roles/edit/') ||
        currentPath === '/roles/new') {
      return ['/roles'];
    }
    if (currentPath === '/departments') {
      return ['/departments'];
    }
    if (currentPath === '/visit-purposes') {
      return ['/visit-purposes'];
    }
    
    // Búsqueda en el menú
    for (const item of menuItems) {
      if (item.children) {
        const child = item.children.find(c => c.key === currentPath);
        if (child) return [child.key];
      } else if (item.key === currentPath) {
        return [item.key];
      }
    }
    
    return [];
  };

  const getOpenKeys = () => {
    const currentPath = location.pathname;
    
    // Mantener abierto el submenú correcto
    if (currentPath.startsWith('/users') || currentPath.startsWith('/roles')) {
      return ['admin'];
    }
    
    if (currentPath === '/departments' || currentPath === '/visit-purposes') {
      return ['configuration'];
    }
    
    for (const item of menuItems) {
      if (item.children) {
        const child = item.children.find(c => c.key === currentPath);
        if (child) return [item.key];
      }
    }
    
    return [];
  };

  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/visitors') return 'Visitantes';
    if (path === '/visitors/new') return 'Nuevo Visitante';
    if (path.startsWith('/visitors/edit/')) return 'Editar Visitante';
    if (path === '/entries') return 'Entradas y Salidas';
    if (path === '/entries/new') return 'Registrar Entrada';
    if (path.startsWith('/entries/edit/')) return 'Editar Entrada';
    if (path.match(/^\/entries\/[^/]+$/)) return 'Detalle de Entrada';
    if (path === '/departments') return 'Departamentos';
    if (path === '/visit-purposes') return 'Motivos de Visita';
    if (path === '/users') return 'Usuarios';
    if (path === '/users/new') return 'Nuevo Usuario';
    if (path.startsWith('/users/edit/')) return 'Editar Usuario';
    if (path === '/roles') return 'Roles';
    if (path === '/roles/new') return 'Nuevo Rol';
    if (path.startsWith('/roles/edit/')) return 'Editar Rol';
    
    return 'Sistema de Control';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={280}
        trigger={null}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          height: '100vh',
          overflow: 'auto',
          background: isDark ? '#0f172a' : '#1e293b',
          borderRight: isDark ? '1px solid #1e293b' : '1px solid #334155',
          boxShadow: isDark
            ? '4px 0 24px rgba(0, 0, 0, 0.4)'
            : '4px 0 24px rgba(0, 0, 0, 0.08)',
          zIndex: 100,
        }}
      >
        {/* Logo y Título */}
        <div style={{ 
          padding: collapsed ? '20px 0' : '24px 20px', 
          textAlign: 'center',
          background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.08)',
          borderBottom: isDark ? '1px solid #1e293b' : '1px solid #334155',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <Avatar 
            size={collapsed ? 48 : 64}
            style={{ 
              backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontSize: collapsed ? '24px' : '32px',
              fontWeight: 'bold',
              boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            V
          </Avatar>
          {!collapsed && (
            <div style={{ marginTop: 12 }}>
              <h3 style={{ 
                color: '#fff', 
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}>
                Control de Visitantes
              </h3>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                margin: '4px 0 0 0',
                fontSize: '13px',
                fontWeight: 500,
              }}>
                Sistema Integral
              </p>
            </div>
          )}
        </div>

        {/* Menú de Navegación */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '12px 8px',
          }}
        />

        {/* Botón de Colapsar/Expandir */}
        <div style={{ 
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0,
          padding: '0 16px',
        }}>
          <Button
            type="text"
            icon={collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: '100%',
              height: 40,
              color: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s',
            }}
            className="sidebar-collapse-btn"
          />
        </div>
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? 80 : 280,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 90,
            padding: '0 32px',
            background: isDark ? '#0f172a' : '#ffffff',
            borderBottom: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: isDark
              ? '0 1px 3px rgba(0, 0, 0, 0.3)'
              : '0 1px 3px rgba(0, 0, 0, 0.06)',
            height: 72,
          }}
        >
          {/* Lado Izquierdo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={<MenuIcon size={22} />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ 
                fontSize: '16px',
                width: 40,
                height: 40,
                borderRadius: 8,
                color: isDark ? '#e2e8f0' : '#475569',
                transition: 'all 0.3s',
              }}
              className="nav-menu-btn"
            />
            
            <div style={{ 
              color: isDark ? '#e2e8f0' : '#1e293b',
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}>
              {getPageTitle()}
            </div>
          </div>

          {/* Lado Derecho */}
          <Space size={8}>
            {/* Modo Oscuro/Claro */}
            <Tooltip title={isDark ? 'Modo claro' : 'Modo oscuro'}>
              <Button
                type="text"
                icon={isDark ? <Sun size={20} /> : <Moon size={20} />}
                onClick={toggleTheme}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  color: isDark ? '#fbbf24' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                }}
                className="nav-icon-btn"
              />
            </Tooltip>

            <Divider type="vertical" style={{ 
              height: 32, 
              margin: '0 8px',
              borderColor: isDark ? '#334155' : '#e2e8f0',
            }} />

            {/* Perfil de Usuario */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12,
              padding: '6px 12px',
              borderRadius: 12,
              background: isDark ? '#1e293b' : '#f8fafc',
              transition: 'all 0.3s',
            }}>
              <Avatar 
                size={40}
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: '16px',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ 
                  color: isDark ? '#f1f5f9' : '#1e293b',
                  fontWeight: 600,
                  fontSize: '14px',
                }}>
                  {user?.name || 'Usuario'}
                </div>
                <div style={{ 
                  color: isDark ? '#94a3b8' : '#64748b',
                  fontSize: '12px',
                }}>
                  {user?.role?.name || 'Rol'}
                </div>
              </div>
            </div>

            {/* Cerrar Sesión */}
            <Tooltip title="Cerrar sesión">
              <Button
                type="text"
                danger
                icon={<LogOut size={20} />}
                onClick={logout}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                }}
                className="nav-logout-btn"
              />
            </Tooltip>
          </Space>
        </Header>

        {/* Contenido */}
        <Content
          style={{
            margin: '24px',
            overflowY: 'auto',
            height: 'calc(100vh - 72px)',
          }}
        >
          <div style={{
            padding: 24,
            background: isDark ? '#0f172a' : '#ffffff',
            borderRadius: 16,
            minHeight: 'calc(100vh - 168px)',
            boxShadow: isDark 
              ? '0 4px 24px rgba(0, 0, 0, 0.3)' 
              : '0 1px 3px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutComponent;