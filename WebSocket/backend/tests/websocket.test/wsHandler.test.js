import { WebSocketServer } from "ws";
import { WebSocket } from "ws";

test("WebSocket connection and message event works", (done) => {
  const port = 8083;
  const wss = new WebSocketServer({ port });

  wss.on("connection", (ws) => {
    ws.send(JSON.stringify({ type: "test", data: "hello world" }));
  });

  const wsClient = new WebSocket(`ws://localhost:${port}`);

  wsClient.on("open", () => {
    wsClient.on("message", (data) => {
      try {
        const message = JSON.parse(data);
        expect(message.type).toBe("test");
        expect(message.data).toBe("hello world");
        done();
      } catch (error) {
        done(error);
      } finally {
        wsClient.close();
        wss.close();
      }
    });
  });

  wsClient.on("error", (err) => {
    wsClient.close();
    wss.close();
    done(err);
  });
});
