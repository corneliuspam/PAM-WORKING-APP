// ===== SOCKET CONNECTION =====
const socket = io({ transports: ["websocket"] });

// ===== DOM ELEMENTS =====
const chatContainer = document.getElementById("chat");
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("sendBtn");
const themeToggle = document.getElementById("themeToggle");
const aboutBtn = document.getElementById("aboutBtn");
const aboutModal = document.getElementById("aboutModal");
const closeAbout = document.getElementById("closeAbout");
const tickerContent = document.getElementById("tickerContent");

// ===== ACTIVE USERS ROTATION =====
function updateTicker(users) {
  if (!tickerContent) return;

  tickerContent.innerHTML = "";
  users.forEach(u => {
    const div = document.createElement("div");
    div.className = "tickerUser";
    div.innerHTML = `<img src="${u.photo}"><span>${u.username}</span>`;
    tickerContent.appendChild(div);
  });

// ===== PRIVATE CHAT BUTTONS (DECLARE ONCE) =====
const privateChatBtn = document.getElementById("privateChatBtn");
const startPrivateChatBtn = document.getElementById("startPrivateChat");

// ===== USER DATA =====
let username = localStorage.getItem("user");
let photo = localStorage.getItem("photo");

// ===== SAFETY CHECK =====
if (!username) window.location.href = "/";

// ===== INITIAL LOAD =====
window.addEventListener("load", () => {
  document.getElementById("usernameDisplay").textContent = username;
  document.getElementById("userPic").src = photo;
  document.getElementById("status").textContent = "● Online";
});

// ===== MESSAGE RENDER =====
function renderMessage(data, isMe) {
  const wrapper = document.createElement("div");
  wrapper.className = isMe ? "me" : "other";

  wrapper.innerHTML = `
    <img class="avatar"
      src="${isMe ? photo : (data.photo || photo)}"
      data-username="${data.username}"
      data-photo="${data.photo || photo}"
      data-status="${data.status || 'Hey there! I am using PAM App.'}"
    />
    <div class="bubble">
      <span>${data.message || ""}</span>
      ${data.image ? `<br><img src="${data.image}" class="msgImage">` : ""}
      <small class="time">${data.time}</small>
    </div>
  `;

  if (isMe) {
    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑️";
    delBtn.className = "deleteMsgBtn";
    delBtn.onclick = () => wrapper.remove();
    wrapper.querySelector(".bubble").appendChild(delBtn);
  }

  chatContainer.appendChild(wrapper);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ===== SEND MESSAGE =====
function sendMessage() {
  const text = msgInput.value.trim();
  if (!text) return;

  const data = {
    username,
    message: text,
    time: new Date().toLocaleTimeString()
  };

  renderMessage(data, true);
  socket.emit("chat message", data);
  msgInput.value = "";
}

sendBtn.onclick = sendMessage;
msgInput.onkeydown = e => { if (e.key === "Enter") sendMessage(); };

// ===== RECEIVE MESSAGE =====
socket.on("chat message", data => {
  if (data.username === username) return;
  renderMessage(data, false);
});

// ===== THEME =====
themeToggle.onclick = () => document.body.classList.toggle("light");

// ===== ABOUT MODAL =====
aboutBtn.onclick = () => aboutModal.style.display = "flex";
closeAbout.onclick = () => aboutModal.style.display = "none";

// ===== PROFILE MODAL =====
const profileModal = document.getElementById("profileModal");
const profileName = document.getElementById("profileName");
const profilePicLarge = document.getElementById("profilePicLarge");
const profileStatus = document.getElementById("profileStatus");

function openUserProfile(user) {
  profilePicLarge.src = user.photo || photo;
  profileName.textContent = user.username;
  profileStatus.textContent = user.status || "Online";
  profileModal.style.display = "flex";
  localStorage.setItem("activePrivateUser", user.username);
}

// ===== OPEN OWN PROFILE FROM TOP AVATAR =====
document.getElementById("userPic").addEventListener("click", () => {
  openUserProfile({
    username: localStorage.getItem("user"),
    photo: localStorage.getItem("photo"),
    status: localStorage.getItem("userStatus") || "Online"
  });
});

// ===== CLICK AVATAR IN CHAT =====
document.addEventListener("click", e => {
  if (e.target.classList.contains("avatar")) {
    openUserProfile({
      username: e.target.dataset.username,
      photo: e.target.dataset.photo,
      status: e.target.dataset.status
    });
  }
});

// ===== OPEN PRIVATE CHAT (SINGLE SOURCE) =====
function openPrivateChat() {
  const targetUser = localStorage.getItem("activePrivateUser");
  if (!targetUser) {
    alert("Select a user first!");
    return;
  }
  window.location.href = `/private-chat.html?user=${encodeURIComponent(targetUser)}`;
}

if (privateChatBtn) privateChatBtn.onclick = openPrivateChat;
if (startPrivateChatBtn) startPrivateChatBtn.onclick = openPrivateChat;

// ===== SETTINGS SAVE =====
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const statusInput = document.getElementById("statusInput");
const photoInput = document.getElementById("photoInput");
const settingsPanel = document.getElementById("settingsModal");

// ===== OPEN SETTINGS PANEL =====
const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsModal");

if (settingsBtn && settingsPanel) {
  settingsBtn.onclick = () => {
    settingsPanel.style.display = "flex";
  };
}

if (saveSettingsBtn) {
  saveSettingsBtn.onclick = () => {
    const status = statusInput.value.trim();
    localStorage.setItem("userStatus", status);
    document.getElementById("status").textContent = `● ${status || "Online"}`;
    profileStatus.textContent = status || "Online";

    if (photoInput.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        localStorage.setItem("photo", reader.result);
        document.getElementById("userPic").src = reader.result;
        profilePicLarge.src = reader.result;
        settingsPanel.style.display = "none";
      };
      reader.readAsDataURL(photoInput.files[0]);
    } else {
      settingsPanel.style.display = "none";
    }
  };
}