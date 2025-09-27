import express from 'express';
import {
  createOrganizationWithOwner,
  addCoOwnerToOrganization,
  getAllOwners,
  getOwnerById,
  getOrganizationById,
  updateOrganization,
  updateOwner,
  // deleteOwner,
  removeOwnerFromOrganization,
} from '../controllers/ownerController.js';
import ROLE from '../util/roleGroups.js';
import jwtAuth  from '../middlewares/jwtMiddleware.js';
const router = express.Router();
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage,
     limits: { fileSize: 5 * 1024 * 1024 }, // ✅ Set file size limit
 });

 const fileFields = [
  { name: "logo", maxCount: 1 }, // 🚨 "photo" leaner of "profile"
  { name: "photo", maxCount: 1 }, // 🚨 "photo" leaner of "profile"
]; 
 const singelFile = [
  { name: "photo", maxCount: 1 }, // 🚨 "photo" leaner of "profile"
]; 
 const logoFile = [
  { name: "logo", maxCount: 1 }, // 🚨 "photo" leaner of "profile"
]; 

// POST /api/v1/organization/
router.post('/', upload.fields(fileFields), createOrganizationWithOwner);

// GET /api/v1/organization/:orgId/add-owner
// router.post('/:orgId/add-owner',jwtAuth(ROLE.superUsers), addCoOwnerToOrganization );
router.post('/:orgId/add-owner', addCoOwnerToOrganization );

// GET /api/v1/organization/:id
// router.get('/:id', jwtAuth(ROLE.superUsers), getOwnerById);
router.get('/:id',  getOwnerById);


// GET All /api/v1/organization/
// router.get('/', jwtAuth(ROLE.superUsers), getAllOwners);
router.get('/',  getAllOwners);


// GET SINGLE organization  /api/v1/organization/getSingleOrganization/:id
// router.get('/', jwtAuth(ROLE.superUsers), getAllOwners);
router.get('/getSingleOrganization/:id',  getOrganizationById);


// PUT /api/v1/organization/:id
// router.put('/:id',jwtAuth(ROLE.superUsers),  updateOwner);
router.put('/:id', upload.fields(singelFile), updateOwner);

 // PUT /api/v1/organization/updateOrganization/:orgId
// router.put('/updateOrganization/:orgId', jwtAuth(ROLE.superUsers), updateOrganization);
router.put('/updateOrganization/:id',upload.fields(logoFile), updateOrganization);

// DELETE /api/v1/:id
// router.delete('/:id',jwtAuth(ROLE.systemAdmins),  deleteOwner);

// DELETE /api/v1/:orgId/remove-owner/:ownerId
router.delete('/:orgId/remove-owner/:ownerId', jwtAuth(ROLE.systemAdmins), removeOwnerFromOrganization);

export default router;
