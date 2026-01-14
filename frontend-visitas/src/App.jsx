import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import esES from 'antd/locale/es_ES';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth.jsx';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './context/useTheme.jsx';
import { lightTheme, darkTheme } from './theme/antd-theme';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Layout from './components/Layout';

import Dashboard from './pages/Dashboard';

import VisitorsList from './pages/Visitors/VisitorsList';
import NewVisitor from './pages/Visitors/NewVisitor';
import EditVisitor from './pages/Visitors/EditVisitor';

import EntriesList from './pages/Entries/EntriesList';
import EntryNew from './pages/Entries/EntryNew';
import EntryDetail from './pages/Entries/EntryDetail';
import EntryEdit from './pages/Entries/EntryEdit';

import UsersList from './pages/Users/UsersList';
import NewUser from './pages/Users/NewUser';
import EditUser from './pages/Users/EditUser';

import RolesList from './pages/Roles/RolesList';
import NewRole from './pages/Roles/NewRole';
import EditRole from './pages/Roles/EditRole';
import DepartmentList from './pages/Department/DepartmentList.jsx';
import VisitPurposeList from './pages/VisitPurposeList/VisitPurposeList.jsx';

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();
  const { isDark } = useTheme();

  // 🛑 Mostrar spinner mientras verifica autenticación
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: isDark ? '#0f172a' : '#f0f2f5',
          gap: '16px',
        }}
      >
        <Spin size="large" />
        <p style={{ 
          color: isDark ? '#94a3b8' : '#64748b',
          fontSize: '14px',
          fontWeight: 500,
        }}>
          Cargando...
        </p>
      </div>
    );
  }

  return (
    <ConfigProvider
      locale={esES}
      theme={isDark ? darkTheme : lightTheme}
    >
      <Routes>
        {/* Login - Redirige al dashboard si ya está autenticado */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
        />

        {/* Rutas protegidas con Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout>
                <Outlet />
              </Layout>
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Visitantes */}
          <Route path="/visitors" element={<VisitorsList />} />
          <Route path="/visitors/new" element={<NewVisitor />} />
          <Route path="/visitors/edit/:id" element={<EditVisitor />} />

          {/* Entradas y Salidas */}
          <Route path="/entries" element={<EntriesList />} />
          <Route path="/entries/new" element={<EntryNew />} />
          <Route path="/entries/:id" element={<EntryDetail />} />
          <Route path="/entries/:id/edit" element={<EntryEdit />} />

          {/* Usuarios */}
          <Route path="/users" element={<UsersList />} />
          <Route path="/users/new" element={<NewUser />} />
          <Route path="/users/edit/:id" element={<EditUser />} />

          {/* Roles */}
          <Route path="/roles" element={<RolesList />} />
          <Route path="/roles/new" element={<NewRole />} />
          <Route path="/roles/edit/:id" element={<EditRole />} />

          {/* Configuración */}
          <Route path="/department" element={<DepartmentList />} />
          <Route path="/visit-purposes" element={<VisitPurposeList />} />
        </Route>

        {/* Redirecciones */}
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </ConfigProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;