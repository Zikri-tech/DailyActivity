// ================================================
// FILE: js/music.js
// Logic Music Player
// ================================================

let currentCat = "fokus";
let currentIdx = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
const audio = document.getElementById("audioPlayer");

document.addEventListener("DOMContentLoaded", () => {
  // Load saved state
  const saved = JSON.parse(localStorage.getItem("dailyflow_music") || "{}");
  currentCat = saved.cat || "fokus";
  currentIdx = saved.idx || 0;

  renderPlaylist(currentCat);
  loadSong(currentIdx, false);

  if (audio) {
    audio.volume = (saved.vol || 70) / 100;
    document.getElementById("volumeSlider").value = saved.vol || 70;

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", onSongEnd);
    audio.addEventListener("loadedmetadata", () => {
      document.getElementById("totalTime").textContent = formatAudioTime(
        audio.duration,
      );
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

// ---- Category Switch ----
function switchCategory(cat) {
  currentCat = cat;
  currentIdx = 0;
  isPlaying = false;
  if (audio) {
    audio.pause();
    audio.src = "";
  }
  updatePlayPauseBtn();

  document.querySelectorAll(".music-tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.cat === cat);
  });

  renderPlaylist(cat);
  loadSong(0, false);
}

// ---- Get Current Playlist ----
function getCat() {
  return (
    MUSIC_CONFIG.categories.find((c) => c.id === currentCat) ||
    MUSIC_CONFIG.categories[0]
  );
}

// ---- Render Playlist ----
function renderPlaylist(cat) {
  const catData = MUSIC_CONFIG.categories.find((c) => c.id === cat);
  const scroll = document.getElementById("playlistScroll");
  const title = document.getElementById("playlistTitle");
  const count = document.getElementById("playlistCount");
  if (!catData || !scroll) return;

  if (title) title.textContent = catData.name;
  if (count) count.textContent = `${catData.songs.length} lagu`;

  scroll.innerHTML = catData.songs
    .map(
      (song, i) => `
    <div class="playlist-item ${i === currentIdx ? "active" : ""}"
         onclick="loadSong(${i}, true)">
      <span class="pl-num">${
        i === currentIdx && isPlaying
          ? '<i class="fas fa-volume-up" style="color:var(--primary);font-size:11px"></i>'
          : i + 1
      }</span>
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

// ---- Load Song ----
function loadSong(idx, autoplay = false) {
  const cat = getCat();
  if (!cat || idx < 0 || idx >= cat.songs.length) return;

  currentIdx = idx;
  const song = cat.songs[idx];

  document.getElementById("songTitle").textContent = song.title;
  document.getElementById("songArtist").textContent = song.artist;
  document.getElementById("songGenre").textContent = cat.name;

  // Album art
  const artEl = document.getElementById("albumArt");
  artEl.style.background = `linear-gradient(135deg, ${cat.color}, #FF6B9D)`;
  artEl.innerHTML = `<span style="font-size:60px">${song.emoji}</span>`;
  if (!isPlaying) artEl.classList.remove("playing");

  // Reset progress
  document.getElementById("progressSlider").value = 0;
  document.getElementById("currentTime").textContent = "0:00";
  document.getElementById("totalTime").textContent = song.duration;

  if (audio) {
    audio.src = song.src;
    audio.load();
    if (autoplay) {
      audio
        .play()
        .then(() => setPlayState(true))
        .catch(() => {});
    }
  }

  // Save last song
  localStorage.setItem("dailyflow_last_song", song.title);
  saveMusicState();

  // Update playlist UI
  renderPlaylist(currentCat);
}

// ---- Play / Pause ----
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
  document.getElementById("albumArt").classList.toggle("playing", playing);
  document.getElementById("equalizer").classList.toggle("playing", playing);
}

function updatePlayPauseBtn() {
  const icon = document.getElementById("playPauseIcon");
  if (icon) icon.className = isPlaying ? "fas fa-pause" : "fas fa-play";
}

// ---- Navigation ----
function nextSong() {
  const cat = getCat();
  let idx;
  if (isShuffle) {
    idx = Math.floor(Math.random() * cat.songs.length);
  } else {
    idx = (currentIdx + 1) % cat.songs.length;
  }
  loadSong(idx, isPlaying);
}

function prevSong() {
  if (audio && audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  const cat = getCat();
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

// ---- Shuffle / Repeat ----
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

// ---- Progress ----
function updateProgress() {
  if (!audio || audio.duration === 0) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  const el = document.getElementById("progressSlider");
  const curEl = document.getElementById("currentTime");
  if (el) el.value = pct;
  if (curEl) curEl.textContent = formatAudioTime(audio.currentTime);
}

function seekTo(val) {
  if (audio && audio.duration) {
    audio.currentTime = (val / 100) * audio.duration;
  }
}

// ---- Volume ----
function setVolume(val) {
  if (audio) audio.volume = val / 100;
  saveMusicState();
}

function toggleMute() {
  if (audio) {
    audio.muted = !audio.muted;
    const icon = document.querySelector(".volume-icon");
    if (icon)
      icon.className = `fas fa-volume-${audio.muted ? "mute" : "down"} volume-icon`;
  }
}

// ---- Helpers ----
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
