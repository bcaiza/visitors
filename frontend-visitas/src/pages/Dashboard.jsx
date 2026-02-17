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
  RadialBarChart,
  RadialBar,
} from 'recharts';
import dayjs from 'dayjs';
import reportService from '../services/reportService';
import { useTheme } from '../context/useTheme';

const { RangePicker } = DatePicker;

// ─── Paleta unificada ────────────────────────────────────────────────────────
const PALETTE = {
  blue:    '#3B82F6',
  cyan:    '#06B6D4',
  emerald: '#10B981',
  violet:  '#8B5CF6',
  amber:   '#F59E0B',
  rose:    '#F43F5E',
  indigo:  '#6366F1',
  teal:    '#14B8A6',
};
const COLORS = Object.values(PALETTE);

// ─── Tooltip personalizado ───────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, labelFormatter, formatter, isDark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.97)',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      borderRadius: 12,
      padding: '10px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      backdropFilter: 'blur(8px)',
    }}>
      <p style={{ margin: '0 0 6px', fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>
        {labelFormatter ? labelFormatter(label) : label}
      </p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: '2px 0', fontSize: 14, fontWeight: 700, color: p.color || p.fill }}>
          {formatter ? formatter(p.value, p.name) : p.value}
          {!formatter && <span style={{ fontWeight: 400, fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', marginLeft: 6 }}>{p.name}</span>}
        </p>
      ))}
    </div>
  );
};

// ─── Label del PieChart ──────────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─── Tick personalizado para el eje X de horas ──────────────────────────────
const HourTick = ({ x, y, payload, isDark }) => (
  <g transform={`translate(${x},${y})`}>
    <text x={0} y={0} dy={14} textAnchor="middle" fontSize={11} fontWeight={600}
      fill={isDark ? '#94a3b8' : '#64748b'}>
      {`${String(payload.value).padStart(2,'0')}h`}
    </text>
  </g>
);

// ─── Bar con bordes redondeados arriba ───────────────────────────────────────
const RoundedBar = (props) => {
  const { x, y, width, height, fill } = props;
  const radius = 6;
  if (height <= 0) return null;
  return (
    <path
      d={`M${x},${y + height} L${x},${y + radius} Q${x},${y} ${x + radius},${y} L${x + width - radius},${y} Q${x + width},${y} ${x + width},${y + radius} L${x + width},${y + height} Z`}
      fill={fill}
    />
  );
};

// ─── Gradientes SVG reutilizables ────────────────────────────────────────────
const ChartGradients = () => (
  <svg width={0} height={0} style={{ position: 'absolute' }}>
    <defs>
      <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={PALETTE.blue} stopOpacity={0.25} />
        <stop offset="95%" stopColor={PALETTE.blue} stopOpacity={0.01} />
      </linearGradient>
      <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={PALETTE.cyan} stopOpacity={0.3} />
        <stop offset="95%" stopColor={PALETTE.cyan} stopOpacity={0.01} />
      </linearGradient>
      <linearGradient id="gradEmerald" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={PALETTE.emerald} stopOpacity={0.3} />
        <stop offset="95%" stopColor={PALETTE.emerald} stopOpacity={0.01} />
      </linearGradient>
    </defs>
  </svg>
);

// ─── Wrapper de Card con header estilizado ───────────────────────────────────
const ChartCard = ({ icon, title, accentColor = PALETTE.blue, children, isDark }) => (
  <Card
    bodyStyle={{ padding: '0 16px 16px' }}
    style={{
      borderRadius: 16,
      border: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`,
      boxShadow: isDark
        ? '0 4px 24px rgba(0,0,0,0.4)'
        : '0 4px 24px rgba(0,0,0,0.06)',
      overflow: 'hidden',
    }}
  >
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '14px 16px 12px',
      borderBottom: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`,
      marginBottom: 4,
    }}>
      <span style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 32, height: 32, borderRadius: 8,
        background: `${accentColor}20`,
        color: accentColor, fontSize: 15,
      }}>
        {icon}
      </span>
      <span style={{
        fontWeight: 700, fontSize: 14,
        color: isDark ? '#e2e8f0' : '#1e293b',
        letterSpacing: '-0.01em',
      }}>
        {title}
      </span>
    </div>
    {children}
  </Card>
);

// ════════════════════════════════════════════════════════════════════════════
const Dashboard = () => {
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
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

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async (customRange = null) => {
    const range = customRange || dateRange;
    if (!range?.[0] || !range?.[1]) { message.warning('Selecciona un rango de fechas válido'); return; }
    setLoading(true);
    try {
      const params = {
        startDate: range[0].format('YYYY-MM-DD'),
        endDate: range[1].add(1, 'day').format('YYYY-MM-DD'),
      };
      const data = await reportService.getAllDashboardData(params);
      setOverview(data.overview);
      setEntriesByDay(data.entriesByDay?.data || []);
      setTopVisitors(data.topVisitors?.topVisitors || []);
      setByDepartment(data.byDepartment?.departments || []);
      setByPurpose(data.byPurpose?.purposes || []);
      setPeakHours(data.peakHours?.hours || []);
      setMonthlyData(data.monthlyComparison?.months || []);
      message.success('Datos cargados exitosamente');
    } catch {
      message.error('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type, format) => {
    if (!dateRange?.[0] || !dateRange?.[1]) { message.warning('Selecciona un rango de fechas válido'); return; }
    setExporting(true);
    try {
      const params = { startDate: dateRange[0].format('YYYY-MM-DD'), endDate: dateRange[1].format('YYYY-MM-DD') };
      await reportService.export(type, format, params);
      message.success('Reporte exportado exitosamente');
    } catch (e) {
      message.error('Error al exportar reporte: ' + e.message);
    } finally { setExporting(false); }
  };

  const handleExportDashboard = async () => {
    if (!dateRange?.[0] || !dateRange?.[1]) { message.warning('Selecciona un rango de fechas válido'); return; }
    setExporting(true);
    try {
      const params = { startDate: dateRange[0].format('YYYY-MM-DD'), endDate: dateRange[1].format('YYYY-MM-DD'), ...exportOptions };
      await reportService.exportDashboardToExcel(params);
      message.success('Dashboard exportado exitosamente');
      setExportModalVisible(false);
    } catch (e) {
      message.error('Error al exportar dashboard: ' + e.message);
    } finally { setExporting(false); }
  };

  const handleDateRangeChange = (dates) => {
    if (!dates?.[0] || !dates?.[1]) return;
    setDateRange(dates);
    loadDashboardData(dates);
  };

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard Completo (Excel)', onClick: () => setExportModalVisible(true) },
    { type: 'divider' },
    { key: 'visitors', icon: <TeamOutlined />, label: 'Visitantes', children: [{ key: 'visitors-excel', icon: <FileExcelOutlined />, label: 'Excel', onClick: () => handleExport('visitors', 'excel') }] },
    { key: 'entries', icon: <LoginOutlined />, label: 'Entradas', children: [{ key: 'entries-excel', icon: <FileExcelOutlined />, label: 'Excel', onClick: () => handleExport('entries', 'excel') }] },
  ];

  // Colores del tema
  const axisColor = isDark ? '#475569' : '#cbd5e1';
  const tickColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#1e293b' : '#f1f5f9';

  const axisStyle = { fontSize: 11, fontWeight: 600, fill: tickColor };

  if (loading && !overview) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 400, gap: 16 }}>
        <Spin size="large" />
        <div className="text-slate-600 dark:text-slate-400">Cargando estadísticas del dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ChartGradients />

      {/* ── Header ── */}
      <Card style={{ borderRadius: 16 }}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard Analítico</h1>
            <p className="text-slate-500 dark:text-slate-400">Estadísticas y reportes de visitantes</p>
          </div>
          <Space>
            <RangePicker value={dateRange} format="DD/MM/YYYY" onChange={handleDateRangeChange} allowClear={false} placeholder={['Fecha inicio', 'Fecha fin']} />
            <Button icon={<ReloadOutlined />} onClick={() => loadDashboardData()} loading={loading}>Actualizar</Button>
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button type="primary" icon={<DownloadOutlined />} loading={exporting}>Exportar</Button>
            </Dropdown>
          </Space>
        </div>
      </Card>

      {/* ── Stats ── */}
      {overview && (
        <Row gutter={16}>
          {[
            { label: 'Total Visitantes', value: overview.totals.visitors, icon: <TeamOutlined />, color: PALETTE.blue },
            { label: 'Total Entradas',   value: overview.totals.entries,  icon: <LoginOutlined />, color: PALETTE.emerald },
            { label: 'Activos Ahora',    value: overview.totals.active,   icon: <ClockCircleOutlined />, color: PALETTE.amber },
            { label: 'Tiempo Promedio',  value: overview.metrics.averageStayFormatted, icon: <ClockCircleOutlined />, color: PALETTE.violet },
          ].map(({ label, value, icon, color }) => (
            <Col xs={24} sm={12} lg={6} key={label}>
              <Card style={{ borderRadius: 16, borderTop: `3px solid ${color}`, boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)' }}>
                <Statistic title={<span style={{ fontSize: 12, fontWeight: 600, color: tickColor, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>} value={value} prefix={<span style={{ color }}>{icon}</span>} valueStyle={{ color, fontWeight: 800, fontSize: 28 }} />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* ── Entradas por Día ── */}
      {entriesByDay.length > 0 && (
        <ChartCard icon={<LineChartOutlined />} title="Entradas por Día" accentColor={PALETTE.blue} isDark={isDark}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={entriesByDay} margin={{ top: 16, right: 16, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PALETTE.blue} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={PALETTE.blue} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridColor} strokeDasharray="0" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(d) => dayjs(d).format('DD/MM')} tick={axisStyle} axisLine={{ stroke: axisColor }} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip isDark={isDark} labelFormatter={(d) => dayjs(d).format('DD MMMM YYYY')} formatter={(v) => [`${v} entradas`]} />} />
              <Area type="monotone" dataKey="count" stroke={PALETTE.blue} strokeWidth={2.5} fill="url(#areaBlue)" dot={false} activeDot={{ r: 5, fill: PALETTE.blue, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      <Row gutter={16}>
        {/* ── Horas Pico ── */}
        {peakHours.length > 0 && (
          <Col xs={24} lg={12}>
            <ChartCard icon={<BarChartOutlined />} title="Horas Pico de Entrada" accentColor={PALETTE.cyan} isDark={isDark}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={peakHours} margin={{ top: 16, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke={gridColor} strokeDasharray="0" vertical={false} />
                  <XAxis dataKey="hour" tick={<HourTick isDark={isDark} />} axisLine={{ stroke: axisColor }} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                  <Tooltip content={
                    <CustomTooltip
                      isDark={isDark}
                      labelFormatter={(h) => `${String(h).padStart(2,'0')}:00 – ${String(h+1).padStart(2,'0')}:00`}
                      formatter={(v) => [`${v} entradas`]}
                    />
                  } />
                  <Bar dataKey="count" shape={<RoundedBar />} maxBarSize={40}>
                    {peakHours.map((entry, i) => {
                      const max = Math.max(...peakHours.map(h => h.count));
                      return <Cell key={i} fill={entry.count === max ? PALETTE.amber : PALETTE.cyan} fillOpacity={entry.count === max ? 1 : 0.75} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Col>
        )}

        {/* ── Departamentos ── */}
        {byDepartment.length > 0 && (
          <Col xs={24} lg={12}>
            <ChartCard icon={<PieChartOutlined />} title="Visitas por Departamento" accentColor={PALETTE.violet} isDark={isDark}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={byDepartment}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={100}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="department"
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {byDepartment.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={
                    <CustomTooltip
                      isDark={isDark}
                      labelFormatter={(l) => l}
                      formatter={(v, n) => [`${v} visitas`, n]}
                    />
                  } />
                  <Legend
                    iconType="circle" iconSize={8}
                    formatter={(value) => <span style={{ fontSize: 12, fontWeight: 600, color: tickColor }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Col>
        )}
      </Row>

      <Row gutter={16}>
        {/* ── Top Visitantes ── */}
        {topVisitors.length > 0 && (
          <Col xs={24} lg={12}>
            <ChartCard icon={<TeamOutlined />} title="Visitantes Frecuentes" accentColor={PALETTE.emerald} isDark={isDark}>
              <div style={{ padding: '8px 0' }}>
                {topVisitors.map((item, index) => {
                  const max = topVisitors[0]?.visitCount || 1;
                  const pct = (item.visitCount / max) * 100;
                  const color = COLORS[index % COLORS.length];
                  return (
                    <div key={item.visitor.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 4px' }}>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                        {index + 1}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#e2e8f0' : '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.visitor.firstName} {item.visitor.lastName}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 800, color, marginLeft: 8, flexShrink: 0 }}>
                            {item.visitCount}
                          </span>
                        </div>
                        <div style={{ height: 5, borderRadius: 99, background: isDark ? '#1e293b' : '#f1f5f9', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
                        </div>
                        {item.visitor.company && (
                          <div style={{ fontSize: 11, color: tickColor, marginTop: 2 }}>{item.visitor.company}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ChartCard>
          </Col>
        )}

        {/* ── Motivos ── */}
        {byPurpose.length > 0 && (
          <Col xs={24} lg={12}>
            <ChartCard icon={<BarChartOutlined />} title="Motivos de Visita" accentColor={PALETTE.indigo} isDark={isDark}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byPurpose} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke={gridColor} strokeDasharray="0" horizontal={false} />
                  <XAxis type="number" tick={axisStyle} axisLine={{ stroke: axisColor }} tickLine={false} />
                  <YAxis dataKey="purpose" type="category" width={110} tick={{ ...axisStyle, textAnchor: 'end' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip isDark={isDark} formatter={(v) => [`${v} visitas`]} />} />
                  <Bar dataKey="count" shape={<RoundedBar />} maxBarSize={28}>
                    {byPurpose.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Col>
        )}
      </Row>

      {/* ── Tendencia Mensual ── */}
      {monthlyData.length > 0 && (
        <ChartCard icon={<LineChartOutlined />} title="Tendencia Mensual" accentColor={PALETTE.violet} isDark={isDark}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyData} margin={{ top: 16, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid stroke={gridColor} strokeDasharray="0" vertical={false} />
              <XAxis dataKey="month" tickFormatter={(m) => dayjs(m).format('MMM YY')} tick={axisStyle} axisLine={{ stroke: axisColor }} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip isDark={isDark} labelFormatter={(m) => dayjs(m).format('MMMM YYYY')} formatter={(v) => [`${v} entradas`]} />} />
              <Line type="monotone" dataKey="count" stroke={PALETTE.violet} strokeWidth={2.5} dot={{ r: 4, fill: PALETTE.violet, strokeWidth: 0 }} activeDot={{ r: 6, fill: PALETTE.violet, strokeWidth: 0 }} name="Entradas" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* ── Modal export ── */}
      <Modal
        title="Exportar Dashboard a Excel"
        open={exportModalVisible}
        onOk={handleExportDashboard}
        onCancel={() => setExportModalVisible(false)}
        okText="Exportar"
        cancelText="Cancelar"
        confirmLoading={exporting}
        width={560}
      >
        <div className="space-y-3">
          <p className="text-slate-600 dark:text-slate-400">Selecciona qué secciones deseas incluir:</p>
          <div className="space-y-2">
            {[
              { key: 'includeOverview',     label: 'Resumen General',           desc: 'Estadísticas principales del período' },
              { key: 'includeCharts',       label: 'Gráfico de Entradas por Día', desc: 'Tendencia diaria de visitas' },
              { key: 'includeTopVisitors',  label: 'Top Visitantes',             desc: 'Visitantes más frecuentes' },
              { key: 'includeDepartments',  label: 'Visitas por Departamento',   desc: 'Distribución por área' },
              { key: 'includePurposes',     label: 'Motivos de Visita',          desc: 'Propósitos de las visitas' },
              { key: 'includePeakHours',    label: 'Horas Pico',                 desc: 'Distribución horaria de entradas' },
              { key: 'includeMonthly',      label: 'Tendencia Mensual',          desc: 'Comparación de últimos meses' },
            ].map(({ key, label, desc }) => (
              <Checkbox key={key} checked={exportOptions[key]} onChange={(e) => setExportOptions({ ...exportOptions, [key]: e.target.checked })}>
                <strong>{label}</strong> — <span style={{ color: '#64748b', fontSize: 12 }}>{desc}</span>
              </Checkbox>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: '10px 14px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#1e40af' }}>📊 El archivo Excel incluirá múltiples hojas con datos y gráficos listos para presentación.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;