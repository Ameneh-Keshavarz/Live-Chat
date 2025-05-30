import { asyncWrapper } from "../middlewares/asyncWrapper.js";
import { createMessage, updateReaction } from "../services/messageService.js";
import { broadcast } from "../websocket/broadcast.js";
import { ApiError } from "../errors/ApiError.js";
import { StatusCodes } from "http-status-codes";

export const postMessage = async (req, res) => {
  const { text } = req.body;
  const user_id = req.user.userId;

  if (!text) {
    throw new ApiError("Message text is required.", StatusCodes.BAD_REQUEST);
  }

  const message = await createMessage({ user_id, text });
  res.status(201).json(message);
  broadcast({ type: "new-message", data: message });
};

export const reactToMessage = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  const result = await updateReaction({ id, action });

  broadcast({ type: "reaction-update", data: result });
  res.json({ success: true });
};
