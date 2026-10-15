document.open();
document.write(`
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; margin: 0; padding: 0; display: flex; height: 100vh; }
    #sidebar { width: 250px; background: #f0f0f0; padding: 10px; overflow-y: auto; border-right: 1px solid #ccc; }
    #main { flex: 1; display: flex; flex-direction: column; }
    #messages { flex: 1; padding: 10px; overflow-y: auto; }
    #inputBar { padding: 10px; border-top: 1px solid #ccc; display: flex; gap: 10px; }
    #inputBar input { flex: 1; padding: 8px; }
    #inputBar button { padding: 8px 12px; }
    .chatItem { padding: 8px; cursor: pointer; border-bottom: 1px solid #ddd; }
    .chatItem:hover { background: #e0e0e0; }
    .deleteBtn { float: right; color: red; cursor: pointer; }
    .msgUser { margin: 6px 0; padding: 6px; background: #d0eaff; border-radius: 6px; }
    .msgAI { margin: 6px 0; padding: 6px; background: #e8e8e8; border-radius: 6px; }
  </style>
</head>
<body>

  <div id="sidebar">
    <h3>Chats</h3>
    <button id="newChatBtn">New Chat</button>
    <div id="chatList"></div>
  </div>

  <div id="main">
    <div id="messages"></div>

    <div id="inputBar">
      <input id="msgInput" placeholder="Type a message...">
      <button id="sendBtn">Send</button>
    </div>
  </div>

</body>
</html>
`);
document.close();

const WORKER_URL = "https://l-ai.proxyproxy.workers.dev";

let chats = {};
let currentChat = null;

function loadChats() {
  const saved = localStorage.getItem("ai_chats");
  chats = saved ? JSON.parse(saved) : {};
}

function saveChats() {
  localStorage.setItem("ai_chats", JSON.stringify(chats));
}

function createChat() {
  const id = "chat_" + Date.now();
  chats[id] = { id, messages: [] };
  currentChat = id;
  saveChats();
  renderChatList();
  renderMessages();
}

function deleteChat(id) {
  delete chats[id];
  if (currentChat === id) currentChat = null;
  saveChats();
  renderChatList();
  renderMessages();
}

function switchChat(id) {
  currentChat = id;
  renderMessages();
}

function renderChatList() {
  const list = document.getElementById("chatList");
  list.innerHTML = "";

  for(const id in chats) {
    const div = document.createElement("div");
    div.className = "chatItem";
    div.textContent = id;

    const del = document.createElement("span");
    del.className = "deleteBtn";
    del.textContent = "X";
    del.onclick = (e) => {
      e.stopPropagation();
      deleteChat(id);
    };

    div.appendChild(del);
    div.onclick = () => switchChat(id);
    list.appendChild(div);
  }
}

function renderMessages() {
  const box = document.getElementById("messages");
  box.innerHTML = "";

  if(!currentChat || !chats[currentChat]) {
    box.innerHTML = "<p style='color:#888'>No chat selected.</p>";
    return;
  }

  for (const msg of chats[currentChat].messages) {
    const div = document.createElement("div");
    div.className = msg.role === "user" ? "msgUser" : "msgAI";
    div.textContent = msg.text;
    box.appendChild(div);
  }

  box.scrollTop = box.scrollHeight;
}

async function sendMessage() {
  if(!currentChat) createChat();

  const input = document.getElementById("msgInput");
  const text = input.value.trim();
  if(!text) return;

  chats[currentChat].messages.push({ role: "user", text });
  saveChats();
  renderMessages();
  input.value = "";

  const history = chats[currentChat].messages.map(m => ({
    role: m.role,
    content: m.text
  }));

  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: text, history })
  });

  const data = await res.json();
  const reply = data.response || data.result || JSON.stringify(data);

  chats[currentChat].messages.push({ role: "assistant", text: reply });
  saveChats();
  renderMessages();
}

loadChats();
renderChatList();
renderMessages();

document.getElementById("newChatBtn").onclick = createChat;
document.getElementById("sendBtn").onclick = sendMessage;

document.getElementById("msgInput").addEventListener("keydown", (e) => {
  if(e.key === "Enter") sendMessage();
});
