function login() {
  const username = document.getElementById("username").value;
  const photo = document.getElementById("photo").files[0];

  if (!username || !photo) return alert("Enter username and upload a photo");

  const reader = new FileReader();
  reader.onload = () => {
    localStorage.setItem("user", username);
    localStorage.setItem("photo", reader.result);
    window.location.href = "/dashboard";
  };
  reader.readAsDataURL(photo);
}
