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
import { authenticate, checkPermission } from '../middleware/permissions.js';

const router = express.Router();

// ==================== EXPORTACIÓN DE DATOS ====================

// Exportar visitantes
router.get('/visitors/excel', 
  authenticate, 
  checkPermission('dashboard', 'view'),
  exportVisitorsToExcel
);

router.get('/visitors/csv', 
  authenticate, 
  checkPermission('dashboard', 'view'),
  exportVisitorsToCSV
);

// Exportar entradas
router.get('/entries/excel', 
  authenticate, 
  checkPermission('dashboard', 'view'),
  exportEntriesToExcel
);

router.get('/entries/csv', 
  authenticate, 
  checkPermission('dashboard', 'view'),
  exportEntriesToCSV
);

// ==================== DASHBOARD ====================

// Estadísticas generales
router.get('/dashboard/overview', 
  authenticate, 
  checkPermission('dashboard', 'view'),
  getDashboardOverview
);

// Datos para gráficos
router.get('/dashboard/entries-by-day', 
  authenticate, 
  checkPermission('dashboard', 'view'),
  getEntriesByDay
);

router.get('/dashboard/top-visitors', 
  authenticate, 
  checkPermission('dashboard', 'view'),
  getTopVisitors
);

router.get('/dashboard/by-department', 
  authenticate, 
  checkPermission('dashboard', 'view'),
  getEntriesByDepartment
);

router.get('/dashboard/by-purpose', 
  authenticate, 
  checkPermission('dashboard', 'view'),
  getEntriesByPurpose
);

router.get('/dashboard/peak-hours', 
  authenticate, 
  checkPermission('dashboard', 'view'),
  getPeakHours
);

router.get('/dashboard/monthly-comparison', 
  authenticate, 
  checkPermission('dashboard', 'view'),
  getMonthlyComparison
);

// Exportar dashboard completo con gráficos
router.get('/dashboard/export-excel', 
  authenticate, 
  checkPermission('dashboard', 'view'),
  exportDashboardToExcel
);

export default router;