import { showMessage } from "./utils.js";

const API_URL = "http://localhost:3000/api/auth";

const registerForm = document.getElementById("register-form");
const statusMessage = document.getElementById("status-message");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const full_name = document.getElementById("register-fullname").value.trim();
  const username = document.getElementById("register-username").value.trim();
  const password = document.getElementById("register-password").value;

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name, username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.log("Registration failed", res.status, data);
      showMessage(statusMessage,data.error,true);
      return;
    }

    showMessage(statusMessage,"Registration successful!", false);

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
  } catch (err) {
    console.error(err);
    showMessage(statusMessage,"An error occurred during registration",ture);
  }
});
