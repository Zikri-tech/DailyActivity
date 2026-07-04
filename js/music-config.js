// FILE: js/music-config.js
// ╔══════════════════════════════════════════════╗
// ║         CARA MENAMBAHKAN LAGU                ║
// ╠══════════════════════════════════════════════╣
// ║ 1. Buat folder audio/ di root project:       ║
// ║    daily-activity/                           ║
// ║    └── audio/                                ║
// ║        ├── fokus/                            ║
// ║        │   ├── lofi-study-1.mp3             ║
// ║        │   └── lofi-study-2.mp3             ║
// ║        ├── santai/                           ║
// ║        │   └── ambient-rain.mp3             ║
// ║        └── energik/                          ║
// ║            └── upbeat-study.mp3             ║
// ║                                              ║
// ║ 2. Tambahkan entri baru di bawah (songs[]):  ║
// ║    {                                         ║
// ║      title:   "Nama Lagu",                   ║
// ║      artist:  "Nama Artis",                  ║
// ║      src:     "audio/fokus/nama-file.mp3",   ║
// ║      emoji:   "🎵",  // ikon album art       ║
// ║      duration:"3:45" // perkiraan durasi     ║
// ║    }                                         ║
// ║                                              ║
// ║ 3. Sumber lagu bebas copyright:              ║
// ║    - https://www.looperman.com               ║
// ║    - https://freemusicarchive.org            ║
// ║    - https://incompetech.com                 ║
// ║    - YouTube Audio Library                   ║
// ║    - Lagu lo-fi bebas copyright              ║
// ╚══════════════════════════════════════════════╝

const MUSIC_CONFIG = {
  categories: [
    {
      id: "trend",
      name: "🧠 Sesi Fokus",
      color: "#6C63FF",
      desc: "Musik ",
      songs: [
        {
          id: 1,
          title: "Terbuang Dalam Waktu",
          artist: "Barasuara",
          src: "audio/trend/Barasuara - Terbuang Dalam Waktu.mp3",
          emoji: "✨",
          duration: "5:15",
        },
      ],
    },
    {
      id: "santai",
      name: "🌿 Sesi Santai",
      color: "#10B981",
      desc: "Musik tenang untuk istirahat & relaksasi",
      songs: [
        {
          id: 1,
          title: "Blue",
          artist: "Yung Kai",
          src: "audio/santai/yung kai - blue.mp3",
          emoji: "💧",
          duration: "3:41",
        },
      ],
    },
    {
      id: "galau",
      name: "💔 Sesi Galau",
      color: "#EC4899",
      desc: "Musik belajar ketika sedih",
      songs: [
        {
          id: 1,
          title: "About You",
          artist: "The 1975",
          src: "audio/galau/About You - The 1975.mp3",
          emoji: "🚬",
          duration: "5:24",
        },
      ],
    },
  ],
};
