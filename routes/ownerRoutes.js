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

// POST /api/owner/organization/
router.post('/', createOrganizationWithOwner);

// GET /api/owner/organization/:orgId/add-owner
// router.post('/:orgId/add-owner',jwtAuth(ROLE.superUsers), addCoOwnerToOrganization );
router.post('/:orgId/add-owner', addCoOwnerToOrganization );

// GET /api/owner/organization/:id
// router.get('/:id', jwtAuth(ROLE.superUsers), getOwnerById);
router.get('/:id',  getOwnerById);


// GET All /api/owner/organization/
// router.get('/', jwtAuth(ROLE.superUsers), getAllOwners);
router.get('/',  getAllOwners);


// PUT /api/owner/organization/:id
// router.put('/:id',jwtAuth(ROLE.superUsers),  updateOwner);
router.put('/:id',  updateOwner);

 // PUT /api/owner/organization/updateOrganization/:orgId
// router.put('/updateOrganization/:orgId', jwtAuth(ROLE.superUsers), updateOrganization);
router.put('/updateOrganization/:orgId', updateOrganization);


// DELETE /api/owner/:id
// router.delete('/:id',jwtAuth(ROLE.systemAdmins),  deleteOwner);

// DELETE /api/owner/:orgId/remove-owner/:ownerId
router.delete('/:orgId/remove-owner/:ownerId', jwtAuth(ROLE.systemAdmins), removeOwnerFromOrganization);

export default router;
