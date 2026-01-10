import express from 'express';
import {
  exportVisitorsToExcel,
  exportVisitorsToCSV,
  exportEntriesToExcel,
  exportEntriesToCSV,
  getDashboardOverview,
  getEntriesByDay,
  getTopVisitors,
  getEntriesByDepartment,
  getEntriesByPurpose,
  getPeakHours,
  getMonthlyComparison,
} from '../controllers/reportController.js';
import { exportDashboardToExcel } from '../controllers/exportDashboardToExcel.js';

const router = express.Router();

// ==================== EXPORTACIÓN DE DATOS ====================

// Exportar visitantes
router.get('/visitors/excel', exportVisitorsToExcel);
router.get('/visitors/csv', exportVisitorsToCSV);

// Exportar entradas
router.get('/entries/excel', exportEntriesToExcel);
router.get('/entries/csv', exportEntriesToCSV);

// ==================== DASHBOARD ====================

// Estadísticas generales
router.get('/dashboard/overview', getDashboardOverview);

// Datos para gráficos
router.get('/dashboard/entries-by-day', getEntriesByDay);
router.get('/dashboard/top-visitors', getTopVisitors);
router.get('/dashboard/by-department', getEntriesByDepartment);
router.get('/dashboard/by-purpose', getEntriesByPurpose);
router.get('/dashboard/peak-hours', getPeakHours);
router.get('/dashboard/monthly-comparison', getMonthlyComparison);

// Exportar dashboard completo con gráficos
router.get('/dashboard/export-excel', exportDashboardToExcel);

export default router;