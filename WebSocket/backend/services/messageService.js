import crypto from "crypto";
import { db } from "../db/db.js";
import { ApiError } from "../errors/ApiError.js";
import { StatusCodes } from "http-status-codes";

export const createMessage = async ({ user_id, text }) => {
  const newMessage = {
    id: crypto.randomUUID(),
    user_id,
    text,
    timestamp: new Date().toISOString(),
    likes: 0,
    dislikes: 0,
  };

  await db("messages").insert(newMessage);

  const fullMessage = await db("messages")
    .join("users", "messages.user_id", "users.id")
    .select(
      "messages.id",
      "messages.text",
      "messages.timestamp",
      "messages.likes",
      "messages.dislikes",
      "users.username",
      "users.full_name"
    )
    .where("messages.id", newMessage.id)
    .first();

  return fullMessage;
};

export const updateReaction = async ({ id, action }) => {
  const message = await db("messages").where({ id }).first();
  if (!message) {
    throw new ApiError("Message not found", StatusCodes.NOT_FOUND);
  }

  const updateField = action === "like" ? "likes" : action === "dislike" ? "dislikes" : null;
  if (!updateField) {
    throw new ApiError("Invalid action", StatusCodes.BAD_REQUEST);
  }

  await db("messages").where({ id }).increment(updateField, 1);
  const updated = await db("messages").where({ id }).first();

  return {
    id,
    likes: updated.likes,
    dislikes: updated.dislikes,
  };
};
