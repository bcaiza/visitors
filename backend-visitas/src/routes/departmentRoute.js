import express from 'express';
import {
  createDepartment,
  getAllDepartments,
  getActiveDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  toggleDepartmentStatus
} from '../controllers/departmentController.js';
import { authenticate, checkPermission } from '../middleware/permissions.js';

const router = express.Router();

router.post('/', 
  authenticate, 
  checkPermission('department', 'create'),
  createDepartment
);

router.get('/', 
  authenticate, 
  checkPermission('department', 'view'),
  getAllDepartments
);

router.get('/active', 
  authenticate, 
  checkPermission('department', 'view'),
  getActiveDepartments
);

router.get('/:id', 
  authenticate, 
  checkPermission('department', 'view'),
  getDepartmentById
);

router.put('/:id', 
  authenticate, 
  checkPermission('department', 'edit'),
  updateDepartment
);

router.delete('/:id', 
  authenticate, 
  checkPermission('department', 'delete'),
  deleteDepartment
);

router.patch('/:id/toggle', 
  authenticate, 
  checkPermission('department', 'edit'),
  toggleDepartmentStatus
);

export default router;