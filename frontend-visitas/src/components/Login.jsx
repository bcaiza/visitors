import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, Avatar, Space } from 'antd';
import { UserCheck, Mail, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/useAuth.jsx';
import { useTheme } from '../context/useTheme.jsx';

const Login = () => {
  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setError('');
    setLoading(true);

    const result = await login(values.email, values.password);
    
    if (result.success) {
      navigate('/entries', { replace: true });
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }
    
    setLoading(false);
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: isDark 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Elementos decorativos de fondo */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: isDark 
          ? 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)',
        borderRadius: '50%',
        top: '-200px',
        right: '-200px',
        animation: 'pulse 8s infinite',
      }} />
      
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: isDark 
          ? 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        bottom: '-150px',
        left: '-150px',
        animation: 'pulse 10s infinite',
      }} />

      {/* Card principal */}
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 460,
          background: isDark 
            ? 'rgba(30, 41, 59, 0.9)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: isDark
            ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            : '0 20px 60px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.5)',
          borderRadius: 24,
          border: 'none',
          position: 'relative',
          zIndex: 1,
          animation: 'fadeIn 0.6s ease-out',
        }}
        bordered={false}
      >
        {/* Header del login */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            position: 'relative',
            display: 'inline-block',
            marginBottom: 24,
          }}>
            <Avatar 
              size={80}
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                animation: 'pulse 3s infinite',
              }}
            >
              <UserCheck size={40} strokeWidth={2} />
            </Avatar>
            
            {/* Icono flotante decorativo */}
            <div style={{
              position: 'absolute',
              top: -8,
              right: -8,
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(251, 191, 36, 0.5)',
              animation: 'pulse 2s infinite',
            }}>
              <Sparkles size={16} color="#fff" />
            </div>
          </div>
          
          <h1 style={{ 
            fontSize: '28px',
            fontWeight: 800,
            marginBottom: 8,
            background: isDark
              ? 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em',
          }}>
            Control de Visitantes
          </h1>
          
          <p style={{ 
            color: isDark ? '#94a3b8' : '#64748b',
            fontSize: '15px',
            fontWeight: 500,
            marginBottom: 8,
          }}>
            Sistema Integral de Gestión
          </p>
          
          <Space size={4} style={{ justifyContent: 'center' }}>
            <ShieldCheck size={16} style={{ color: '#10b981' }} />
            <span style={{ 
              fontSize: '13px', 
              color: '#10b981',
              fontWeight: 600,
            }}>
              Conexión Segura
            </span>
          </Space>
        </div>

        {/* Alerta de error */}
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError('')}
            style={{ 
              marginBottom: 24,
              borderRadius: 12,
              border: 'none',
              animation: 'fadeIn 0.3s ease-out',
            }}
          />
        )}

        {/* Formulario */}
        <Form
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
          style={{
            animation: 'slideInRight 0.5s ease-out',
          }}
        >
          <Form.Item
            label={
              <span style={{ 
                fontWeight: 600, 
                fontSize: '14px',
                color: isDark ? '#e2e8f0' : '#475569',
              }}>
                Correo electrónico
              </span>
            }
            name="email"
            rules={[
              { required: true, message: 'Por favor ingrese su correo' },
              { type: 'email', message: 'Ingrese un correo válido' }
            ]}
          >
            <Input 
              prefix={<Mail size={18} style={{ color: '#94a3b8' }} />}
              placeholder="usuario@empresa.com"
              style={{
                borderRadius: 12,
                height: 48,
                fontSize: '15px',
              }}
            />
          </Form.Item>

          <Form.Item
            label={
              <span style={{ 
                fontWeight: 600, 
                fontSize: '14px',
                color: isDark ? '#e2e8f0' : '#475569',
              }}>
                Contraseña
              </span>
            }
            name="password"
            rules={[
              { required: true, message: 'Por favor ingrese su contraseña' }
            ]}
          >
            <Input.Password 
              prefix={<Lock size={18} style={{ color: '#94a3b8' }} />}
              placeholder="••••••••"
              style={{
                borderRadius: 12,
                height: 48,
                fontSize: '15px',
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
              icon={<UserCheck size={20} />}
              style={{
                height: 52,
                borderRadius: 12,
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: '0.02em',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: loading 
                  ? 'none'
                  : '0 6px 20px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
            </Button>
          </Form.Item>
        </Form>

        {/* Footer del card */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: 28,
          paddingTop: 24,
          borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        }}>
          <Space direction="vertical" size={4}>
            <p style={{ 
              fontSize: '13px', 
              color: isDark ? '#94a3b8' : '#64748b',
              fontWeight: 500,
              margin: 0,
            }}>
              🔐 Acceso exclusivo para personal autorizado
            </p>
            <p style={{ 
              fontSize: '12px', 
              color: isDark ? '#64748b' : '#94a3b8',
              margin: 0,
            }}>
              Protegido con encriptación de grado empresarial
            </p>
          </Space>
        </div>
      </Card>

      {/* Footer fijo */}
      <div style={{ 
        position: 'absolute', 
        bottom: 24, 
        textAlign: 'center',
        width: '100%',
        zIndex: 1,
      }}>
        <p style={{ 
          fontSize: '14px',
          color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.9)',
          fontWeight: 600,
          margin: 0,
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        }}>
          Sistema de Control de Visitantes © {new Date().getFullYear()}
        </p>
        <p style={{ 
          fontSize: '12px',
          color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.7)',
          margin: '4px 0 0 0',
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        }}>
          Desarrollado con tecnología de vanguardia
        </p>
      </div>
    </div>
  );
};

export default Login;
