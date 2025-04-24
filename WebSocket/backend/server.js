import express from "express";
import cors from "cors";
import crypto from "crypto";
import { createServer } from "http";
import { WebSocketServer } from "ws";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let messages = [];

app.get("/", (req, res) => {
  res.json({ result: "WebSocket server is running" });
});

app.post("/api/messages", (req, res) => {
  const { username, text } = req.body;

  if (!username || !text) {
    return res.status(400).json({ error: "Username and message text are required." });
  }

  const newMessage = {
    id: crypto.randomUUID(),
    username,
    text,
    timestamp: new Date().toISOString(),
  };

  messages.push(newMessage);
  res.status(201).json(newMessage);

  const data = JSON.stringify([newMessage]);
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(data);
    }
  });
});

wss.on("connection", (ws) => {
  ws.send(JSON.stringify(messages));
});

server.listen(PORT, () => {
  const host = process.env.HOST || "localhost";
  console.log(`Server is running at http://${host}:${PORT}`);
});
