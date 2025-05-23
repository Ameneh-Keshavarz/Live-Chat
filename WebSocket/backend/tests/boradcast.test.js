import { WebSocketServer, WebSocket } from "ws";
import { initWSS, broadcast } from "../websocket/broadcast.js";

describe("WebSocket broadcast", () => {
  let wss;
  const port = 8085;

  afterEach((done) => {
    if (wss) wss.close(() => done());
    else done();
  });

  test("sends message to open clients", (done) => {
    wss = new WebSocketServer({ port }, () => {
      initWSS(wss);

      const client = new WebSocket(`ws://localhost:${port}`);

      client.on("open", () => {
        client.on("message", (data) => {
          expect(JSON.parse(data)).toEqual({ type: "hello" });
          client.close();
          done();
        });

        broadcast({ type: "hello" });
      });

      client.on("error", done);
    });
  });

  test("does not send to closed clients", (done) => {
    wss = new WebSocketServer({ port }, () => {
      initWSS(wss);

      const client = new WebSocket(`ws://localhost:${port}`);

      client.on("open", () => {
        client.close();

        setTimeout(() => {
          expect(() => broadcast({ type: "shouldNotSend" })).not.toThrow();
          done();
        }, 50);
      });

      client.on("error", done);
    });
  });
});
