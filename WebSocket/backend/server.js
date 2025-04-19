const http = require('http');
const WebSocketServer = require('websocket').server;

const server = http.createServer();
server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

const wsServer = new WebSocketServer({ httpServer: server });

wsServer.on('request', function(request) {
  console.log('Received a WebSocket request');
  const connection = request.accept(null, request.origin);
  console.log('Client connected');
  connection.sendUTF('Hello from server!');
});
