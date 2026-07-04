// Logic halaman login
// ====================

document.addEventListener("DOMContentLoaded", () => {
  // Generate particles
  generateParticles();

  // Password toggle
  document.getElementById("togglePwd")?.addEventListener("click", () => {
    const pwd = document.getElementById("password");
    const icon = document.getElementById("eyeIcon");
    if (pwd.type === "password") {
      pwd.type = "text";
      icon.className = "fas fa-eye-slash";
    } else {
      pwd.type = "password";
      icon.className = "fas fa-eye";
    }
  });

  // Login form submit
  document.getElementById("loginForm")?.addEventListener("submit", handleLogin);

  // If already logged in, redirect
  try {
    const u = JSON.parse(localStorage.getItem("dailyflow_user"));
    if (u && u.fullName) {
      // Verify with server first
      fetch("check_session.php")
        .then((r) => r.json())
        .then((d) => {
          if (d.loggedIn) location.href = "html/dashboard.html";
        })
        .catch(() => {});
    }
  } catch (e) {}
});

async function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const btn = document.getElementById("loginBtn");
  const errDiv = document.getElementById("errorMsg");
  const errText = document.getElementById("errorText");

  if (!username || !password) {
    showError("Username dan password wajib diisi!");
    return;
  }

  // Loading state
  btn.classList.add("loading");
  btn.innerHTML = `<i class="fas fa-spinner spin"></i> Memverifikasi...`;

  try {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const res = await fetch("login.php", { method: "POST", body: formData });
    const data = await res.json();

    if (data.success) {
      // Save to localStorage
      localStorage.setItem(
        "dailyflow_user",
        JSON.stringify({
          fullName: data.full_name,
          username: data.username,
          id: data.user_id,
        }),
      );

      // Remember me
      if (document.getElementById("rememberMe")?.checked) {
        localStorage.setItem("dailyflow_remember", username);
      } else {
        localStorage.removeItem("dailyflow_remember");
      }

      // Success animation
      btn.innerHTML = `<i class="fas fa-check"></i> Berhasil masuk!`;
      btn.style.background = "linear-gradient(135deg, #10B981, #059669)";

      setTimeout(() => {
        location.href = "dashboard.html";
      }, 800);
    } else {
      showError(data.message || "Username atau password salah!");
      resetBtn();
      // Shake animation
      document.querySelector(".login-left")?.classList.add("shake");
      setTimeout(
        () => document.querySelector(".login-left")?.classList.remove("shake"),
        500,
      );
    }
  } catch (err) {
    showError("Tidak dapat terhubung ke server. Pastikan XAMPP berjalan!");
    resetBtn();
  }
}

function showError(msg) {
  const d = document.getElementById("errorMsg");
  const t = document.getElementById("errorText");
  if (d && t) {
    t.textContent = msg;
    d.classList.add("show");
    setTimeout(() => d.classList.remove("show"), 5000);
  }
}

function resetBtn() {
  const btn = document.getElementById("loginBtn");
  btn.classList.remove("loading");
  btn.innerHTML = `<span class="btn-text">Masuk ke DailyFlow</span><i class="fas fa-arrow-right" id="btnIcon"></i>`;
  btn.style.background = "";
}

// Particle generator
function generateParticles() {
  const container = document.getElementById("particles");
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const size = Math.random() * 8 + 3;
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation-duration: ${Math.random() * 15 + 10}s;
      animation-delay: ${Math.random() * -15}s;
    `;
    container.appendChild(p);
  }
}
