import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { asyncWrapper } from "../middlewares/asyncWrapper.js";
import {
  postMessage,
  reactToMessage,
} from "../controllers/messageController.js";

const router = express.Router();

router.post("/", authenticate, asyncWrapper(postMessage));
router.post("/:id/react", authenticate, asyncWrapper(reactToMessage));

export default router;
