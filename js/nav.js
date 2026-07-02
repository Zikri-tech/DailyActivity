/* ================================================
   FILE: js/nav.js  — Navbar + Bottom Nav + Session
   ================================================ */

/* ── DESKTOP NAVBAR INNER HTML ─────────────────── */
const TOPBAR_INNER = `
  <!-- Brand -->
  <a class="tb-brand" href="dashboard.html">
    <div class="tb-logo">
      <i class="fas fa-bolt"></i>
    </div>
    <span class="tb-name">Daily<strong>Flow</strong></span>
  </a>

  <!-- Nav Links (desktop center) -->
  <div class="tb-links" id="tbLinks">
    <a class="tb-link" href="dashboard.html" data-page="dashboard">
      <i class="fas fa-home"></i><span>Dashboard</span>
    </a>
    <a class="tb-link" href="stopwatch.html" data-page="stopwatch">
      <i class="fas fa-stopwatch"></i><span>Stopwatch</span>
    </a>
    <a class="tb-link" href="music.html" data-page="music">
      <i class="fas fa-headphones-alt"></i><span>Musik</span>
    </a>
    <a class="tb-link" href="schedule.html" data-page="schedule">
      <i class="fas fa-calendar-alt"></i><span>Jadwal</span>
    </a>
    <a class="tb-link" href="todo.html" data-page="todo">
      <i class="fas fa-tasks"></i><span>To-Do</span>
    </a>
  </div>

  <!-- Right side -->
  <div class="tb-end">
    <!-- Live Clock (hidden on mobile) -->
    <div class="tb-clock" id="tbClock">
      <span class="tb-clock-time" id="tbClockTime">00:00:00</span>
      <span class="tb-clock-date" id="tbClockDate">—</span>
    </div>

    <!-- Separator -->
    <div class="tb-sep"></div>

    <!-- User Avatar + Dropdown -->
    <div class="tb-user" id="tbUser">
      <button class="tb-avatar" id="tbAvatar"
              onclick="toggleDropdown(event)" aria-label="Menu akun">
        <span id="tbInitials">?</span>
      </button>
      <div class="tb-dropdown" id="tbDropdown">
        <div class="tdd-head">
          <div class="tdd-name" id="tddName">Pengguna</div>
          <div class="tdd-un"   id="tddUn">@username</div>
        </div>
        <div class="tdd-rule"></div>
        <a  class="tdd-item" href="dashboard.html">
          <i class="fas fa-home"></i> Dashboard
        </a>
        <div class="tdd-rule"></div>
        <div class="tdd-item tdd-danger" onclick="doLogout()">
          <i class="fas fa-sign-out-alt"></i> Keluar
        </div>
      </div>
    </div>
  </div>
`;

/* ── MOBILE BOTTOM NAV INNER HTML ──────────────── */
const BOTTOM_NAV_HTML = `
  <a class="bn-item" href="dashboard.html" data-page="dashboard">
    <i class="fas fa-home"></i><span>Home</span>
  </a>
  <a class="bn-item" href="stopwatch.html" data-page="stopwatch">
    <i class="fas fa-stopwatch"></i><span>Timer</span>
  </a>
  <a class="bn-item" href="music.html" data-page="music">
    <i class="fas fa-headphones-alt"></i><span>Musik</span>
  </a>
  <a class="bn-item" href="schedule.html" data-page="schedule">
    <i class="fas fa-calendar-alt"></i><span>Jadwal</span>
  </a>
  <a class="bn-item" href="todo.html" data-page="todo">
    <i class="fas fa-tasks"></i><span>To-Do</span>
  </a>
`;

/* ── INIT ───────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  buildNavbar();
  buildBottomNav();
  markActivePage();
  startClock();
  checkSession();
});

function buildNavbar() {
  const nav = document.getElementById("navbar");
  if (nav) {
    nav.className = "topbar";
    nav.innerHTML = TOPBAR_INNER;
  }
  /* Hide old mobileNav div — no longer used */
  const old = document.getElementById("mobileNav");
  if (old) old.style.display = "none";
}

function buildBottomNav() {
  /* Inject bottom nav into <body> once */
  if (document.getElementById("bottomNav")) return;
  const bn = document.createElement("nav");
  bn.id = "bottomNav";
  bn.className = "bottom-nav";
  bn.innerHTML = BOTTOM_NAV_HTML;
  document.body.appendChild(bn);
}

/* ── Active Page Highlight ──────────────────────── */
function markActivePage() {
  const raw = location.pathname.split("/").pop();
  const page = raw.replace(".html", "") || "dashboard";

  /* Desktop links */
  document.querySelectorAll(".tb-link[data-page]").forEach((l) => {
    l.classList.toggle("active", l.dataset.page === page);
  });
  /* Bottom nav */
  document.querySelectorAll(".bn-item[data-page]").forEach((l) => {
    l.classList.toggle("active", l.dataset.page === page);
  });
}

/* ── Clock ──────────────────────────────────────── */
function startClock() {
  const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const MONS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agt",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  function tick() {
    const n = new Date();
    const hms = n.toTimeString().substring(0, 8);
    const dmy = `${DAYS[n.getDay()]}, ${n.getDate()} ${MONS[n.getMonth()]} ${n.getFullYear()}`;
    const te = document.getElementById("tbClockTime");
    const de = document.getElementById("tbClockDate");
    if (te) te.textContent = hms;
    if (de) de.textContent = dmy;
  }
  tick();
  setInterval(tick, 1000);
}

/* ── User Dropdown ──────────────────────────────── */
function toggleDropdown(e) {
  e.stopPropagation();
  document.getElementById("tbDropdown")?.classList.toggle("open");
}
document.addEventListener("click", () => {
  document.getElementById("tbDropdown")?.classList.remove("open");
});

function setNavUser(user) {
  const initials = (user.fullName || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
  const av = document.getElementById("tbInitials");
  const name = document.getElementById("tddName");
  const un = document.getElementById("tddUn");
  if (av) av.textContent = initials;
  if (name) name.textContent = user.fullName || "Pengguna";
  if (un) un.textContent = "@" + (user.username || "user");
}

/* ── Session Guard ──────────────────────────────── */
function checkSession() {
  const local = getLocalUser();
  if (local) setNavUser(local);

  fetch("check_session.php")
    .then((r) => r.json())
    .then((d) => {
      if (!d.loggedIn) {
        clearLocalUser();
        location.href = "index.html";
      } else {
        const u = {
          fullName: d.full_name,
          username: d.username,
          id: d.user_id,
        };
        saveLocalUser(u);
        setNavUser(u);
      }
    })
    .catch(() => {
      /* Offline fallback */
      if (!getLocalUser()) location.href = "index.html";
    });
}

/* ── Logout ─────────────────────────────────────── */
function doLogout() {
  clearLocalUser();
  location.href = "logout.php";
}

/* ── localStorage helpers ───────────────────────── */
function saveLocalUser(u) {
  localStorage.setItem("dailyflow_user", JSON.stringify(u));
}
function getLocalUser() {
  try {
    return JSON.parse(localStorage.getItem("dailyflow_user"));
  } catch {
    return null;
  }
}
function clearLocalUser() {
  localStorage.removeItem("dailyflow_user");
}

/* ── Global Toast (available to all pages) ───────── */
window.showToast = function (msg, type = "success", ms = 3200) {
  let stack = document.getElementById("toastStack");
  if (!stack) {
    stack = document.createElement("div");
    stack.id = "toastStack";
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }
  const icons = {
    success: "fa-check-circle",
    error: "fa-times-circle",
    warning: "fa-exclamation-triangle",
  };
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.innerHTML = `
    <i class="fas ${icons[type] || icons.success} toast-ico"></i>
    <span class="toast-msg">${msg}</span>
    <button class="toast-x" onclick="this.closest('.toast').remove()">
      <i class="fas fa-times"></i>
    </button>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateX(16px)";
    setTimeout(() => el.remove(), 320);
  }, ms);
};
