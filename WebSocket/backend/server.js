import express from "express";
import cors from "cors";
import crypto from "crypto";
import { createServer } from "http";
import { WebSocketServer } from "ws";

import { asyncWrapper } from "./middlewares/asyncWrapper.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandlerMiddleware } from "./middlewares/errorHandlerMiddleware.js";
import { authenticate } from "./middlewares/authMiddleware.js";
import { db } from "./db/db.js";
import { register, login } from "./controllers/authController.js";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.url}`);
  next();
});

function broadcast(obj) {
  const data = JSON.stringify(obj);
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  });
}

app.get("/", (req, res) => {
  res.json({ result: "WebSocket server is running" });
});

app.post("/api/auth/register", register);
app.post("/api/auth/login", login);

app.post("/api/messages", authenticate, asyncWrapper(async (req, res) => {
  const { text } = req.body;
  const username = req.user.username;

  if (!text) {
    return res.status(400).json({ error: "Message text is required." });
  }

  const newMessage = {
    id: crypto.randomUUID(),
    username,
    text,
    timestamp: new Date().toISOString(),
    likes: 0,
    dislikes: 0,
  };

  await db("messages").insert(newMessage);
  res.status(201).json(newMessage);
  broadcast({ type: "new-message", data: newMessage });
}));

app.post("/api/messages/:id/react", authenticate, asyncWrapper(async (req, res) => {
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
}));

wss.on("connection", async (ws) => {
  const messages = await db("messages").orderBy("timestamp", "asc");
  for (const message of messages) {
    ws.send(JSON.stringify({ type: "new-message", data: message }));
  }
});

app.use(notFound);
app.use(errorHandlerMiddleware);

server.listen(PORT, () => {
  const host = process.env.HOST || "localhost";
  console.log(`Server running at http://${host}:${PORT}`);
});
