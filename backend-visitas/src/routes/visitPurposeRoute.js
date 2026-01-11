import express from 'express';
import {
  createVisitPurpose,
  getAllVisitPurposes,
  getActiveVisitPurposes,
  getVisitPurposeById,
  updateVisitPurpose,
  deleteVisitPurpose,
  toggleVisitPurposeStatus
} from '../controllers/visitPurposeController.js';

const router = express.Router();

router.post('/', createVisitPurpose);
router.get('/', getAllVisitPurposes);
router.get('/active', getActiveVisitPurposes);
router.get('/:id', getVisitPurposeById);
router.put('/:id', updateVisitPurpose);
router.delete('/:id', deleteVisitPurpose);
router.patch('/:id/toggle', toggleVisitPurposeStatus);

export default router;