import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  resetPassword,
  toggleUserStatus,
  getUsersByRole,
  getActiveUsers
} from '../controllers/userController.js';
import { authenticate, checkPermission } from '../middleware/permissions.js';

const router = express.Router();

router.get('/', 
  authenticate, 
  checkPermission('users', 'view'),
  getUsers
);

router.get('/active', 
  authenticate, 
  checkPermission('users', 'view'),
  getActiveUsers
);

router.get('/role/:roleId', 
  authenticate, 
  checkPermission('users', 'view'),
  getUsersByRole
);

router.get('/:id', 
  authenticate, 
  checkPermission('users', 'view'),
  getUserById
);

router.post('/', 
  authenticate, 
  checkPermission('users', 'create'),
  createUser
);

router.put('/:id', 
  authenticate, 
  checkPermission('users', 'edit'),
  updateUser
);

router.delete('/:id', 
  authenticate, 
  checkPermission('users', 'delete'),
  deleteUser
);

router.put('/:id/change-password', 
  authenticate, 
  checkPermission('users', 'edit'),
  changePassword
);

router.put('/:id/reset-password', 
  authenticate, 
  checkPermission('users', 'edit'),
  resetPassword
);

router.patch('/:id/toggle-status', 
  authenticate, 
  checkPermission('users', 'edit'),
  toggleUserStatus
);

export default router;