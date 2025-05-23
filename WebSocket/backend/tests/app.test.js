import request from "supertest";
import { createServer } from "http";
import express from "express";
import { WebSocketServer } from "ws";
import cors from "cors";
import cookieParser from "cookie-parser";

import { initWSS } from "../websocket/broadcast.js";
import { setupWebSocketHandlers } from "../websocket/wsHandler.js";
import authRoutes from "../routes/authRoutes.js";
import messageRoutes from "../routes/messageRoutes.js";
import { notFound } from "../middlewares/notFound.js";
import { errorHandlerMiddleware } from "../middlewares/errorHandlerMiddleware.js";

let server;
let app;

beforeEach((done) => {
  app = express();
  server = createServer(app);
  const wss = new WebSocketServer({ server });

  initWSS(wss);
  setupWebSocketHandlers(wss);

  app.use(cors({ origin: "http://localhost:5173", credentials: true }));
  app.use(cookieParser());
  app.use(express.json());

  app.get("/", (req, res) => res.json({ result: "WebSocket server is running" }));
  app.use("/api/auth", authRoutes);
  app.use("/api/messages", messageRoutes);
  app.use(notFound);
  app.use(errorHandlerMiddleware);

  server.listen(0, done); 
});

afterEach((done) => {
  server.close(done); 
});

test("GET / returns server status", (done) => {
  const { port } = server.address();
  request(`http://localhost:${port}`)
    .get("/")
    .expect(200)
    .expect("Content-Type", /json/)
    .expect({ result: "WebSocket server is running" })
    .end((err) => {
      if (err) return done(err);
      done();
    });
});
