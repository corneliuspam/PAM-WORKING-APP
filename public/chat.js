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

// Open private chat when clicking either floating button or message button
const privateChatBtn = document.getElementById("privateChatBtn");
const startPrivateChatBtn = document.getElementById("startPrivateChat");

// Open private chat when clicking either floating button or message button
const privateChatBtn = document.getElementById("privateChatBtn");
const startPrivateChatBtn = document.getElementById("startPrivateChat");

function openPrivateChat() {
  const targetUser = localStorage.getItem("activePrivateUser");
  if (!targetUser) {
    alert("Select a user first!");
    return;
  }
  window.location.href = `/private-chat.html?user=${encodeURIComponent(targetUser)}`;
}

// Floating icon
if (privateChatBtn) privateChatBtn.addEventListener("click", openPrivateChat);

// Message button in profile modal
if (startPrivateChatBtn) startPrivateChatBtn.addEventListener("click", openPrivateChat);

// ===== USER DATA =====
let username = localStorage.getItem("user");
let photo = localStorage.getItem("photo");

// ===== PROFILE DATA (SAFE ADDITION) =====
const profileData = {
  username: username,
  photo: photo,
  status: localStorage.getItem("profileStatus") || "Hey there! I am using PAM App.",
  online: true
};

// ===== SAFETY CHECK =====
if (!username) window.location.href = "/";

// ===== INITIAL LOAD =====
window.addEventListener("load", () => {
  document.getElementById("usernameDisplay").textContent = username;
  document.getElementById("userPic").src = photo;
  document.getElementById("status").textContent = "● Online";
});

// ===== MESSAGE RENDER FUNCTION =====
function renderMessage(data, isMe) {
  const wrapper = document.createElement("div");
  wrapper.className = isMe ? "me" : "other";

  let contentHTML = `<span>${data.message}</span>`;
  if (data.image) contentHTML += `<br><img src="${data.image}" class="msgImage" />`;

  wrapper.innerHTML = `
    <img 
  class="avatar"
  src="${isMe ? photo : (data.photo || photo)}"
  data-username="${data.username}"
  data-photo="${data.photo || photo}"
  data-status="${data.status || 'Hey there! I am using PAM App.'}"
/>
    <div class="bubble">${contentHTML}<small class="time">${data.time}</small></div>
  `;

  // DELETE BUTTON FOR SELF
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
    image: null,
    time: new Date().toLocaleTimeString()
  };

  renderMessage(data, true);
  socket.emit("chat message", data);
  msgInput.value = "";
}

// ===== EVENTS =====
sendBtn.addEventListener("click", sendMessage);
msgInput.addEventListener("keydown", e => { if (e.key === "Enter") sendMessage(); });

// ===== RECEIVE MESSAGE =====
socket.on("chat message", data => {
  if (data.username === username) return;
  renderMessage(data, false);
});

// ===== DARK MODE =====
themeToggle.onclick = () => document.body.classList.toggle("light");

// ===== ABOUT MODAL =====
aboutBtn.onclick = () => aboutModal.style.display = "flex";
closeAbout.onclick = () => aboutModal.style.display = "none";
window.onclick = e => { if (e.target === aboutModal) aboutModal.style.display = "none"; };

// ===== PROFILE MODAL =====
const profileModal = document.getElementById("profileModal");
const profileName = document.getElementById("profileName");
const profilePicLarge = document.getElementById("profilePicLarge");
const profileStatus = document.getElementById("profileStatus");
const closeProfile = document.getElementById("closeProfile");

document.getElementById("userPic").addEventListener("click", () => {
  profilePicLarge.src = profileData.photo;
  profileName.textContent = profileData.username;
  profileStatus.textContent = profileData.status;
  profileModal.style.display = "flex";

  // mark self profile
  localStorage.setItem("activePrivateUser", profileData.username);
});
closeProfile.addEventListener("click", () => profileModal.style.display = "none");
window.addEventListener("click", e => { if (e.target === profileModal) profileModal.style.display = "none"; });

// ===== OPEN OTHER USER PROFILE (SAFE, FUTURE USE) =====
function openUserProfile(user) {
  profilePicLarge.src = user.photo;
  profileName.textContent = user.username;
  profileStatus.textContent = user.status || "No status";
  profileModal.style.display = "flex";

  localStorage.setItem("activePrivateUser", user.username);
}

// ===== PROFILE BIO =====
(function () {
  const bioText = document.getElementById("profileBio");
  const editBtn = document.getElementById("editBioBtn");
  const bioEditor = document.getElementById("bioEditor");
  const bioInput = document.getElementById("bioInput");
  const saveBio = document.getElementById("saveBioBtn");

  if (!bioText || !editBtn) return;

  const savedBio = localStorage.getItem("profileBio") || "Hey there! I am using PAM App.";
  bioText.textContent = savedBio;

  editBtn.onclick = () => { bioEditor.style.display = "block"; bioInput.value = bioText.textContent; };
  saveBio.onclick = () => {
    const bio = bioInput.value.trim() || "Hey there! I am using PAM App.";
    localStorage.setItem("profileBio", bio);
    bioText.textContent = bio;
    bioEditor.style.display = "none";
  };
})();

// ===== ONLINE USERS LIST =====
const onlineList = document.getElementById("onlineList");
function updateOnlineUsers(users) {
  onlineList.innerHTML = "";
  users.forEach(u => {
    const li = document.createElement("li");
    li.textContent = u;
    onlineList.appendChild(li);
  });
}

// ===== ACTIVE USERS TICKER =====
function updateTicker(users) {
  tickerContent.innerHTML = "";
  users.forEach(u => {
    const div = document.createElement("div");
    div.className = "tickerUser";
    div.innerHTML = `<img src="${u.photo || '/default.png'}" /> ${u.username}`;
    tickerContent.appendChild(div);
  });
}

// ===== SAMPLE ACTIVE USERS =====
updateTicker([
  { username: username, photo: photo },
  { username: "Alice", photo: "/default.png" },
  { username: "Bob", photo: "/default.png" }
]);

// ===== USER STATUS TOGGLE =====
const statusToggle = document.getElementById("statusToggle");
const statusDisplay = document.getElementById("status");
statusToggle.addEventListener("change", () => { statusDisplay.textContent = `● ${statusToggle.value}`; });

// ===== SCROLL TO BOTTOM BUTTON =====
const scrollBtn = document.getElementById("scrollBottom");
chatContainer.addEventListener("scroll", () => {
  scrollBtn.style.display = chatContainer.scrollTop < chatContainer.scrollHeight - chatContainer.clientHeight ? "block" : "none";
});
scrollBtn.addEventListener("click", () => chatContainer.scrollTop = chatContainer.scrollHeight);

// ===== SETTINGS MODAL =====
const settingsModal = document.getElementById("settingsModal");
document.getElementById("settingsBtn").addEventListener("click", () => { settingsModal.style.display = "flex"; });
document.getElementById("closeSettings").addEventListener("click", () => { settingsModal.style.display = "none"; });

// LOGOUT
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "/";
});

// CHANGE USERNAME
document.getElementById("changeUsernameBtn").addEventListener("click", () => {
  const newName = document.getElementById("newUsername").value.trim();
  if (!newName) return;
  localStorage.setItem("user", newName);
  username = newName;
  document.getElementById("usernameDisplay").textContent = newName;
  alert("Username updated!");
  settingsModal.style.display = "none";
});

// ===== PROFILE STATUS & PHOTO IN SETTINGS =====
const statusInput = document.getElementById("statusInput");
const photoInput = document.getElementById("photoInput");

// Open settings: fill current values
openSettings.onclick = () => {
  settingsPanel.style.display = "flex";
  statusInput.value = localStorage.getItem("userStatus") || "";
  document.getElementById("usernameInput").value = localStorage.getItem("user") || "";
};

// Save status instantly
statusInput.addEventListener("input", () => {
  localStorage.setItem("userStatus", statusInput.value);
  document.getElementById("status").textContent = `● ${statusInput.value || 'Online'}`;
  document.getElementById("profileStatus").textContent = statusInput.value || 'Online';
});

// Change profile picture
photoInput.onchange = () => {
  const file = photoInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    localStorage.setItem("photo", reader.result);
    document.getElementById("userPic").src = reader.result;
    document.getElementById("profilePicLarge").src = reader.result;
  };
  reader.readAsDataURL(file);
};

// ===== IMAGE UPLOADER =====
const imageBtn = document.getElementById("imageBtn");
const imageInput = document.getElementById("imageInput");

// Open file selector
imageBtn.addEventListener("click", () => {
  imageInput.click();
});

// When user selects image
imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const base64 = evt.target.result;

    const data = {
      username,
      message: "", // optional text with image
      image: base64,
      time: new Date().toLocaleTimeString()
    };

    // Render locally
    renderMessage(data, true);

    // Send via socket
    socket.emit("chat message", data);
  };

  reader.readAsDataURL(file);

  // Clear input for next image
  imageInput.value = "";
});

// ===== PROFILE → PRIVATE CHAT ENTRY (SAFE BIND) =====
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "startPrivateChat") {
    const targetUser = localStorage.getItem("activePrivateUser");

    if (!targetUser || targetUser === profileData.username) return;

    window.location.href = "/private-chat.html";
  }
});

// ===== OPEN PRIVATE CHAT =====
document.addEventListener("click", (e) => {
  // Profile Message button
  if (e.target.id === "startPrivateChat") {
    const targetUser = localStorage.getItem("activePrivateUser");
    if (!targetUser) return;

    window.location.href = "/private-chat.html";
  }

  // Floating private chat icon
  if (e.target.id === "privateChatBtn") {
    window.location.href = "/private-chat.html";
  }
});

// ===== OPEN PROFILE FROM MESSAGE AVATAR =====
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("avatar") && e.target.dataset.username) {
    const user = {
      username: e.target.dataset.username,
      photo: e.target.dataset.photo,
      status: e.target.dataset.status
    };

    openUserProfile(user);
      // ✅ Store active user for private chat
    localStorage.setItem("activePrivateUser", user.username);
  }
});

// Open modal when clicking avatar
document.getElementById("userPic").addEventListener("click", () => {
  profilePicLarge.src = localStorage.getItem("photo");
  profileName.textContent = localStorage.getItem("user");
  profileStatus.textContent = localStorage.getItem("userStatus") || "Online";
  profileModal.style.display = "flex";

  // ✅ Store active private user for message button
  localStorage.setItem("activePrivateUser", localStorage.getItem("user"));
});

// ===== FLOATING PRIVATE CHAT DASHBOARD =====
const privateChatBtn = document.getElementById("privateChatBtn");

if (privateChatBtn) {
  privateChatBtn.onclick = () => {
    window.location.href = "/private-chat.html";
  };
}

const saveSettingsBtn = document.getElementById("saveSettingsBtn");

saveSettingsBtn.onclick = () => {
  // Save status
  const status = statusInput.value.trim();
  localStorage.setItem("userStatus", status);
  document.getElementById("status").textContent = `● ${status || 'Online'}`;
  document.getElementById("profileStatus").textContent = status || 'Online';

  // Save profile photo (if user has uploaded a new one)
  const photoFile = photoInput.files[0];
  if (photoFile) {
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem("photo", reader.result);
      document.getElementById("userPic").src = reader.result;
      document.getElementById("profilePicLarge").src = reader.result;
      alert("Settings saved!");
      settingsPanel.style.display = "none";
    };
    reader.readAsDataURL(photoFile);
  } else {
    alert("Settings saved!");
    settingsPanel.style.display = "none";
  }
};

document.addEventListener("click", (e) => {
  if (e.target.id === "startPrivateChat" || e.target.id === "privateChatBtn") {
    const targetUser = localStorage.getItem("activePrivateUser");
    if (!targetUser) {
      alert("No user selected to chat with!");
      return;
    }
    window.location.href = "/private-chat.html";
  }
});

// ===== OPEN PROFILE MODAL & STORE ACTIVE PRIVATE USER =====
function openUserProfile(user) {
  profilePicLarge.src = user.photo || photo;
  profileName.textContent = user.username;
  profileStatus.textContent = user.status || "Online";
  profileModal.style.display = "flex";

  // Store active user for private chat
  localStorage.setItem("activePrivateUser", user.username);
}

// ===== CLICK AVATAR IN CHAT TO OPEN PROFILE =====
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("avatar") && e.target.dataset.username) {
    const user = {
      username: e.target.dataset.username,
      photo: e.target.dataset.photo || photo,
      status: e.target.dataset.status || "Hey there! I am using PAM App."
    };
    openUserProfile(user);
  }
});

// ===== CLICK MESSAGE BUTTON OR FLOATING ICON TO OPEN PRIVATE CHAT =====
document.addEventListener("click", (e) => {
  if (e.target.id === "startPrivateChat" || e.target.id === "privateChatBtn") {
    const targetUser = localStorage.getItem("activePrivateUser");
    if (!targetUser) {
      alert("Select a user first!");
      return;
    }
    // Optionally pass the username as query string
    window.location.href = `/private-chat.html?user=${encodeURIComponent(targetUser)}`;
  }
});

// ===== SETTINGS PANEL: SAVE PROFILE STATUS AND PHOTO =====
const saveSettingsBtn = document.getElementById("saveSettingsBtn");

saveSettingsBtn.onclick = () => {
  // Save status
  const status = statusInput.value.trim();
  localStorage.setItem("userStatus", status);
  document.getElementById("status").textContent = `● ${status || 'Online'}`;
  document.getElementById("profileStatus").textContent = status || 'Online';

  // Save profile photo if uploaded
  const photoFile = photoInput.files[0];
  if (photoFile) {
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem("photo", reader.result);
      document.getElementById("userPic").src = reader.result;
      document.getElementById("profilePicLarge").src = reader.result;
      alert("Settings saved!");
      settingsPanel.style.display = "none";
    };
    reader.readAsDataURL(photoFile);
  } else {
    alert("Settings saved!");
    settingsPanel.style.display = "none";
  }
};

// ===== OPEN SETTINGS PANEL =====
openSettings.onclick = () => {
  settingsPanel.style.display = "flex";
  statusInput.value = localStorage.getItem("userStatus") || "";
  document.getElementById("usernameInput").value = localStorage.getItem("user") || "";
};