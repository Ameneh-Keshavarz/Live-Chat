import { WebSocket } from 'ws';

let wssInstance;

export function initWSS(wss) {
  wssInstance = wss;
}

export function broadcast(obj) {
  if (!wssInstance) return;

  const data = JSON.stringify(obj);
  wssInstance.clients.forEach(client => {
    if (isClientOpen(client)) {
      client.send(data);
    }
  });
}

export function isClientOpen(client) {
  return client.readyState === WebSocket.OPEN;
}
