import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  message,
  Spin,
  Row,
  Col,
  Descriptions,
  Avatar,
  Tag,
  Divider,
  Modal,
  Image,
  Timeline,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  LogoutOutlined,
  CloseCircleOutlined,
  UserOutlined,
  IdcardOutlined,
  TeamOutlined,
  PhoneOutlined,
  MailOutlined,
  CarOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import entryService from '../../services/entryService';
import { useTheme } from '../../context/useTheme.jsx';

const { confirm } = Modal;

const EntryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    loadEntry();
  }, [id]);

  const loadEntry = async () => {
    try {
      setLoading(true);
      const data = await entryService.getById(id);
      setEntry(data);
    } catch (error) {
      message.error('Error al cargar los datos de la entrada');
      console.error(error);
      navigate('/entries');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = () => {
    confirm({
      title: '¿Registrar salida?',
      content: `¿Desea registrar la salida de ${entry.visitor.firstName} ${entry.visitor.lastName}?`,
      okText: 'Sí, registrar salida',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await entryService.checkOut(entry.id, {
            checkedOutBy: 'Admin', // Cambiar por usuario actual
          });
          message.success('Salida registrada exitosamente');
          loadEntry(); // Recargar datos
        } catch (error) {
          message.error('Error al registrar la salida');
          console.error(error);
        }
      },
    });
  };

  const handleCancelEntry = () => {
    confirm({
      title: '¿Cancelar entrada?',
      content: `¿Está seguro de cancelar la entrada de ${entry.visitor.firstName} ${entry.visitor.lastName}?`,
      okText: 'Sí, cancelar',
      cancelText: 'No',
      okType: 'danger',
      onOk: async () => {
        try {
          await entryService.cancel(entry.id, {
            cancelReason: 'Cancelado manualmente',
            cancelledBy: 'Admin', // Cambiar por usuario actual
          });
          message.success('Entrada cancelada');
          loadEntry(); // Recargar datos
        } catch (error) {
          message.error('Error al cancelar la entrada');
          console.error(error);
        }
      },
    });
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      active: {
        color: 'success',
        text: 'Activo',
        icon: <ClockCircleOutlined />,
      },
      completed: {
        color: 'default',
        text: 'Completado',
        icon: <CheckCircleOutlined />,
      },
      cancelled: {
        color: 'error',
        text: 'Cancelado',
        icon: <CloseCircleOutlined />,
      },
    };
    const config = statusConfig[status] || statusConfig.active;
    return (
      <Tag color={config.color} icon={config.icon} style={{ fontSize: 14 }}>
        {config.text}
      </Tag>
    );
  };

  const formatDuration = () => {
    if (!entry) return '-';
    const duration = entryService.calculateStayDuration(entry);
    return duration ? entryService.formatDuration(duration) : 'En proceso';
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <Spin size="large" tip="Cargando detalles de la entrada..." />
      </div>
    );
  }

  if (!entry) return null;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/entries')}
              size="large"
            >
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Detalles de Entrada
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Información completa de la visita
              </p>
            </div>
          </div>

          <Space>
            {entry.status === 'active' && (
              <>
                <Button
                  type="primary"
                  icon={<LogoutOutlined />}
                  onClick={handleCheckOut}
                  size="large"
                  style={{ background: '#10b981' }}
                >
                  Registrar Salida
                </Button>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/entries/${entry.id}/edit`)}
                  size="large"
                >
                  Editar
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={handleCancelEntry}
                  size="large"
                >
                  Cancelar
                </Button>
              </>
            )}
          </Space>
        </div>

        {/* Estado de la entrada */}
        <div
          className="mb-6"
          style={{
            padding: '20px',
            background: isDark
              ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
              : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRadius: '12px',
            border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
          }}
        >
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={8}>
              <div className="text-center">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  Estado
                </div>
                {getStatusTag(entry.status)}
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-center">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  Tiempo de Permanencia
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {formatDuration()}
                </div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-center">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  ID de Entrada
                </div>
                <div className="text-sm font-mono text-slate-600 dark:text-slate-300">
                  {entry.id.substring(0, 8)}...
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Información del Visitante */}
        <Card type="inner" title="Información del Visitante" className="mb-4">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <div className="flex flex-col items-center gap-4">
                <Avatar
                  size={120}
                  src={
                    entry.visitor.photoPath
                      ? `http://localhost:4000/${entry.visitor.photoPath}`
                      : null
                  }
                  icon={<UserOutlined />}
                  style={{
                    border: isDark ? '3px solid #334155' : '3px solid #e2e8f0',
                  }}
                />
                <div className="text-center">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    {entry.visitor.firstName} {entry.visitor.lastName}
                  </h2>
                  {entry.visitor.company && (
                    <p className="text-slate-600 dark:text-slate-300">
                      <TeamOutlined className="mr-2" />
                      {entry.visitor.company}
                    </p>
                  )}
                </div>
              </div>
            </Col>

            <Col xs={24} md={16}>
              <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                <Descriptions.Item
                  label={
                    <span>
                      <IdcardOutlined className="mr-2" />
                      Tipo de ID
                    </span>
                  }
                >
                  {entry.visitor.idType}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span>
                      <IdcardOutlined className="mr-2" />
                      Número de ID
                    </span>
                  }
                >
                  {entry.visitor.idNumber}
                </Descriptions.Item>
                {entry.visitor.email && (
                  <Descriptions.Item
                    label={
                      <span>
                        <MailOutlined className="mr-2" />
                        Email
                      </span>
                    }
                  >
                    {entry.visitor.email}
                  </Descriptions.Item>
                )}
                {entry.visitor.phone && (
                  <Descriptions.Item
                    label={
                      <span>
                        <PhoneOutlined className="mr-2" />
                        Teléfono
                      </span>
                    }
                  >
                    {entry.visitor.phone}
                  </Descriptions.Item>
                )}
              </Descriptions>

              {entry.visitor.idDocumentPath && (
                <div className="mt-4">
                  <div className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                    Documento de Identidad:
                  </div>
                  <Image
                    width={200}
                    src={`http://localhost:4000/${entry.visitor.idDocumentPath}`}
                    alt="Documento de identidad"
                    style={{ borderRadius: 8 }}
                  />
                </div>
              )}
            </Col>
          </Row>
        </Card>

        {/* Detalles de la Visita */}
        <Card type="inner" title="Detalles de la Visita" className="mb-4">
          <Descriptions column={{ xs: 1, sm: 2 }} bordered>
            <Descriptions.Item
              label={
                <span>
                  <FileTextOutlined className="mr-2" />
                  Motivo
                </span>
              }
              span={2}
            >
              {entry.purpose || '-'}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span>
                  <UserOutlined className="mr-2" />
                  Persona a Visitar
                </span>
              }
            >
              {entry.hostName || '-'}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span>
                  <TeamOutlined className="mr-2" />
                  Departamento
                </span>
              }
            >
              {entry.hostDepartment || '-'}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span>
                  <IdcardOutlined className="mr-2" />
                  Gafete
                </span>
              }
            >
              {entry.badge ? (
                <Tag color="blue">{entry.badge}</Tag>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <span>
                  <CarOutlined className="mr-2" />
                  Vehículo
                </span>
              }
            >
              {entry.vehiclePlate || '-'}
            </Descriptions.Item>
            {entry.temperature && (
              <Descriptions.Item label="Temperatura" span={2}>
                {entry.temperature}°C
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Timeline de Eventos */}
        <Card type="inner" title="Línea de Tiempo" className="mb-4">
          <Timeline
            items={[
              {
                color: 'green',
                children: (
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-100">
                      Entrada Registrada
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {dayjs(entry.checkInTime).format('DD/MM/YYYY HH:mm:ss')}
                    </div>
                    {entry.checkedInBy && (
                      <div className="text-xs text-slate-400">
                        Por: {entry.checkedInBy}
                      </div>
                    )}
                  </div>
                ),
              },
              entry.checkOutTime && {
                color: entry.status === 'cancelled' ? 'red' : 'blue',
                children: (
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-100">
                      {entry.status === 'cancelled'
                        ? 'Entrada Cancelada'
                        : 'Salida Registrada'}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {dayjs(entry.checkOutTime).format('DD/MM/YYYY HH:mm:ss')}
                    </div>
                    {entry.checkedOutBy && (
                      <div className="text-xs text-slate-400">
                        Por: {entry.checkedOutBy}
                      </div>
                    )}
                  </div>
                ),
              },
            ].filter(Boolean)}
          />
        </Card>

        {/* Notas */}
        {(entry.entryNotes || entry.exitNotes) && (
          <Card type="inner" title="Notas y Observaciones">
            {entry.entryNotes && (
              <div className="mb-4">
                <div className="font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Notas de Entrada:
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{
                    background: isDark ? '#1e293b' : '#f8fafc',
                    border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                  }}
                >
                  {entry.entryNotes}
                </div>
              </div>
            )}
            {entry.exitNotes && (
              <div>
                <div className="font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Notas de Salida:
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{
                    background: isDark ? '#1e293b' : '#f8fafc',
                    border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                  }}
                >
                  {entry.exitNotes}
                </div>
              </div>
            )}
          </Card>
        )}
      </Card>
    </div>
  );
};

export default EntryDetail;