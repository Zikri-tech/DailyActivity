// ================================================
// FILE: js/dashboard.js
// Logic Dashboard
// ================================================

const QUOTES = [
  {
    text: "Belajar tanpa berpikir adalah sia-sia. Berpikir tanpa belajar adalah berbahaya.",
    author: "Konfusius",
  },
  {
    text: "Pendidikan bukan pengisian ember, melainkan penyalaan api.",
    author: "W.B. Yeats",
  },
  {
    text: "Satu-satunya cara untuk melakukan pekerjaan yang hebat adalah dengan mencintai apa yang kamu lakukan.",
    author: "Steve Jobs",
  },
  {
    text: "Kesuksesan adalah guru yang buruk. Ia membuat orang cerdas berpikir bahwa mereka tidak bisa kalah.",
    author: "Bill Gates",
  },
  {
    text: "Tidak ada elevator menuju kesuksesan. Kamu harus menggunakan tangga.",
    author: "Zig Ziglar",
  },
  {
    text: "Jangan takut gagal. Takutlah saat kamu tidak pernah mencoba.",
    author: "Michael Jordan",
  },
  {
    text: "Investasi terbaik yang bisa kamu lakukan adalah investasi pada dirimu sendiri.",
    author: "Warren Buffett",
  },
  {
    text: "Buku adalah jendela dunia. Membaca adalah kuncinya.",
    author: "Peribahasa",
  },
  {
    text: "Bermimpilah setinggi langit. Jika engkau jatuh, engkau akan jatuh di antara bintang-bintang.",
    author: "Ir. Soekarno",
  },
  {
    text: "Dengan ilmu, hidup menjadi mudah. Dengan seni, hidup menjadi indah. Dengan agama, hidup menjadi terarah.",
    author: "H.A. Mukti Ali",
  },
];

let quoteIdx = Math.floor(Math.random() * QUOTES.length);
let waterCount = 0;

document.addEventListener("DOMContentLoaded", () => {
  // Greeting
  updateGreeting();

  // Hero clock
  startHeroClock();

  // Quote
  loadDailyQuote();
  document.getElementById("quoteRefresh")?.addEventListener("click", nextQuote);

  // Water tracker
  loadWater();
  renderWaterCups();

  // Stats from localStorage
  updateStats();

  // Streak
  updateStreak();
});

// ---- Greeting ----
function updateGreeting() {
  const user = JSON.parse(localStorage.getItem("dailyflow_user") || "{}");
  const now = new Date();
  const h = now.getHours();
  let label = "SELAMAT PAGI";
  let emoji = "☀️";
  if (h >= 11 && h < 15) {
    label = "SELAMAT SIANG";
    emoji = "🌤️";
  } else if (h >= 15 && h < 18) {
    label = "SELAMAT SORE";
    emoji = "🌇";
  } else if (h >= 18 || h < 4) {
    label = "SELAMAT MALAM";
    emoji = "🌙";
  }

  const el = document.getElementById("greetingLabel");
  const nm = document.getElementById("greetingName");
  if (el) el.textContent = label;
  if (nm) nm.textContent = `Halo, ${user.fullName || "Pengguna"}! ${emoji}`;
}

// ---- Hero Clock ----
function startHeroClock() {
  const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const MONTHS = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  function tick() {
    const now = new Date();
    const el = document.getElementById("heroClock");
    const de = document.getElementById("heroDate");
    if (el) el.textContent = now.toTimeString().substring(0, 8);
    if (de)
      de.textContent = `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  }
  tick();
  setInterval(tick, 1000);
}

// ---- Quote ----
function loadDailyQuote() {
  const q = QUOTES[quoteIdx];
  const qt = document.getElementById("quoteText");
  const qa = document.getElementById("quoteAuthor");
  if (qt) qt.textContent = `"${q.text}"`;
  if (qa) qa.textContent = `— ${q.author}`;
}

function nextQuote() {
  quoteIdx = (quoteIdx + 1) % QUOTES.length;
  const qt = document.getElementById("quoteText");
  const qa = document.getElementById("quoteAuthor");
  if (qt) {
    qt.style.opacity = "0";
    setTimeout(() => {
      loadDailyQuote();
      qt.style.opacity = "1";
    }, 200);
  }
  qt?.style.setProperty("transition", "opacity 0.2s ease");
}

// ---- Water Tracker ----
function loadWater() {
  const stored = localStorage.getItem("dailyflow_water");
  if (stored) {
    const data = JSON.parse(stored);
    const today = new Date().toDateString();
    if (data.date === today) waterCount = data.count;
    else waterCount = 0;
  }
}

function saveWater() {
  localStorage.setItem(
    "dailyflow_water",
    JSON.stringify({
      date: new Date().toDateString(),
      count: waterCount,
    }),
  );
  // Sync mini progress
  const fill = document.getElementById("miniWaterFill");
  const txt = document.getElementById("miniWaterText");
  if (fill) fill.style.width = `${(waterCount / 8) * 100}%`;
  if (txt) txt.textContent = `${waterCount} / 8 gelas`;
}

function renderWaterCups() {
  const container = document.getElementById("waterCups");
  const countEl = document.getElementById("waterCount");
  const goalTxt = document.getElementById("waterGoalTxt");
  if (!container) return;

  container.innerHTML = "";
  for (let i = 0; i < 8; i++) {
    const cup = document.createElement("button");
    cup.className = "water-cup" + (i < waterCount ? " filled" : "");
    cup.textContent = "🥤";
    cup.title =
      i < waterCount ? "Klik untuk batalkan" : "Klik untuk catat minum";
    cup.addEventListener("click", () => {
      if (i < waterCount) {
        waterCount = i;
      } else {
        waterCount = i + 1;
      }
      saveWater();
      renderWaterCups();
    });
    container.appendChild(cup);
  }

  if (countEl) countEl.textContent = waterCount;
  const msgs = [
    "Belum ada gelas diminum. Ayo mulai!",
    "Bagus! Sudah minum 1 gelas 💧",
    "Pertahankan! 2 gelas sudah tercapai 💧",
    "Setengah jalan! Terus minum 💧",
    "Sudah 4 gelas! Halfway there! 💪",
    "Luar biasa! 5 gelas sudah 💧",
    "Hampir! 6 dari 8 gelas 🔥",
    "Sedikit lagi! Satu gelas terakhir 💪",
    "✅ Target 8 gelas tercapai! Kamu keren!",
  ];
  if (goalTxt) goalTxt.textContent = msgs[Math.min(waterCount, 8)];
}

// ---- Stats ----
function updateStats() {
  // Study time today
  const sessions = JSON.parse(
    localStorage.getItem("dailyflow_sessions") || "[]",
  );
  const today = new Date().toDateString();
  const todaySec = sessions
    .filter((s) => new Date(s.created).toDateString() === today)
    .reduce((acc, s) => acc + (s.duration || 0), 0);
  const el = document.getElementById("statStudyTime");
  if (el) {
    const h = Math.floor(todaySec / 3600);
    const m = Math.floor((todaySec % 3600) / 60);
    el.textContent = h > 0 ? `${h}j ${m}m` : `${m}m`;
  }

  // Last song
  const lastSong = localStorage.getItem("dailyflow_last_song");
  const sEl = document.getElementById("statSongPlayed");
  if (sEl && lastSong) {
    sEl.textContent =
      lastSong.length > 12 ? lastSong.substring(0, 12) + "…" : lastSong;
  }

  // Todos done today
  const todos = JSON.parse(localStorage.getItem("dailyflow_todos") || "[]");
  const doneN = todos.filter((t) => t.done).length;
  const doneEl = document.getElementById("statTodoDone");
  if (doneEl) doneEl.textContent = doneN;
}

// ---- Streak ----
function updateStreak() {
  const data = JSON.parse(
    localStorage.getItem("dailyflow_streak") || '{"days":1,"last":""}',
  );
  const today = new Date().toDateString();
  const el = document.getElementById("statStreak");
  if (data.last !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const streak = data.last === yesterday.toDateString() ? data.days + 1 : 1;
    localStorage.setItem(
      "dailyflow_streak",
      JSON.stringify({ days: streak, last: today }),
    );
    if (el) el.textContent = streak;
  } else {
    if (el) el.textContent = data.days;
  }
}
