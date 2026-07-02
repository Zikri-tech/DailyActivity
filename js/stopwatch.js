// ================================================
// FILE: js/stopwatch.js
// Logic Stopwatch & Pomodoro
// ================================================

// ---- State ----
let timerInterval = null;
let isRunning = false;
let elapsedSeconds = 0;
let totalSeconds = 0; // 0 = countup (normal mode)
let currentMode = "normal";
let isBreakTime = false;
let pomodoroCount = 0;
let breakSeconds = 0;
let breakInterval = null;

const MODES = {
  normal: { work: 0, break: 0, label: "BELAJAR" },
  pomodoro: { work: 25 * 60, break: 5 * 60, label: "🍅 POMODORO" },
  5010: { work: 50 * 60, break: 10 * 60, label: "⚡ 50/10" },
};

// Circumference of SVG ring (r=95): 2 * π * 95 ≈ 596.9
const RING_C = 596.9;

// ---- DOM ----
const displayEl = () => document.getElementById("timerDisplay");
const labelEl = () => document.getElementById("timerLabel");
const ringEl = () => document.getElementById("ringProgress");
const playBtn = () => document.getElementById("playBtn");
const playIcon = () => document.getElementById("playIcon");
const saveBtn = () => document.getElementById("saveBtn");
const pomoDots = () => document.getElementById("pomodoroDots");

document.addEventListener("DOMContentLoaded", () => {
  renderSessionLog();
  updateTodayStats();
  resetRing();
});

// ---- Mode ----
function setMode(mode) {
  if (isRunning) stopTimer();
  currentMode = mode;

  // Update button styles
  ["modeNormal", "modePomodoro", "mode5010"].forEach((id) => {
    document.getElementById(id)?.classList.remove("active");
  });
  const map = {
    normal: "modeNormal",
    pomodoro: "modePomodoro",
    5010: "mode5010",
  };
  document.getElementById(map[mode])?.classList.add("active");

  // Reset
  elapsedSeconds = 0;
  isBreakTime = false;
  if (mode === "normal") {
    totalSeconds = 0;
    pomoDots().style.display = "none";
  } else {
    totalSeconds = MODES[mode].work;
    pomoDots().style.display = "flex";
  }

  updateDisplay();
  resetRing();
  labelEl().textContent = mode === "normal" ? "SIAP" : MODES[mode].label;
}

// ---- Toggle Timer ----
function toggleTimer() {
  if (isRunning) pauseTimer();
  else startTimer();
}

function startTimer() {
  isRunning = true;
  playIcon().className = "fas fa-pause";
  playBtn().classList.add("running");
  labelEl().textContent = isBreakTime
    ? "☕ ISTIRAHAT"
    : currentMode === "normal"
      ? "BELAJAR"
      : MODES[currentMode].label;

  if (currentMode === "normal") {
    timerInterval = setInterval(() => {
      elapsedSeconds++;
      updateDisplay();
    }, 1000);
  } else {
    // Countdown
    if (elapsedSeconds === 0) {
      elapsedSeconds = totalSeconds;
    }
    timerInterval = setInterval(() => {
      elapsedSeconds--;
      updateDisplay();
      updateRing(elapsedSeconds, totalSeconds);
      if (elapsedSeconds <= 0) {
        clearInterval(timerInterval);
        isRunning = false;
        onSessionComplete();
      }
    }, 1000);
  }
}

function pauseTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  playIcon().className = "fas fa-play";
  playBtn().classList.remove("running");
  labelEl().textContent = "DIJEDA";
  if (elapsedSeconds > 0) saveBtn().disabled = false;
}

function stopTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  playIcon().className = "fas fa-play";
  playBtn().classList.remove("running");
}

function resetTimer() {
  stopTimer();
  elapsedSeconds = 0;
  isBreakTime = false;
  if (currentMode !== "normal") {
    elapsedSeconds = 0;
    totalSeconds = MODES[currentMode].work;
  }
  saveBtn().disabled = true;
  updateDisplay();
  resetRing();
  labelEl().textContent = "SIAP";
}

// ---- Session Complete ----
function onSessionComplete() {
  playIcon().className = "fas fa-play";
  playBtn().classList.remove("running");
  saveBtn().disabled = false;

  if (currentMode !== "normal") {
    pomodoroCount++;
    updatePomoDots();
    showBreakOverlay();
  }
}

// ---- Break ----
function showBreakOverlay() {
  const overlay = document.getElementById("breakOverlay");
  const bt = document.getElementById("breakTimer");
  const bTitle = document.getElementById("breakTitle");
  const bDesc = document.getElementById("breakDesc");
  const bEmoji = document.getElementById("breakEmoji");

  const isLongBreak = pomodoroCount % 4 === 0 && currentMode === "pomodoro";
  const breakDur = isLongBreak ? 15 * 60 : MODES[currentMode].break;

  bEmoji.textContent = isLongBreak ? "🏆" : "🎉";
  bTitle.textContent = isLongBreak ? "Istirahat Panjang!" : "Sesi Selesai!";
  bDesc.textContent = isLongBreak
    ? `Luar biasa! Sudah ${pomodoroCount} sesi. Istirahat 15 menit!`
    : "Waktunya istirahat sejenak. Regangkan tubuhmu!";

  breakSeconds = breakDur;
  bt.textContent = formatTime(breakSeconds);
  overlay?.classList.add("show");
}

function startBreak() {
  document.getElementById("breakStartBtn").disabled = true;
  breakInterval = setInterval(() => {
    breakSeconds--;
    document.getElementById("breakTimer").textContent =
      formatTime(breakSeconds);
    if (breakSeconds <= 0) {
      clearInterval(breakInterval);
      skipBreak();
    }
  }, 1000);
}

function skipBreak() {
  clearInterval(breakInterval);
  document.getElementById("breakOverlay")?.classList.remove("show");
  document.getElementById("breakStartBtn").disabled = false;
  isBreakTime = false;
  elapsedSeconds = 0;
  totalSeconds = MODES[currentMode].work;
  updateDisplay();
  resetRing();
  labelEl().textContent = MODES[currentMode].label;
  playIcon().className = "fas fa-play";
  playBtn().classList.remove("running");
}

// ---- Pomodoro Dots ----
function updatePomoDots() {
  document.querySelectorAll(".pomo-dot").forEach((dot, i) => {
    const n = pomodoroCount % 4;
    dot.classList.remove("done", "current");
    if (i < n) dot.classList.add("done");
    if (i === n && n < 4) dot.classList.add("current");
  });
}

// ---- Display ----
function updateDisplay() {
  const el = displayEl();
  if (!el) return;
  if (currentMode === "normal") {
    el.textContent = formatTime(elapsedSeconds);
  } else {
    el.textContent = formatTime(Math.max(0, elapsedSeconds));
  }
  if (currentMode === "normal" && elapsedSeconds > 0) {
    saveBtn().disabled = false;
  }
}

function formatTime(sec) {
  const s = Math.max(0, sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

// ---- SVG Ring ----
function updateRing(current, total) {
  const ring = ringEl();
  if (!ring || total === 0) return;
  const progress = current / total;
  ring.style.strokeDashoffset = RING_C * (1 - progress);
}

function resetRing() {
  const ring = ringEl();
  if (!ring) return;
  if (currentMode === "normal") {
    ring.style.strokeDashoffset = 0;
  } else {
    ring.style.strokeDashoffset = 0; // Full ring = ready
  }
}

// ---- Save Modal ----
function openSaveModal() {
  if (isRunning) pauseTimer();
  const dur =
    currentMode === "normal" ? elapsedSeconds : totalSeconds - elapsedSeconds;
  document.getElementById("saveDuration").textContent = formatTime(
    Math.abs(dur > 0 ? dur : elapsedSeconds),
  );
  document.getElementById("saveSubject").value =
    document.getElementById("subjectSelect")?.value || "Umum";
  document.getElementById("saveNotes").value = "";
  document.getElementById("saveModal")?.classList.add("open");
}

function closeSaveModal() {
  document.getElementById("saveModal")?.classList.remove("open");
}

function saveSession() {
  const dur = currentMode === "normal" ? elapsedSeconds : totalSeconds;
  if (dur < 10) {
    showToast("Durasi terlalu singkat!", "warning");
    return;
  }

  const session = {
    id: Date.now().toString(),
    subject: document.getElementById("saveSubject")?.value || "Umum",
    notes: document.getElementById("saveNotes")?.value || "",
    duration: dur,
    mode: currentMode,
    created: new Date().toISOString(),
  };

  const sessions = JSON.parse(
    localStorage.getItem("dailyflow_sessions") || "[]",
  );
  sessions.unshift(session);
  localStorage.setItem("dailyflow_sessions", JSON.stringify(sessions));

  closeSaveModal();
  resetTimer();
  renderSessionLog();
  updateTodayStats();
  showToast(
    `✅ Sesi "${session.subject}" berhasil disimpan! (${formatTime(session.duration)})`,
    "success",
  );
}

// ---- Session Log ----
function renderSessionLog() {
  const container = document.getElementById("sessionLog");
  if (!container) return;
  const sessions = JSON.parse(
    localStorage.getItem("dailyflow_sessions") || "[]",
  );

  if (sessions.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⏰</div>
        <h3>Belum ada sesi</h3>
        <p>Mulai timer dan simpan sesimu untuk melihat log di sini.</p>
      </div>`;
    return;
  }

  const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  container.innerHTML = sessions
    .map((s) => {
      const dt = new Date(s.created);
      const label = `${DAYS[dt.getDay()]}, ${dt.getDate()}/${dt.getMonth() + 1} · ${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
      return `
      <div class="log-item">
        <div class="log-item-icon"><i class="fas fa-book-open"></i></div>
        <div class="log-item-info">
          <div class="log-item-subject">${s.subject}</div>
          <div class="log-item-meta">${label}${s.mode !== "normal" ? ` · ${s.mode}` : ""}</div>
        </div>
        <div class="log-item-duration">${formatTime(s.duration)}</div>
        <i class="fas fa-trash log-item-del" onclick="deleteSession('${s.id}')"></i>
      </div>`;
    })
    .join("");
}

function deleteSession(id) {
  let sessions = JSON.parse(localStorage.getItem("dailyflow_sessions") || "[]");
  sessions = sessions.filter((s) => s.id !== id);
  localStorage.setItem("dailyflow_sessions", JSON.stringify(sessions));
  renderSessionLog();
  updateTodayStats();
  showToast("Sesi dihapus", "warning");
}

function clearAllSessions() {
  if (!confirm("Hapus semua log sesi?")) return;
  localStorage.removeItem("dailyflow_sessions");
  renderSessionLog();
  updateTodayStats();
  showToast("Semua sesi dihapus", "warning");
}

function updateTodayStats() {
  const sessions = JSON.parse(
    localStorage.getItem("dailyflow_sessions") || "[]",
  );
  const today = new Date().toDateString();
  const todaySes = sessions.filter(
    (s) => new Date(s.created).toDateString() === today,
  );
  const totalSec = todaySes.reduce((a, s) => a + s.duration, 0);

  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const display = h > 0 ? `${h}j ${m}m` : `${m}m`;

  const ts = document.getElementById("totalStudyToday");
  const tc = document.getElementById("totalSessionsToday");
  if (ts) ts.textContent = display;
  if (tc) tc.textContent = todaySes.length;
}
