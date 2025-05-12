const API_URL = "http://localhost:3000/api/auth";

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  if (!username || !password) {
    alert("Username and password are required.");
    return;
  }

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
  localStorage.setItem("full_name", data.full_name); 

  window.location.href = "chat.html";
});