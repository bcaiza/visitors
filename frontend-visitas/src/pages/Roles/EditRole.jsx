import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  message,
  Breadcrumb,
  Row,
  Col,
  Switch,
  Divider,
  Checkbox,
  Alert,
  Spin,
  Tag,
  Tabs
} from 'antd';
import {
  SafetyOutlined,
  HomeOutlined,
  SaveOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { ShieldCheck as ShieldCheckOutlined } from 'lucide-react';
import roleService from '../../services/roleService';

const { TextArea } = Input;

const EditRole = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [roleData, setRoleData] = useState(null);
  
  // Estado para permisos por módulo
  const [permissions, setPermissions] = useState({
    dashboard: { view: false },
    visitors: { view: false, create: false, edit: false, delete: false },
    entries: { view: false, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    roles: { view: false, create: false, edit: false, delete: false },
  });

  // Definición de módulos con sus permisos disponibles
  const modules = [
    {
      key: 'dashboard',
      name: 'Dashboard',
      description: 'Panel de control y estadísticas',
      permissions: ['view'],
      icon: '📊'
    },
    {
      key: 'visitors',
      name: 'Visitantes',
      description: 'Gestión de visitantes',
      permissions: ['view', 'create', 'edit', 'delete'],
      icon: '👥'
    },
    {
      key: 'entries',
      name: 'Entradas/Salidas',
      description: 'Registro de entradas y salidas',
      permissions: ['view', 'create', 'edit', 'delete'],
      icon: '📋'
    },
    {
      key: 'users',
      name: 'Usuarios',
      description: 'Administración de usuarios',
      permissions: ['view', 'create', 'edit', 'delete'],
      icon: '👤'
    },
    {
      key: 'roles',
      name: 'Roles',
      description: 'Gestión de roles y permisos',
      permissions: ['view', 'create', 'edit', 'delete'],
      icon: '🛡️'
    },
  ];

  const permissionLabels = {
    view: 'Ver',
    create: 'Crear',
    edit: 'Editar',
    delete: 'Eliminar'
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const role = await roleService.getRoleById(id);
      setRoleData(role);

      // Setear valores en el formulario
      form.setFieldsValue({
        name: role.name,
        description: role.description || '',
        isActive: role.isActive !== undefined ? role.isActive : true
      });

      // Transformar y setear permisos
      if (role.permissions && Array.isArray(role.permissions)) {
        const transformedPermissions = {};
        role.permissions.forEach(perm => {
          transformedPermissions[perm.module] = {
            view: perm.can_view || false,
            create: perm.can_create || false,
            edit: perm.can_edit || false,
            delete: perm.can_delete || false,
          };
        });
        setPermissions(transformedPermissions);
      } else {
        // Si no hay permisos, usar valores por defecto
        setPermissions({
          dashboard: { view: false },
          visitors: { view: false, create: false, edit: false, delete: false },
          entries: { view: false, create: false, edit: false, delete: false },
          users: { view: false, create: false, edit: false, delete: false },
          roles: { view: false, create: false, edit: false, delete: false },
        });
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      message.error('Error al cargar los datos del rol');
      navigate('/roles');
    } finally {
      setLoadingData(false);
    }
  };

  const handlePermissionChange = (module, permission, checked) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [permission]: checked
      }
    }));
  };

  const handleSelectAllModule = (module, checked) => {
    const modulePerms = modules.find(m => m.key === module);
    if (!modulePerms) return;

    const newPerms = {};
    modulePerms.permissions.forEach(perm => {
      newPerms[perm] = checked;
    });

    setPermissions(prev => ({
      ...prev,
      [module]: newPerms
    }));
  };

  const handleSelectAll = (checked) => {
    const newPermissions = {};
    modules.forEach(module => {
      newPermissions[module.key] = {};
      module.permissions.forEach(perm => {
        newPermissions[module.key][perm] = checked;
      });
    });
    setPermissions(newPermissions);
  };

  const isModuleFullySelected = (module) => {
    const modulePerms = modules.find(m => m.key === module);
    if (!modulePerms) return false;
    
    return modulePerms.permissions.every(perm => permissions[module][perm]);
  };

  const getPermissionCount = () => {
    let count = 0;
    Object.values(permissions).forEach(modulePerms => {
      Object.values(modulePerms).forEach(perm => {
        if (perm === true) count++;
      });
    });
    return count;
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Validar datos
      const { isValid, errors } = roleService.validateRoleData(values);
      
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

      // Verificar si el nombre ya existe (excluyendo el rol actual)
      if (values.name !== roleData.name) {
        const nameExists = await roleService.checkRoleNameExists(values.name, id);
        if (nameExists) {
          form.setFields([
            {
              name: 'name',
              errors: ['Ya existe un rol con este nombre']
            }
          ]);
          setLoading(false);
          return;
        }
      }

      // Verificar que al menos tenga un permiso
      const permCount = getPermissionCount();
      if (permCount === 0) {
        message.warning('Debe asignar al menos un permiso al rol');
        setLoading(false);
        return;
      }

      // Preparar datos del rol
      const transformedPermissions = [];
      Object.keys(permissions).forEach(moduleKey => {
        const modulePerms = permissions[moduleKey];
        transformedPermissions.push({
          module: moduleKey,
          can_view: modulePerms.view || false,
          can_create: modulePerms.create || false,
          can_edit: modulePerms.edit || false,
          can_delete: modulePerms.delete || false,
        });
      });

      const updatedData = {
        name: values.name,
        description: values.description || '',
        isActive: values.isActive !== undefined ? values.isActive : true,
        permissions: transformedPermissions
      };

      // Actualizar rol
      await roleService.updateRole(id, updatedData);
      
      message.success('Rol actualizado exitosamente');
      navigate('/roles');
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Error al actualizar el rol');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/roles');
  };

  if (loadingData) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Cargando datos del rol..." />
      </div>
    );
  }

  const permCount = getPermissionCount();
  const isSystemRole = roleService.isSystemRole(roleData?.name || '');

  return (
    <div style={{ padding: '24px' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 24 }}>
        <Breadcrumb.Item href="/">
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/roles">
          <SafetyOutlined />
          <span>Roles</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Editar Rol</Breadcrumb.Item>
      </Breadcrumb>

      <Card
        title={
          <Space>
            <SafetyOutlined />
            <span>Editar Rol: {roleData?.name}</span>
            {isSystemRole && (
              <Tag color="gold">Sistema</Tag>
            )}
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
              disabled={isSystemRole}
            >
              Guardar Cambios
            </Button>
          </Space>
        }
      >
        {isSystemRole && (
          <Alert
            message="Rol del Sistema"
            description="Este es un rol del sistema y no puede ser modificado. Solo se puede ver su configuración."
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Tabs defaultActiveKey="1">
          {/* Pestaña de Información */}
          <Tabs.TabPane
            tab={
              <span>
                <SafetyOutlined />
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
                  <SafetyOutlined />
                  Información del Rol
                </Space>
              </Divider>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Nombre del Rol"
                    name="name"
                    rules={[
                      { required: true, message: 'El nombre es requerido' },
                      { min: 3, message: 'El nombre debe tener al menos 3 caracteres' },
                      { max: 50, message: 'El nombre no puede tener más de 50 caracteres' }
                    ]}
                  >
                    <Input
                      prefix={<SafetyOutlined />}
                      placeholder="Ej: Recepcionista"
                      size="large"
                      disabled={isSystemRole}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Estado del Rol"
                    name="isActive"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="Activo"
                      unCheckedChildren="Inactivo"
                      style={{ marginTop: 4 }}
                      disabled={isSystemRole}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item
                    label="Descripción"
                    name="description"
                    rules={[
                      { max: 200, message: 'La descripción no puede tener más de 200 caracteres' }
                    ]}
                  >
                    <TextArea
                      placeholder="Descripción breve del rol y sus responsabilidades..."
                      rows={3}
                      disabled={isSystemRole}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Permisos */}
              <Divider orientation="left">
                <Space>
                  <ShieldCheckOutlined />
                  <span>Permisos del Rol</span>
                  <Tag color="blue">{permCount} permiso{permCount !== 1 ? 's' : ''} seleccionado{permCount !== 1 ? 's' : ''}</Tag>
                </Space>
              </Divider>

              {!isSystemRole && (
                <>
                  <Alert
                    message="Asignación de Permisos"
                    description="Modifique los permisos que tendrá este rol para cada módulo del sistema."
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />

                  {/* Botón Seleccionar/Deseleccionar Todo */}
                  <div style={{ marginBottom: 16 }}>
                    <Button
                      type="dashed"
                      onClick={() => handleSelectAll(true)}
                      style={{ marginRight: 8 }}
                    >
                      Seleccionar Todo
                    </Button>
                    <Button
                      type="dashed"
                      onClick={() => handleSelectAll(false)}
                    >
                      Deseleccionar Todo
                    </Button>
                  </div>
                </>
              )}

              {/* Tabla de Permisos */}
              <div style={{ 
                border: '1px solid #f0f0f0', 
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                {modules.map((module, index) => (
                  <div
                    key={module.key}
                    style={{
                      padding: '16px',
                      borderBottom: index < modules.length - 1 ? '1px solid #f0f0f0' : 'none',
                      backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff'
                    }}
                  >
                    <Row gutter={16} align="middle">
                      <Col xs={24} md={8}>
                        <Space direction="vertical" size={0}>
                          <Space>
                            <span style={{ fontSize: '20px' }}>{module.icon}</span>
                            <strong style={{ fontSize: '15px' }}>{module.name}</strong>
                          </Space>
                          <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            {module.description}
                          </span>
                        </Space>
                      </Col>
                      <Col xs={24} md={12}>
                        <Space wrap>
                          {module.permissions.map(perm => (
                            <Checkbox
                              key={perm}
                              checked={permissions[module.key][perm]}
                              onChange={(e) => handlePermissionChange(module.key, perm, e.target.checked)}
                              disabled={isSystemRole}
                            >
                              {permissionLabels[perm]}
                            </Checkbox>
                          ))}
                        </Space>
                      </Col>
                      <Col xs={24} md={4} style={{ textAlign: 'right' }}>
                        <Checkbox
                          checked={isModuleFullySelected(module.key)}
                          onChange={(e) => handleSelectAllModule(module.key, e.target.checked)}
                          disabled={isSystemRole}
                        >
                          Todos
                        </Checkbox>
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>

              {/* Botones de acción */}
              {!isSystemRole && (
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
              )}
            </Form>
          </Tabs.TabPane>

          {/* Pestaña de Historial */}
          <Tabs.TabPane
            tab={
              <span>
                <HistoryOutlined />
                Información
              </span>
            }
            key="2"
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Card size="small" title="Fecha de Creación">
                  <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {roleData?.createdAt 
                      ? new Date(roleData.createdAt).toLocaleString('es-ES', {
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
                <Card size="small" title="Usuarios con este Rol">
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                    <TeamOutlined /> {roleData?.userCount || 0}
                  </p>
                </Card>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col xs={24} md={12}>
                <Card size="small" title="ID del Rol">
                  <p style={{ fontSize: '14px', fontFamily: 'monospace' }}>
                    {roleData?.id}
                  </p>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" title="Estado Actual">
                  <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {roleData?.isActive ? (
                      <span style={{ color: '#52c41a' }}>✓ Activo</span>
                    ) : (
                      <span style={{ color: '#ff4d4f' }}>✗ Inactivo</span>
                    )}
                  </p>
                </Card>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col xs={24}>
                <Card size="small" title="Tipo de Rol">
                  <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {isSystemRole ? (
                      <Tag color="gold" style={{ fontSize: '14px', padding: '4px 12px' }}>
                        🛡️ Rol del Sistema
                      </Tag>
                    ) : (
                      <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                        👤 Rol Personalizado
                      </Tag>
                    )}
                  </p>
                </Card>
              </Col>
            </Row>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default EditRole;