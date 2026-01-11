import express from 'express';
import {
  checkIn,
  checkOut,
  getAllEntries,
  getActiveVisitors,
  getEntryById,
  cancelEntry,
  getVisitorEntries,
  getEntryStats,
  getTodayEntries,
  updateEntry
} from '../controllers/entryController.js';
import { authenticate, checkPermission } from '../middleware/permissions.js';

const router = express.Router();

router.post('/', 
  authenticate, 
  checkPermission('entries', 'create'),
  checkIn
);

router.get('/', 
  authenticate, 
  checkPermission('entries', 'view'),
  getAllEntries
);

router.get('/active', 
  authenticate, 
  checkPermission('entries', 'view'),
  getActiveVisitors
);

router.get('/today', 
  authenticate, 
  checkPermission('entries', 'view'),
  getTodayEntries
);

router.get('/stats', 
  authenticate, 
  checkPermission('entries', 'view'),
  getEntryStats
);

router.get('/visitor/:visitor_id', 
  authenticate, 
  checkPermission('entries', 'view'),
  getVisitorEntries
);

router.get('/checkin', (req, res) => res.status(404).json({ message: 'Not found' }));

router.get('/:id', 
  authenticate, 
  checkPermission('entries', 'view'),
  getEntryById
);

router.patch('/:id', 
  authenticate, 
  checkPermission('entries', 'edit'),
  updateEntry
);

router.patch('/:id/checkout', 
  authenticate, 
  checkPermission('entries', 'edit'),
  checkOut
);

router.patch('/:id/cancel', 
  authenticate, 
  checkPermission('entries', 'edit'),
  cancelEntry
);

export default router;