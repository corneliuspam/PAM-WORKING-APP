// ===== SOCKET CONNECTION =====
const socket = io({ transports: ["websocket"] });

// ===== USER DATA =====
const myUsername = localStorage.getItem("user");
const myPhoto = localStorage.getItem("photo");
const targetUser = localStorage.getItem("activePrivateUser");

if (!myUsername || !targetUser) {
  window.location.href = "/";
}

// ===== DOM =====
const chatBox = document.getElementById("privateChat");
const msgInput = document.getElementById("privateMsg");
const sendBtn = document.getElementById("privateSendBtn");
const backBtn = document.getElementById("backBtn");

const privateUsername = document.getElementById("privateUsername");
const privateUserPic = document.getElementById("privateUserPic");

// ===== LOAD PROFILE =====
privateUsername.textContent = targetUser;
privateUserPic.src = myPhoto;

// ===== ROOM ID (REAL & SAFE) =====
const roomId = [myUsername, targetUser].sort().join("_");

// ===== JOIN PRIVATE ROOM =====
socket.emit("join private", roomId);

// ===== RENDER MESSAGE =====
function renderPrivateMessage(data, isMe) {
  const wrap = document.createElement("div");
  wrap.className = isMe ? "me" : "other";

  wrap.innerHTML = `
    <div class="bubble">
      <span>${data.message}</span>
      <small class="time">${data.time}</small>
    </div>
  `;

  chatBox.appendChild(wrap);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ===== SEND MESSAGE =====
sendBtn.onclick = () => {
  const text = msgInput.value.trim();
  if (!text) return;

  const data = {
    from: myUsername,
    to: targetUser,
    message: text,
    time: new Date().toLocaleTimeString(),
    room: roomId
  };

  renderPrivateMessage(data, true);
  socket.emit("private message", data);
  msgInput.value = "";
};

msgInput.addEventListener("keydown", e => {
  if (e.key === "Enter") sendBtn.onclick();
});

// ===== RECEIVE MESSAGE =====
socket.on("private message", data => {
  if (data.from === myUsername) return;
  renderPrivateMessage(data, false);
});

// ===== BACK BUTTON =====
backBtn.onclick = () => {
  window.history.back();
};