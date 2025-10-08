import express from 'express';
import {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
  assignBranchAdmin,
  removeBranchAdmin,
} from '../controllers/branchController.js';
import ROLE from '../util/roleGroups.js';
import jwtAuth from '../middlewares/jwtMiddleware.js';
import checkSubscription from '../middlewares/checkSubscription.js';
const router = express.Router();

// Create new branch (Owner only)
router.post('/create/:organizationId',jwtAuth(ROLE.superUsers), createBranch);

// Get all branches (for one organization)
router.get('/organization_branches/:organizationId',jwtAuth(ROLE.branchTeam), getAllBranches);

// Get single branch by ID
router.get('/:branchId', jwtAuth(ROLE.everyone), checkSubscription, getBranchById);

// Update branch by ID
router.put('/:branchId',jwtAuth(ROLE.superUsers), checkSubscription, updateBranch);

// Delete branch (soft delete or hard delete)
router.delete('/:branchId',jwtAuth(ROLE.superUsers), deleteBranch);

// Assign an Admin using params
router.post('/assign-admin/:branchId/:adminId',jwtAuth(ROLE.superUsers), checkSubscription, assignBranchAdmin);

// Remove assigned admin
router.delete('/remove-admin/:branchId/:adminId', jwtAuth(ROLE.superUsers), checkSubscription,removeBranchAdmin);


export default router;
