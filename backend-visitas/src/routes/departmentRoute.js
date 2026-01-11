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

const router = express.Router();

router.post('/', createDepartment);
router.get('/', getAllDepartments);
router.get('/active', getActiveDepartments);
router.get('/:id', getDepartmentById);
router.put('/:id', updateDepartment);
router.delete('/:id', deleteDepartment);
router.patch('/:id/toggle', toggleDepartmentStatus);

export default router;