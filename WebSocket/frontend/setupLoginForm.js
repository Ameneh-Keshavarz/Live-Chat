const API_URL = "http://localhost:3000/api/auth";

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;

    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      alert("Login failed.");
      return;
    }

    const data = await res.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", username);
    window.location.href = "chat.html";
  });

