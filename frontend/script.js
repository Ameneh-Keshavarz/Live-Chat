    const messagesDiv = document.getElementById("messages");
    const form = document.getElementById("chat-form");
    const usernameInput = document.getElementById("username");
    const messageInput = document.getElementById("message");
    const server = "http://localhost:3000/api";


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

    const keepFetchingMessages = async () => {
      const lastMessageTime = state.messages.length > 0
        ? state.messages[state.messages.length - 1].timestamp
        : null;

        const queryString = lastMessageTime
        ? `?since=${lastMessageTime}&long=true`
        : "?long=true";
      const url = `${server}/messages${queryString}`;
      
      const rawResponse = await fetch(url);
      const response = await rawResponse.json();

      if (response.length > 0) {
        state.messages.push(...response);
        render();
      }

      setTimeout(keepFetchingMessages, 100);
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = usernameInput.value.trim();
      const text = messageInput.value.trim();

      if (!username || !text) return;

      await fetch(`${server}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, text })
      });

      messageInput.value = "";
    });

    keepFetchingMessages();
