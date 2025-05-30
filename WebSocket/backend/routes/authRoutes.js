import express from "express";
import { register, login } from "../controllers/authController.js";
import { asyncWrapper } from "../middlewares/asyncWrapper.js";

const router = express.Router();

router.post("/register", asyncWrapper(register));
router.post("/login", asyncWrapper(login));

export default router;
