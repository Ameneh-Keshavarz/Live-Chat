const socket = new WebSocket('ws://localhost:3000');

socket.onmessage = function(event) {
  document.getElementById('output').textContent = event.data;
};

socket.onerror = function(error) {
  console.error('WebSocket Error:', error);
};
