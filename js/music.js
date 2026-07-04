/* ================================================
   FILE: js/music.js
   Music Player — Tab dinamis dari music-config.js
   ================================================ */

/* ── State ──────────────────────────────────────────
   Ambil ID kategori pertama dari config sebagai default.
   Ini otomatis menyesuaikan jika config diubah.
   ─────────────────────────────────────────────────── */
let currentCat = MUSIC_CONFIG.categories[0]?.id || "fokus";
let currentIdx = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
const audio = document.getElementById("audioPlayer");

/* ── Init ──────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  /* Muat state tersimpan */
  const saved = JSON.parse(localStorage.getItem("dailyflow_music") || "{}");

  /* Validasi: pastikan cat tersimpan masih ada di config.
     Jika tidak (misal: config berubah), pakai kategori pertama. */
  const savedCatExists = MUSIC_CONFIG.categories.some(
    (c) => c.id === saved.cat,
  );
  currentCat = savedCatExists
    ? saved.cat
    : MUSIC_CONFIG.categories[0]?.id || "fokus";

  /* Validasi index */
  const catData = getCat();
  const maxIdx = catData ? catData.songs.length - 1 : 0;
  currentIdx = saved.idx >= 0 && saved.idx <= maxIdx ? saved.idx : 0;

  /* 1. Render tab dari config */
  renderTabs();

  /* 2. Render playlist */
  renderPlaylist(currentCat);

  /* 3. Load lagu pertama (tanpa autoplay) */
  loadSong(currentIdx, false);

  /* 4. Setup audio events */
  if (audio) {
    audio.volume = (saved.vol || 70) / 100;
    const volSlider = document.getElementById("volumeSlider");
    if (volSlider) volSlider.value = saved.vol || 70;

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", onSongEnd);
    audio.addEventListener("loadedmetadata", () => {
      const el = document.getElementById("totalTime");
      if (el) el.textContent = formatAudioTime(audio.duration);
    });
    audio.addEventListener("error", () => {
      showToast(
        "File audio tidak ditemukan. Periksa path di music-config.js",
        "error",
        5000,
      );
    });
  }
});

/* ════════════════════════════════════════════════════
   RENDER TABS — Otomatis dari MUSIC_CONFIG
   ════════════════════════════════════════════════════
   Fungsi ini membuat tombol tab secara dinamis,
   sehingga music.html tidak perlu diubah saat
   kategori di music-config.js berubah.
   ════════════════════════════════════════════════════ */
function renderTabs() {
  const container = document.getElementById("musicTabs");
  if (!container) return;

  container.innerHTML = MUSIC_CONFIG.categories
    .map(
      (cat) => `
    <button
      class="music-tab ${cat.id === currentCat ? "active" : ""}"
      data-cat="${cat.id}"
      onclick="switchCategory('${cat.id}')">
      <span class="tab-dot"></span> ${cat.name}
    </button>
  `,
    )
    .join("");
}

/* ── Ganti Kategori ─────────────────────────────── */
function switchCategory(cat) {
  /* Abaikan jika klik kategori yang sama */
  if (cat === currentCat && isPlaying) return;

  currentCat = cat;
  currentIdx = 0;

  /* Stop audio */
  if (isPlaying) {
    isPlaying = false;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    updatePlayPauseBtn();
  }

  /* Update tab aktif */
  document.querySelectorAll(".music-tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.cat === cat);
  });

  /* Render playlist + load lagu pertama */
  renderPlaylist(cat);
  loadSong(0, false);
}

/* ── Ambil Data Kategori Aktif ──────────────────── */
function getCat() {
  return (
    MUSIC_CONFIG.categories.find((c) => c.id === currentCat) ||
    MUSIC_CONFIG.categories[0]
  );
}

/* ── Render Playlist ────────────────────────────── */
function renderPlaylist(cat) {
  const catData = MUSIC_CONFIG.categories.find((c) => c.id === cat);
  const scroll = document.getElementById("playlistScroll");
  const titleEl = document.getElementById("playlistTitle");
  const countEl = document.getElementById("playlistCount");

  /* Jika kategori tidak ditemukan di config */
  if (!catData) {
    if (scroll)
      scroll.innerHTML = `
      <div class="empty-state" style="padding:24px 12px">
        <div class="empty-state-icon">🎵</div>
        <h3>Kategori tidak ditemukan</h3>
        <p>Periksa ID kategori di music-config.js</p>
      </div>`;
    return;
  }

  if (titleEl) titleEl.textContent = catData.name;
  if (countEl) countEl.textContent = `${catData.songs.length} lagu`;

  /* Jika playlist kosong */
  if (!catData.songs || catData.songs.length === 0) {
    if (scroll)
      scroll.innerHTML = `
      <div class="empty-state" style="padding:24px 12px">
        <div class="empty-state-icon">🎵</div>
        <h3>Belum ada lagu</h3>
        <p>Tambahkan lagu di music-config.js</p>
      </div>`;
    return;
  }

  /* Render daftar lagu */
  if (!scroll) return;
  scroll.innerHTML = catData.songs
    .map(
      (song, i) => `
    <div class="playlist-item ${i === currentIdx ? "active" : ""}"
         onclick="loadSong(${i}, true)">
      <span class="pl-num">
        ${
          i === currentIdx && isPlaying
            ? '<i class="fas fa-volume-up" style="color:var(--primary);font-size:11px"></i>'
            : i + 1
        }
      </span>
      <div class="pl-art" style="font-size:20px">${song.emoji}</div>
      <div class="pl-info">
        <div class="pl-title">${song.title}</div>
        <div class="pl-artist">${song.artist}</div>
      </div>
      <span class="pl-dur">${song.duration}</span>
    </div>
  `,
    )
    .join("");
}

/* ── Load Lagu ──────────────────────────────────── */
function loadSong(idx, autoplay = false) {
  const cat = getCat();
  if (!cat || !cat.songs || idx < 0 || idx >= cat.songs.length) return;

  currentIdx = idx;
  const song = cat.songs[idx];

  /* Update info lagu */
  const titleEl = document.getElementById("songTitle");
  const artistEl = document.getElementById("songArtist");
  const genreEl = document.getElementById("songGenre");
  if (titleEl) titleEl.textContent = song.title;
  if (artistEl) artistEl.textContent = song.artist;
  if (genreEl) genreEl.textContent = cat.name;

  /* Album art */
  const artEl = document.getElementById("albumArt");
  if (artEl) {
    artEl.style.background = `linear-gradient(135deg, ${cat.color}, #FF6B9D)`;
    artEl.innerHTML = `<span style="font-size:60px">${song.emoji}</span>`;
    if (!autoplay) artEl.classList.remove("playing");
  }

  /* Reset progress bar */
  const slider = document.getElementById("progressSlider");
  const curTime = document.getElementById("currentTime");
  const totTime = document.getElementById("totalTime");
  if (slider) slider.value = 0;
  if (curTime) curTime.textContent = "0:00";
  if (totTime) totTime.textContent = song.duration;

  /* Set src & play */
  if (audio) {
    audio.src = song.src;
    audio.load();
    if (autoplay) {
      audio
        .play()
        .then(() => setPlayState(true))
        .catch(() =>
          showToast(
            "Tidak dapat memutar. Pastikan file audio tersedia!",
            "error",
            5000,
          ),
        );
    } else {
      setPlayState(false);
    }
  }

  /* Simpan state */
  localStorage.setItem("dailyflow_last_song", song.title);
  saveMusicState();

  /* Perbarui tampilan playlist (update nomor & highlight) */
  renderPlaylist(currentCat);
}

/* ── Play / Pause ───────────────────────────────── */
function togglePlay() {
  if (!audio || !audio.src || audio.src === window.location.href) {
    loadSong(currentIdx, true);
    return;
  }
  if (isPlaying) {
    audio.pause();
    setPlayState(false);
  } else {
    audio
      .play()
      .then(() => setPlayState(true))
      .catch(() =>
        showToast(
          "Tidak dapat memutar. Pastikan file audio tersedia!",
          "error",
          5000,
        ),
      );
  }
}

function setPlayState(playing) {
  isPlaying = playing;
  updatePlayPauseBtn();
  document.getElementById("albumArt")?.classList.toggle("playing", playing);
  document.getElementById("equalizer")?.classList.toggle("playing", playing);
}

function updatePlayPauseBtn() {
  const icon = document.getElementById("playPauseIcon");
  if (icon) icon.className = isPlaying ? "fas fa-pause" : "fas fa-play";
}

/* ── Navigasi Lagu ──────────────────────────────── */
function nextSong() {
  const cat = getCat();
  if (!cat) return;
  let idx;
  if (isShuffle) {
    /* Shuffle: pilih acak, hindari lagu yang sama */
    do {
      idx = Math.floor(Math.random() * cat.songs.length);
    } while (cat.songs.length > 1 && idx === currentIdx);
  } else {
    idx = (currentIdx + 1) % cat.songs.length;
  }
  loadSong(idx, isPlaying);
}

function prevSong() {
  /* Jika sudah > 3 detik, putar ulang dari awal */
  if (audio && audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  const cat = getCat();
  if (!cat) return;
  const idx = (currentIdx - 1 + cat.songs.length) % cat.songs.length;
  loadSong(idx, isPlaying);
}

function onSongEnd() {
  if (isRepeat) {
    audio.currentTime = 0;
    audio.play();
    return;
  }
  nextSong();
}

/* Shuffle & Repeat */
function toggleShuffle() {
  isShuffle = !isShuffle;
  document.getElementById("shuffleBtn")?.classList.toggle("active", isShuffle);
  showToast(
    isShuffle ? "🔀 Shuffle aktif" : "🔀 Shuffle nonaktif",
    "success",
    1500,
  );
}

function toggleRepeat() {
  isRepeat = !isRepeat;
  document.getElementById("repeatBtn")?.classList.toggle("active", isRepeat);
  showToast(
    isRepeat ? "🔁 Ulangi aktif" : "🔁 Ulangi nonaktif",
    "success",
    1500,
  );
}

/* Progress Bar */
function updateProgress() {
  if (!audio || !audio.duration || audio.duration === 0) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  const sl = document.getElementById("progressSlider");
  const curEl = document.getElementById("currentTime");
  if (sl) sl.value = pct;
  if (curEl) curEl.textContent = formatAudioTime(audio.currentTime);
}

function seekTo(val) {
  if (audio && audio.duration) {
    audio.currentTime = (val / 100) * audio.duration;
  }
}

/* Volume */
function setVolume(val) {
  if (audio) audio.volume = val / 100;
  saveMusicState();
}

function toggleMute() {
  if (!audio) return;
  audio.muted = !audio.muted;
  const icons = document.querySelectorAll(".volume-icon");
  icons.forEach((icon) => {
    icon.className = `fas fa-volume-${audio.muted ? "mute" : "down"} volume-icon`;
  });
}

/* Helpers */
function formatAudioTime(sec) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function saveMusicState() {
  localStorage.setItem(
    "dailyflow_music",
    JSON.stringify({
      cat: currentCat,
      idx: currentIdx,
      vol: document.getElementById("volumeSlider")?.value || 70,
    }),
  );
}
