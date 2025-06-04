import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { WebSocketServer } from "ws";

import { PORT, HOST,CLIENT_ORIGIN } from "./config.js";
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
  origin: CLIENT_ORIGIN, 
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => res.json({ result: "WebSocket server is running" }));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.use(notFound);
app.use(errorHandlerMiddleware);

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
