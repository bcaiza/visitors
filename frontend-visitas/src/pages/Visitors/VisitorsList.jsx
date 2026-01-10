import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  message,
  Card,
  Avatar,
  Tooltip,
  Pagination,
  Drawer,
  Image,
  Row,
  Col,
  Statistic,
  Badge,
  Descriptions,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  TeamOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import visitorService from '../../services/visitorService';
import { useAuth } from '../../context/useAuth.jsx';
import { useTheme } from '../../context/useTheme.jsx';

const { Search } = Input;

const VisitorsList = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { isDark } = useTheme();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  
  const [stats, setStats] = useState({
    total: 0,
    withVisits: 0,
    activeToday: 0,
  });

  useEffect(() => {
    fetchVisitors();
  }, [pagination.current, pagination.pageSize]);

  const fetchVisitors = async (search = '') => {
    setLoading(true);
    try {
      const data = await visitorService.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        search,
      });

      setVisitors(data.visitors);
      setPagination({
        ...pagination,
        total: data.pagination.total,
      });

      // Calcular estadísticas
      calculateStats(data.visitors, data.pagination.total);
    } catch (error) {
      message.error('Error al cargar visitantes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (visitorsList, total) => {
    const withVisits = visitorsList.filter(v => v.entries && v.entries.length > 0).length;
    // Aquí podrías calcular visitas activas hoy si tienes esa info
    setStats({
      total: total,
      withVisits: withVisits,
      activeToday: 0, // Implementar según tu lógica
    });
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
    fetchVisitors(value);
  };

  const handleDelete = (id, fullName) => {
    Modal.confirm({
      title: '¿Está seguro de eliminar este visitante?',
      content: `Se eliminará a ${fullName} y todo su historial de visitas. Esta acción no se puede deshacer.`,
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await visitorService.delete(id);
          message.success('Visitante eliminado exitosamente');
          fetchVisitors(searchText);
        } catch (error) {
          message.error('Error al eliminar visitante');
          console.error(error);
        }
      },
    });
  };

  const handleViewDetails = async (record) => {
    try {
      // Obtener detalles completos del visitante
      const visitor = await visitorService.getById(record.id);
      setSelectedVisitor(visitor);
      setDetailsVisible(true);
    } catch (error) {
      message.error('Error al cargar los detalles del visitante');
      console.error(error);
    }
  };

  const handlePreviewImage = (imagePath) => {
    setPreviewImage(`http://localhost:4000/${imagePath}`);
    setImagePreviewVisible(true);
  };

  const handleTableChange = (page, pageSize) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize,
    });
  };

  const columns = [
    {
      title: 'Foto',
      dataIndex: 'photoPath',
      key: 'photoPath',
      width: 80,
      render: (photoPath, record) => (
        <Tooltip 
          title="Click para ver foto completa"
          placement="right"
        >
          <Badge
            count={photoPath ? <CheckCircleOutlined style={{ color: '#10b981' }} /> : 0}
            offset={[-5, 5]}
          >
            <Avatar
              size={56}
              src={photoPath ? `http://localhost:4000/${photoPath}` : null}
              icon={!photoPath && <UserOutlined />}
              style={{
                backgroundColor: photoPath ? '#3b82f6' : '#94a3b8',
                border: '3px solid #e2e8f0',
                cursor: photoPath ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
              }}
              onClick={() => photoPath && handlePreviewImage(photoPath)}
              className="hover:scale-110 hover:shadow-lg"
            >
              {!photoPath && `${record.firstName[0]}${record.lastName[0]}`}
            </Avatar>
          </Badge>
        </Tooltip>
      ),
    },
    {
      title: 'Nombre Completo',
      key: 'fullName',
      sorter: (a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
      render: (_, record) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-slate-100 text-base">
            {record.firstName} {record.lastName}
          </div>
          {record.company && (
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <TeamOutlined /> {record.company}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Identificación',
      key: 'identification',
      render: (_, record) => (
        <div>
          <Tag color="blue" className="mb-1 font-medium">
            {record.idType}
          </Tag>
          <div className="font-mono text-sm text-slate-700 dark:text-slate-300">
            {record.idNumber}
          </div>
        </div>
      ),
    },
    {
      title: 'Contacto',
      key: 'contact',
      render: (_, record) => (
        <div className="text-sm space-y-1">
          {record.email && (
            <div className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <MailOutlined className="text-blue-500" /> 
              <span className="truncate max-w-[200px]">{record.email}</span>
            </div>
          )}
          {record.phone && (
            <div className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <PhoneOutlined className="text-green-500" /> {record.phone}
            </div>
          )}
          {!record.email && !record.phone && (
            <span className="text-slate-400 dark:text-slate-500 italic">Sin contacto</span>
          )}
        </div>
      ),
    },
    {
      title: 'Visitas',
      key: 'visits',
      align: 'center',
      sorter: (a, b) => (a.entries?.length || 0) - (b.entries?.length || 0),
      render: (_, record) => {
        const visitCount = record.entries?.length || 0;
        const color = visitCount > 5 ? 'green' : visitCount > 0 ? 'blue' : 'default';
        return (
          <Tag color={color} style={{ fontSize: '13px', padding: '4px 12px' }}>
            <strong>{visitCount}</strong> {visitCount === 1 ? 'visita' : 'visitas'}
          </Tag>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver Detalles">
            <Button
              type="primary"
              ghost
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              size="middle"
            />
          </Tooltip>
          {hasPermission('visitors', 'edit') && (
            <Tooltip title="Editar">
              <Button
                type="default"
                icon={<EditOutlined />}
                onClick={() => navigate(`/visitors/edit/${record.id}`)}
                size="middle"
              />
            </Tooltip>
          )}
          {hasPermission('visitors', 'delete') && (
            <Tooltip title="Eliminar">
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.id, `${record.firstName} ${record.lastName}`)}
                size="middle"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Estadísticas */}
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Visitantes"
              value={stats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Con Visitas Registradas"
              value={stats.withVisits}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Visitas Activas Hoy"
              value={stats.activeToday}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Buscador y Acciones */}
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Visitantes Registrados
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Gestiona la información de los visitantes del sistema
            </p>
          </div>

          <Space wrap>
            <Search
              placeholder="Buscar por nombre, cédula, empresa..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              onChange={(e) => {
                if (e.target.value === '') {
                  handleSearch('');
                }
              }}
              style={{ width: 350 }}
            />
            {hasPermission('visitors', 'create') && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => navigate('/visitors/new')}
              >
                Nuevo Visitante
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* Tabla */}
      <Card>
        <Table
          columns={columns}
          dataSource={visitors}
          loading={loading}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: searchText 
              ? 'No se encontraron visitantes con ese criterio de búsqueda' 
              : 'No hay visitantes registrados'
          }}
          rowClassName={() => 'hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors'}
        />
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Mostrando {visitors.length > 0 ? ((pagination.current - 1) * pagination.pageSize) + 1 : 0} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} de {pagination.total} visitantes
          </div>
          <Pagination
            current={pagination.current}
            total={pagination.total}
            pageSize={pagination.pageSize}
            onChange={handleTableChange}
            showSizeChanger
            showTotal={(total) => `Total: ${total} visitantes`}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </div>
      </Card>

      {/* Drawer de Detalles del Visitante */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <Avatar
              size={48}
              src={selectedVisitor?.photoPath ? `http://localhost:4000/${selectedVisitor.photoPath}` : null}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#3b82f6' }}
            >
              {selectedVisitor && `${selectedVisitor.firstName[0]}${selectedVisitor.lastName[0]}`}
            </Avatar>
            <div>
              <div className="text-lg font-bold">
                {selectedVisitor?.firstName} {selectedVisitor?.lastName}
              </div>
              <div className="text-sm text-slate-500">
                Detalles del Visitante
              </div>
            </div>
          </div>
        }
        width={720}
        onClose={() => setDetailsVisible(false)}
        open={detailsVisible}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setDetailsVisible(false)}>
                Cerrar
              </Button>
              {hasPermission('visitors', 'edit') && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setDetailsVisible(false);
                    navigate(`/visitors/edit/${selectedVisitor?.id}`);
                  }}
                >
                  Editar Visitante
                </Button>
              )}
            </Space>
          </div>
        }
      >
        {selectedVisitor && (
          <div className="space-y-6">
            {/* Fotos */}
            <Card type="inner" title={<><FileTextOutlined /> Documentos</>}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Foto del Visitante
                  </div>
                  {selectedVisitor.photoPath ? (
                    <Image
                      width="100%"
                      height={250}
                      src={`http://localhost:4000/${selectedVisitor.photoPath}`}
                      alt="Foto del visitante"
                      style={{
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: isDark ? '2px solid #334155' : '2px solid #e2e8f0',
                      }}
                      preview={{
                        mask: (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <EyeOutlined style={{ fontSize: 24 }} />
                            <div style={{ marginTop: 8 }}>Ver en grande</div>
                          </div>
                        ),
                      }}
                    />
                  ) : (
                    <div style={{
                      height: 250,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isDark ? '#1e293b' : '#f1f5f9',
                      borderRadius: '8px',
                      border: isDark ? '2px dashed #334155' : '2px dashed #cbd5e1',
                    }}>
                      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                        <UserOutlined style={{ fontSize: 48 }} />
                        <div style={{ marginTop: 8 }}>Sin foto</div>
                      </div>
                    </div>
                  )}
                </Col>

                <Col xs={24} md={12}>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Documento de Identidad
                  </div>
                  {selectedVisitor.idDocumentPath ? (
                    <Image
                      width="100%"
                      height={250}
                      src={`http://localhost:4000/${selectedVisitor.idDocumentPath}`}
                      alt="Documento de identidad"
                      style={{
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: isDark ? '2px solid #334155' : '2px solid #e2e8f0',
                      }}
                      preview={{
                        mask: (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <EyeOutlined style={{ fontSize: 24 }} />
                            <div style={{ marginTop: 8 }}>Ver en grande</div>
                          </div>
                        ),
                      }}
                    />
                  ) : (
                    <div style={{
                      height: 250,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isDark ? '#1e293b' : '#f1f5f9',
                      borderRadius: '8px',
                      border: isDark ? '2px dashed #334155' : '2px dashed #cbd5e1',
                    }}>
                      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                        <IdcardOutlined style={{ fontSize: 48 }} />
                        <div style={{ marginTop: 8 }}>Sin documento</div>
                      </div>
                    </div>
                  )}
                </Col>
              </Row>
            </Card>

            {/* Información Personal */}
            <Card type="inner" title={<><UserOutlined /> Información Personal</>}>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Nombre Completo">
                  <strong>{selectedVisitor.firstName} {selectedVisitor.lastName}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Tipo de Identificación">
                  <Tag color="blue">{selectedVisitor.idType}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Número de Identificación">
                  <span className="font-mono">{selectedVisitor.idNumber}</span>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Información de Contacto */}
            <Card type="inner" title={<><MailOutlined /> Información de Contacto</>}>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Correo Electrónico">
                  {selectedVisitor.email || <span className="text-slate-400 italic">No registrado</span>}
                </Descriptions.Item>
                <Descriptions.Item label="Teléfono">
                  {selectedVisitor.phone || <span className="text-slate-400 italic">No registrado</span>}
                </Descriptions.Item>
                <Descriptions.Item label="Empresa">
                  {selectedVisitor.company || <span className="text-slate-400 italic">No registrado</span>}
                </Descriptions.Item>
                <Descriptions.Item label="Dirección">
                  {selectedVisitor.address || <span className="text-slate-400 italic">No registrada</span>}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Notas */}
            {selectedVisitor.notes && (
              <Card type="inner" title={<><FileTextOutlined /> Notas Adicionales</>}>
                <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {selectedVisitor.notes}
                </div>
              </Card>
            )}

            {/* Historial de Visitas */}
            <Card type="inner" title={<><CalendarOutlined /> Historial de Visitas</>}>
              <Statistic
                value={selectedVisitor.entries?.length || 0}
                suffix={selectedVisitor.entries?.length === 1 ? 'visita registrada' : 'visitas registradas'}
                valueStyle={{ fontSize: 24 }}
              />
              {selectedVisitor.entries && selectedVisitor.entries.length > 0 && (
                <div className="mt-4 text-sm text-slate-500">
                  <p>Para ver el historial completo, consulte la sección de Entradas.</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </Drawer>

      <Modal
        open={imagePreviewVisible}
        footer={null}
        onCancel={() => setImagePreviewVisible(false)}
        width="auto"
        style={{ maxWidth: '90vw' }}
      >
        <img 
          alt="Preview" 
          style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }} 
          src={previewImage} 
        />
      </Modal>
    </div>
  );
};

export default VisitorsList;