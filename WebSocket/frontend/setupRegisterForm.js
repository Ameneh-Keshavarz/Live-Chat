const API_URL = "http://localhost:3000/api/auth";

const registerForm = document.getElementById("register-form");

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const full_name = document.getElementById("register-fullname").value.trim();
    const username = document.getElementById("register-username").value.trim();
    const password = document.getElementById("register-password").value;

    const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name, username, password }),
    });

    if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Registration failed.");
        return;
    }

    alert("Registration successful! Please log in.");
    window.location.href = "login.html";
});