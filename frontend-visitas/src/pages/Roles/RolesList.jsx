import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Table, 
  Space, 
  Tag, 
  message,
  Breadcrumb,
  Tooltip,
  Switch,
  Input,
  Popconfirm,
  Badge
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined,
  HomeOutlined,
  SafetyOutlined,
  DeleteOutlined,
  SearchOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { ShieldCheck as ShieldCheckOutlined } from 'lucide-react';
import roleService from '../../services/roleService';

const { Search } = Input;

const RoleList = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredRoles(filtered);
    } else {
      setFilteredRoles(roles);
    }
  }, [searchTerm, roles]);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await roleService.getRoles();
      setRoles(data);
      setFilteredRoles(data);
    } catch (error) {
      console.error('Error al cargar roles:', error);
      message.error('Error al cargar los roles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, roleName) => {
    // Verificar si es rol del sistema
    if (roleService.isSystemRole(roleName)) {
      message.error('No se puede eliminar un rol del sistema');
      return;
    }

    try {
      await roleService.deleteRole(id);
      message.success(`Rol ${roleName} eliminado exitosamente`);
      loadRoles();
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Error al eliminar el rol');
      }
    }
  };

  const getPermissionCount = (permissions) => {
    if (!permissions) return 0;
    
    let count = 0;
    Object.values(permissions).forEach(modulePerms => {
      if (modulePerms && typeof modulePerms === 'object') {
        Object.values(modulePerms).forEach(perm => {
          if (perm === true) count++;
        });
      }
    });
    return count;
  };

  const getModuleCount = (permissions) => {
    if (!permissions) return 0;
    return Object.keys(permissions).length;
  };

  const columns = [
    {
      title: 'Rol',
      key: 'role',
      render: (_, record) => (
        <Space>
          <SafetyOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>
              {record.name}
              {roleService.isSystemRole(record.name) && (
                <Tag color="gold" style={{ marginLeft: 8 }}>Sistema</Tag>
              )}
            </div>
            {record.description && (
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                {record.description}
              </div>
            )}
          </div>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Módulos',
      key: 'modules',
      align: 'center',
      render: (_, record) => {
        const moduleCount = getModuleCount(record.permissions);
        return (
          <Badge 
            count={moduleCount} 
            showZero 
            style={{ backgroundColor: '#52c41a' }}
          >
            <ShieldCheckOutlined size={20} />
          </Badge>
        );
      }
    },
    {
      title: 'Permisos',
      key: 'permissions',
      align: 'center',
      render: (_, record) => {
        const permCount = getPermissionCount(record.permissions);
        return (
          <Tag color="blue" style={{ fontSize: '13px', padding: '4px 12px' }}>
            {permCount} permiso{permCount !== 1 ? 's' : ''}
          </Tag>
        );
      }
    },
    {
      title: 'Usuarios',
      dataIndex: 'userCount',
      key: 'userCount',
      align: 'center',
      render: (count) => (
        <Space>
          <TeamOutlined />
          <span>{count || 0}</span>
        </Space>
      )
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Activo' : 'Inactivo'}
        </Tag>
      )
    },
    {
      title: 'Fecha de Creación',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : '-',
      sorter: (a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(a.createdAt) - new Date(b.createdAt);
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'center',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Editar">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/roles/edit/${record.id}`)}
            />
          </Tooltip>
          
          <Popconfirm
            title="¿Eliminar rol?"
            description={
              <div>
                <p>¿Está seguro de eliminar el rol <strong>{record.name}</strong>?</p>
                {record.userCount > 0 && (
                  <p style={{ color: '#ff4d4f', marginTop: 8 }}>
                    ⚠️ Este rol tiene {record.userCount} usuario{record.userCount !== 1 ? 's' : ''} asignado{record.userCount !== 1 ? 's' : ''}.
                  </p>
                )}
              </div>
            }
            onConfirm={() => handleDelete(record.id, record.name)}
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
            disabled={roleService.isSystemRole(record.name)}
          >
            <Tooltip title={roleService.isSystemRole(record.name) ? 'No se puede eliminar un rol del sistema' : 'Eliminar'}>
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                disabled={roleService.isSystemRole(record.name)}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Breadcrumb style={{ marginBottom: 24 }}>
        <Breadcrumb.Item href="/">
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <SafetyOutlined />
          <span>Roles</span>
        </Breadcrumb.Item>
      </Breadcrumb>

      <Card
        title={
          <Space>
            <SafetyOutlined />
            <span>Gestión de Roles y Permisos</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/roles/new')}
          >
            Crear Rol
          </Button>
        }
      >
        {/* Buscador */}
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={(value) => setSearchTerm(value)}
            allowClear
            style={{ width: 400 }}
            prefix={<SearchOutlined />}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredRoles}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} rol${total !== 1 ? 'es' : ''}`,
            pageSizeOptions: ['10', '20', '50']
          }}
        />
      </Card>
    </div>
  );
};

export default RoleList;