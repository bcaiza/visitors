import { Op } from 'sequelize';
import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';
import Entry from '../models/Entry.js';
import Visitor from '../models/Visitor.js';
import Department from '../models/Department.js';
import VisitPurpose from '../models/VisitPurpose.js';
import sequelize from '../config/database.js';

// ==================== HELPER DE FECHAS ====================

/**
 * Convierte un string de fecha a rango completo del día en hora local
 * startDate -> 2026-02-16T00:00:00.000 (inicio del día)
 * endDate   -> 2026-02-16T23:59:59.999 (fin del día)
 */
const parseDateRange = (startDate, endDate) => {
  const start = new Date(`${startDate}T00:00:00.000`);
  const end = new Date(`${endDate}T23:59:59.999`);
  return { start, end };
};

// ==================== EXPORTACIÓN A EXCEL ====================

/**
 * GET /reports/visitors/excel
 * Exportar lista de visitantes a Excel
 */
export const exportVisitorsToExcel = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const whereClause = {};

    if (startDate && endDate) {
      const { start, end } = parseDateRange(startDate, endDate);
      whereClause.createdAt = {
        [Op.between]: [start, end],
      };
    }

    const visitors = await Visitor.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });

    console.log('Visitantes a exportar:', visitors.length);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Visitantes');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Nombre', key: 'firstName', width: 20 },
      { header: 'Apellido', key: 'lastName', width: 20 },
      { header: 'Tipo ID', key: 'idType', width: 15 },
      { header: 'Número ID', key: 'idNumber', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Teléfono', key: 'phone', width: 15 },
      { header: 'Empresa', key: 'company', width: 25 },
      { header: 'Dirección', key: 'address', width: 35 },
      { header: 'Notas', key: 'notes', width: 40 },
      { header: 'Fecha Registro', key: 'createdAt', width: 20 },
    ];

    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };

    visitors.forEach((visitor) => {
      worksheet.addRow({
        id: visitor.id,
        firstName: visitor.firstName,
        lastName: visitor.lastName,
        idType: visitor.idType,
        idNumber: visitor.idNumber,
        email: visitor.email || 'N/A',
        phone: visitor.phone || 'N/A',
        company: visitor.company || 'N/A',
        address: visitor.address || 'N/A',
        notes: visitor.notes || 'N/A',
        createdAt: new Date(visitor.createdAt).toLocaleString('es-ES'),
      });
    });

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=visitantes_${new Date().toISOString().split('T')[0]}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al exportar visitantes a Excel:', error);
    res.status(500).json({
      message: 'Error al generar el archivo Excel',
      error: error.message,
    });
  }
};

/**
 * GET /reports/entries/excel
 * Exportar registro de entradas a Excel
 */
export const exportEntriesToExcel = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const whereClause = {};

    if (startDate && endDate) {
      const { start, end } = parseDateRange(startDate, endDate);
      whereClause.checkInTime = {
        [Op.between]: [start, end],
      };
    }

    if (status) {
      whereClause.status = status;
    }

    console.log('Criterios de filtrado:', whereClause);

    const entries = await Entry.findAll({
      where: whereClause,
      include: [
        {
          model: Visitor,
          as: 'visitor',
          attributes: ['firstName', 'lastName', 'idNumber', 'company'],
          required: false,
        },
        {
          model: Department,
          as: 'department',
          attributes: ['name'],
          required: false,
        },
        {
          model: VisitPurpose,
          as: 'purpose',
          attributes: ['name'],
          required: false,
        },
      ],
      order: [['checkInTime', 'DESC']],
    });

    console.log('Entradas a exportar:', entries.length);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Entradas y Salidas');

    worksheet.columns = [
      { header: 'Fecha Entrada', key: 'checkInTime', width: 20 },
      { header: 'Fecha Salida', key: 'checkOutTime', width: 20 },
      { header: 'Visitante', key: 'visitorName', width: 30 },
      { header: 'Cédula', key: 'idNumber', width: 15 },
      { header: 'Empresa', key: 'company', width: 25 },
      { header: 'Motivo', key: 'purpose', width: 30 },
      { header: 'Anfitrión', key: 'hostName', width: 25 },
      { header: 'Departamento', key: 'department', width: 20 },
      { header: 'Gafete', key: 'badge', width: 12 },
      { header: 'Vehículo', key: 'vehiclePlate', width: 15 },
      { header: 'Temperatura', key: 'temperature', width: 12 },
      { header: 'Estado', key: 'status', width: 12 },
      { header: 'Duración (min)', key: 'duration', width: 15 },
      { header: 'Registrado por', key: 'checkedInBy', width: 20 },
      { header: 'Notas Entrada', key: 'entryNotes', width: 40 },
      { header: 'Notas Salida', key: 'exitNotes', width: 40 },
    ];

    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };

    entries.forEach((entry) => {
      let duration = null;
      if (entry.checkOutTime) {
        const checkIn = new Date(entry.checkInTime);
        const checkOut = new Date(entry.checkOutTime);
        duration = Math.round((checkOut - checkIn) / 1000 / 60);
      }

      worksheet.addRow({
        checkInTime: new Date(entry.checkInTime).toLocaleString('es-ES'),
        checkOutTime: entry.checkOutTime
          ? new Date(entry.checkOutTime).toLocaleString('es-ES')
          : 'N/A',
        visitorName: entry.visitor
          ? `${entry.visitor.firstName} ${entry.visitor.lastName}`
          : 'N/A',
        idNumber: entry.visitor?.idNumber || 'N/A',
        company: entry.visitor?.company || 'N/A',
        purpose: entry.purpose?.name || 'N/A',
        hostName: entry.hostName || 'N/A',
        department: entry.department?.name || 'N/A',
        badge: entry.badge || 'N/A',
        vehiclePlate: entry.vehiclePlate || 'N/A',
        temperature: entry.temperature || 'N/A',
        status: entry.status,
        duration: duration ?? 'En proceso',
        checkedInBy: entry.checkedInBy || 'N/A',
        entryNotes: entry.entryNotes || 'N/A',
        exitNotes: entry.exitNotes || 'N/A',
      });
    });

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=entradas_${new Date().toISOString().split('T')[0]}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al exportar entradas a Excel:', error);
    res.status(500).json({
      message: 'Error al generar el archivo Excel',
      error: error.message,
    });
  }
};

// ==================== EXPORTACIÓN A CSV ====================

/**
 * GET /reports/visitors/csv
 * Exportar lista de visitantes a CSV
 */
export const exportVisitorsToCSV = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const whereClause = {};

    if (startDate && endDate) {
      const { start, end } = parseDateRange(startDate, endDate);
      whereClause.createdAt = {
        [Op.between]: [start, end],
      };
    }

    const visitors = await Visitor.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });

    const fields = [
      { label: 'ID', value: 'id' },
      { label: 'Nombre', value: 'firstName' },
      { label: 'Apellido', value: 'lastName' },
      { label: 'Tipo ID', value: 'idType' },
      { label: 'Número ID', value: 'idNumber' },
      { label: 'Email', value: 'email' },
      { label: 'Teléfono', value: 'phone' },
      { label: 'Empresa', value: 'company' },
      { label: 'Dirección', value: 'address' },
      { label: 'Notas', value: 'notes' },
      { label: 'Fecha Registro', value: 'createdAt' },
    ];

    const data = visitors.map((v) => ({
      id: v.id,
      firstName: v.firstName,
      lastName: v.lastName,
      idType: v.idType,
      idNumber: v.idNumber,
      email: v.email || '',
      phone: v.phone || '',
      company: v.company || '',
      address: v.address || '',
      notes: v.notes || '',
      createdAt: new Date(v.createdAt).toLocaleString('es-ES'),
    }));

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=visitantes_${new Date().toISOString().split('T')[0]}.csv`
    );

    res.write('\ufeff');
    res.write(csv);
    res.end();
  } catch (error) {
    console.error('Error al exportar visitantes a CSV:', error);
    res.status(500).json({
      message: 'Error al generar el archivo CSV',
      error: error.message,
    });
  }
};

/**
 * GET /reports/entries/csv
 * Exportar registro de entradas a CSV
 */
export const exportEntriesToCSV = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const whereClause = {};

    if (startDate && endDate) {
      const { start, end } = parseDateRange(startDate, endDate);
      whereClause.checkInTime = {
        [Op.between]: [start, end],
      };
    }

    if (status) {
      whereClause.status = status;
    }

    const entries = await Entry.findAll({
      where: whereClause,
      include: [
        {
          model: Visitor,
          as: 'visitor',
          attributes: ['firstName', 'lastName', 'idNumber', 'company'],
          required: false,
        },
        {
          model: Department,
          as: 'department',
          attributes: ['name'],
          required: false,
        },
        {
          model: VisitPurpose,
          as: 'purpose',
          attributes: ['name'],
          required: false,
        },
      ],
      order: [['checkInTime', 'DESC']],
    });

    const fields = [
      { label: 'Fecha Entrada', value: 'checkInTime' },
      { label: 'Fecha Salida', value: 'checkOutTime' },
      { label: 'Visitante', value: 'visitorName' },
      { label: 'Cédula', value: 'idNumber' },
      { label: 'Empresa', value: 'company' },
      { label: 'Motivo', value: 'purpose' },
      { label: 'Anfitrión', value: 'hostName' },
      { label: 'Departamento', value: 'department' },
      { label: 'Gafete', value: 'badge' },
      { label: 'Vehículo', value: 'vehiclePlate' },
      { label: 'Temperatura', value: 'temperature' },
      { label: 'Estado', value: 'status' },
      { label: 'Duración (min)', value: 'duration' },
      { label: 'Registrado por', value: 'checkedInBy' },
      { label: 'Notas Entrada', value: 'entryNotes' },
      { label: 'Notas Salida', value: 'exitNotes' },
    ];

    const data = entries.map((entry) => {
      let duration = '';
      if (entry.checkOutTime) {
        const checkIn = new Date(entry.checkInTime);
        const checkOut = new Date(entry.checkOutTime);
        duration = Math.round((checkOut - checkIn) / 1000 / 60);
      }

      return {
        checkInTime: new Date(entry.checkInTime).toLocaleString('es-ES'),
        checkOutTime: entry.checkOutTime
          ? new Date(entry.checkOutTime).toLocaleString('es-ES')
          : '',
        visitorName: entry.visitor
          ? `${entry.visitor.firstName} ${entry.visitor.lastName}`
          : '',
        idNumber: entry.visitor?.idNumber || '',
        company: entry.visitor?.company || '',
        purpose: entry.purpose?.name || '',
        hostName: entry.hostName || '',
        department: entry.department?.name || '',
        badge: entry.badge || '',
        vehiclePlate: entry.vehiclePlate || '',
        temperature: entry.temperature || '',
        status: entry.status,
        duration: duration,
        checkedInBy: entry.checkedInBy || '',
        entryNotes: entry.entryNotes || '',
        exitNotes: entry.exitNotes || '',
      };
    });

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=entradas_${new Date().toISOString().split('T')[0]}.csv`
    );

    res.write('\ufeff');
    res.write(csv);
    res.end();
  } catch (error) {
    console.error('Error al exportar entradas a CSV:', error);
    res.status(500).json({
      message: 'Error al generar el archivo CSV',
      error: error.message,
    });
  }
};

// ==================== DASHBOARD - ESTADÍSTICAS ====================

/**
 * GET /reports/dashboard/overview
 * Estadísticas generales para el dashboard
 */
export const getDashboardOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let start, end;
    if (startDate && endDate) {
      ({ start, end } = parseDateRange(startDate, endDate));
    } else {
      end = new Date();
      start = new Date();
      start.setMonth(end.getMonth() - 1);
    }

    const whereClause = {
      checkInTime: {
        [Op.between]: [start, end],
      },
    };

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
        const duration =
          (new Date(entry.checkOutTime) - new Date(entry.checkInTime)) /
          1000 /
          60;
        return sum + duration;
      }, 0);
      averageStayMinutes = Math.round(
        totalMinutes / completedEntriesWithTime.length
      );
    }

    res.json({
      period: { startDate: start, endDate: end },
      totals: {
        visitors: totalVisitors,
        entries: totalEntries,
        active: activeEntries,
        completed: completedEntries,
        cancelled: cancelledEntries,
      },
      metrics: {
        averageStayMinutes,
        averageStayFormatted: `${Math.floor(averageStayMinutes / 60)}h ${averageStayMinutes % 60}m`,
      },
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({
      message: 'Error al obtener estadísticas',
      error: error.message,
    });
  }
};

/**
 * GET /reports/dashboard/entries-by-day
 * Entradas por día (para gráfica de línea)
 */
export const getEntriesByDay = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let start, end;
    if (startDate && endDate) {
      ({ start, end } = parseDateRange(startDate, endDate));
    } else {
      end = new Date();
      start = new Date();
      start.setDate(end.getDate() - 30);
    }

    const entries = await Entry.findAll({
      where: {
        checkInTime: {
          [Op.between]: [start, end],
        },
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('checkInTime')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: [sequelize.fn('DATE', sequelize.col('checkInTime'))],
      order: [[sequelize.fn('DATE', sequelize.col('checkInTime')), 'ASC']],
      raw: true,
    });

    res.json({
      data: entries.map((entry) => ({
        date: entry.date,
        count: parseInt(entry.count),
      })),
    });
  } catch (error) {
    console.error('Error al obtener entradas por día:', error);
    res.status(500).json({
      message: 'Error al obtener datos',
      error: error.message,
    });
  }
};

/**
 * GET /reports/dashboard/top-visitors
 * Visitantes más frecuentes
 */
export const getTopVisitors = async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    const whereClause = {};

    if (startDate && endDate) {
      const { start, end } = parseDateRange(startDate, endDate);
      whereClause.checkInTime = {
        [Op.between]: [start, end],
      };
    }

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
          attributes: ['firstName', 'lastName', 'company', 'photoPath'],
        },
      ],
      group: ['visitor_id', 'visitor.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('Entry.id')), 'DESC']],
      limit: parseInt(limit),
      raw: false,
    });

    res.json({
      topVisitors: topVisitors.map((entry) => ({
        visitor: {
          id: entry.visitor.id,
          firstName: entry.visitor.firstName,
          lastName: entry.visitor.lastName,
          company: entry.visitor.company,
          photoPath: entry.visitor.photoPath,
        },
        visitCount: parseInt(entry.get('visitCount')),
      })),
    });
  } catch (error) {
    console.error('Error al obtener visitantes frecuentes:', error);
    res.status(500).json({
      message: 'Error al obtener datos',
      error: error.message,
    });
  }
};

/**
 * GET /reports/dashboard/by-department
 * Visitas por departamento
 */
export const getEntriesByDepartment = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const whereClause = {};

    if (startDate && endDate) {
      const { start, end } = parseDateRange(startDate, endDate);
      whereClause.checkInTime = {
        [Op.between]: [start, end],
      };
    }

    const results = await Entry.findAll({
      attributes: [
        'department_id',
        [sequelize.fn('COUNT', sequelize.col('Entry.id')), 'count'],
      ],
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name'],
        },
      ],
      where: {
        ...whereClause,
        department_id: { [Op.ne]: null },
      },
      group: ['Entry.department_id', 'department.id', 'department.name'],
      order: [[sequelize.fn('COUNT', sequelize.col('Entry.id')), 'DESC']],
      raw: false,
    });

    const formatted = results.map((entry) => ({
      department: entry.department?.name || 'Sin departamento',
      count: parseInt(entry.getDataValue('count')),
    }));

    res.json({ departments: formatted });
  } catch (error) {
    console.error('Error al obtener visitas por departamento:', error);
    res.status(500).json({
      message: 'Error al obtener datos',
      error: error.message,
    });
  }
};

/**
 * GET /reports/dashboard/by-purpose
 * Visitas por motivo
 */
export const getEntriesByPurpose = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    const whereClause = {};

    if (startDate && endDate) {
      const { start, end } = parseDateRange(startDate, endDate);
      whereClause.checkInTime = {
        [Op.between]: [start, end],
      };
    }

    const results = await Entry.findAll({
      attributes: [
        'purpose_id',
        [sequelize.fn('COUNT', sequelize.col('Entry.id')), 'count'],
      ],
      include: [
        {
          model: VisitPurpose,
          as: 'purpose',
          attributes: ['id', 'name'],
        },
      ],
      where: {
        ...whereClause,
        purpose_id: { [Op.ne]: null },
      },
      group: ['Entry.purpose_id', 'purpose.id', 'purpose.name'],
      order: [[sequelize.fn('COUNT', sequelize.col('Entry.id')), 'DESC']],
      limit: parseInt(limit),
      raw: false,
    });

    const formatted = results.map((entry) => ({
      purpose: entry.purpose?.name || 'Sin motivo',
      count: parseInt(entry.getDataValue('count')),
    }));

    res.json({ purposes: formatted });
  } catch (error) {
    console.error('Error al obtener visitas por motivo:', error);
    res.status(500).json({
      message: 'Error al obtener datos',
      error: error.message,
    });
  }
};

/**
 * GET /reports/dashboard/peak-hours
 * Horas pico de entrada
 */
export const getPeakHours = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const whereClause = {};

    if (startDate && endDate) {
      const { start, end } = parseDateRange(startDate, endDate);
      whereClause.checkInTime = {
        [Op.between]: [start, end],
      };
    }

    const peakHours = await Entry.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('EXTRACT', sequelize.literal('HOUR FROM "checkInTime"')), 'hour'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: [sequelize.fn('EXTRACT', sequelize.literal('HOUR FROM "checkInTime"'))],
      order: [[sequelize.fn('EXTRACT', sequelize.literal('HOUR FROM "checkInTime"')), 'ASC']],
      raw: true,
    });

    res.json({
      hours: peakHours.map((h) => ({
        hour: parseInt(h.hour),
        count: parseInt(h.count),
      })),
    });
  } catch (error) {
    console.error('Error al obtener horas pico:', error);
    res.status(500).json({
      message: 'Error al obtener datos',
      error: error.message,
    });
  }
};

/**
 * GET /reports/dashboard/monthly-comparison
 * Comparación mensual
 */
export const getMonthlyComparison = async (req, res) => {
  try {
    const { months = 6 } = req.query;

    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - parseInt(months));

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

    res.json({
      months: monthlyData.map((m) => ({
        month: m.month,
        count: parseInt(m.count),
      })),
    });
  } catch (error) {
    console.error('Error al obtener comparación mensual:', error);
    res.status(500).json({
      message: 'Error al obtener datos',
      error: error.message,
    });
  }
};