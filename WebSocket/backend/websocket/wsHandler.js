import jwt from "jsonwebtoken";
import { db } from "../db/db.js";
import { JWT_SECRET } from "../config.js";

export function setupWebSocketHandlers(wss) {
  wss.on("connection", async (ws, req) => {
    console.log("Incoming cookies:", req.headers.cookie);

    const cookieHeader = req.headers.cookie || "";
    const cookiePairs = cookieHeader.split("; ");
    const cookies = {};
    for (const pair of cookiePairs) {
      const [key, value] = pair.split("=");
      cookies[key] = value;
    }

    const token = cookies.token;

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      ws.user = payload;
    } catch (err) {
      ws.close();
      return;
    }

    const messages = await db("messages")
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
      .orderBy("messages.timestamp", "asc");

    for (const message of messages) {
      ws.send(JSON.stringify({ type: "new-message", data: message }));
    }
  });
}
