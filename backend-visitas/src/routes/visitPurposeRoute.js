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
import { authenticate, checkPermission } from '../middleware/permissions.js';

const router = express.Router();

router.post('/', 
  authenticate, 
  checkPermission('visit-purposes', 'create'),
  createVisitPurpose
);

router.get('/', 
  authenticate, 
  checkPermission('visit-purposes', 'view'),
  getAllVisitPurposes
);

router.get('/active', 
  authenticate, 
  checkPermission('visit-purposes', 'view'),
  getActiveVisitPurposes
);

router.get('/:id', 
  authenticate, 
  checkPermission('visit-purposes', 'view'),
  getVisitPurposeById
);

router.put('/:id', 
  authenticate, 
  checkPermission('visit-purposes', 'edit'),
  updateVisitPurpose
);

router.delete('/:id', 
  authenticate, 
  checkPermission('visit-purposes', 'delete'),
  deleteVisitPurpose
);

router.patch('/:id/toggle', 
  authenticate, 
  checkPermission('visit-purposes', 'edit'),
  toggleVisitPurposeStatus
);

export default router;