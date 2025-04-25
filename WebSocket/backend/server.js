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
    likes: 0,
    dislikes: 0,
  };

  messages.push(newMessage);
  res.status(201).json(newMessage);

  broadcast({ type: "new-message", data: newMessage });
});

app.post("/api/messages/:id/react", (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  const message = messages.find(msg => msg.id === id);
  if (!message) {
    return res.status(404).json({ error: "Message not found" });
  }

  if (action === "like") {
    message.likes++;
  } else if (action === "dislike") {
    message.dislikes++;
  } else {
    return res.status(400).json({ error: "Invalid action" });
  }

  broadcast({
    type: "reaction-update",
    data: {
      id: message.id,
      likes: message.likes,
      dislikes: message.dislikes,
    },
  });

  res.json({ success: true });
});

wss.on("connection", (ws) => {
  for (const message of messages) {
    ws.send(JSON.stringify({ type: "new-message", data: message }));
  }
});

server.listen(PORT, () => {
  const host = process.env.HOST || "localhost";
  console.log(`Server running at http://${host}:${PORT}`);
});
