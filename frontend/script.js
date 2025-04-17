const messagesDiv = document.getElementById('messages');
const form = document.getElementById('chat-form');
const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('message');

async function loadMessages() {
  const res = await fetch('http://localhost:3000/api/messages');
  let messages = await res.json();
  messages=Object.values(messages);
  messagesDiv.innerHTML = '';
  if(messages)
    {messages.forEach(msg => {
    const msgElem = document.createElement('div');
    msgElem.className = 'message';
    msgElem.textContent = `${msg.username}: ${msg.text}`;
    messagesDiv.appendChild(msgElem);
  });
}
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const text = messageInput.value.trim();
  
    if (!username || !text) return;
  
    await fetch('http://localhost:3000/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, text })
    });
  
    messageInput.value = '';
    await loadMessages(); 
  });
loadMessages();
