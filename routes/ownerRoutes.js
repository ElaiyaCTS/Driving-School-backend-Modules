import express from 'express';
import {
  createOwner,
  getAllOwners,
  getOwnerById,
  updateOwner,
  deleteOwner
} from '../controllers/ownerController.js';

const router = express.Router();

// POST /api/owners
router.post('/', createOwner);

// GET /api/owners
router.get('/', getAllOwners);

// GET /api/owners/:id
router.get('/:id', getOwnerById);

// PUT /api/owners/:id
router.put('/:id', updateOwner);

// DELETE /api/owners/:id
router.delete('/:id', deleteOwner);

export default router;
