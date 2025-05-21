const API_URL = "http://localhost:3000";

// DOM Elements
const messagesDiv = document.getElementById("messages");
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message");
const logoutBtn = document.getElementById("logout-btn");
const userLabel = document.getElementById("user-label");

// State/Token
const username = localStorage.getItem("username");
const fullName = localStorage.getItem("full_name");

if (!username) {
  window.location.href = "index.html";
}

userLabel.textContent = `Logged in as: ${fullName || username}`;

const state = {
  messages: [],
  username,
  fullName,
};

// Logout
function handleUnauthorized(res) {
  if (res.status === 401) {
    alert("Session expired. Please log in again.");
    localStorage.clear();
    window.location.href = "index.html";
    return true;
  }
  return false;
}

// Render Messages
const render = () => {
  messagesDiv.innerHTML = "";
  for (const msg of state.messages) {
    const msgElem = document.createElement("div");
    msgElem.className = "message";

    const nameElem = document.createElement("strong");
    nameElem.textContent = msg.full_name || msg.username;

    const textNode = document.createTextNode(`: ${msg.text}`);
    const br = document.createElement("br");

    const likeBtn = document.createElement("button");
    likeBtn.textContent = `👍 ${msg.likes || 0}`;
    likeBtn.dataset.id = msg.id;
    likeBtn.dataset.action = "like";

    const dislikeBtn = document.createElement("button");
    dislikeBtn.textContent = `👎 ${msg.dislikes || 0}`;
    dislikeBtn.dataset.id = msg.id;
    dislikeBtn.dataset.action = "dislike";

    msgElem.appendChild(nameElem);
    msgElem.appendChild(textNode);
    msgElem.appendChild(br);
    msgElem.appendChild(likeBtn);
    msgElem.appendChild(dislikeBtn);

    messagesDiv.appendChild(msgElem);
  }
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
};

// WebSocket Setup 
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

socket.addEventListener("close", () => {
  console.warn("WebSocket disconnected.");
});

// Send Message
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;

  try {
    const response = await fetch(`${API_URL}/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ text }),
    });

    if (handleUnauthorized(response)) return;

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

// React to Message
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
      },
      credentials: "include",
      body: JSON.stringify({ action }),
    });

    if (handleUnauthorized(response)) return;

    const result = await response.json();
    if (!result.success) {
      alert(result.error || "Failed to react.");
    }
  } catch (error) {
    console.error("Reaction error:", error);
    alert("Error reacting to message.");
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  socket.close();
  window.location.href = "index.html";
});
