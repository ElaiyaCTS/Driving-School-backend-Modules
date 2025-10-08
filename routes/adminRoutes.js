import express from 'express';
import {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
} from '../controllers/adminController.js';
import multer from "multer";
import ROLE from '../util/roleGroups.js';
import jwtAuth from '../middlewares/jwtMiddleware.js';
import checkSubscription from '../middlewares/checkSubscription.js';

const router = express.Router();
// Set up multer for file uploads
const storage = multer.memoryStorage();
// Set file size limit to 5MB
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // ✅ Set file size limit
});

const fileFieldsInstead = [
  { name: "photo", maxCount: 1 }, // 🚨 "photo" instead of "profile"
];

// Create a new admin
router.post('/create', jwtAuth(ROLE.superUsers), checkSubscription, upload.fields(fileFieldsInstead), createAdmin);


// Get un-assinged admins
router.get('/un-assigned-admin', jwtAuth(ROLE.superUsers),checkSubscription,getAllAdmins);
router.get('/get-assigned-admin/:branchId', jwtAuth(ROLE.superUsers), checkSubscription,getAllAdmins);

// Get all admins
router.get('/', jwtAuth(ROLE.superUsers),checkSubscription, getAllAdmins);

// Get a single admin by ID
router.get('/:adminId', jwtAuth(ROLE.adminLevel), checkSubscription,getAdminById);

// Get a single admin by ID form owner
router.get('/:branchId/:adminId', jwtAuth(ROLE.adminLevel),checkSubscription, getAdminById);

// Update admin by ID
router.put('/:adminId',   jwtAuth(ROLE.adminLevel),checkSubscription,upload.fields(fileFieldsInstead),updateAdmin);

// Update admin by ID form owner
router.put('/:branchId/:adminId',  jwtAuth(ROLE.adminLevel),checkSubscription, upload.fields(fileFieldsInstead),updateAdmin);

// Delete admin by ID
router.delete('/:adminId',jwtAuth(ROLE.systemAdmins), deleteAdmin);

export default router;
