const API_URL = "http://localhost:3000";

const messagesDiv = document.getElementById("messages");
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message");
const logoutBtn = document.getElementById("logout-btn");
const userLabel = document.getElementById("user-label");

const username = localStorage.getItem("username");
const token = localStorage.getItem("token");

if (!token || !username) {
  window.location.href = "login.html";
}

userLabel.textContent = `Logged in as: ${username}`;

const state = {
  messages: [],
  token,
  username,
};

const socket = new WebSocket("ws://localhost:3000");

socket.addEventListener("message", (event) => {
  try {
    const message = JSON.parse(event.data);

    if (message.type === "new-message") {
      state.messages.push(message.data);
    } else if (message.type === "reaction-update") {
      const index = state.messages.findIndex((msg) => msg.id === message.data.id);
      if (index !== -1) {
        state.messages[index].likes = message.data.likes;
        state.messages[index].dislikes = message.data.dislikes;
      }
    }

    render();
  } catch (error) {
    console.error("Failed to parse WebSocket message:", error);
  }
});

const render = () => {
  messagesDiv.innerHTML = "";
  for (const msg of state.messages) {
    const msgElem = document.createElement("div");
    msgElem.className = "message";
    msgElem.innerHTML = `
      <strong>${msg.username}</strong>: ${msg.text} <br />
      <button data-id="${msg.id}" data-action="like">👍 ${msg.likes || 0}</button>
      <button data-id="${msg.id}" data-action="dislike">👎 ${msg.dislikes || 0}</button>
    `;
    messagesDiv.appendChild(msgElem);
  }
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
};

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text || !state.token) return;

  try {
    const response = await fetch(`${API_URL}/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.token}`,
      },
      body: JSON.stringify({ text }),
    });

    const result = await response.json();
    if (!response.ok) {
      alert(result.error || "Failed to send message.");
    } else {
      messageInput.value = "";
    }
  } catch (error) {
    console.error("Send error:", error);
    alert("Error sending message.");
  }
});

messagesDiv.addEventListener("click", async (e) => {
  const btn = e.target;
  if (btn.tagName !== "BUTTON") return;

  const messageId = btn.getAttribute("data-id");
  const action = btn.getAttribute("data-action");

  try {
    const response = await fetch(`${API_URL}/api/messages/${messageId}/react`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.token}`,
      },
      body: JSON.stringify({ action }),
    });

    const result = await response.json();
    if (!result.success) {
      alert(result.error || "Failed to react.");
    }
  } catch (error) {
    console.error("Reaction error:", error);
    alert("Error reacting to message.");
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});
