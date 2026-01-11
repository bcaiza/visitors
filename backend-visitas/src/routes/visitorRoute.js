import express from 'express';
import {
  getAllVisitors,
  getVisitorById,
  getVisitorByIdNumber,
  createVisitor,
  updateVisitor,
  deleteVisitor,
  deleteVisitorFile,
  searchVisitors
} from '../controllers/visitorController.js';

import { uploadVisitor } from '../config/multer.js';
import { authenticate, checkPermission } from '../middleware/permissions.js';


const router = express.Router();

router.get('/',
   authenticate,
   checkPermission('visitors', 'view'),
  getAllVisitors
);

router.get('/search',
   authenticate,
   checkPermission('visitors', 'view'),
  searchVisitors
);

router.get('/id-number/:idNumber',
   authenticate,
   checkPermission('visitors', 'view'),
  getVisitorByIdNumber
);

router.get('/:id',
   authenticate,
   checkPermission('visitors', 'view'),
  getVisitorById
);

router.post('/',
   authenticate,
   checkPermission('visitors', 'create'),
  uploadVisitor.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'idDocument', maxCount: 1 }
  ]),
  createVisitor
);

router.put('/:id',
   authenticate,
   checkPermission('visitors', 'edit'),
  uploadVisitor.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'idDocument', maxCount: 1 }
  ]),
  updateVisitor
);

router.delete('/:id/file/:fileType',
   authenticate,
   checkPermission('visitors', 'delete'),
  deleteVisitorFile
);

router.delete('/:id',
   authenticate,
   checkPermission('visitors', 'delete'),
  deleteVisitor
);

export default router;