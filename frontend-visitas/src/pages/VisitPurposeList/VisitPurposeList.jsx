import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  message,
  Form,
  Switch,
  Popconfirm,
  Row,
  Col,
  Badge,
  Tooltip,
  Select,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import visitPurposeService from '../../services/visitPurposeService';

const { TextArea } = Input;
const { Option } = Select;

const VisitPurposeList = () => {
  const [form] = Form.useForm();

  const [purposes, setPurposes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPurpose, setEditingPurpose] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    isActive: '',
  });

  useEffect(() => {
    loadPurposes();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadPurposes = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
      };

      if (filters.search) params.search = filters.search;
      if (filters.isActive !== '') params.isActive = filters.isActive;

      const response = await visitPurposeService.getAll(params);

      setPurposes(response.visitPurposes);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination.total,
      }));
    } catch (error) {
      message.error('Error al cargar motivos de visita');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      isActive: '',
    });
  };

  const openModal = (purpose = null) => {
    setEditingPurpose(purpose);
    setModalVisible(true);

    if (purpose) {
      form.setFieldsValue({
        name: purpose.name,
        description: purpose.description,
        isActive: purpose.isActive,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ isActive: true });
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingPurpose(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      if (editingPurpose) {
        await visitPurposeService.update(editingPurpose.id, values);
        message.success('Motivo de visita actualizado exitosamente');
      } else {
        await visitPurposeService.create(values);
        message.success('Motivo de visita creado exitosamente');
      }
      closeModal();
      loadPurposes();
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          `Error al ${editingPurpose ? 'actualizar' : 'crear'} el motivo de visita`
      );
      console.error(error);
    }
  };

  const handleToggleStatus = async (purpose) => {
    try {
      await visitPurposeService.toggleStatus(purpose.id);
      message.success(
        `Motivo de visita ${purpose.isActive ? 'desactivado' : 'activado'} exitosamente`
      );
      loadPurposes();
    } catch (error) {
      message.error('Error al cambiar el estado del motivo de visita');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await visitPurposeService.delete(id, false); // Soft delete
      message.success('Motivo de visita desactivado exitosamente');
      loadPurposes();
    } catch (error) {
      message.error('Error al eliminar el motivo de visita');
      console.error(error);
    }
  };

  const columns = [
    {
      title: 'Motivo',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
      render: (text, record) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-slate-100">
            {text}
          </div>
          {record.description && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive) =>
        isActive ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Activo
          </Tag>
        ) : (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Inactivo
          </Tag>
        ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            />
          </Tooltip>

          <Tooltip title={record.isActive ? 'Desactivar' : 'Activar'}>
            <Button
              type="text"
              icon={
                record.isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />
              }
              onClick={() => handleToggleStatus(record)}
              style={{ color: record.isActive ? '#ef4444' : '#10b981' }}
            />
          </Tooltip>

          <Popconfirm
            title="¿Eliminar motivo de visita?"
            description="Esta acción desactivará el motivo de visita"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
            okType="danger"
          >
            <Tooltip title="Eliminar">
              <Button danger type="text" icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <FileTextOutlined style={{ fontSize: 24, color: '#3b82f6' }} />
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Motivos de Visita
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Gestión de motivos de visita disponibles
              </p>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            size="large"
          >
            Nuevo Motivo
          </Button>
        </div>

        <Row gutter={16} className="mb-4">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Buscar por nombre o descripción..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              allowClear
            />
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Estado"
              style={{ width: '100%' }}
              value={filters.isActive}
              onChange={(v) => handleFilterChange('isActive', v)}
              allowClear
            >
              <Option value="true">Activos</Option>
              <Option value="false">Inactivos</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Space>
              <Badge count={Object.values(filters).filter(Boolean).length}>
                <Button icon={<SearchOutlined />}>Filtros</Button>
              </Badge>
              <Button onClick={clearFilters}>Limpiar</Button>
            </Space>
          </Col>
        </Row>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={purposes}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} motivos`,
          }}
          onChange={(p) => setPagination(p)}
        />
      </Card>

      {/* Modal para Crear/Editar */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileTextOutlined />
            <span>
              {editingPurpose ? 'Editar Motivo de Visita' : 'Nuevo Motivo de Visita'}
            </span>
          </div>
        }
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ isActive: true }}
        >
          <Form.Item
            label="Nombre del Motivo"
            name="name"
            rules={[
              { required: true, message: 'Ingrese el nombre del motivo de visita' },
              { min: 2, message: 'El nombre debe tener al menos 2 caracteres' },
              { max: 100, message: 'El nombre no puede superar 100 caracteres' },
            ]}
          >
            <Input placeholder="Ej: Reunión de negocios" size="large" />
          </Form.Item>

          <Form.Item
            label="Descripción"
            name="description"
            rules={[
              { max: 500, message: 'La descripción no puede superar 500 caracteres' },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Descripción del motivo (opcional)"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item label="Estado" name="isActive" valuePropName="checked">
            <Switch
              checkedChildren="Activo"
              unCheckedChildren="Inactivo"
              defaultChecked
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={closeModal}>Cancelar</Button>
              <Button type="primary" htmlType="submit">
                {editingPurpose ? 'Actualizar' : 'Crear'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VisitPurposeList;