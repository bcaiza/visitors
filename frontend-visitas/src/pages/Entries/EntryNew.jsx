import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Avatar,
  AutoComplete,
  Alert,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  LoginOutlined,
  UserOutlined,
  TeamOutlined,
  HomeOutlined,
  CarOutlined,
  FileTextOutlined,
  IdcardOutlined,
  UserAddOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import visitorService from '../../services/visitorService';
import entryService from '../../services/entryService';
import { useTheme } from '../../context/useTheme.jsx';

const { TextArea } = Input;
const { Option } = Select;

const EntryNew = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [visitors, setVisitors] = useState([]);
  const [loadingVisitors, setLoadingVisitors] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [activeEntry, setActiveEntry] = useState(null);

  useEffect(() => {
    loadVisitors();
  }, []);

  const loadVisitors = async () => {
    try {
      setLoadingVisitors(true);
      const response = await visitorService.getAll({ limit: 1000 });
      setVisitors(response.visitors);
    } catch (error) {
      message.error('Error al cargar visitantes');
      console.error(error);
    } finally {
      setLoadingVisitors(false);
    }
  };

  const handleVisitorSelect = async (visitorId) => {
    const visitor = visitors.find((v) => v.id === visitorId);
    setSelectedVisitor(visitor);

    // Verificar si tiene entrada activa
    try {
      const active = await entryService.hasActiveEntry(visitorId);
      setActiveEntry(active);
      
      if (active) {
        message.warning('Este visitante ya tiene una entrada activa');
      }
    } catch (error) {
      console.error('Error al verificar entrada activa:', error);
    }
  };

  const handleSubmit = async (values) => {
    if (activeEntry) {
      message.error('No se puede registrar entrada. El visitante ya está en las instalaciones.');
      return;
    }

    setLoading(true);
    try {
      const entryData = {
        visitor_id: values.visitor_id,
        purpose: values.purpose,
        hostName: values.hostName,
        hostDepartment: values.hostDepartment,
        badge: values.badge,
        vehiclePlate: values.vehiclePlate,
        temperature: values.temperature,
        entryNotes: values.entryNotes,
        checkedInBy: 'Admin', // Cambiar por usuario autenticado
      };

      await entryService.checkIn(entryData);
      message.success('Entrada registrada exitosamente');
      navigate('/entries');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error al registrar la entrada';
      message.error(errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const visitorOptions = visitors.map((visitor) => ({
    value: visitor.id,
    label: (
      <div className="flex items-center gap-3">
        <Avatar
          size={32}
          src={visitor.photoPath ? `http://localhost:4000/${visitor.photoPath}` : null}
          icon={<UserOutlined />}
        />
        <div>
          <div className="font-medium">
            {visitor.firstName} {visitor.lastName}
          </div>
          <div className="text-xs text-slate-500">
            {visitor.idNumber} {visitor.company && `- ${visitor.company}`}
          </div>
        </div>
      </div>
    ),
    searchText: `${visitor.firstName} ${visitor.lastName} ${visitor.idNumber} ${visitor.company || ''}`,
  }));

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
              Registrar Entrada (Check-In)
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Registra el ingreso de un visitante a las instalaciones
            </p>
          </div>
        </div>

        {/* Alerta si hay entrada activa */}
        {activeEntry && (
          <Alert
            message="Visitante con entrada activa"
            description={`Este visitante ingresó el ${new Date(activeEntry.checkInTime).toLocaleString()} y aún no ha registrado su salida.`}
            type="warning"
            icon={<WarningOutlined />}
            showIcon
            action={
              <Button
                size="small"
                danger
                onClick={() => navigate(`/entries/${activeEntry.id}`)}
              >
                Ver entrada
              </Button>
            }
            className="mb-4"
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          requiredMark="optional"
        >
          <Card type="inner" title="Seleccionar Visitante" className="mb-4">
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  label="Visitante"
                  name="visitor_id"
                  rules={[{ required: true, message: 'Debe seleccionar un visitante' }]}
                  extra="Busque por nombre, cédula o empresa"
                >
                  <Select
                    showSearch
                    placeholder="Buscar visitante..."
                    optionFilterProp="searchText"
                    loading={loadingVisitors}
                    size="large"
                    onChange={handleVisitorSelect}
                    filterOption={(input, option) =>
                      option.searchText.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {visitorOptions.map((option) => (
                      <Option
                        key={option.value}
                        value={option.value}
                        searchText={option.searchText}
                      >
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <div className="flex justify-end">
                  <Button
                    type="link"
                    icon={<UserAddOutlined />}
                    onClick={() => navigate('/visitors/new')}
                  >
                    Registrar nuevo visitante
                  </Button>
                </div>
              </Col>
            </Row>

            {/* Información del visitante seleccionado */}
            {selectedVisitor && (
              <>
                <Divider />
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar
                      size={64}
                      src={
                        selectedVisitor.photoPath
                          ? `http://localhost:4000/${selectedVisitor.photoPath}`
                          : null
                      }
                      icon={<UserOutlined />}
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {selectedVisitor.firstName} {selectedVisitor.lastName}
                      </h3>
                      <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                        <div>
                          <IdcardOutlined className="mr-2" />
                          {selectedVisitor.idType}: {selectedVisitor.idNumber}
                        </div>
                        {selectedVisitor.company && (
                          <div>
                            <TeamOutlined className="mr-2" />
                            {selectedVisitor.company}
                          </div>
                        )}
                        {selectedVisitor.phone && (
                          <div>📱 {selectedVisitor.phone}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>

          <Card type="inner" title="Información de la Visita" className="mb-4">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Motivo de la Visita"
                  name="purpose"
                  rules={[{ required: true, message: 'Ingrese el motivo de la visita' }]}
                >
                  <Input
                    prefix={<FileTextOutlined />}
                    placeholder="Ej: Reunión, Entrega, Mantenimiento"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Persona a Visitar"
                  name="hostName"
                  rules={[{ required: true, message: 'Ingrese el nombre de la persona' }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Nombre completo"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Departamento"
                  name="hostDepartment"
                >
                  <Select placeholder="Seleccione el departamento" size="large">
                    <Option value="Administración">Administración</Option>
                    <Option value="Sistemas">Sistemas</Option>
                    <Option value="Recursos Humanos">Recursos Humanos</Option>
                    <Option value="Ventas">Ventas</Option>
                    <Option value="Operaciones">Operaciones</Option>
                    <Option value="Mantenimiento">Mantenimiento</Option>
                    <Option value="Seguridad">Seguridad</Option>
                    <Option value="Otro">Otro</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Número de Gafete"
                  name="badge"
                >
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
                <Form.Item
                  label="Placa del Vehículo"
                  name="vehiclePlate"
                >
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
                <Form.Item
                  label="Notas de Entrada"
                  name="entryNotes"
                >
                  <TextArea
                    rows={4}
                    placeholder="Observaciones, artículos que ingresa, restricciones, etc."
                    showCount
                    maxLength={500}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
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
            disabled={!!activeEntry}
            size="large"
            icon={<LoginOutlined />}
            style={{
              minWidth: 180,
            }}
          >
            Registrar Entrada
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default EntryNew;