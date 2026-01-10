import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  message,
  Breadcrumb,
  Row,
  Col,
  Switch,
  Divider,
  Tooltip
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  HomeOutlined,
  SafetyOutlined,
  SaveOutlined,
  CloseOutlined,
  TeamOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import userService from '../../services/userService';
import roleService from '../../services/roleService';

const { Option } = Select;

const NewUser = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoadingRoles(true);
    try {
      const data = await roleService.getActiveRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error al cargar roles:', error);
      message.error('Error al cargar los roles');
    } finally {
      setLoadingRoles(false);
    }
  };


 

  const handleGeneratePassword = () => {
    const password = userService.generateRandomPassword(12);
    form.setFieldsValue({ 
      password: password,
      confirmPassword: password
    });
    message.success('Contraseña generada');
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Validar datos
      const { isValid, errors } = userService.validateUserData(values, false);
      
      if (!isValid) {
        Object.keys(errors).forEach(key => {
          form.setFields([
            {
              name: key,
              errors: [errors[key]]
            }
          ]);
        });
        setLoading(false);
        return;
      }

      // Verificar username único
      const usernameExists = await userService.checkUsernameExists(values.username);
      if (usernameExists) {
        form.setFields([
          {
            name: 'username',
            errors: ['Este nombre de usuario ya está en uso']
          }
        ]);
        setLoading(false);
        return;
      }

      // Verificar email único
      const emailExists = await userService.checkEmailExists(values.email);
      if (emailExists) {
        form.setFields([
          {
            name: 'email',
            errors: ['Este email ya está registrado']
          }
        ]);
        setLoading(false);
        return;
      }

      // Preparar datos
      const userData = userService.prepareUserData(values, false);

      // Crear usuario
      await userService.createUser(userData);
      
      message.success('Usuario creado exitosamente');
      navigate('/users');
    } catch (error) {
      console.error('Error al crear usuario:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Error al crear el usuario');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 24 }}>
        <Breadcrumb.Item href="/">
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/users">
          <UserOutlined />
          <span>Usuarios</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Nuevo Usuario</Breadcrumb.Item>
      </Breadcrumb>

      <Card
        title={
          <Space>
            <UserOutlined />
            <span>Crear Nuevo Usuario</span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<CloseOutlined />} onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={loading}
              onClick={() => form.submit()}
            >
              Guardar Usuario
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            active: true,
          }}
        >
          {/* Información Básica */}
          <Divider orientation="left">
            <Space>
              <IdcardOutlined />
              Información Personal
            </Space>
          </Divider>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Nombre Completo"
                name="name"
                rules={[
                  { required: true, message: 'El nombre es requerido' },
                  { min: 3, message: 'El nombre debe tener al menos 3 caracteres' },
                  { max: 100, message: 'El nombre no puede tener más de 100 caracteres' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Ej: Juan Pérez García"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <Space>
                    <span>Nombre de Usuario</span>
                  </Space>
                }
                name="username"
                rules={[
                  { required: true, message: 'El username es requerido' },
                  { min: 3, message: 'Debe tener al menos 3 caracteres' },
                  { max: 50, message: 'No puede tener más de 50 caracteres' },
                  { 
                    pattern: /^[a-zA-Z0-9_.-]+$/, 
                    message: 'Solo letras, números, guiones y puntos' 
                  }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Ej: juan.perez"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'El email es requerido' },
                  { type: 'email', message: 'Email no válido' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="correo@ejemplo.com"
                  size="large"
                  type="email"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Teléfono (opcional)"
                name="phone"
                rules={[
                  { 
                    pattern: /^[0-9+\s()-]{7,20}$/, 
                    message: 'Teléfono no válido' 
                  }
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="+593 99 123 4567"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Información Organizacional */}
          <Divider orientation="left">
            <Space>
              <TeamOutlined />
              Información Organizacional
            </Space>
          </Divider>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Rol"
                name="roleId"
                rules={[
                  { required: true, message: 'Debe seleccionar un rol' }
                ]}
              >
                <Select
                  placeholder="Seleccione un rol"
                  size="large"
                  loading={loadingRoles}
                  suffixIcon={<SafetyOutlined />}
                >
                  {roles.map(role => (
                    <Option key={role.id} value={role.id}>
                      <Space>
                        <SafetyOutlined />
                        {role.name}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Departamento (opcional)"
                name="department"
              >
                <Input
                  prefix={<TeamOutlined />}
                  placeholder="Ej: Recursos Humanos"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Seguridad */}
          <Divider orientation="left">
            <Space>
              <LockOutlined />
              Seguridad y Acceso
            </Space>
          </Divider>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <Space>
                    <span>Contraseña</span>
                    <Button
                      type="link"
                      size="small"
                      onClick={handleGeneratePassword}
                    >
                      Generar automática
                    </Button>
                  </Space>
                }
                name="password"
                rules={[
                  { required: true, message: 'La contraseña es requerida' },
                  { min: 6, message: 'Debe tener al menos 6 caracteres' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Mínimo 6 caracteres"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Confirmar Contraseña"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Debe confirmar la contraseña' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Las contraseñas no coinciden'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Repita la contraseña"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Estado */}
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                label="Estado del Usuario"
                name="active"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Activo"
                  unCheckedChildren="Inactivo"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Botones de acción */}
          <Row gutter={16} style={{ marginTop: 24 }}>
            <Col xs={24} md={12}>
              <Button
                block
                size="large"
                icon={<CloseOutlined />}
                onClick={handleCancel}
              >
                Cancelar
              </Button>
            </Col>
            <Col xs={24} md={12}>
              <Button
                block
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                loading={loading}
                htmlType="submit"
              >
                Crear Usuario
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default NewUser;