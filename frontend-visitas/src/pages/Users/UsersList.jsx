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
  Avatar,
  Switch,
  Input,
  Popconfirm,
  Modal
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined,
  HomeOutlined,
  UserOutlined,
  MailOutlined,
  SafetyOutlined,
  DeleteOutlined,
  SearchOutlined,
  LockOutlined
} from '@ant-design/icons';
import userService from '../../services/userService';

const { Search } = Input;

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = userService.filterUsers(users, searchTerm);
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data.users || data);
      setFilteredUsers(data.users || data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      message.error('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await userService.toggleUserStatus(id);
      message.success(`Usuario ${currentStatus ? 'desactivado' : 'activado'} exitosamente`);
      loadUsers();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      message.error('Error al cambiar el estado del usuario');
    }
  };

  const handleDelete = async (id, userName) => {
    try {
      await userService.deleteUser(id);
      message.success(`Usuario ${userName} eliminado exitosamente`);
      loadUsers();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      message.error('Error al eliminar el usuario');
    }
  };

  const handleResetPassword = async (id, userName) => {
    Modal.confirm({
      title: '¿Resetear contraseña?',
      content: `Se generará una nueva contraseña para ${userName}`,
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
                <p>Nueva contraseña temporal para <strong>{userName}</strong>:</p>
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

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getAvatarColor = (index) => {
    const colors = ['#1890ff', '#52c41a', '#722ed1', '#eb2f96', '#fa8c16'];
    return colors[index % colors.length];
  };

  const columns = [
    {
      title: 'Usuario',
      key: 'user',
      render: (_, record, index) => (
        <Space>
          <Avatar style={{ backgroundColor: getAvatarColor(index) }}>
            {getInitials(record.name)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              <UserOutlined style={{ marginRight: 4 }} />
              {record.username}
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              <MailOutlined style={{ marginRight: 4 }} />
              {record.email}
            </div>
          </div>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        role ? (
          <Tag color="blue" icon={<SafetyOutlined />}>
            {role.name}
          </Tag>
        ) : (
          <Tag color="default">Sin rol</Tag>
        )
      )
    },
    {
      title: 'Departamento',
      dataIndex: 'department',
      key: 'department',
      render: (department) => department || <span style={{ color: '#ccc' }}>-</span>
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || <span style={{ color: '#ccc' }}>-</span>
    },
    {
      title: 'Estado',
      dataIndex: 'active',
      key: 'active',
      align: 'center',
      render: (active, record) => (
        <Switch
          checked={active}
          onChange={() => handleToggleStatus(record.id, active)}
          checkedChildren="Activo"
          unCheckedChildren="Inactivo"
        />
      )
    },
    {
      title: 'Fecha de Registro',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'center',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Editar">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/users/edit/${record.id}`)}
            />
          </Tooltip>
          
          <Tooltip title="Resetear contraseña">
            <Button
              size="small"
              icon={<LockOutlined />}
              onClick={() => handleResetPassword(record.id, record.name)}
            />
          </Tooltip>
          
          <Popconfirm
            title="¿Eliminar usuario?"
            description={`¿Está seguro de eliminar a ${record.name}?`}
            onConfirm={() => handleDelete(record.id, record.name)}
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Eliminar">
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
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
          <UserOutlined />
          <span>Usuarios</span>
        </Breadcrumb.Item>
      </Breadcrumb>

      <Card
        title={
          <Space>
            <UserOutlined />
            <span>Gestión de Usuarios</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/users/new')}
          >
            Crear Usuario
          </Button>
        }
      >
        {/* Buscador */}
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="Buscar por nombre, email o username..."
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
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} usuario${total !== 1 ? 's' : ''}`,
            pageSizeOptions: ['10', '20', '50']
          }}
        />
      </Card>
    </div>
  );
};

export default UserList;