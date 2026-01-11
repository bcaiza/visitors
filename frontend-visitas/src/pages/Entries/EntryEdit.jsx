import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  message,
  Row,
  Col,
  Space,
  InputNumber,
  Spin,
  Avatar,
  Tag,
  Divider,
  Descriptions,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UserOutlined,
  TeamOutlined,
  HomeOutlined,
  CarOutlined,
  FileTextOutlined,
  IdcardOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import entryService from '../../services/entryService';
import departmentService from '../../services/departmentService';
import visitPurposeService from '../../services/visitPurposeService';
import { useTheme } from '../../context/useTheme.jsx';

const { TextArea } = Input;
const { Option } = Select;

const EntryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [entry, setEntry] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [purposes, setPurposes] = useState([]);

  useEffect(() => {
    loadDepartments();
    loadPurposes();
    loadEntry();
  }, [id]);

  const loadDepartments = async () => {
    try {
      const data = await departmentService.getActive();
      setDepartments(data);
    } catch (error) {
      console.error('Error al cargar departamentos:', error);
    }
  };

  const loadPurposes = async () => {
    try {
      const data = await visitPurposeService.getActive();
      setPurposes(data);
    } catch (error) {
      console.error('Error al cargar motivos:', error);
    }
  };

  const loadEntry = async () => {
    try {
      setLoadingData(true);
      const entryData = await entryService.getById(id);
      setEntry(entryData);

      // Cargar datos en el formulario
      form.setFieldsValue({
        purpose_id: entryData.purpose?.id,           // ⬅️ CAMBIO
        hostName: entryData.hostName,
        department_id: entryData.department?.id,     // ⬅️ CAMBIO
        badge: entryData.badge,
        vehiclePlate: entryData.vehiclePlate,
        temperature: entryData.temperature,
        entryNotes: entryData.entryNotes,
        exitNotes: entryData.exitNotes,
      });
    } catch (error) {
      message.error('Error al cargar los datos de la entrada');
      console.error(error);
      navigate('/entries');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await entryService.update(id, values);
      message.success('Entrada actualizada exitosamente');
      navigate('/entries');
    } catch (error) {
      message.error(
        error.response?.data?.message || 'Error al actualizar la entrada'
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      active: { color: 'success', text: 'Activo' },
      completed: { color: 'default', text: 'Completado' },
      cancelled: { color: 'error', text: 'Cancelado' },
    };
    const config = statusConfig[status] || statusConfig.active;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatDuration = () => {
    if (!entry) return '-';
    const duration = entryService.calculateStayDuration(entry);
    return duration ? entryService.formatDuration(duration) : 'En proceso';
  };

  if (loadingData) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <Spin size="large" tip="Cargando datos de la entrada..." />
      </div>
    );
  }

  return (
    <div className="space-y-4" style={{ paddingBottom: '100px' }}>
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/entries')}
            size="large"
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Editar Entrada
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Modifica la información de la visita
            </p>
          </div>
        </div>

        {/* Información del visitante y estado */}
        {entry && (
          <Card type="inner" className="mb-4">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div className="flex items-center gap-4">
                  <Avatar
                    size={64}
                    src={
                      entry.visitor.photoPath
                        ? `http://localhost:4000/${entry.visitor.photoPath}`
                        : null
                    }
                    icon={<UserOutlined />}
                    style={{
                      border: isDark ? '2px solid #334155' : '2px solid #e2e8f0',
                    }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                      {entry.visitor.firstName} {entry.visitor.lastName}
                    </h3>
                    <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                      <div>
                        <IdcardOutlined className="mr-2" />
                        {entry.visitor.idNumber}
                      </div>
                      {entry.visitor.company && (
                        <div>
                          <TeamOutlined className="mr-2" />
                          {entry.visitor.company}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Estado">
                    {getStatusTag(entry.status)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Entrada">
                    <ClockCircleOutlined className="mr-2" />
                    {dayjs(entry.checkInTime).format('DD/MM/YYYY HH:mm:ss')}
                  </Descriptions.Item>
                  {entry.checkOutTime && (
                    <Descriptions.Item label="Salida">
                      <ClockCircleOutlined className="mr-2" />
                      {dayjs(entry.checkOutTime).format('DD/MM/YYYY HH:mm:ss')}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Duración">
                    {formatDuration()}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </Card>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          requiredMark="optional"
        >
          <Card type="inner" title="Información de la Visita" className="mb-4">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Motivo de la Visita"
                  name="purpose_id" // ⬅️ CAMBIO
                  rules={[
                    { required: true, message: 'Seleccione el motivo de la visita' },
                  ]}
                >
                  <Select
                    placeholder="Seleccione un motivo"
                    size="large"
                    showSearch
                    optionFilterProp="children"
                  >
                    {purposes.map((purpose) => (
                      <Option key={purpose.id} value={purpose.id}>
                        {purpose.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Persona a Visitar"
                  name="hostName"
                  rules={[
                    { required: true, message: 'Ingrese el nombre de la persona' },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nombre completo"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Departamento" name="department_id"> {/* ⬅️ CAMBIO */}
                  <Select
                    placeholder="Seleccione el departamento"
                    size="large"
                    showSearch
                    optionFilterProp="children"
                  >
                    {departments.map((dept) => (
                      <Option key={dept.id} value={dept.id}>
                        {dept.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Número de Gafete" name="badge">
                  <Input
                    prefix={<IdcardOutlined />}
                    placeholder="Ej: G-001"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card type="inner" title="Información Adicional" className="mb-4">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Placa del Vehículo" name="vehiclePlate">
                  <Input
                    prefix={<CarOutlined />}
                    placeholder="Ej: ABC-1234"
                    size="large"
                    style={{ textTransform: 'uppercase' }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Temperatura (°C)"
                  name="temperature"
                  rules={[
                    {
                      type: 'number',
                      min: 35,
                      max: 42,
                      message: 'La temperatura debe estar entre 35°C y 42°C',
                    },
                  ]}
                >
                  <InputNumber
                    min={35}
                    max={42}
                    step={0.1}
                    precision={1}
                    placeholder="36.5"
                    size="large"
                    style={{ width: '100%' }}
                    addonAfter="°C"
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item label="Notas de Entrada" name="entryNotes">
                  <TextArea
                    rows={4}
                    placeholder="Observaciones, artículos que ingresa, restricciones, etc."
                    showCount
                    maxLength={500}
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item label="Notas de Salida" name="exitNotes">
                  <TextArea
                    rows={4}
                    placeholder="Observaciones al momento de la salida, artículos que retira, etc."
                    showCount
                    maxLength={500}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Información de registro */}
          {entry && (
            <Card type="inner" title="Información de Registro">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Registrado por">
                      {entry.checkedInBy || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Fecha de creación">
                      {dayjs(entry.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>

                <Col xs={24} md={12}>
                  <Descriptions column={1} size="small">
                    {entry.checkedOutBy && (
                      <Descriptions.Item label="Salida registrada por">
                        {entry.checkedOutBy}
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Última actualización">
                      {dayjs(entry.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>
          )}
        </Form>
      </Card>

      {/* Footer fijo con botones de acción */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 280,
          right: 0,
          padding: '16px 32px',
          background: isDark
            ? 'rgba(15, 23, 42, 0.98)'
            : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(12px)',
          borderTop: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
          boxShadow: isDark
            ? '0 -4px 24px rgba(0, 0, 0, 0.4)'
            : '0 -4px 12px rgba(0, 0, 0, 0.08)',
          zIndex: 999,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Space size="middle">
          <Button
            onClick={() => navigate('/entries')}
            size="large"
            style={{
              minWidth: 120,
            }}
          >
            Cancelar
          </Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={loading}
            size="large"
            icon={<SaveOutlined />}
            style={{
              minWidth: 180,
            }}
          >
            Guardar Cambios
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default EntryEdit;