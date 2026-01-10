import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  message,
  DatePicker,
  Avatar,
  Tooltip,
  Badge,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  SearchOutlined,
  LoginOutlined,
  LogoutOutlined,
  EditOutlined,
  EyeOutlined,
  CloseCircleOutlined,
  FilterOutlined,
  CalendarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import entryService from '../../services/entryService';
import { useTheme } from '../../context/useTheme.jsx';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { confirm } = Modal;

const EntryList = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [stats, setStats] = useState({
    totalEntries: 0,
    activeEntries: 0,
    completedEntries: 0,
    cancelledEntries: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateRange: null,
    hostDepartment: '',
  });

  // 🔑 MODO DE VISTA
  // all = normal
  // today = solo entradas de hoy
  const [viewMode, setViewMode] = useState('all');

  useEffect(() => {
    loadEntries();
    loadStats();
  }, [pagination.current, pagination.pageSize, filters, viewMode]);

  // ========================
  // CARGAR ENTRADAS
  // ========================

  const loadEntries = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
      };

      let response;

      // 🟢 VER HOY (endpoint correcto)
      if (viewMode === 'today') {
        if (filters.status) params.status = filters.status;

        response = await entryService.getToday(params);

        setEntries(response.entries);
        setPagination((prev) => ({
          ...prev,
          total: response.pagination.total,
        }));
        return;
      }

      // 🟢 NORMAL / ACTIVOS
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.hostDepartment) params.hostDepartment = filters.hostDepartment;

      if (filters.dateRange?.length === 2) {
        params.startDate = filters.dateRange[0].format('YYYY-MM-DD');
        params.endDate = filters.dateRange[1].format('YYYY-MM-DD');
      }

      response = await entryService.getAll(params);

      setEntries(response.entries);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination.total,
      }));
    } catch (error) {
      message.error('Error al cargar las entradas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await entryService.getStats();
      setStats(response);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  // ========================
  // FILTROS RÁPIDOS
  // ========================

  const filterToday = () => {
    setViewMode('today');

    setFilters({
      search: '',
      status: '',
      dateRange: null,
      hostDepartment: '',
    });

    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  const filterActive = () => {
    setViewMode('all');

    setFilters({
      search: '',
      status: 'active',
      dateRange: null,
      hostDepartment: '',
    });

    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  const clearFilters = () => {
    setViewMode('all');

    setFilters({
      search: '',
      status: '',
      dateRange: null,
      hostDepartment: '',
    });
  };

  const handleFilterChange = (key, value) => {
    setViewMode('all');
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // ========================
  // ACCIONES
  // ========================

  const handleCheckOut = (entry) => {
    confirm({
      title: '¿Registrar salida?',
      content: `¿Desea registrar la salida de ${entry.visitor.firstName} ${entry.visitor.lastName}?`,
      onOk: async () => {
        await entryService.checkOut(entry.id, { checkedOutBy: 'Admin' });
        message.success('Salida registrada');
        loadEntries();
        loadStats();
      },
    });
  };

  const handleCancelEntry = (entry) => {
    confirm({
      title: '¿Cancelar entrada?',
      okType: 'danger',
      content: `¿Cancelar la entrada de ${entry.visitor.firstName} ${entry.visitor.lastName}?`,
      onOk: async () => {
        await entryService.cancel(entry.id, {
          cancelReason: 'Cancelado manualmente',
          cancelledBy: 'Admin',
        });
        message.success('Entrada cancelada');
        loadEntries();
        loadStats();
      },
    });
  };

  // ========================
  // UTILIDADES
  // ========================

  const getStatusTag = (status) => {
    const map = {
      active: { color: 'success', text: 'Activo', icon: <ClockCircleOutlined /> },
      completed: { color: 'default', text: 'Completado', icon: <CheckCircleOutlined /> },
      cancelled: { color: 'error', text: 'Cancelado', icon: <CloseCircleOutlined /> },
    };
    const s = map[status] || map.active;
    return <Tag color={s.color} icon={s.icon}>{s.text}</Tag>;
  };

  const formatDuration = (entry) => {
    if (!entry.checkOutTime) return '-';
    const minutes = entryService.calculateStayDuration(entry);
    return entryService.formatDuration(minutes);
  };

  // ========================
  // COLUMNAS
  // ========================

  const columns = [
    {
      title: 'Visitante',
      width: 260,
      render: (_, r) => (
        <div className="flex gap-3 items-center">
          <Avatar
            size={48}
            src={r.visitor.photoPath ? `http://localhost:4000/${r.visitor.photoPath}` : null}
            icon={<UserOutlined />}
            style={{ border: isDark ? '2px solid #334155' : '2px solid #e2e8f0' }}
          />
          <div>
            <div className="font-semibold">{r.visitor.firstName} {r.visitor.lastName}</div>
            <div className="text-xs text-slate-500">{r.visitor.idNumber}</div>
          </div>
        </div>
      ),
    },
    { title: 'Estado', dataIndex: 'status', render: getStatusTag },
    {
      title: 'Entrada',
      dataIndex: 'checkInTime',
      render: (t) => dayjs(t).format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: 'Salida',
      dataIndex: 'checkOutTime',
      render: (t) => (t ? dayjs(t).format('DD/MM/YYYY HH:mm:ss') : '-'),
    },
    { title: 'Duración', render: (_, r) => formatDuration(r) },
    {
      title: 'Acciones',
      fixed: 'right',
      render: (_, r) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => navigate(`/entries/${r.id}`)} />
          {r.status === 'active' && (
            <>
              <Button type="text" icon={<LogoutOutlined />} onClick={() => handleCheckOut(r)} />
              <Button type="text" icon={<EditOutlined />} onClick={() => navigate(`/entries/${r.id}/edit`)} />
              <Button danger type="text" icon={<CloseCircleOutlined />} onClick={() => handleCancelEntry(r)} />
            </>
          )}
        </Space>
      ),
    },
  ];

  // ========================
  // RENDER
  // ========================

  return (
    <div className="space-y-4">
      <Row gutter={16}>
        <Col span={6}><Card><Statistic title="Total" value={stats.totalEntries} /></Card></Col>
        <Col span={6}><Card><Statistic title="Activos" value={stats.activeEntries} /></Card></Col>
        <Col span={6}><Card><Statistic title="Completados" value={stats.completedEntries} /></Card></Col>
        <Col span={6}><Card><Statistic title="Cancelados" value={stats.cancelledEntries} /></Card></Col>
      </Row>

      <Card>
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">Registro de Entradas</h1>
          <Button type="primary" icon={<LoginOutlined />} onClick={() => navigate('/entries/new')}>
            Registrar Entrada
          </Button>
        </div>

        <Row gutter={16}>
          <Col span={6}>
            <Input
              placeholder="Buscar..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </Col>

          <Col span={6}>
            <Select
              placeholder="Estado"
              allowClear
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(v) => handleFilterChange('status', v)}
            >
              <Option value="active">Activo</Option>
              <Option value="completed">Completado</Option>
              <Option value="cancelled">Cancelado</Option>
            </Select>
          </Col>

          <Col span={6}>
            <RangePicker
              style={{ width: '100%' }}
              value={filters.dateRange}
              onChange={(d) => handleFilterChange('dateRange', d)}
            />
          </Col>
        </Row>

        <div className="flex justify-between mt-4">
          <Space>
            <Badge count={Object.values(filters).filter(Boolean).length}>
              <Button icon={<FilterOutlined />}>Filtros</Button>
            </Badge>
            <Button onClick={clearFilters}>Limpiar</Button>
          </Space>

          <Space>
            <Button
              type={viewMode === 'today' ? 'primary' : 'default'}
              icon={<CalendarOutlined />}
              onClick={filterToday}
            >
              Ver Hoy
            </Button>
            <Button
              type={filters.status === 'active' ? 'primary' : 'default'}
              icon={<TeamOutlined />}
              onClick={filterActive}
            >
              Ver Activos
            </Button>
          </Space>
        </div>

        <Table
          className="mt-4"
          rowKey="id"
          columns={columns}
          dataSource={entries}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (t) => `Total: ${t}`,
          }}
          onChange={(p) => setPagination(p)}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default EntryList;
