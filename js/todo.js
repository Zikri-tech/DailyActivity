// ================================================
// FILE: js/todo.js
// Logic To-Do List
// ================================================

let todos = [];
let currentFilter = "all";
let selectedPriority = "medium";

const STORAGE_KEY = "dailyflow_todos";

document.addEventListener("DOMContentLoaded", () => {
  load();
  renderList();
  updateStats();
  setTodayAsMinDate();
  // Enter to add
  document.getElementById("taskInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.ctrlKey) addTodo();
  });
});

// ---- Load / Save ----
function load() {
  try {
    todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    todos = [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// ---- Priority ----
function setPriority(p) {
  selectedPriority = p;
  document.querySelectorAll(".priority-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.p === p);
  });
}

// ---- Add Todo ----
function addTodo() {
  const input = document.getElementById("taskInput");
  const task = input?.value.trim();
  if (!task) {
    showToast("Tulis deskripsi tugas terlebih dahulu!", "warning");
    input?.focus();
    return;
  }

  const dueDate = document.getElementById("dueInput")?.value || null;

  todos.unshift({
    id: Date.now().toString(),
    task,
    priority: selectedPriority,
    done: false,
    dueDate,
    created: new Date().toISOString(),
  });

  save();
  if (input) input.value = "";
  renderList();
  updateStats();
  showToast("✅ Tugas berhasil ditambahkan!", "success");
}

// ---- Toggle Done ----
function toggleDone(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;
  todo.done = !todo.done;
  save();
  renderList();
  updateStats();
  if (todo.done) showToast("🎉 Tugas selesai! Keren!", "success", 2000);
}

// ---- Delete ----
function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  save();
  renderList();
  updateStats();
  showToast("Tugas dihapus", "warning", 2000);
}

// ---- Filter ----
function setFilter(f) {
  currentFilter = f;
  document.querySelectorAll(".filter-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.f === f);
  });
  renderList();
}

function getFiltered() {
  const today = new Date().toDateString();
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  switch (currentFilter) {
    case "today":
      return todos.filter(
        (t) =>
          !t.done &&
          t.dueDate &&
          new Date(t.dueDate + "T00:00:00").toDateString() === today,
      );
    case "high":
      return todos.filter((t) => !t.done && t.priority === "high");
    case "done":
      return todos.filter((t) => t.done);
    case "overdue":
      return todos.filter(
        (t) =>
          !t.done && t.dueDate && new Date(t.dueDate + "T00:00:00") < todayDate,
      );
    default:
      return todos;
  }
}

// ---- Render ----
function renderList() {
  const container = document.getElementById("todoList");
  if (!container) return;
  const list = getFiltered();

  if (list.length === 0) {
    const msgs = {
      all: ["📭", "Belum ada tugas", "Tambahkan tugas pertamamu!"],
      today: [
        "📅",
        "Tidak ada tugas hari ini",
        "Jadwalkan tugas dengan deadline hari ini.",
      ],
      high: ["🟢", "Tidak ada tugas prioritas tinggi", "Semua aman!"],
      done: ["✅", "Belum ada yang selesai", "Yuk selesaikan tugasmu!"],
      overdue: ["⚠️", "Tidak ada tugas terlambat", "Bagus! Semua tepat waktu."],
    };
    const m = msgs[currentFilter] || msgs.all;
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">${m[0]}</div>
        <h3>${m[1]}</h3>
        <p>${m[2]}</p>
      </div>`;
    return;
  }

  // Sort: high priority first, then by date
  const sorted = [...list].sort((a, b) => {
    const pOrder = { high: 0, medium: 1, low: 2 };
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (pOrder[a.priority] !== pOrder[b.priority])
      return pOrder[a.priority] - pOrder[b.priority];
    return new Date(b.created) - new Date(a.created);
  });

  container.innerHTML = sorted.map((t) => renderItem(t)).join("");
}

function renderItem(t) {
  const dueLbl = getDueLabel(t.dueDate);
  const pBadge = { high: "🔴 Tinggi", medium: "🟡 Sedang", low: "🟢 Rendah" };
  return `
    <div class="todo-item priority-${t.priority} ${t.done ? "done" : ""}" id="item-${t.id}">
      <div class="todo-check-wrap">
        <div class="todo-check ${t.done ? "checked" : ""}" onclick="toggleDone('${t.id}')">
          ${t.done ? '<i class="fas fa-check"></i>' : ""}
        </div>
      </div>
      <div class="todo-body">
        <div class="todo-task">${escapeHtml(t.task)}</div>
        <div class="todo-meta">
          <span class="badge badge-${priorityBadgeClass(t.priority)}">${pBadge[t.priority]}</span>
          ${dueLbl}
        </div>
      </div>
      <div class="todo-actions">
        <button class="todo-action-btn" onclick="deleteTodo('${t.id}')" title="Hapus">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>`;
}

// ---- Stats ----
function updateStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const total = todos.length;
  const done = todos.filter((t) => t.done).length;
  const pending = todos.filter((t) => !t.done).length;
  const overdue = todos.filter(
    (t) => !t.done && t.dueDate && new Date(t.dueDate + "T00:00:00") < today,
  ).length;

  document.getElementById("statTotal")?.setAttribute("textContent", total) ||
    setTextContent("statTotal", total);
  setTextContent("statDone", done);
  setTextContent("statPending", pending);
  setTextContent("statOverdue", overdue);
}

function setTextContent(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ---- Helpers ----
function getDueLabel(dueDate) {
  if (!dueDate) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  const diff = Math.floor((due - today) / (1000 * 60 * 60 * 24));
  let cls = "todo-due";
  let lbl = "";
  if (diff < 0) {
    cls += " overdue";
    lbl = `⚠️ Terlambat ${Math.abs(diff)} hari`;
  } else if (diff === 0) {
    cls += " today-due";
    lbl = "📅 Hari ini!";
  } else if (diff <= 3) lbl = `📅 ${diff} hari lagi`;
  else {
    const d = due;
    lbl = `📅 ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }
  return lbl
    ? `<span class="${cls}"><i class="fas fa-calendar"></i> ${lbl}</span>`
    : "";
}

function priorityBadgeClass(p) {
  return p === "high" ? "danger" : p === "medium" ? "warning" : "success";
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setTodayAsMinDate() {
  const inp = document.getElementById("dueInput");
  if (inp) inp.min = new Date().toISOString().split("T")[0];
}
