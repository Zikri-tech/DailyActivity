/* ================================================
   FILE: js/todo.js
   To-Do List — dengan fitur Edit Deskripsi Tugas
   ================================================ */

/* ── State ──────────────────────────────────────── */
let todos            = [];
let currentFilter    = 'all';
let selectedPriority = 'medium';
let editingId        = null;   // ← ID tugas yang sedang diedit

const STORAGE_KEY = 'dailyflow_todos';

/* ── Init ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  load();
  renderList();
  updateStats();
  setMinDate();

  /* Ctrl+Enter untuk tambah tugas dari textarea */
  document.getElementById('taskInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.ctrlKey) addTodo();
  });

  /* Escape global: batalkan edit */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && editingId) cancelEdit();
  });
});

/* ── Load / Save ────────────────────────────────── */
function load() {
  try { todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { todos = []; }
}
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

/* ── Priority selector ──────────────────────────── */
function setPriority(p) {
  selectedPriority = p;
  document.querySelectorAll('.priority-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.p === p);
  });
}

/* ── Add Todo ───────────────────────────────────── */
function addTodo() {
  const input = document.getElementById('taskInput');
  const task  = input?.value.trim();
  if (!task) {
    showToast('Tulis deskripsi tugas terlebih dahulu!', 'warning');
    input?.focus();
    return;
  }
  const dueDate = document.getElementById('dueInput')?.value || null;
  todos.unshift({
    id:       Date.now().toString(),
    task,
    priority: selectedPriority,
    done:     false,
    dueDate,
    created:  new Date().toISOString()
  });
  save();
  if (input) input.value = '';
  renderList();
  updateStats();
  showToast('✅ Tugas berhasil ditambahkan!', 'success');
}

/* ══════════════════════════════════════════════════
   EDIT FITUR — CORE
   ══════════════════════════════════════════════════ */

/**
 * Mulai mode edit untuk tugas dengan id tertentu.
 * Merender ulang daftar sehingga item berubah menjadi textarea.
 */
function startEdit(id) {
  /* Kalau sedang mengedit item lain, batalkan dulu */
  if (editingId && editingId !== id) cancelEdit(false);

  editingId = id;
  renderList();

  /* Fokus ke textarea dan taruh kursor di akhir teks */
  setTimeout(() => {
    const inp = document.getElementById(`edit-input-${id}`);
    if (!inp) return;
    inp.focus();
    const len = inp.value.length;
    inp.setSelectionRange(len, len);

    /* Keyboard shortcut di dalam edit textarea */
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); saveEdit(id); }
      if (e.key === 'Escape')              { e.preventDefault(); cancelEdit(); }
    });
  }, 30);
}

/**
 * Simpan hasil edit.
 */
function saveEdit(id) {
  const inp = document.getElementById(`edit-input-${id}`);
  if (!inp) return;

  const newTask = inp.value.trim();
  if (!newTask) {
    /* Tampilkan error di dalam edit area, bukan menghapus */
    inp.style.borderColor = '#EF4444';
    inp.style.boxShadow   = '0 0 0 3px rgba(239,68,68,.14)';
    inp.placeholder = 'Deskripsi tidak boleh kosong!';
    inp.focus();
    return;
  }

  const todo = todos.find(t => t.id === id);
  if (todo) {
    const oldTask = todo.task;
    todo.task     = newTask;
    save();
    editingId = null;
    renderList();
    updateStats();
    showToast(
      oldTask === newTask
        ? 'Tidak ada perubahan.'
        : '✏️ Deskripsi tugas berhasil diperbarui!',
      oldTask === newTask ? 'warning' : 'success'
    );
  }
}

/**
 * Batalkan edit tanpa menyimpan.
 * @param {boolean} rerender - apakah perlu render ulang (default: true)
 */
function cancelEdit(rerender = true) {
  editingId = null;
  if (rerender) renderList();
}

/* ══════════════════════════════════════════════════ */

/* ── Toggle selesai ─────────────────────────────── */
function toggleDone(id) {
  /* Jika sedang edit, selesaikan edit dulu */
  if (editingId === id) cancelEdit(false);

  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  todo.done = !todo.done;
  save();
  renderList();
  updateStats();
  if (todo.done) showToast('🎉 Tugas selesai! Keren!', 'success', 2000);
}

/* ── Delete ─────────────────────────────────────── */
function deleteTodo(id) {
  if (editingId === id) editingId = null;
  todos = todos.filter(t => t.id !== id);
  save();
  renderList();
  updateStats();
  showToast('Tugas dihapus', 'warning', 2000);
}

/* ── Filter ─────────────────────────────────────── */
function setFilter(f) {
  if (editingId) cancelEdit(false);
  currentFilter = f;
  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.f === f);
  });
  renderList();
}

function getFiltered() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  switch (currentFilter) {
    case 'today':
      return todos.filter(t =>
        !t.done && t.dueDate &&
        new Date(t.dueDate + 'T00:00:00').toDateString() === today.toDateString()
      );
    case 'high':    return todos.filter(t => !t.done && t.priority === 'high');
    case 'done':    return todos.filter(t => t.done);
    case 'overdue': return todos.filter(t =>
        !t.done && t.dueDate && new Date(t.dueDate + 'T00:00:00') < today);
    default:        return todos;
  }
}

/* ── Render daftar ──────────────────────────────── */
function renderList() {
  const container = document.getElementById('todoList');
  if (!container) return;

  const list = getFiltered();
  if (list.length === 0) {
    const msgs = {
      all:     ['📭', 'Belum ada tugas',             'Tambahkan tugas pertamamu!'],
      today:   ['📅', 'Tidak ada tugas hari ini',    'Jadwalkan tugas dengan deadline hari ini.'],
      high:    ['🟢', 'Tidak ada prioritas tinggi',  'Semua aman!'],
      done:    ['✅', 'Belum ada yang selesai',       'Yuk selesaikan tugasmu!'],
      overdue: ['⚠️', 'Tidak ada tugas terlambat',  'Bagus! Semua tepat waktu.']
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

  /* Urutkan: prioritas tinggi dulu, lalu tanggal */
  const pOrder = { high: 0, medium: 1, low: 2 };
  const sorted = [...list].sort((a, b) => {
    if (a.done !== b.done)                           return a.done ? 1 : -1;
    if (pOrder[a.priority] !== pOrder[b.priority])  return pOrder[a.priority] - pOrder[b.priority];
    return new Date(b.created) - new Date(a.created);
  });

  container.innerHTML = sorted.map(t => renderItem(t)).join('');
}

/* ── Render satu item (normal atau mode edit) ────── */
function renderItem(t) {
  const isEditing = editingId === t.id;

  /* ────── MODE EDIT ────── */
  if (isEditing) {
    return `
    <div class="todo-item priority-${t.priority} editing" id="item-${t.id}">

      <!-- Checkbox (tetap bisa diklik saat edit) -->
      <div class="todo-check-wrap">
        <div class="todo-check ${t.done ? 'checked' : ''}"
             onclick="toggleDone('${t.id}')" title="Tandai selesai">
          ${t.done ? '<i class="fas fa-check"></i>' : ''}
        </div>
      </div>

      <!-- Area Edit -->
      <div class="todo-edit-wrap">

        <div class="edit-header">
          <span class="edit-label">
            <i class="fas fa-pen"></i> Edit deskripsi tugas
          </span>
          <span class="edit-hint">Ctrl+Enter simpan &nbsp;·&nbsp; Esc batal</span>
        </div>

        <textarea
          class="todo-edit-input"
          id="edit-input-${t.id}"
          rows="2"
          placeholder="Tulis deskripsi tugas..."
        >${escapeHtml(t.task)}</textarea>

        <div class="todo-edit-actions">
          <button class="btn-edit-save" onclick="saveEdit('${t.id}')">
            <i class="fas fa-check"></i> Simpan
          </button>
          <button class="btn-edit-cancel" onclick="cancelEdit()">
            <i class="fas fa-times"></i> Batal
          </button>
        </div>

      </div><!-- /todo-edit-wrap -->
    </div>`;
  }

  /* ────── MODE NORMAL ────── */
  const dueLbl = getDueLabel(t.dueDate);
  const pBadge = { high: '🔴 Tinggi', medium: '🟡 Sedang', low: '🟢 Rendah' };

  return `
  <div class="todo-item priority-${t.priority} ${t.done ? 'done' : ''}"
       id="item-${t.id}">

    <!-- Checkbox -->
    <div class="todo-check-wrap">
      <div class="todo-check ${t.done ? 'checked' : ''}"
           onclick="toggleDone('${t.id}')" title="Tandai selesai">
        ${t.done ? '<i class="fas fa-check"></i>' : ''}
      </div>
    </div>

    <!-- Konten -->
    <div class="todo-body">
      <div class="todo-task">${escapeHtml(t.task)}</div>
      <div class="todo-meta">
        <span class="badge badge-${priorityBadgeClass(t.priority)}">
          ${pBadge[t.priority]}
        </span>
        ${dueLbl}
      </div>
    </div>

    <!-- Aksi -->
    <div class="todo-actions">
      <!-- Tombol Edit -->
      <button class="todo-action-btn todo-btn-edit"
              onclick="startEdit('${t.id}')"
              title="Edit deskripsi tugas"
              ${t.done ? 'disabled' : ''}>
        <i class="fas fa-pen"></i>
      </button>
      <!-- Tombol Hapus -->
      <button class="todo-action-btn todo-btn-delete"
              onclick="deleteTodo('${t.id}')"
              title="Hapus tugas">
        <i class="fas fa-trash"></i>
      </button>
    </div>

  </div>`;
}

/* ── Statistik ──────────────────────────────────── */
function updateStats() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const total   = todos.length;
  const done    = todos.filter(t => t.done).length;
  const pending = todos.filter(t => !t.done).length;
  const overdue = todos.filter(t =>
    !t.done && t.dueDate && new Date(t.dueDate + 'T00:00:00') < today).length;

  setTxt('statTotal',   total);
  setTxt('statDone',    done);
  setTxt('statPending', pending);
  setTxt('statOverdue', overdue);
}
function setTxt(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* Helpers */
function getDueLabel(dueDate) {
  if (!dueDate) return '';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due   = new Date(dueDate + 'T00:00:00');
  const diff  = Math.floor((due - today) / 86400000);
  let cls = 'todo-due', lbl = '';
  if      (diff < 0)  { cls += ' overdue';   lbl = `⚠️ Terlambat ${Math.abs(diff)} hari`; }
  else if (diff === 0){ cls += ' today-due';  lbl = '📅 Hari ini!'; }
  else if (diff <= 3) lbl = `📅 ${diff} hari lagi`;
  else {
    lbl = `📅 ${due.getDate()}/${due.getMonth()+1}/${due.getFullYear()}`;
  }
  return lbl
    ? `<span class="${cls}"><i class="fas fa-calendar"></i> ${lbl}</span>`
    : '';
}

function priorityBadgeClass(p) {
  return p === 'high' ? 'danger' : p === 'medium' ? 'warning' : 'success';
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function setMinDate() {
  const inp = document.getElementById('dueInput');
  if (inp) inp.min = new Date().toISOString().split('T')[0];
}