import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Spin,
  Modal,
  Tabs
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
  IdcardOutlined,
  KeyOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import userService from '../../services/userService';
import roleService from '../../services/roleService';

const { Option } = Select;

const EditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [roles, setRoles] = useState([]);
  const [userData, setUserData] = useState(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [user, rolesData] = await Promise.all([
        userService.getUserById(id),
        roleService.getActiveRoles()
      ]);

      setUserData(user);
      setRoles(rolesData);

      // Setear valores en el formulario
      form.setFieldsValue({
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        roleId: user.roleId,
        department: user.department || '',
        active: user.active
      });
    } catch (error) {
      console.error('Error al cargar datos:', error);
      message.error('Error al cargar los datos del usuario');
      navigate('/users');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Validar datos (isEdit = true)
      const { isValid, errors } = userService.validateUserData(values, true);
      
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

      // Verificar username único (excluyendo el usuario actual)
      if (values.username !== userData.username) {
        const usernameExists = await userService.checkUsernameExists(values.username, id);
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
      }

      // Verificar email único (excluyendo el usuario actual)
      if (values.email !== userData.email) {
        const emailExists = await userService.checkEmailExists(values.email, id);
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
      }

      // Preparar datos
      const updatedData = userService.prepareUserData(values, true);

      // Actualizar usuario
      await userService.updateUser(id, updatedData);
      
      message.success('Usuario actualizado exitosamente');
      navigate('/users');
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Error al actualizar el usuario');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    setChangingPassword(true);
    try {
      // Validar
      const { isValid, errors } = userService.validatePasswordChange(values);
      
      if (!isValid) {
        Object.keys(errors).forEach(key => {
          passwordForm.setFields([
            {
              name: key,
              errors: [errors[key]]
            }
          ]);
        });
        setChangingPassword(false);
        return;
      }

      // Cambiar contraseña
      await userService.changePassword(id, values);
      
      message.success('Contraseña actualizada exitosamente');
      setPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      if (error.response?.status === 401) {
        passwordForm.setFields([
          {
            name: 'currentPassword',
            errors: ['Contraseña actual incorrecta']
          }
        ]);
      } else {
        message.error('Error al cambiar la contraseña');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleResetPassword = () => {
    Modal.confirm({
      title: '¿Resetear contraseña?',
      content: 'Se generará una nueva contraseña temporal para este usuario',
      okText: 'Resetear',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          const newPassword = userService.generateRandomPassword(10);
          await userService.resetPassword(id, { newPassword });
          
          Modal.info({
            title: 'Contraseña reseteada',
            content: (
              <div>
                <p>Nueva contraseña temporal:</p>
                <Input.Password 
                  value={newPassword} 
                  readOnly 
                  style={{ marginTop: 8 }}
                />
                <p style={{ marginTop: 8, color: '#666', fontSize: '12px' }}>
                  Por favor, guarde esta contraseña y proporciónesela al usuario.
                </p>
              </div>
            ),
            okText: 'Entendido'
          });
        } catch (error) {
          console.error('Error al resetear contraseña:', error);
          message.error('Error al resetear la contraseña');
        }
      }
    });
  };

  const handleCancel = () => {
    navigate('/users');
  };

  if (loadingData) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Cargando datos del usuario..." />
      </div>
    );
  }

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
        <Breadcrumb.Item>Editar Usuario</Breadcrumb.Item>
      </Breadcrumb>

      <Card
        title={
          <Space>
            <UserOutlined />
            <span>Editar Usuario: {userData?.name}</span>
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
              Guardar Cambios
            </Button>
          </Space>
        }
      >
        <Tabs defaultActiveKey="1">
          {/* Pestaña de Información */}
          <Tabs.TabPane
            tab={
              <span>
                <IdcardOutlined />
                Información
              </span>
            }
            key="1"
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
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
                    label="Nombre de Usuario"
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

              {/* Estado */}
              <Divider orientation="left">Estado</Divider>

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
                    Guardar Cambios
                  </Button>
                </Col>
              </Row>
            </Form>
          </Tabs.TabPane>

          {/* Pestaña de Seguridad */}
          <Tabs.TabPane
            tab={
              <span>
                <LockOutlined />
                Seguridad
              </span>
            }
            key="2"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Card size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <strong>Cambiar Contraseña</strong>
                    <p style={{ color: '#8c8c8c', fontSize: '12px', marginTop: 4 }}>
                      Permite al usuario cambiar su contraseña actual por una nueva.
                    </p>
                  </div>
                  <Button
                    icon={<KeyOutlined />}
                    onClick={() => setPasswordModalVisible(true)}
                  >
                    Cambiar Contraseña
                  </Button>
                </Space>
              </Card>

              <Card size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <strong>Resetear Contraseña</strong>
                    <p style={{ color: '#8c8c8c', fontSize: '12px', marginTop: 4 }}>
                      Genera una nueva contraseña temporal. Útil cuando el usuario olvidó su contraseña.
                    </p>
                  </div>
                  <Button
                    danger
                    icon={<LockOutlined />}
                    onClick={handleResetPassword}
                  >
                    Resetear Contraseña
                  </Button>
                </Space>
              </Card>
            </Space>
          </Tabs.TabPane>

          {/* Pestaña de Historial */}
          <Tabs.TabPane
            tab={
              <span>
                <HistoryOutlined />
                Historial
              </span>
            }
            key="3"
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Card size="small" title="Fecha de Registro">
                  <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {userData?.createdAt 
                      ? new Date(userData.createdAt).toLocaleString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'N/A'
                    }
                  </p>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" title="Último Acceso">
                  <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {userData?.lastLogin 
                      ? new Date(userData.lastLogin).toLocaleString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Nunca ha iniciado sesión'
                    }
                  </p>
                </Card>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col xs={24} md={12}>
                <Card size="small" title="ID del Usuario">
                  <p style={{ fontSize: '14px', fontFamily: 'monospace' }}>
                    {userData?.id}
                  </p>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" title="Estado Actual">
                  <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {userData?.active ? (
                      <span style={{ color: '#52c41a' }}>✓ Activo</span>
                    ) : (
                      <span style={{ color: '#ff4d4f' }}>✗ Inactivo</span>
                    )}
                  </p>
                </Card>
              </Col>
            </Row>
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {/* Modal de Cambio de Contraseña */}
      <Modal
        title={
          <Space>
            <KeyOutlined />
            <span>Cambiar Contraseña</span>
          </Space>
        }
        open={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            label="Contraseña Actual"
            name="currentPassword"
            rules={[
              { required: true, message: 'Ingrese la contraseña actual' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Contraseña actual"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Nueva Contraseña"
            name="newPassword"
            rules={[
              { required: true, message: 'Ingrese la nueva contraseña' },
              { min: 6, message: 'Debe tener al menos 6 caracteres' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nueva contraseña (mínimo 6 caracteres)"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Confirmar Nueva Contraseña"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Confirme la nueva contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirme la nueva contraseña"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setPasswordModalVisible(false);
                passwordForm.resetFields();
              }}>
                Cancelar
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={changingPassword}
                icon={<SaveOutlined />}
              >
                Cambiar Contraseña
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EditUser;