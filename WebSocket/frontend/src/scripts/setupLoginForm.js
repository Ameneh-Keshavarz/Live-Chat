import {showMessage} from '../utils.js';

const form = document.getElementById("login-form");
const statusMessage = document.getElementById("status-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    const res = await fetch('https://ameneh-websocket-backend.hosting.codeyourfuture.io/api/auth/login', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      console.log("Login failed", res.status, data);
      showMessage(statusMessage,"Login failed",true);
      return;
    }

    console.log("Login successful", data);

    localStorage.setItem("username", data.username);
    localStorage.setItem("full_name", data.full_name);

    showMessage(statusMessage,"Login successful!", false);

    setTimeout(() => {
      window.location.href = "chat.html";
    }, 1000);
  } catch (err) {
    console.error(err);
    showMessage(statusMessage,"An error occurred during login",true);
  }
});