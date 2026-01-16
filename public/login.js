// ===== LOGIN PANEL ELEMENTS =====
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError"); // optional div to show errors

// ===== SIGNUP PANEL ELEMENTS =====
const signupUsername = document.getElementById("signupUsername");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const signupBtn = document.getElementById("signupBtn");
const signupPhotoInput = document.getElementById("signupPhoto"); // new: profile picture input
const signupError = document.getElementById("signupError"); // optional div to show errors

// ===== LOGIN FUNCTION =====
loginBtn.onclick = async (e) => {
  e.preventDefault();
  loginError.textContent = "";

  try {
    const userCredential = await firebase.auth().signInWithEmailAndPassword(
      loginEmail.value.trim(),
      loginPassword.value.trim()
    );

    const user = userCredential.user;

    // Fetch user profile from Firestore
    const doc = await db.collection("users").doc(user.uid).get();
    const userData = doc.exists ? doc.data() : { username: user.email, photo: "/default.png" };

    // Save in localStorage for dashboard
    localStorage.setItem("user", userData.username);
    localStorage.setItem("photo", userData.photo);
    localStorage.setItem("uid", user.uid);

    window.location.href = "/dashboard.html";
  } catch (err) {
    loginError.textContent = err.message;
  }
};

// ===== SIGNUP FUNCTION =====
signupBtn.onclick = async (e) => {
  e.preventDefault();
  signupError.textContent = "";

  if (!signupUsername.value.trim()) {
    signupError.textContent = "Enter a username!";
    return;
  }

  try {
    // Create Firebase user
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(
      signupEmail.value.trim(),
      signupPassword.value.trim()
    );

    const user = userCredential.user;

    // Process profile picture (optional)
    let photoURL = "/default.png";
    if (signupPhotoInput.files[0]) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        photoURL = evt.target.result;

        // Save user profile in Firestore
        await db.collection("users").doc(user.uid).set({
          username: signupUsername.value.trim(),
          email: signupEmail.value.trim(),
          photo: photoURL,
          status: "Online"
        });

        // Save locally
        localStorage.setItem("user", signupUsername.value.trim());
        localStorage.setItem("photo", photoURL);
        localStorage.setItem("uid", user.uid);

        window.location.href = "/dashboard.html";
      };
      reader.readAsDataURL(signupPhotoInput.files[0]);
    } else {
      // Save user profile in Firestore without photo
      await db.collection("users").doc(user.uid).set({
        username: signupUsername.value.trim(),
        email: signupEmail.value.trim(),
        photo: photoURL,
        status: "Online"
      });

      localStorage.setItem("user", signupUsername.value.trim());
      localStorage.setItem("photo", photoURL);
      localStorage.setItem("uid", user.uid);

      window.location.href = "/dashboard.html";
    }
  } catch (err) {
    signupError.textContent = err.message;
  }
};

// ===== OPTIONAL: FORM SWITCHING =====
const loginFormLink = document.getElementById("showLoginForm");
const signupFormLink = document.getElementById("showSignupForm");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

if (loginFormLink && signupFormLink && loginForm && signupForm) {
  loginFormLink.onclick = () => {
    signupForm.style.display = "none";
    loginForm.style.display = "block";
  };
  signupFormLink.onclick = () => {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
  };
}