import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';
import esES from 'antd/locale/es_ES';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth.jsx';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './context/useTheme.jsx';
import { lightTheme, darkTheme } from './theme/antd-theme';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Layout from './components/Layout';

// Dashboard con reportes y gráficas
import Dashboard from './pages/Dashboard';

// Visitors
import VisitorsList from './pages/Visitors/VisitorsList';
import NewVisitor from './pages/Visitors/NewVisitor';
import EditVisitor from './pages/Visitors/EditVisitor';

// Entries
import EntriesList from './pages/Entries/EntriesList';
import EntryNew from './pages/Entries/EntryNew';
import EntryDetail from './pages/Entries/EntryDetail';
import EntryEdit from './pages/Entries/EntryEdit';

// Users
import UsersList from './pages/Users/UsersList';
import NewUser from './pages/Users/NewUser';
import EditUser from './pages/Users/EditUser';

// Roles
import RolesList from './pages/Roles/RolesList';
import NewRole from './pages/Roles/NewRole';
import EditRole from './pages/Roles/EditRole';

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();

  return (
    <ConfigProvider
      locale={esES}
      theme={isDark ? darkTheme : lightTheme}
      algorithm={isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm}
    >
      <Routes>
        {/* Login */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
        />

        {/* Dashboard - Reportes y Estadísticas */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Visitantes */}
        <Route 
          path="/visitors" 
          element={
            <ProtectedRoute>
              <Layout>
                <VisitorsList />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/visitors/new" 
          element={
            <ProtectedRoute>
              <Layout>
                <NewVisitor />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/visitors/edit/:id" 
          element={
            <ProtectedRoute>
              <Layout>
                <EditVisitor />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Entradas y Salidas */}
        <Route 
          path="/entries" 
          element={
            <ProtectedRoute>
              <Layout>
                <EntriesList />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/entries/new" 
          element={
            <ProtectedRoute>
              <Layout>
                <EntryNew />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/entries/:id" 
          element={
            <ProtectedRoute>
              <Layout>
                <EntryDetail />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/entries/:id/edit" 
          element={
            <ProtectedRoute>
              <Layout>
                <EntryEdit />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Usuarios */}
        <Route 
          path="/users" 
          element={
            <ProtectedRoute>
              <Layout>
                <UsersList />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users/new" 
          element={
            <ProtectedRoute>
              <Layout>
                <NewUser />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users/edit/:id" 
          element={
            <ProtectedRoute>
              <Layout>
                <EditUser />
              </Layout>
            </ProtectedRoute>
          } 
        />

        {/* Roles */}
        <Route 
          path="/roles" 
          element={
            <ProtectedRoute>
              <Layout>
                <RolesList />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/roles/new" 
          element={
            <ProtectedRoute>
              <Layout>
                <NewRole />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/roles/edit/:id" 
          element={
            <ProtectedRoute>
              <Layout>
                <EditRole />
              </Layout>
            </ProtectedRoute>
          } 
        />

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