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

// ===== PRIVATE CHAT BUTTONS =====
const privateChatBtn = document.getElementById("privateChatBtn");
const startPrivateChatBtn = document.getElementById("startPrivateChat");

// ===== SETTINGS ELEMENTS =====
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const statusInput = document.getElementById("statusInput");
const photoInput = document.getElementById("photoInput");
const settingsPanel = document.getElementById("settingsModal");
const openSettings = document.getElementById("settingsBtn");

// ===== PROFILE ELEMENTS =====
const profileModal = document.getElementById("profileModal");
const profileName = document.getElementById("profileName");
const profilePicLarge = document.getElementById("profilePicLarge");
const profileStatus = document.getElementById("profileStatus");

// ===== USER DATA =====
let username = localStorage.getItem("user");
let photo = localStorage.getItem("photo");

// ===== SAFETY CHECK =====
if (!username) window.location.href = "/";

// ===== INITIAL LOAD =====
window.addEventListener("load", () => {
  document.getElementById("usernameDisplay").textContent = username;
  document.getElementById("userPic").src = photo;
  document.getElementById("status").textContent = `● ${localStorage.getItem("userStatus") || "Online"}`;
});

// ===== MESSAGE RENDER FUNCTION =====
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
  if (!text && !photoInput.files[0]) return;

  const data = {
    username,
    message: text || "",
    image: null,
    time: new Date().toLocaleTimeString()
  };

  // If user selected image
  if (photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      data.image = evt.target.result;
      renderMessage(data, true);
      socket.emit("chat message", data);
    };
    reader.readAsDataURL(photoInput.files[0]);
    photoInput.value = "";
  } else {
    renderMessage(data, true);
    socket.emit("chat message", data);
  }

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
window.onclick = e => { if (e.target === aboutModal) aboutModal.style.display = "none"; };

// ===== PROFILE MODAL =====
function openUserProfile(user) {
  profilePicLarge.src = user.photo || photo;
  profileName.textContent = user.username;
  profileStatus.textContent = user.status || "Online";
  profileModal.style.display = "flex";

  // Store active user for private chat
  localStorage.setItem("activePrivateUser", user.username);
}

// Click avatar in chat messages to open profile
document.addEventListener("click", e => {
  if (e.target.classList.contains("avatar") && e.target.dataset.username) {
    openUserProfile({
      username: e.target.dataset.username,
      photo: e.target.dataset.photo,
      status: e.target.dataset.status
    });
  }
});

// Click top avatar (your profile) to open profile modal
document.getElementById("userPic").onclick = () => {
  openUserProfile({
    username: username,
    photo: photo,
    status: localStorage.getItem("userStatus") || "Online"
  });
};

// Close profile modal
document.getElementById("closeProfile").onclick = () => profileModal.style.display = "none";
window.addEventListener("click", e => { if (e.target === profileModal) profileModal.style.display = "none"; });

// ===== PRIVATE CHAT FUNCTION =====
function openPrivateChat() {
  const targetUser = localStorage.getItem("activePrivateUser");
  if (!targetUser) { alert("Select a user first!"); return; }
  window.location.href = `/private-chat.html?user=${encodeURIComponent(targetUser)}`;
}

if (privateChatBtn) privateChatBtn.onclick = openPrivateChat;
if (startPrivateChatBtn) startPrivateChatBtn.onclick = openPrivateChat;

// ===== SETTINGS PANEL =====
openSettings.onclick = () => {
  settingsPanel.style.display = "flex";
  statusInput.value = localStorage.getItem("userStatus") || "";
};

// Save settings (status & photo)
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

// Logout button
document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "/";
};

// ===== ONLINE USERS ROTATING TICKER =====
function updateTicker(users) {
  if (!tickerContent) return; // Safety
  tickerContent.innerHTML = "";
  users.forEach(u => {
    const div = document.createElement("div");
    div.className = "tickerUser";
    div.innerHTML = `<img src="${u.photo || '/default.png'}" /> ${u.username}`;
    tickerContent.appendChild(div);
  });
}

// Example call (can replace with real server data)
updateTicker([
  { username: username, photo: photo },
  { username: "Alice", photo: "/default.png" },
  { username: "Bob", photo: "/default.png" }
]);

// ===== SCROLL TO BOTTOM =====
const scrollBtn = document.getElementById("scrollBottom");
chatContainer.addEventListener("scroll", () => {
  scrollBtn.style.display = chatContainer.scrollTop < chatContainer.scrollHeight - chatContainer.clientHeight ? "block" : "none";
});
scrollBtn.onclick = () => { chatContainer.scrollTop = chatContainer.scrollHeight; };

// ===== IMAGE MESSAGE UPLOADER =====
const imageBtn = document.getElementById("imageBtn");
const imageInput = document.getElementById("imageInput");

if (imageBtn && imageInput) {
  imageBtn.onclick = () => imageInput.click();

  imageInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
      const data = {
        username,
        message: "", // optional text with image
        image: evt.target.result,
        time: new Date().toLocaleTimeString()
      };

      // Render locally
      renderMessage(data, true);

      // Send via socket
      socket.emit("chat message", data);
    };

    reader.readAsDataURL(file);
    imageInput.value = "";
  };
}

// ===== PATCH SEND MESSAGE =====
function sendMessage() {
  const text = msgInput.value.trim();
  const file = imageInput.files[0];

  if (!text && !file) return;

  const data = {
    username,
    message: text || "",
    image: null,
    time: new Date().toLocaleTimeString()
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      data.image = evt.target.result;

      renderMessage(data, true);
      socket.emit("chat message", data);
      imageInput.value = "";
    };
    reader.readAsDataURL(file);
  } else {
    renderMessage(data, true);
    socket.emit("chat message", data);
  }

  msgInput.value = "";
}

sendBtn.onclick = sendMessage;
msgInput.onkeydown = e => { if (e.key === "Enter") sendMessage(); };

// ===== CLOSE SETTINGS PANEL =====
const closeSettingsBtn = document.getElementById("closeSettings");
if (closeSettingsBtn) closeSettingsBtn.onclick = () => settingsPanel.style.display = "none";