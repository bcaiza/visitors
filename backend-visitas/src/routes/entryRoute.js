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

const router = express.Router();

router.post('/', checkIn);                           
router.get('/', getAllEntries);                      
router.get('/active', getActiveVisitors);            
router.get('/today', getTodayEntries);              
router.get('/stats', getEntryStats);                 
router.get('/visitor/:visitor_id', getVisitorEntries); 
router.get('/checkin', (req, res) => res.status(404).json({ message: 'Not found' }));
router.get('/:id', getEntryById);                    
router.patch('/:id', updateEntry);                   
router.patch('/:id/checkout', checkOut);             
router.patch('/:id/cancel', cancelEntry);            

export default router;