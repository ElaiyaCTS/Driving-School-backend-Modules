import express from 'express';
import {
  createOrganizationWithOwner,
  addCoOwnerToOrganization,
  getAllOwners,
  getOwnerById,
  updateOrganization,
  updateOwner,
  // deleteOwner,
  removeOwnerFromOrganization,
} from '../controllers/ownerController.js';
import ROLE from '../util/roleGroups.js';
import jwtAuth  from '../middlewares/jwtMiddleware.js';
const router = express.Router();

// POST /api/owners
router.post('/', createOrganizationWithOwner);

// GET /api/owners
// router.post('/:orgId/add-owner',jwtAuth(ROLE.superUsers), addCoOwnerToOrganization );
router.post('/:orgId/add-owner', addCoOwnerToOrganization );

// GET /api/owners/:id
// router.get('/:id', jwtAuth(ROLE.superUsers), getOwnerById);
router.get('/:id',  getOwnerById);


// GET All /api/owners/
// router.get('/', jwtAuth(ROLE.superUsers), getAllOwners);
router.get('/',  getAllOwners);


// PUT /api/owners/:id
// router.put('/:id',jwtAuth(ROLE.superUsers),  updateOwner);
router.put('/:id',  updateOwner);


 // PUT /api/owners/organization/:orgId
// router.put('/organization/:orgId', jwtAuth(ROLE.superUsers), updateOrganization);
router.put('/organization/:orgId', updateOrganization);


// DELETE /api/owners/:id
// router.delete('/:id',jwtAuth(ROLE.systemAdmins),  deleteOwner);

// DELETE /api/owners/:orgId/remove-owner/:ownerId
router.delete('/:orgId/remove-owner/:ownerId', jwtAuth(ROLE.systemAdmins), removeOwnerFromOrganization);

export default router;
