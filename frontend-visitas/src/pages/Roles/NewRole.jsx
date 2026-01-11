import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Table,
  Tag
} from 'antd';
import {
  SafetyOutlined,
  HomeOutlined,
  SaveOutlined,
  CloseOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { ShieldCheck as ShieldCheckOutlined } from 'lucide-react';
import roleService from '../../services/roleService';

const { TextArea } = Input;

const NewRole = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // Estado para permisos por módulo
  const [permissions, setPermissions] = useState({
    dashboard: { view: false },
    visitors: { view: false, create: false, edit: false, delete: false },
    entries: { view: false, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    roles: { view: false, create: false, edit: false, delete: false },
    department: { view: false, create: false, edit: false, delete: false },
    'visit-purpose': { view: false, create: false, edit: false, delete: false },
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
  key: 'department',
  name: 'Departamentos',
  description: 'Gestión de departamentos',
  permissions: ['view', 'create', 'edit', 'delete'],
  icon: '🏢'
},
{
  key: 'visit-purpose',
  name: 'Propósito de Visita',
  description: 'Gestión de propósitos de visita',
  permissions: ['view', 'create', 'edit', 'delete'],
  icon: '🎯'
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

      // Verificar si el nombre ya existe
      const nameExists = await roleService.checkRoleNameExists(values.name);
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

      // Verificar que al menos tenga un permiso
      const permCount = getPermissionCount();
      if (permCount === 0) {
        message.warning('Debe asignar al menos un permiso al rol');
        setLoading(false);
        return;
      }

      // Preparar datos del rol
      const roleData = {
        name: values.name,
        description: values.description || '',
        isActive: values.isActive !== undefined ? values.isActive : true,
        permissions: permissions
      };

      // Crear rol
      await roleService.createRole(roleData);
      
      message.success('Rol creado exitosamente');
      navigate('/roles');
    } catch (error) {
      console.error('Error al crear rol:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Error al crear el rol');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/roles');
  };

  const permCount = getPermissionCount();

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
        <Breadcrumb.Item>Nuevo Rol</Breadcrumb.Item>
      </Breadcrumb>

      <Card
        title={
          <Space>
            <SafetyOutlined />
            <span>Crear Nuevo Rol</span>
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
              Guardar Rol
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isActive: true,
          }}
        >
          <Alert
            message="Información del Rol"
            description="Complete los datos del rol y asigne los permisos correspondientes. Los campos marcados con * son obligatorios."
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            style={{ marginBottom: 24 }}
          />

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

          <Alert
            message="Asignación de Permisos"
            description="Seleccione los permisos que tendrá este rol para cada módulo del sistema."
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
                    >
                      Todos
                    </Checkbox>
                  </Col>
                </Row>
              </div>
            ))}
          </div>

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
                Crear Rol
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default NewRole;