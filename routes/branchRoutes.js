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

const router = express.Router();

// Create new branch (Owner only)
router.post('/create/:organizationId', createBranch);

// Get all branches (for one organization)
router.get('/organization_branches/:organizationId', getAllBranches);

// Get single branch by ID
router.get('/:branchId', getBranchById);

// Update branch by ID
router.put('/:branchId', updateBranch);

// Delete branch (soft delete or hard delete)
router.delete('/:branchId', deleteBranch);

// Assign an Admin using params
router.post('/assign-admin/:branchId/:adminId', assignBranchAdmin);

// Remove assigned admin
router.delete('/remove-admin/:branchId/:adminId', removeBranchAdmin);


export default router;
