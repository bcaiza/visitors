import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Button,
  Space,
  Spin,
  message,
  Dropdown,
  Modal,
  Checkbox,
} from 'antd';
import {
  TeamOutlined,
  LoginOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  ReloadOutlined,
  FileExcelOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import dayjs from 'dayjs';
import reportService from '../services/reportService';
import { useTheme } from '../context/useTheme';

const { RangePicker } = DatePicker;

const Dashboard = () => {
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(false); 
  const [exporting, setExporting] = useState(false);

  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);

  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeOverview: true,
    includeCharts: true,
    includeTopVisitors: true,
    includeDepartments: true,
    includePurposes: true,
    includePeakHours: true,
    includeMonthly: true,
  });

  const [overview, setOverview] = useState(null);
  const [entriesByDay, setEntriesByDay] = useState([]);
  const [topVisitors, setTopVisitors] = useState([]);
  const [byDepartment, setByDepartment] = useState([]);
  const [byPurpose, setByPurpose] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);


  useEffect(() => {
    loadDashboardData();
  }, []);

  // -------------------- FUNCTIONS --------------------
 const loadDashboardData = async (customRange = null) => {
  const range = customRange || dateRange;
  
  if (!range || !range[0] || !range[1]) {
    message.warning('Selecciona un rango de fechas válido');
    return;
  }

  setLoading(true);
  try {
    const params = {
      startDate: range[0].format('YYYY-MM-DD'),
      endDate: range[1].add(1, 'day').format('YYYY-MM-DD'),
    };


    const data = await reportService.getAllDashboardData(params);

    console.log('✅ Datos recibidos:', data);

    setOverview(data.overview);
    setEntriesByDay(data.entriesByDay?.data || []);
    setTopVisitors(data.topVisitors?.topVisitors || []);
    setByDepartment(data.byDepartment?.departments || []);
    setByPurpose(data.byPurpose?.purposes || []);
    setPeakHours(data.peakHours?.hours || []);
    setMonthlyData(data.monthlyComparison?.months || []);

    message.success('Datos cargados exitosamente');
  } catch (error) {
    console.error('❌ Error al cargar datos del dashboard:', error);
    message.error('Error al cargar datos del dashboard');
  } finally {
    setLoading(false);
  }
};

  const handleExport = async (type, format) => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      message.warning('Selecciona un rango de fechas válido');
      return;
    }

    setExporting(true);
    try {
      const params = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
      };
      await reportService.export(type, format, params);
      message.success('Reporte exportado exitosamente');
    } catch (error) {
      message.error('Error al exportar reporte: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const handleExportDashboard = async () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      message.warning('Selecciona un rango de fechas válido');
      return;
    }

    setExporting(true);
    try {
      const params = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        ...exportOptions,
      };
      await reportService.exportDashboardToExcel(params);
      message.success('Dashboard exportado exitosamente');
      setExportModalVisible(false);
    } catch (error) {
      message.error('Error al exportar dashboard: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const handleDateRangeChange = (dates) => {
    if (!dates || !dates[0] || !dates[1]) {
      return;
    }
    setDateRange(dates);
    loadDashboardData(dates); // ✅ Cargar inmediatamente con las nuevas fechas
  };

  // -------------------- MENU EXPORT --------------------
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard Completo (Excel)',
      onClick: () => setExportModalVisible(true),
    },
    {
      type: 'divider',
    },
    {
      key: 'visitors',
      icon: <TeamOutlined />,
      label: 'Visitantes',
      children: [
        {
          key: 'visitors-excel',
          icon: <FileExcelOutlined />,
          label: 'Excel',
          onClick: () => handleExport('visitors', 'excel'),
        },
      ],
    },
    {
      key: 'entries',
      icon: <LoginOutlined />,
      label: 'Entradas',
      children: [
        {
          key: 'entries-excel',
          icon: <FileExcelOutlined />,
          label: 'Excel',
          onClick: () => handleExport('entries', 'excel'),
        },
      ],
    },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  // -------------------- LOADING --------------------
  if (loading && !overview) { // ✅ Solo mostrar loading si es la primera carga
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          gap: 16,
        }}
      >
        <Spin size="large" />
        <div className="text-slate-600 dark:text-slate-400">
          Cargando estadísticas del dashboard...
        </div>
      </div>
    );
  }

  // -------------------- RENDER --------------------
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Dashboard Analítico
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Estadísticas y reportes de visitantes
            </p>
          </div>

          <Space>
            <RangePicker
              value={dateRange}
              format="DD/MM/YYYY"
              onChange={handleDateRangeChange}
              allowClear={false}
              placeholder={['Fecha inicio', 'Fecha fin']}
            />

            <Button
              icon={<ReloadOutlined />}
              onClick={() => loadDashboardData()}
              loading={loading}
            >
              Actualizar
            </Button>

            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button type="primary" icon={<DownloadOutlined />} loading={exporting}>
                Exportar
              </Button>
            </Dropdown>
          </Space>
        </div>
      </Card>

      {/* Estadísticas principales */}
      {overview && (
        <Row gutter={16}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Visitantes"
                value={overview.totals.visitors}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Entradas"
                value={overview.totals.entries}
                prefix={<LoginOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Visitantes Activos"
                value={overview.totals.active}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tiempo Promedio"
                value={overview.metrics.averageStayFormatted}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Gráfica de entradas por día */}
      {entriesByDay.length > 0 && (
        <Card title={<><LineChartOutlined className="mr-2" />Entradas por Día</>}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={entriesByDay}>
              <defs>
                <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => dayjs(date).format('DD/MM')}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(date) => dayjs(date).format('DD/MM/YYYY')}
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#fff',
                  border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#1890ff"
                fillOpacity={1}
                fill="url(#colorEntries)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Row gutter={16}>
        {/* Horas Pico */}
        {peakHours.length > 0 && (
          <Col xs={24} lg={12}>
            <Card title={<><BarChartOutlined className="mr-2" />Horas Pico de Entrada</>}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(hour) => `${hour}:00 - ${hour + 1}:00`}
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#fff',
                      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                    }}
                  />
                  <Bar dataKey="count" fill="#52c41a" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        )}

        {/* Departamentos */}
        {byDepartment.length > 0 && (
          <Col xs={24} lg={12}>
            <Card title={<><PieChartOutlined className="mr-2" />Visitas por Departamento</>}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={byDepartment}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ department, percent }) =>
                      `${department}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="department"
                  >
                    {byDepartment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#fff',
                      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        )}
      </Row>

      <Row gutter={16}>
        {/* Top Visitantes */}
        {topVisitors.length > 0 && (
          <Col xs={24} lg={12}>
            <Card title={<><TeamOutlined className="mr-2" />Visitantes Frecuentes</>}>
              <div className="space-y-3">
                {topVisitors.map((item, index) => (
                  <div
                    key={item.visitor.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{
                      background: isDark ? '#1e293b' : '#f8fafc',
                      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-full font-bold"
                        style={{
                          background: COLORS[index % COLORS.length],
                          color: '#fff',
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100">
                          {item.visitor.firstName} {item.visitor.lastName}
                        </div>
                        {item.visitor.company && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {item.visitor.company}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">
                        {item.visitCount}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        visitas
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        )}

        {/* Motivos */}
        {byPurpose.length > 0 && (
          <Col xs={24} lg={12}>
            <Card title={<><BarChartOutlined className="mr-2" />Motivos de Visita</>}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byPurpose} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="purpose" type="category" width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#fff',
                      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                    }}
                  />
                  <Bar dataKey="count" fill="#8884d8">
                    {byPurpose.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        )}
      </Row>

      {/* Comparación Mensual */}
      {monthlyData.length > 0 && (
        <Card title={<><LineChartOutlined className="mr-2" />Tendencia Mensual</>}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickFormatter={(month) => dayjs(month).format('MMM YYYY')}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(month) => dayjs(month).format('MMMM YYYY')}
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#fff',
                  border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#1890ff"
                strokeWidth={2}
                name="Entradas"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Modal de opciones de exportación */}
      <Modal
        title="Exportar Dashboard a Excel"
        open={exportModalVisible}
        onOk={handleExportDashboard}
        onCancel={() => setExportModalVisible(false)}
        okText="Exportar"
        cancelText="Cancelar"
        confirmLoading={exporting}
        width={600}
      >
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            Selecciona qué secciones deseas incluir en el reporte de Excel:
          </p>
          
          <div className="space-y-2">
            <Checkbox
              checked={exportOptions.includeOverview}
              onChange={(e) =>
                setExportOptions({ ...exportOptions, includeOverview: e.target.checked })
              }
            >
              <strong>Resumen General</strong> - Estadísticas principales del período
            </Checkbox>
            
            <Checkbox
              checked={exportOptions.includeCharts}
              onChange={(e) =>
                setExportOptions({ ...exportOptions, includeCharts: e.target.checked })
              }
            >
              <strong>Gráfico de Entradas por Día</strong> - Tendencia diaria de visitas
            </Checkbox>
            
            <Checkbox
              checked={exportOptions.includeTopVisitors}
              onChange={(e) =>
                setExportOptions({ ...exportOptions, includeTopVisitors: e.target.checked })
              }
            >
              <strong>Top Visitantes</strong> - Visitantes más frecuentes
            </Checkbox>
            
            <Checkbox
              checked={exportOptions.includeDepartments}
              onChange={(e) =>
                setExportOptions({ ...exportOptions, includeDepartments: e.target.checked })
              }
            >
              <strong>Visitas por Departamento</strong> - Distribución por área
            </Checkbox>
            
            <Checkbox
              checked={exportOptions.includePurposes}
              onChange={(e) =>
                setExportOptions({ ...exportOptions, includePurposes: e.target.checked })
              }
            >
              <strong>Motivos de Visita</strong> - Propósitos de las visitas
            </Checkbox>
            
            <Checkbox
              checked={exportOptions.includePeakHours}
              onChange={(e) =>
                setExportOptions({ ...exportOptions, includePeakHours: e.target.checked })
              }
            >
              <strong>Horas Pico</strong> - Distribución horaria de entradas
            </Checkbox>
            
            <Checkbox
              checked={exportOptions.includeMonthly}
              onChange={(e) =>
                setExportOptions({ ...exportOptions, includeMonthly: e.target.checked })
              }
            >
              <strong>Tendencia Mensual</strong> - Comparación de últimos meses
            </Checkbox>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              📊 El archivo Excel incluirá múltiples hojas con datos y gráficos profesionales listos para presentación.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;