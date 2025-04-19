import express from "express";
import cors from "cors";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let messages = [];
const callbacksForNewMessages = [];

app.get("/", (req, res) => {
  res.json({ result: "Server is running" });
});

app.get("/api/messages", (req, res) => {
  const { since, long } = req.query;
  const sinceDate = since ? new Date(since) : null;

  const messagesToSend = sinceDate
    ? messages.filter(msg => new Date(msg.timestamp) > sinceDate)
    : messages;

  const useLongPolling = long === "true";

  if (messagesToSend.length === 0 && useLongPolling) {
    const callback = (newMsgs) => res.json(newMsgs);
    callbacksForNewMessages.push(callback);
  
    setTimeout(() => {
      const index = callbacksForNewMessages.indexOf(callback);
      if (index !== -1) {
        callbacksForNewMessages.splice(index, 1);
        res.json([]);
      }
    }, 25000);
  }
   else {
    res.json(messagesToSend);
  }
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
    timestamp: new Date().toISOString()
  };

  messages.push(newMessage);
  res.status(201).json(newMessage);

  while (callbacksForNewMessages.length > 0) {
    const callback = callbacksForNewMessages.pop();
    callback([newMessage]);
  }
});

app.listen(PORT, () => {
  const host = process.env.HOST || "localhost";
  console.log(`Server is running at http://${host}:${PORT}`);
});
