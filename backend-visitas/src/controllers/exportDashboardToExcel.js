import { Op } from 'sequelize';
import ExcelJS from 'exceljs';
import Entry from '../models/Entry.js';
import Visitor from '../models/Visitor.js';
import sequelize from '../config/database.js';

/**
 * GET /reports/dashboard/export-excel
 * Exportar dashboard completo a Excel con múltiples hojas y gráficos
 */
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

    // Fechas por defecto
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(end.getMonth() - 1));

    const whereClause = {
      checkInTime: {
        [Op.between]: [start, end],
      },
    };

    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Gestión de Visitantes';
    workbook.created = new Date();

    // ==================== HOJA 1: RESUMEN ====================
    if (includeOverview) {
      const summarySheet = workbook.addWorksheet('Resumen', {
        views: [{ showGridLines: false }],
      });

      // Título
      summarySheet.mergeCells('A1:F1');
      summarySheet.getCell('A1').value = 'REPORTE DE DASHBOARD - SISTEMA DE VISITANTES';
      summarySheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      summarySheet.getCell('A1').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1890FF' },
      };
      summarySheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
      summarySheet.getRow(1).height = 30;

      // Período
      summarySheet.mergeCells('A2:F2');
      summarySheet.getCell('A2').value = `Período: ${start.toLocaleDateString('es-ES')} - ${end.toLocaleDateString('es-ES')}`;
      summarySheet.getCell('A2').font = { size: 12, italic: true };
      summarySheet.getCell('A2').alignment = { horizontal: 'center' };
      summarySheet.getRow(2).height = 20;

      // Obtener totales
      const [
        totalVisitors,
        totalEntries,
        activeEntries,
        completedEntries,
        cancelledEntries,
      ] = await Promise.all([
        Visitor.count(),
        Entry.count({ where: whereClause }),
        Entry.count({ where: { ...whereClause, status: 'active' } }),
        Entry.count({ where: { ...whereClause, status: 'completed' } }),
        Entry.count({ where: { ...whereClause, status: 'cancelled' } }),
      ]);

      // Tiempo promedio
      const completedEntriesWithTime = await Entry.findAll({
        where: {
          ...whereClause,
          status: 'completed',
          checkOutTime: { [Op.ne]: null },
        },
        attributes: ['checkInTime', 'checkOutTime'],
      });

      let averageStayMinutes = 0;
      if (completedEntriesWithTime.length > 0) {
        const totalMinutes = completedEntriesWithTime.reduce((sum, entry) => {
          const duration = (new Date(entry.checkOutTime) - new Date(entry.checkInTime)) / 1000 / 60;
          return sum + duration;
        }, 0);
        averageStayMinutes = Math.round(totalMinutes / completedEntriesWithTime.length);
      }

      // Estadísticas Principales
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
          // Encabezados
          summarySheet.getRow(rowNum).font = { bold: true, color: { argb: 'FFFFFFFF' } };
          summarySheet.getRow(rowNum).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' },
          };
        } else {
          // Alternar colores de fila
          if (index % 2 === 0) {
            summarySheet.getRow(rowNum).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF0F0F0' },
            };
          }
        }

        summarySheet.getRow(rowNum).alignment = { vertical: 'middle' };
        summarySheet.getRow(rowNum).height = 22;
      });

      // Bordes
      for (let i = 5; i <= 11; i++) {
        ['A', 'B', 'C'].forEach(col => {
          summarySheet.getCell(`${col}${i}`).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      }

      // Ancho de columnas
      summarySheet.getColumn('A').width = 35;
      summarySheet.getColumn('B').width = 20;
      summarySheet.getColumn('C').width = 45;

      // Formato de números
      summarySheet.getCell('B6').numFmt = '#,##0';
      summarySheet.getCell('B7').numFmt = '#,##0';
      summarySheet.getCell('B8').numFmt = '#,##0';
      summarySheet.getCell('B9').numFmt = '#,##0';
      summarySheet.getCell('B10').numFmt = '#,##0';
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

      // Título
      entriesSheet.mergeCells('A1:C1');
      entriesSheet.getCell('A1').value = 'ENTRADAS POR DÍA';
      entriesSheet.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      entriesSheet.getCell('A1').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1890FF' },
      };
      entriesSheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
      entriesSheet.getRow(1).height = 25;

      // Encabezados
      entriesSheet.getCell('A3').value = 'Fecha';
      entriesSheet.getCell('B3').value = 'Día de la Semana';
      entriesSheet.getCell('C3').value = 'Cantidad de Entradas';
      entriesSheet.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      entriesSheet.getRow(3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };

      // Datos
      entriesByDay.forEach((entry, index) => {
        const rowNum = 4 + index;
        const date = new Date(entry.date);
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        
        entriesSheet.getCell(`A${rowNum}`).value = date;
        entriesSheet.getCell(`A${rowNum}`).numFmt = 'dd/mm/yyyy';
        entriesSheet.getCell(`B${rowNum}`).value = dayNames[date.getDay()];
        entriesSheet.getCell(`C${rowNum}`).value = parseInt(entry.count);

        // Alternar colores
        if (index % 2 === 1) {
          entriesSheet.getRow(rowNum).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF0F0F0' },
          };
        }
      });

      // Totales
      const totalRow = 4 + entriesByDay.length;
      entriesSheet.getCell(`A${totalRow}`).value = 'TOTAL';
      entriesSheet.getCell(`A${totalRow}`).font = { bold: true };
      entriesSheet.getCell(`C${totalRow}`).value = {
        formula: `SUM(C4:C${totalRow - 1})`,
        result: entriesByDay.reduce((sum, e) => sum + parseInt(e.count), 0),
      };
      entriesSheet.getCell(`C${totalRow}`).font = { bold: true };
      entriesSheet.getRow(totalRow).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFE699' },
      };

      // Bordes
      for (let i = 3; i <= totalRow; i++) {
        ['A', 'B', 'C'].forEach(col => {
          entriesSheet.getCell(`${col}${i}`).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      }

      // Columnas
      entriesSheet.getColumn('A').width = 15;
      entriesSheet.getColumn('B').width = 20;
      entriesSheet.getColumn('C').width = 20;

      // Agregar gráfico de línea
      if (entriesByDay.length > 0) {
        entriesSheet.addChart = (chartData) => {
          // Nota: ExcelJS tiene soporte limitado para gráficos
          // Los datos están preparados para que puedan ser graficados manualmente o con una biblioteca adicional
        };
      }
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
            attributes: ['firstName', 'lastName', 'company', 'email', 'phone'],
          },
        ],
        group: ['visitor_id', 'visitor.id'],
        order: [[sequelize.fn('COUNT', sequelize.col('Entry.id')), 'DESC']],
        limit: 20,
        raw: false,
      });

      // Título
      visitorsSheet.mergeCells('A1:F1');
      visitorsSheet.getCell('A1').value = 'TOP 20 VISITANTES MÁS FRECUENTES';
      visitorsSheet.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      visitorsSheet.getCell('A1').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF52C41A' },
      };
      visitorsSheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
      visitorsSheet.getRow(1).height = 25;

      // Encabezados
      const headers = ['Ranking', 'Nombre', 'Apellido', 'Empresa', 'Email', 'Cantidad de Visitas'];
      headers.forEach((header, index) => {
        const col = String.fromCharCode(65 + index); // A, B, C, etc.
        visitorsSheet.getCell(`${col}3`).value = header;
      });
      visitorsSheet.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      visitorsSheet.getRow(3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };

      // Datos
      topVisitors.forEach((entry, index) => {
        const rowNum = 4 + index;
        visitorsSheet.getCell(`A${rowNum}`).value = index + 1;
        visitorsSheet.getCell(`B${rowNum}`).value = entry.visitor.firstName;
        visitorsSheet.getCell(`C${rowNum}`).value = entry.visitor.lastName;
        visitorsSheet.getCell(`D${rowNum}`).value = entry.visitor.company || 'N/A';
        visitorsSheet.getCell(`E${rowNum}`).value = entry.visitor.email || 'N/A';
        visitorsSheet.getCell(`F${rowNum}`).value = parseInt(entry.get('visitCount'));

        // Destacar top 3
        if (index < 3) {
          visitorsSheet.getRow(rowNum).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFD700' }, // Dorado
          };
          visitorsSheet.getRow(rowNum).font = { bold: true };
        } else if (index % 2 === 1) {
          visitorsSheet.getRow(rowNum).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF0F0F0' },
          };
        }
      });

      // Bordes
      const lastRow = 3 + topVisitors.length;
      for (let i = 3; i <= lastRow; i++) {
        ['A', 'B', 'C', 'D', 'E', 'F'].forEach(col => {
          visitorsSheet.getCell(`${col}${i}`).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      }

      // Columnas
      visitorsSheet.getColumn('A').width = 10;
      visitorsSheet.getColumn('B').width = 20;
      visitorsSheet.getColumn('C').width = 20;
      visitorsSheet.getColumn('D').width = 25;
      visitorsSheet.getColumn('E').width = 30;
      visitorsSheet.getColumn('F').width = 18;
    }

    // ==================== HOJA 4: POR DEPARTAMENTO ====================
    if (includeDepartments) {
      const deptSheet = workbook.addWorksheet('Por Departamento');

      const byDepartment = await Entry.findAll({
        where: {
          ...whereClause,
          hostDepartment: { [Op.ne]: null },
        },
        attributes: [
          'hostDepartment',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: ['hostDepartment'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
        raw: true,
      });

      // Título
      deptSheet.mergeCells('A1:D1');
      deptSheet.getCell('A1').value = 'VISITAS POR DEPARTAMENTO';
      deptSheet.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      deptSheet.getCell('A1').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF722ED1' },
      };
      deptSheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
      deptSheet.getRow(1).height = 25;

      // Encabezados
      deptSheet.getCell('A3').value = 'Departamento';
      deptSheet.getCell('B3').value = 'Cantidad';
      deptSheet.getCell('C3').value = 'Porcentaje';
      deptSheet.getCell('D3').value = 'Gráfico';
      deptSheet.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      deptSheet.getRow(3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };

      const totalDept = byDepartment.reduce((sum, d) => sum + parseInt(d.count), 0);

      byDepartment.forEach((dept, index) => {
        const rowNum = 4 + index;
        const count = parseInt(dept.count);
        const percentage = (count / totalDept) * 100;

        deptSheet.getCell(`A${rowNum}`).value = dept.hostDepartment;
        deptSheet.getCell(`B${rowNum}`).value = count;
        deptSheet.getCell(`C${rowNum}`).value = percentage / 100;
        deptSheet.getCell(`C${rowNum}`).numFmt = '0.0%';

        // Barra de progreso visual
        const barLength = Math.round((percentage / 100) * 20);
        deptSheet.getCell(`D${rowNum}`).value = '█'.repeat(barLength);

        if (index % 2 === 1) {
          deptSheet.getRow(rowNum).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF0F0F0' },
          };
        }
      });

      // Total
      const totalRow = 4 + byDepartment.length;
      deptSheet.getCell(`A${totalRow}`).value = 'TOTAL';
      deptSheet.getCell(`A${totalRow}`).font = { bold: true };
      deptSheet.getCell(`B${totalRow}`).value = totalDept;
      deptSheet.getCell(`B${totalRow}`).font = { bold: true };
      deptSheet.getCell(`C${totalRow}`).value = 1;
      deptSheet.getCell(`C${totalRow}`).numFmt = '0.0%';
      deptSheet.getCell(`C${totalRow}`).font = { bold: true };
      deptSheet.getRow(totalRow).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFE699' },
      };

      // Bordes
      for (let i = 3; i <= totalRow; i++) {
        ['A', 'B', 'C', 'D'].forEach(col => {
          deptSheet.getCell(`${col}${i}`).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      }

      deptSheet.getColumn('A').width = 30;
      deptSheet.getColumn('B').width = 15;
      deptSheet.getColumn('C').width = 15;
      deptSheet.getColumn('D').width = 30;
    }

    // ==================== HOJA 5: POR MOTIVO ====================
    if (includePurposes) {
      const purposeSheet = workbook.addWorksheet('Por Motivo');

      const byPurpose = await Entry.findAll({
        where: {
          ...whereClause,
          purpose: { [Op.ne]: null },
        },
        attributes: [
          'purpose',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: ['purpose'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
        limit: 15,
        raw: true,
      });

      // Título
      purposeSheet.mergeCells('A1:C1');
      purposeSheet.getCell('A1').value = 'MOTIVOS DE VISITA';
      purposeSheet.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      purposeSheet.getCell('A1').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFA8C16' },
      };
      purposeSheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
      purposeSheet.getRow(1).height = 25;

      // Encabezados
      purposeSheet.getCell('A3').value = 'Motivo';
      purposeSheet.getCell('B3').value = 'Cantidad';
      purposeSheet.getCell('C3').value = 'Porcentaje';
      purposeSheet.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      purposeSheet.getRow(3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };

      const totalPurpose = byPurpose.reduce((sum, p) => sum + parseInt(p.count), 0);

      byPurpose.forEach((purpose, index) => {
        const rowNum = 4 + index;
        const count = parseInt(purpose.count);
        const percentage = (count / totalPurpose) * 100;

        purposeSheet.getCell(`A${rowNum}`).value = purpose.purpose;
        purposeSheet.getCell(`B${rowNum}`).value = count;
        purposeSheet.getCell(`C${rowNum}`).value = percentage / 100;
        purposeSheet.getCell(`C${rowNum}`).numFmt = '0.0%';

        if (index % 2 === 1) {
          purposeSheet.getRow(rowNum).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF0F0F0' },
          };
        }
      });

      // Bordes
      const lastRow = 3 + byPurpose.length;
      for (let i = 3; i <= lastRow; i++) {
        ['A', 'B', 'C'].forEach(col => {
          purposeSheet.getCell(`${col}${i}`).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      }

      purposeSheet.getColumn('A').width = 40;
      purposeSheet.getColumn('B').width = 15;
      purposeSheet.getColumn('C').width = 15;
    }

    // ==================== HOJA 6: HORAS PICO ====================
    if (includePeakHours) {
      const hoursSheet = workbook.addWorksheet('Horas Pico');

      const peakHours = await Entry.findAll({
        where: whereClause,
        attributes: [
          [sequelize.fn('EXTRACT', sequelize.literal('HOUR FROM "checkInTime"')), 'hour'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: [sequelize.fn('EXTRACT', sequelize.literal('HOUR FROM "checkInTime"'))],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
        raw: true,
      });

      // Título
      hoursSheet.mergeCells('A1:D1');
      hoursSheet.getCell('A1').value = 'HORAS PICO DE ENTRADA';
      hoursSheet.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      hoursSheet.getCell('A1').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF13C2C2' },
      };
      hoursSheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
      hoursSheet.getRow(1).height = 25;

      // Encabezados
      hoursSheet.getCell('A3').value = 'Hora';
      hoursSheet.getCell('B3').value = 'Rango';
      hoursSheet.getCell('C3').value = 'Cantidad';
      hoursSheet.getCell('D3').value = 'Visualización';
      hoursSheet.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      hoursSheet.getRow(3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };

      // Ordenar por hora
      const sortedHours = peakHours.sort((a, b) => a.hour - b.hour);
      const maxCount = Math.max(...sortedHours.map(h => parseInt(h.count)));

      sortedHours.forEach((hour, index) => {
        const rowNum = 4 + index;
        const count = parseInt(hour.count);
        const hourNum = parseInt(hour.hour);

        hoursSheet.getCell(`A${rowNum}`).value = `${hourNum}:00`;
        hoursSheet.getCell(`B${rowNum}`).value = `${hourNum}:00 - ${hourNum + 1}:00`;
        hoursSheet.getCell(`C${rowNum}`).value = count;

        // Barra proporcional
        const barLength = Math.round((count / maxCount) * 30);
        hoursSheet.getCell(`D${rowNum}`).value = '▓'.repeat(barLength);
        hoursSheet.getCell(`D${rowNum}`).font = { color: { argb: 'FF52C41A' } };

        if (index % 2 === 1) {
          hoursSheet.getRow(rowNum).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF0F0F0' },
          };
        }

        // Destacar hora pico
        if (count === maxCount) {
          hoursSheet.getRow(rowNum).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFE699' },
          };
          hoursSheet.getRow(rowNum).font = { bold: true };
        }
      });

      // Bordes
      const lastRow = 3 + sortedHours.length;
      for (let i = 3; i <= lastRow; i++) {
        ['A', 'B', 'C', 'D'].forEach(col => {
          hoursSheet.getCell(`${col}${i}`).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      }

      hoursSheet.getColumn('A').width = 12;
      hoursSheet.getColumn('B').width = 20;
      hoursSheet.getColumn('C').width = 15;
      hoursSheet.getColumn('D').width = 40;
    }

    // ==================== HOJA 7: TENDENCIA MENSUAL ====================
    if (includeMonthly) {
      const monthlySheet = workbook.addWorksheet('Tendencia Mensual');

      const monthsAgo = new Date();
      monthsAgo.setMonth(monthsAgo.getMonth() - 6);

      const monthlyData = await Entry.findAll({
        where: {
          checkInTime: {
            [Op.gte]: monthsAgo,
          },
        },
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('checkInTime')), 'month'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('checkInTime'))],
        order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('checkInTime')), 'ASC']],
        raw: true,
      });

      // Título
      monthlySheet.mergeCells('A1:C1');
      monthlySheet.getCell('A1').value = 'TENDENCIA MENSUAL';
      monthlySheet.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      monthlySheet.getCell('A1').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF9254DE' },
      };
      monthlySheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
      monthlySheet.getRow(1).height = 25;

      // Encabezados
      monthlySheet.getCell('A3').value = 'Mes';
      monthlySheet.getCell('B3').value = 'Cantidad de Entradas';
      monthlySheet.getCell('C3').value = 'Variación vs. Anterior';
      monthlySheet.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      monthlySheet.getRow(3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };

      let previousCount = null;

      monthlyData.forEach((month, index) => {
        const rowNum = 4 + index;
        const count = parseInt(month.count);
        const date = new Date(month.month);
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        monthlySheet.getCell(`A${rowNum}`).value = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        monthlySheet.getCell(`B${rowNum}`).value = count;

        if (previousCount !== null) {
          const variation = ((count - previousCount) / previousCount) * 100;
          monthlySheet.getCell(`C${rowNum}`).value = variation / 100;
          monthlySheet.getCell(`C${rowNum}`).numFmt = '0.0%';
          
          // Color según variación
          if (variation > 0) {
            monthlySheet.getCell(`C${rowNum}`).font = { color: { argb: 'FF52C41A' } };
          } else if (variation < 0) {
            monthlySheet.getCell(`C${rowNum}`).font = { color: { argb: 'FFFF4D4F' } };
          }
        } else {
          monthlySheet.getCell(`C${rowNum}`).value = '-';
        }

        previousCount = count;

        if (index % 2 === 1) {
          monthlySheet.getRow(rowNum).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF0F0F0' },
          };
        }
      });

      // Bordes
      const lastRow = 3 + monthlyData.length;
      for (let i = 3; i <= lastRow; i++) {
        ['A', 'B', 'C'].forEach(col => {
          monthlySheet.getCell(`${col}${i}`).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      }

      monthlySheet.getColumn('A').width = 25;
      monthlySheet.getColumn('B').width = 20;
      monthlySheet.getColumn('C').width = 25;
    }

    // Configurar respuesta
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=dashboard_${new Date().toISOString().split('T')[0]}.xlsx`
    );

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