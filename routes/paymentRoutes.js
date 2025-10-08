import express from "express";
import { createPayment, getPayments, getPaymentById, deletePayment } from "../controllers/paymentController.js";
import jwtAuth from "../middlewares/jwtMiddleware.js";
import checkSubscription from "../middlewares/checkSubscription.js";
import ROLE from "../util/roleGroups.js";

const router = express.Router();

router.post("/", jwtAuth(ROLE.branchTeam), checkSubscription,createPayment);
router.get("/",jwtAuth(ROLE.branchTeam), checkSubscription,getPayments);
router.get("/createdBy/:createdBy",jwtAuth(ROLE.branchTeam),checkSubscription, getPayments);
router.get("/:id",jwtAuth(ROLE.everyone), checkSubscription,getPayments);
// router.get("/:id",jwtAuth(["Admin","Instructor","Learner"]), getPaymentById);
router.delete("/:id",jwtAuth(ROLE.superUsers),checkSubscription, deletePayment);

export default router;
