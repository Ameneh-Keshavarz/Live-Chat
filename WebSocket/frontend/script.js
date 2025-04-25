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

    msgElem.innerHTML = `
      <strong>${msg.username}</strong>: ${msg.text}<br />
      <button data-id="${msg.id}" data-action="like">👍 ${msg.likes || 0}</button>
      <button data-id="${msg.id}" data-action="dislike">👎 ${msg.dislikes || 0}</button>
    `;

    messagesDiv.appendChild(msgElem);
  });

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
};

const socket = new WebSocket("ws://localhost:3000");

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);

  if (message.type === "new-message") {
    state.messages.push(message.data);
  } else if (message.type === "reaction-update") {
    const index = state.messages.findIndex(msg => msg.id === message.data.id);
    if (index !== -1) {
      state.messages[index].likes = message.data.likes;
      state.messages[index].dislikes = message.data.dislikes;
    }
  }
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

messagesDiv.addEventListener("click", async (e) => {
  const btn = e.target;
  if (btn.tagName !== "BUTTON") return;

  const messageId = btn.getAttribute("data-id");
  const action = btn.getAttribute("data-action");

  await fetch(`http://localhost:3000/api/messages/${messageId}/react`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
});
