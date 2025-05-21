import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { WebSocketServer } from "ws";

import { PORT, HOST } from "./config.js";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandlerMiddleware } from "./middlewares/errorHandlerMiddleware.js";
import { initWSS } from "./websocket/broadcast.js";
import { setupWebSocketHandlers } from "./websocket/wsHandler.js";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

initWSS(wss);
setupWebSocketHandlers(wss);

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.url}`);
  next();
});

app.get("/", (req, res) => res.json({ result: "WebSocket server is running" }));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.use(notFound);
app.use(errorHandlerMiddleware);

server.listen(PORT, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
