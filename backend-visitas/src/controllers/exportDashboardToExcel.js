import { Op } from 'sequelize';
import ExcelJS from 'exceljs';
import { createCanvas } from '@napi-rs/canvas';
import Entry from '../models/Entry.js';
import Visitor from '../models/Visitor.js';
import Department from '../models/Department.js';
import VisitPurpose from '../models/VisitPurpose.js';
import sequelize from '../config/database.js';

// ==================== HELPER DE FECHAS ====================
const parseDateRange = (startDate, endDate) => {
  const start = new Date(`${startDate}T00:00:00.000`);
  const end = new Date(`${endDate}T23:59:59.999`);
  return { start, end };
};

// ==================== HELPERS DE GRÁFICOS ====================

/**
 * Dibuja un gráfico de barras y devuelve un Buffer PNG
 */
const renderBarChart = ({ labels, values, title, color = '#4472C4', width = 800, height = 400 }) => {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const paddingTop = 60;
  const paddingBottom = 80;
  const paddingLeft = 70;
  const paddingRight = 30;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Fondo blanco
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Título
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, 35);

  const maxVal = Math.max(...values, 1);
  const barWidth = Math.max(10, (chartW / labels.length) * 0.6);
  const barGap = chartW / labels.length;

  // Líneas de cuadrícula
  const gridLines = 5;
  ctx.strokeStyle = '#e8e8e8';
  ctx.lineWidth = 1;
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#888888';

  for (let i = 0; i <= gridLines; i++) {
    const y = paddingTop + chartH - (i / gridLines) * chartH;
    const val = Math.round((i / gridLines) * maxVal);
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(paddingLeft + chartW, y);
    ctx.stroke();
    ctx.fillText(val.toString(), paddingLeft - 8, y + 4);
  }

  // Eje Y
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(paddingLeft, paddingTop);
  ctx.lineTo(paddingLeft, paddingTop + chartH);
  ctx.lineTo(paddingLeft + chartW, paddingTop + chartH);
  ctx.stroke();

  // Barras y etiquetas X
  labels.forEach((label, i) => {
    const val = values[i] || 0;
    const barH = (val / maxVal) * chartH;
    const x = paddingLeft + i * barGap + (barGap - barWidth) / 2;
    const y = paddingTop + chartH - barH;

    // Sombra suave
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(x + 3, y + 3, barWidth, barH);

    // Barra
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, barH);

    // Valor encima
    if (val > 0) {
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(val.toString(), x + barWidth / 2, y - 6);
    }

    // Label eje X (rotar si hay muchos)
    ctx.save();
    ctx.translate(x + barWidth / 2, paddingTop + chartH + 12);
    if (labels.length > 8) {
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = 'right';
    } else {
      ctx.textAlign = 'center';
    }
    ctx.fillStyle = '#555555';
    ctx.font = '11px sans-serif';
    // Truncar labels largos
    const shortLabel = label.length > 12 ? label.substring(0, 11) + '…' : label;
    ctx.fillText(shortLabel, 0, 0);
    ctx.restore();
  });

  return canvas.toBuffer('image/png');
};

/**
 * Dibuja un gráfico de líneas y devuelve un Buffer PNG
 */
const renderLineChart = ({ labels, values, title, color = '#1890FF', width = 800, height = 400 }) => {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const paddingTop = 60;
  const paddingBottom = 80;
  const paddingLeft = 70;
  const paddingRight = 30;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Fondo
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Título
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, 35);

  if (values.length === 0) {
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '14px sans-serif';
    ctx.fillText('Sin datos para mostrar', width / 2, height / 2);
    return canvas.toBuffer('image/png');
  }

  const maxVal = Math.max(...values, 1);
  const gridLines = 5;

  // Cuadrícula y eje Y
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#888888';
  for (let i = 0; i <= gridLines; i++) {
    const y = paddingTop + chartH - (i / gridLines) * chartH;
    const val = Math.round((i / gridLines) * maxVal);
    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(paddingLeft + chartW, y);
    ctx.stroke();
    ctx.fillText(val.toString(), paddingLeft - 8, y + 4);
  }

  // Ejes
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(paddingLeft, paddingTop);
  ctx.lineTo(paddingLeft, paddingTop + chartH);
  ctx.lineTo(paddingLeft + chartW, paddingTop + chartH);
  ctx.stroke();

  // Área rellena bajo la línea
  const points = values.map((val, i) => ({
    x: paddingLeft + (i / Math.max(values.length - 1, 1)) * chartW,
    y: paddingTop + chartH - (val / maxVal) * chartH,
  }));

  ctx.beginPath();
  ctx.moveTo(points[0].x, paddingTop + chartH);
  points.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(points[points.length - 1].x, paddingTop + chartH);
  ctx.closePath();
  ctx.fillStyle = color.replace(')', ', 0.15)').replace('rgb', 'rgba').replace('#', '').length > 10
    ? 'rgba(24,144,255,0.12)'
    : 'rgba(24,144,255,0.12)';
  ctx.fill();

  // Línea
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();

  // Puntos
  points.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Valor
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(values[i].toString(), p.x, p.y - 12);
  });

  // Labels eje X
  labels.forEach((label, i) => {
    const x = paddingLeft + (i / Math.max(labels.length - 1, 1)) * chartW;
    ctx.save();
    ctx.translate(x, paddingTop + chartH + 12);
    if (labels.length > 10) {
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = 'right';
    } else {
      ctx.textAlign = 'center';
    }
    ctx.fillStyle = '#555555';
    ctx.font = '11px sans-serif';
    const shortLabel = label.length > 10 ? label.substring(0, 9) + '…' : label;
    ctx.fillText(shortLabel, 0, 0);
    ctx.restore();
  });

  return canvas.toBuffer('image/png');
};

/**
 * Dibuja un gráfico de pastel y devuelve un Buffer PNG
 */
const renderPieChart = ({ labels, values, title, width = 600, height = 450 }) => {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const colors = [
    '#4472C4', '#ED7D31', '#A9D18E', '#FFC000', '#5B9BD5',
    '#70AD47', '#FF7C80', '#9E480E', '#636363', '#997300',
  ];

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#333333';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, 35);

  const total = values.reduce((a, b) => a + b, 0);
  if (total === 0) {
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '14px sans-serif';
    ctx.fillText('Sin datos', width / 2, height / 2);
    return canvas.toBuffer('image/png');
  }

  const centerX = width / 2 - 60;
  const centerY = height / 2 + 20;
  const radius = Math.min(width, height) / 2 - 80;

  let startAngle = -Math.PI / 2;

  values.forEach((val, i) => {
    const slice = (val / total) * 2 * Math.PI;
    const endAngle = startAngle + slice;
    const midAngle = startAngle + slice / 2;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Porcentaje dentro del slice si es suficientemente grande
    if (slice > 0.25) {
      const textX = centerX + Math.cos(midAngle) * radius * 0.65;
      const textY = centerY + Math.sin(midAngle) * radius * 0.65;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round((val / total) * 100)}%`, textX, textY);
    }

    startAngle = endAngle;
  });

  // Leyenda a la derecha
  const legendX = width - 170;
  const legendStartY = 60;
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';

  labels.forEach((label, i) => {
    const ly = legendStartY + i * 24;
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(legendX, ly, 14, 14);
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(legendX, ly, 14, 14);
    ctx.fillStyle = '#333333';
    const shortLabel = label.length > 16 ? label.substring(0, 15) + '…' : label;
    ctx.fillText(`${shortLabel} (${values[i]})`, legendX + 20, ly + 11);
  });

  return canvas.toBuffer('image/png');
};

/**
 * Inserta un PNG buffer como imagen en una hoja de Excel
 * en la celda indicada, con ancho/alto en píxeles de columna/fila aproximados
 */
const insertChartImage = async (workbook, worksheet, pngBuffer, anchorCell, widthCols, heightRows) => {
  const imageId = workbook.addImage({
    buffer: pngBuffer,
    extension: 'png',
  });

  // Calcular rango aproximado (col/row en base 0)
  const colLetter = anchorCell.match(/[A-Z]+/)[0];
  const rowNum = parseInt(anchorCell.match(/\d+/)[0]);
  const colIndex = colLetter.split('').reduce((acc, c) => acc * 26 + c.charCodeAt(0) - 64, 0) - 1;

  worksheet.addImage(imageId, {
    tl: { col: colIndex, row: rowNum - 1 },
    br: { col: colIndex + widthCols, row: rowNum - 1 + heightRows },
  });
};

// ==================== EXPORTAR DASHBOARD A EXCEL ====================

export const exportDashboardToExcel = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      includeOverview = true,
      includeCharts = true,
      includeTopVisitors = true,
      includeDepartments = true,
      includePurposes = true,
      includePeakHours = true,
      includeMonthly = true,
    } = req.query;

    // ✅ Fechas en hora local
    let start, end;
    if (startDate && endDate) {
      ({ start, end } = parseDateRange(startDate, endDate));
    } else {
      end = new Date();
      start = new Date();
      start.setMonth(end.getMonth() - 1);
    }

    const whereClause = {
      checkInTime: { [Op.between]: [start, end] },
    };

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Gestión de Visitantes';
    workbook.created = new Date();

    // ==================== HOJA 1: RESUMEN ====================
    if (includeOverview) {
      const summarySheet = workbook.addWorksheet('Resumen', {
        views: [{ showGridLines: false }],
      });

      summarySheet.mergeCells('A1:F1');
      summarySheet.getCell('A1').value = 'REPORTE DE DASHBOARD - SISTEMA DE VISITANTES';
      summarySheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      summarySheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1890FF' } };
      summarySheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
      summarySheet.getRow(1).height = 30;

      summarySheet.mergeCells('A2:F2');
      summarySheet.getCell('A2').value = `Período: ${start.toLocaleDateString('es-ES')} - ${end.toLocaleDateString('es-ES')}`;
      summarySheet.getCell('A2').font = { size: 12, italic: true };
      summarySheet.getCell('A2').alignment = { horizontal: 'center' };
      summarySheet.getRow(2).height = 20;

      const [totalVisitors, totalEntries, activeEntries, completedEntries, cancelledEntries] =
        await Promise.all([
          Visitor.count(),
          Entry.count({ where: whereClause }),
          Entry.count({ where: { ...whereClause, status: 'active' } }),
          Entry.count({ where: { ...whereClause, status: 'completed' } }),
          Entry.count({ where: { ...whereClause, status: 'cancelled' } }),
        ]);

      const completedWithTime = await Entry.findAll({
        where: { ...whereClause, status: 'completed', checkOutTime: { [Op.ne]: null } },
        attributes: ['checkInTime', 'checkOutTime'],
      });

      let averageStayMinutes = 0;
      if (completedWithTime.length > 0) {
        const totalMinutes = completedWithTime.reduce((sum, entry) => {
          return sum + (new Date(entry.checkOutTime) - new Date(entry.checkInTime)) / 1000 / 60;
        }, 0);
        averageStayMinutes = Math.round(totalMinutes / completedWithTime.length);
      }

      summarySheet.getCell('A4').value = 'ESTADÍSTICAS PRINCIPALES';
      summarySheet.getCell('A4').font = { size: 14, bold: true, color: { argb: 'FF1890FF' } };
      summarySheet.getRow(4).height = 25;

      const stats = [
        ['Métrica', 'Valor', 'Descripción'],
        ['Total Visitantes Registrados', totalVisitors, 'Visitantes únicos en el sistema'],
        ['Total Entradas en Período', totalEntries, 'Entradas registradas en el rango de fechas'],
        ['Visitantes Activos', activeEntries, 'Visitantes actualmente en las instalaciones'],
        ['Visitas Completadas', completedEntries, 'Visitas que ya finalizaron'],
        ['Visitas Canceladas', cancelledEntries, 'Visitas canceladas en el período'],
        ['Tiempo Promedio de Estancia', `${Math.floor(averageStayMinutes / 60)}h ${averageStayMinutes % 60}m`, 'Duración promedio de las visitas'],
      ];

      stats.forEach((row, index) => {
        const rowNum = 5 + index;
        summarySheet.getCell(`A${rowNum}`).value = row[0];
        summarySheet.getCell(`B${rowNum}`).value = row[1];
        summarySheet.getCell(`C${rowNum}`).value = row[2];

        if (index === 0) {
          summarySheet.getRow(rowNum).font = { bold: true, color: { argb: 'FFFFFFFF' } };
          summarySheet.getRow(rowNum).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        } else if (index % 2 === 0) {
          summarySheet.getRow(rowNum).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
        }

        summarySheet.getRow(rowNum).alignment = { vertical: 'middle' };
        summarySheet.getRow(rowNum).height = 22;
      });

      for (let i = 5; i <= 11; i++) {
        ['A', 'B', 'C'].forEach(col => {
          summarySheet.getCell(`${col}${i}`).border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' },
          };
        });
      }

      summarySheet.getColumn('A').width = 35;
      summarySheet.getColumn('B').width = 20;
      summarySheet.getColumn('C').width = 45;
      ['B6', 'B7', 'B8', 'B9', 'B10'].forEach(cell => {
        summarySheet.getCell(cell).numFmt = '#,##0';
      });
    }

    // ==================== HOJA 2: ENTRADAS POR DÍA ====================
    if (includeCharts) {
      const entriesSheet = workbook.addWorksheet('Entradas por Día');

      const entriesByDay = await Entry.findAll({
        where: whereClause,
        attributes: [
          [sequelize.fn('DATE', sequelize.col('checkInTime')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: [sequelize.fn('DATE', sequelize.col('checkInTime'))],
        order: [[sequelize.fn('DATE', sequelize.col('checkInTime')), 'ASC']],
        raw: true,
      });

      // Tabla de datos
      entriesSheet.mergeCells('A1:C1');
      entriesSheet.getCell('A1').value = 'ENTRADAS POR DÍA';
      entriesSheet.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      entriesSheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1890FF' } };
      entriesSheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
      entriesSheet.getRow(1).height = 25;

      ['Fecha', 'Día de la Semana', 'Cantidad'].forEach((h, i) => {
        const col = ['A', 'B', 'C'][i];
        entriesSheet.getCell(`${col}3`).value = h;
      });
      entriesSheet.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      entriesSheet.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      entriesByDay.forEach((entry, index) => {
        const rowNum = 4 + index;
        const date = new Date(entry.date + 'T12:00:00'); // evitar desplazamiento UTC
        entriesSheet.getCell(`A${rowNum}`).value = date;
        entriesSheet.getCell(`A${rowNum}`).numFmt = 'dd/mm/yyyy';
        entriesSheet.getCell(`B${rowNum}`).value = dayNames[date.getDay()];
        entriesSheet.getCell(`C${rowNum}`).value = parseInt(entry.count);
        if (index % 2 === 1) {
          entriesSheet.getRow(rowNum).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
        }
      });

      const totalRow = 4 + entriesByDay.length;
      entriesSheet.getCell(`A${totalRow}`).value = 'TOTAL';
      entriesSheet.getCell(`A${totalRow}`).font = { bold: true };
      entriesSheet.getCell(`C${totalRow}`).value = {
        formula: `SUM(C4:C${totalRow - 1})`,
        result: entriesByDay.reduce((sum, e) => sum + parseInt(e.count), 0),
      };
      entriesSheet.getCell(`C${totalRow}`).font = { bold: true };
      entriesSheet.getRow(totalRow).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE699' } };

      for (let i = 3; i <= totalRow; i++) {
        ['A', 'B', 'C'].forEach(col => {
          entriesSheet.getCell(`${col}${i}`).border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' },
          };
        });
      }

      entriesSheet.getColumn('A').width = 15;
      entriesSheet.getColumn('B').width = 20;
      entriesSheet.getColumn('C').width = 20;

      // ✅ Gráfico real
      const chartLabels = entriesByDay.map(e => {
        const d = new Date(e.date + 'T12:00:00');
        return `${d.getDate()}/${d.getMonth() + 1}`;
      });
      const chartValues = entriesByDay.map(e => parseInt(e.count));
      const chartBuffer = renderLineChart({
        labels: chartLabels,
        values: chartValues,
        title: 'Entradas por Día',
        color: '#1890FF',
        width: 900,
        height: 420,
      });

      // Insertar gráfico en columna E
      entriesSheet.getColumn('E').width = 15;
      await insertChartImage(workbook, entriesSheet, chartBuffer, 'E1', 11, 22);
    }

    // ==================== HOJA 3: TOP VISITANTES ====================
    if (includeTopVisitors) {
      const visitorsSheet = workbook.addWorksheet('Top Visitantes');

      const topVisitors = await Entry.findAll({
        where: whereClause,
        attributes: [
          'visitor_id',
          [sequelize.fn('COUNT', sequelize.col('Entry.id')), 'visitCount'],
        ],
        include: [
          {
            model: Visitor,
            as: 'visitor',
            attributes: ['firstName', 'lastName', 'company', 'email'],
          },
        ],
        group: ['visitor_id', 'visitor.id'],
        order: [[sequelize.fn('COUNT', sequelize.col('Entry.id')), 'DESC']],
        limit: 20,
        raw: false,
      });

      visitorsSheet.mergeCells('A1:F1');
      visitorsSheet.getCell('A1').value = 'TOP 20 VISITANTES MÁS FRECUENTES';
      visitorsSheet.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      visitorsSheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF52C41A' } };
      visitorsSheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
      visitorsSheet.getRow(1).height = 25;

      ['Ranking', 'Nombre', 'Apellido', 'Empresa', 'Email', 'Visitas'].forEach((h, i) => {
        const col = String.fromCharCode(65 + i);
        visitorsSheet.getCell(`${col}3`).value = h;
      });
      visitorsSheet.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      visitorsSheet.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

      topVisitors.forEach((entry, index) => {
        const rowNum = 4 + index;
        visitorsSheet.getCell(`A${rowNum}`).value = index + 1;
        visitorsSheet.getCell(`B${rowNum}`).value = entry.visitor?.firstName || 'N/A';
        visitorsSheet.getCell(`C${rowNum}`).value = entry.visitor?.lastName || 'N/A';
        visitorsSheet.getCell(`D${rowNum}`).value = entry.visitor?.company || 'N/A';
        visitorsSheet.getCell(`E${rowNum}`).value = entry.visitor?.email || 'N/A';
        visitorsSheet.getCell(`F${rowNum}`).value = parseInt(entry.get('visitCount'));

        if (index < 3) {
          visitorsSheet.getRow(rowNum).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD700' } };
          visitorsSheet.getRow(rowNum).font = { bold: true };
        } else if (index % 2 === 1) {
          visitorsSheet.getRow(rowNum).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
        }
      });

      const lastRow = 3 + topVisitors.length;
      for (let i = 3; i <= lastRow; i++) {
        ['A', 'B', 'C', 'D', 'E', 'F'].forEach(col => {
          visitorsSheet.getCell(`${col}${i}`).border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' },
          };
        });
      }

      visitorsSheet.getColumn('A').width = 10;
      visitorsSheet.getColumn('B').width = 20;
      visitorsSheet.getColumn('C').width = 20;
      visitorsSheet.getColumn('D').width = 25;
      visitorsSheet.getColumn('E').width = 30;
      visitorsSheet.getColumn('F').width = 10;

      // ✅ Gráfico de barras: Top 10 visitantes
      const top10 = topVisitors.slice(0, 10);
      const chartBuffer = renderBarChart({
        labels: top10.map(e => `${e.visitor?.firstName || ''} ${e.visitor?.lastName || ''}`.trim()),
        values: top10.map(e => parseInt(e.get('visitCount'))),
        title: 'Top 10 Visitantes Frecuentes',
        color: '#52C41A',
        width: 900,
        height: 420,
      });

      visitorsSheet.getColumn('H').width = 15;
      await insertChartImage(workbook, visitorsSheet, chartBuffer, 'H1', 11, 22);
    }

    // ==================== HOJA 4: POR DEPARTAMENTO ====================
    if (includeDepartments) {
      const deptSheet = workbook.addWorksheet('Por Departamento');

      const byDepartment = await Entry.findAll({
        attributes: [
          'department_id',
          [sequelize.fn('COUNT', sequelize.col('Entry.id')), 'count'],
        ],
        include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }],
        where: { ...whereClause, department_id: { [Op.ne]: null } },
        group: ['Entry.department_id', 'department.id', 'department.name'],
        order: [[sequelize.fn('COUNT', sequelize.col('Entry.id')), 'DESC']],
        raw: false,
      });

      deptSheet.mergeCells('A1:D1');
      deptSheet.getCell('A1').value = 'VISITAS POR DEPARTAMENTO';
      deptSheet.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      deptSheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF722ED1' } };
      deptSheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
      deptSheet.getRow(1).height = 25;

      ['Departamento', 'Cantidad', 'Porcentaje', 'Barra'].forEach((h, i) => {
        const col = ['A', 'B', 'C', 'D'][i];
        deptSheet.getCell(`${col}3`).value = h;
      });
      deptSheet.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      deptSheet.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

      const totalDept = byDepartment.reduce((sum, d) => sum + parseInt(d.getDataValue('count')), 0);

      byDepartment.forEach((entry, index) => {
        const rowNum = 4 + index;
        const count = parseInt(entry.getDataValue('count'));
        const percentage = (count / totalDept) * 100;
        deptSheet.getCell(`A${rowNum}`).value = entry.department?.name || 'Sin departamento';
        deptSheet.getCell(`B${rowNum}`).value = count;
        deptSheet.getCell(`C${rowNum}`).value = percentage / 100;
        deptSheet.getCell(`C${rowNum}`).numFmt = '0.0%';
        deptSheet.getCell(`D${rowNum}`).value = '█'.repeat(Math.round((percentage / 100) * 20));
        if (index % 2 === 1) {
          deptSheet.getRow(rowNum).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
        }
      });

      const totalRow = 4 + byDepartment.length;
      deptSheet.getCell(`A${totalRow}`).value = 'TOTAL';
      deptSheet.getCell(`A${totalRow}`).font = { bold: true };
      deptSheet.getCell(`B${totalRow}`).value = totalDept;
      deptSheet.getCell(`B${totalRow}`).font = { bold: true };
      deptSheet.getCell(`C${totalRow}`).value = 1;
      deptSheet.getCell(`C${totalRow}`).numFmt = '0.0%';
      deptSheet.getRow(totalRow).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE699' } };

      for (let i = 3; i <= totalRow; i++) {
        ['A', 'B', 'C', 'D'].forEach(col => {
          deptSheet.getCell(`${col}${i}`).border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' },
          };
        });
      }

      deptSheet.getColumn('A').width = 30;
      deptSheet.getColumn('B').width = 15;
      deptSheet.getColumn('C').width = 15;
      deptSheet.getColumn('D').width = 30;

      // ✅ Gráfico de pastel
      const chartBuffer = renderPieChart({
        labels: byDepartment.map(e => e.department?.name || 'Sin departamento'),
        values: byDepartment.map(e => parseInt(e.getDataValue('count'))),
        title: 'Visitas por Departamento',
        width: 700,
        height: 450,
      });

      deptSheet.getColumn('F').width = 15;
      await insertChartImage(workbook, deptSheet, chartBuffer, 'F1', 10, 25);
    }

    // ==================== HOJA 5: POR MOTIVO ====================
    if (includePurposes) {
      const purposeSheet = workbook.addWorksheet('Por Motivo');

      const byPurpose = await Entry.findAll({
        attributes: [
          'purpose_id',
          [sequelize.fn('COUNT', sequelize.col('Entry.id')), 'count'],
        ],
        include: [{ model: VisitPurpose, as: 'purpose', attributes: ['id', 'name'] }],
        where: { ...whereClause, purpose_id: { [Op.ne]: null } },
        group: ['Entry.purpose_id', 'purpose.id', 'purpose.name'],
        order: [[sequelize.fn('COUNT', sequelize.col('Entry.id')), 'DESC']],
        limit: 15,
        raw: false,
      });

      purposeSheet.mergeCells('A1:C1');
      purposeSheet.getCell('A1').value = 'MOTIVOS DE VISITA';
      purposeSheet.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      purposeSheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFA8C16' } };
      purposeSheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
      purposeSheet.getRow(1).height = 25;

      ['Motivo', 'Cantidad', 'Porcentaje'].forEach((h, i) => {
        const col = ['A', 'B', 'C'][i];
        purposeSheet.getCell(`${col}3`).value = h;
      });
      purposeSheet.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      purposeSheet.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

      const totalPurpose = byPurpose.reduce((sum, p) => sum + parseInt(p.getDataValue('count')), 0);

      byPurpose.forEach((entry, index) => {
        const rowNum = 4 + index;
        const count = parseInt(entry.getDataValue('count'));
        purposeSheet.getCell(`A${rowNum}`).value = entry.purpose?.name || 'Sin motivo';
        purposeSheet.getCell(`B${rowNum}`).value = count;
        purposeSheet.getCell(`C${rowNum}`).value = (count / totalPurpose);
        purposeSheet.getCell(`C${rowNum}`).numFmt = '0.0%';
        if (index % 2 === 1) {
          purposeSheet.getRow(rowNum).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
        }
      });

      const lastRow = 3 + byPurpose.length;
      for (let i = 3; i <= lastRow; i++) {
        ['A', 'B', 'C'].forEach(col => {
          purposeSheet.getCell(`${col}${i}`).border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' },
          };
        });
      }

      purposeSheet.getColumn('A').width = 40;
      purposeSheet.getColumn('B').width = 15;
      purposeSheet.getColumn('C').width = 15;

      // ✅ Gráfico de barras horizontales (barras normales con labels de motivo)
      const chartBuffer = renderBarChart({
        labels: byPurpose.map(e => e.purpose?.name || 'Sin motivo'),
        values: byPurpose.map(e => parseInt(e.getDataValue('count'))),
        title: 'Motivos de Visita',
        color: '#FA8C16',
        width: 900,
        height: 420,
      });

      purposeSheet.getColumn('E').width = 15;
      await insertChartImage(workbook, purposeSheet, chartBuffer, 'E1', 11, 24);
    }

    // ==================== HOJA 6: HORAS PICO ====================
    if (includePeakHours) {
  const hoursSheet = workbook.addWorksheet('Horas Pico');

  const peakHours = await Entry.findAll({
    where: whereClause,
    attributes: [
      [
        sequelize.fn(
          'EXTRACT',
          sequelize.literal(`HOUR FROM ("checkInTime" AT TIME ZONE 'America/Bogota')`)
        ),
        'hour',
      ],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
    ],
    group: [
      sequelize.literal(`EXTRACT(HOUR FROM ("checkInTime" AT TIME ZONE 'America/Bogota'))`),
    ],
    order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
    raw: true,
  });

  hoursSheet.mergeCells('A1:C1');
  hoursSheet.getCell('A1').value = 'HORAS PICO DE ENTRADA';
  hoursSheet.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  hoursSheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF13C2C2' } };
  hoursSheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  hoursSheet.getRow(1).height = 25;

  ['Hora', 'Rango', 'Cantidad'].forEach((h, i) => {
    const col = ['A', 'B', 'C'][i];
    const cell = hoursSheet.getCell(`${col}2`);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' },
    };
  });
  hoursSheet.getRow(2).height = 20;

  const sortedHours = peakHours.sort((a, b) => a.hour - b.hour);
  const maxCount = Math.max(...sortedHours.map(h => parseInt(h.count)), 1);

  sortedHours.forEach((hour, index) => {
    const rowNum = 3 + index;
    const count = parseInt(hour.count);
    const h = parseInt(hour.hour);

    const cellA = hoursSheet.getCell(`A${rowNum}`);
    const cellB = hoursSheet.getCell(`B${rowNum}`);
    const cellC = hoursSheet.getCell(`C${rowNum}`);

    cellA.value = `${String(h).padStart(2, '0')}:00`;
    cellB.value = `${String(h).padStart(2, '0')}:00 - ${String(h + 1).padStart(2, '0')}:00`;
    cellC.value = count;

    let fillColor = null;
    let isBold = false;

    if (count === maxCount) {
      fillColor = 'FFFFE699';
      isBold = true;
    } else if (index % 2 === 1) {
      fillColor = 'FFF0F0F0';
    }

    [cellA, cellB, cellC].forEach(cell => {
      if (fillColor) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
      }
      if (isBold) {
        cell.font = { bold: true };
      }
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' },
      };
    });
  });

  hoursSheet.getColumn('A').width = 12;
  hoursSheet.getColumn('B').width = 22;
  hoursSheet.getColumn('C').width = 15;

  const chartBuffer = renderBarChart({
    labels: sortedHours.map(h => `${String(parseInt(h.hour)).padStart(2, '0')}:00`),
    values: sortedHours.map(h => parseInt(h.count)),
    title: 'Distribución de Entradas por Hora',
    color: '#13C2C2',
    width: 900,
    height: 420,
  });

  hoursSheet.getColumn('E').width = 15;
  await insertChartImage(workbook, hoursSheet, chartBuffer, 'E1', 11, 24);
}
    // ==================== HOJA 7: TENDENCIA MENSUAL ====================
    if (includeMonthly) {
      const monthlySheet = workbook.addWorksheet('Tendencia Mensual');

      const monthsAgo = new Date();
      monthsAgo.setMonth(monthsAgo.getMonth() - 6);

      const monthlyData = await Entry.findAll({
        where: { checkInTime: { [Op.gte]: monthsAgo } },
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('checkInTime')), 'month'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('checkInTime'))],
        order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('checkInTime')), 'ASC']],
        raw: true,
      });

      monthlySheet.mergeCells('A1:C1');
      monthlySheet.getCell('A1').value = 'TENDENCIA MENSUAL';
      monthlySheet.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      monthlySheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9254DE' } };
      monthlySheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
      monthlySheet.getRow(1).height = 25;

      ['Mes', 'Entradas', 'Variación vs. Anterior'].forEach((h, i) => {
        const col = ['A', 'B', 'C'][i];
        monthlySheet.getCell(`${col}3`).value = h;
      });
      monthlySheet.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      monthlySheet.getRow(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      let previousCount = null;

      monthlyData.forEach((month, index) => {
        const rowNum = 4 + index;
        const count = parseInt(month.count);
        const date = new Date(month.month);
        monthlySheet.getCell(`A${rowNum}`).value = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        monthlySheet.getCell(`B${rowNum}`).value = count;

        if (previousCount !== null) {
          const variation = ((count - previousCount) / previousCount) * 100;
          monthlySheet.getCell(`C${rowNum}`).value = variation / 100;
          monthlySheet.getCell(`C${rowNum}`).numFmt = '0.0%';
          monthlySheet.getCell(`C${rowNum}`).font = {
            color: { argb: variation > 0 ? 'FF52C41A' : 'FFFF4D4F' },
          };
        } else {
          monthlySheet.getCell(`C${rowNum}`).value = '-';
        }

        previousCount = count;
        if (index % 2 === 1) {
          monthlySheet.getRow(rowNum).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
        }
      });

      const lastRow = 3 + monthlyData.length;
      for (let i = 3; i <= lastRow; i++) {
        ['A', 'B', 'C'].forEach(col => {
          monthlySheet.getCell(`${col}${i}`).border = {
            top: { style: 'thin' }, left: { style: 'thin' },
            bottom: { style: 'thin' }, right: { style: 'thin' },
          };
        });
      }

      monthlySheet.getColumn('A').width = 25;
      monthlySheet.getColumn('B').width = 20;
      monthlySheet.getColumn('C').width = 25;

      // ✅ Gráfico de líneas mensual
      const chartBuffer = renderLineChart({
        labels: monthlyData.map(m => {
          const d = new Date(m.month);
          return `${monthNames[d.getMonth()].substring(0, 3)} ${d.getFullYear()}`;
        }),
        values: monthlyData.map(m => parseInt(m.count)),
        title: 'Tendencia Mensual de Entradas',
        color: '#9254DE',
        width: 900,
        height: 420,
      });

      monthlySheet.getColumn('E').width = 15;
      await insertChartImage(workbook, monthlySheet, chartBuffer, 'E1', 11, 24);
    }

    // Enviar respuesta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=dashboard_${new Date().toISOString().split('T')[0]}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al exportar dashboard a Excel:', error);
    res.status(500).json({
      message: 'Error al generar el archivo Excel del dashboard',
      error: error.message,
    });
  }
};