const messagesDiv = document.getElementById("messages");
const form = document.getElementById("chat-form");
const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("message");

const state = { messages: [] };

const render = () => {
  messagesDiv.innerHTML = '';
  state.messages.forEach(msg => {
    const msgElem = document.createElement("div");
    msgElem.className = "message";
    msgElem.textContent = `${msg.username}: ${msg.text}`;
    messagesDiv.appendChild(msgElem);
  });
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
};

const socket = new WebSocket("ws://localhost:3000");

socket.addEventListener("message", (event) => {
  const newMessages = JSON.parse(event.data);

  state.messages.push(...newMessages);
  render();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const text = messageInput.value.trim();

  if (!username || !text) return;

  await fetch("http://localhost:3000/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, text }),
  });

  messageInput.value = "";
});
