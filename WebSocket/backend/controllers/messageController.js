import crypto from "crypto";
import { db } from "../db/db.js";
import { broadcast } from "../websocket/broadcast.js";

export const postMessage = async (req, res) => {
  const { text } = req.body;
  const user_id = req.user.userId;

  if (!text) {
    return res.status(400).json({ error: "Message text is required." });
  }

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

  res.status(201).json(fullMessage);
  broadcast({ type: "new-message", data: fullMessage });
};

export const reactToMessage = async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  const message = await db("messages").where({ id }).first();
  if (!message) {
    return res.status(404).json({ error: "Message not found" });
  }

  const updateField = action === "like" ? "likes" : action === "dislike" ? "dislikes" : null;
  if (!updateField) {
    return res.status(400).json({ error: "Invalid action" });
  }

  await db("messages").where({ id }).increment(updateField, 1);
  const updated = await db("messages").where({ id }).first();

  broadcast({
    type: "reaction-update",
    data: {
      id,
      likes: updated.likes,
      dislikes: updated.dislikes,
    },
  });

  res.json({ success: true });
};
