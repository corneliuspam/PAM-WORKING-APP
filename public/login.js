// ===== DOM ELEMENTS =====
const usernameInput = document.getElementById("username");
const photoInput = document.getElementById("photo");
const previewImg = document.getElementById("preview");

// Optional: error display (you can add a div with id="loginError" in HTML)
const loginError = document.getElementById("loginError");

// ===== PROFILE PREVIEW =====
photoInput.onchange = () => {
  const file = photoInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    previewImg.src = evt.target.result;
  };
  reader.readAsDataURL(file);
};

// ===== LOGIN / SIGNUP FUNCTION =====
async function login() {
  const emailOrUsername = usernameInput.value.trim();
  if (!emailOrUsername) {
    alert("Please enter email or username");
    return;
  }

  // Check if a file is uploaded
  const file = photoInput.files[0];

  try {
    // ===== SIGNUP OR LOGIN LOGIC =====
    let userCredential;

    // Try to sign in first
    try {
      userCredential = await auth.signInWithEmailAndPassword(emailOrUsername, "defaultPassword123!");
    } catch (err) {
      // If user doesn't exist, create account
      if (err.code === "auth/user-not-found") {
        // Create account with email/password
        userCredential = await auth.createUserWithEmailAndPassword(emailOrUsername, "defaultPassword123!");
      } else {
        throw err; // Other errors
      }
    }

    const user = userCredential.user;

    let photoURL = "/default.png"; // default image if none uploaded

    // ===== UPLOAD PROFILE PHOTO =====
    if (file) {
      const storageRef = storage.ref(`profilePhotos/${user.uid}`);
      await storageRef.put(file);
      photoURL = await storageRef.getDownloadURL();
    }

    // ===== SAVE USER INFO TO FIRESTORE =====
    await db.collection("users").doc(user.uid).set({
      username: emailOrUsername,
      email: emailOrUsername,
      photo: photoURL,
      status: "Hey there! I am using PAM App.",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // ===== SAVE TO LOCALSTORAGE =====
    localStorage.setItem("user", emailOrUsername);
    localStorage.setItem("photo", photoURL);
    localStorage.setItem("userStatus", "Hey there! I am using PAM App.");

    // Redirect to dashboard
    window.location.href = "/dashboard.html";

  } catch (err) {
    console.error(err);
    if (loginError) {
      loginError.textContent = err.message;
      loginError.style.display = "block";
    } else {
      alert(err.message);
    }
  }
}