import express from "express";
import cors from "cors";
import crypto from "crypto";


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); 

let messages = [];

app.get("/", (req, res) => {
  res.json({result:"server is running"});
});

app.get("/api/messages", (req, res) => {
    res.json(messages);
  });

app.post('/api/messages', (req, res) => {
    const { username, text } = req.body;
    if (!username || !text) {
      return res.status(400).json({ error: 'Username and message text are required.' });
    }
  
    const newMessage = {
      id: crypto.randomUUID(),
      username,
      text,
      timestamp: new Date()
    };
  
    messages.push(newMessage);
    res.status(201).json(newMessage);
  });
  
app.listen(PORT, () => {
  const host = process.env.HOST || "localhost";
  console.log(`Server is running at http://${host}:${PORT}`);
});

