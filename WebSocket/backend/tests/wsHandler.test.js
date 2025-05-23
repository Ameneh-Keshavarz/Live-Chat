import { WebSocketServer } from "ws";
import {WebSocket} from "ws";

test("WebSocket connection and message event works", (done) => {
  const port = 8083;
  const wss = new WebSocketServer({ port });

  wss.on("connection", (ws) => {
    ws.send(JSON.stringify({ type: "test", data: "hello world" }));
  });

  const wsClient = new WebSocket(`ws://localhost:${port}`);

  wsClient.on("message", (data) => {
    const message = JSON.parse(data);
    expect(message.type).toBe("test");
    expect(message.data).toBe("hello world");
    wsClient.close();
    wss.close();
    done();
  });

  wsClient.on("error", (err) => {
    wsClient.close();
    wss.close();
    done(err);
  });
  
});
