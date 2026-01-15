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

// ===== USER DATA =====
const username = localStorage.getItem("user");
const photo = localStorage.getItem("photo");

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
    <img class="avatar" src="${photo}" />
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
    image: null, // optionally set image URL
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
  profilePicLarge.src = photo;
  profileName.textContent = username;
  profileStatus.textContent = "Online";
  profileModal.style.display = "flex";
});
closeProfile.addEventListener("click", () => profileModal.style.display = "none");
window.addEventListener("click", e => { if (e.target === profileModal) profileModal.style.display = "none"; });

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

// ===== SAMPLE: simulate active users =====
updateTicker([{username,'Alice',photo:'/default.png'}, {username,'Bob',photo:'/default.png'}, {username,photo}]);

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
  document.getElementById("usernameDisplay").textContent = newName;
  alert("Username updated!");
  settingsModal.style.display = "none";
});