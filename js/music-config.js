// ================================================
// FILE: js/music-config.js
// ================================================
//
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
      id: "fokus",
      name: "🧠 Fokus Belajar",
      color: "#6C63FF",
      desc: "Lo-fi & instrumental untuk konsentrasi",
      songs: [
        {
          id: 1,
          title: "Lofi Study Session",
          artist: "Chillhop Music",
          src: "audio/fokus/lofi-study-1.mp3",
          emoji: "📚",
          duration: "3:45",
        },
        {
          id: 2,
          title: "Coffee Shop Ambience",
          artist: "Lo-fi Beats",
          src: "audio/fokus/coffee-shop.mp3",
          emoji: "☕",
          duration: "4:12",
        },
        {
          id: 3,
          title: "Deep Focus Flow",
          artist: "Study Music Project",
          src: "audio/fokus/deep-focus.mp3",
          emoji: "🌿",
          duration: "5:30",
        },
        {
          id: 4,
          title: "Piano Study Vibes",
          artist: "Instrumental Beats",
          src: "audio/fokus/piano-study.mp3",
          emoji: "🎹",
          duration: "4:20",
        },
        {
          id: 5,
          title: "Brain Power Alpha Waves",
          artist: "Focus Music",
          src: "audio/fokus/alpha-waves.mp3",
          emoji: "🧠",
          duration: "6:00",
        },
      ],
    },
    {
      id: "santai",
      name: "🌿 Santai & Rileks",
      color: "#10B981",
      desc: "Musik tenang untuk istirahat & relaksasi",
      songs: [
        {
          id: 6,
          title: "Gentle Rain Sounds",
          artist: "Nature Ambience",
          src: "audio/santai/rain-sounds.mp3",
          emoji: "🌧️",
          duration: "5:00",
        },
        {
          id: 7,
          title: "Forest Morning",
          artist: "Nature Sounds",
          src: "audio/santai/forest-morning.mp3",
          emoji: "🌲",
          duration: "4:45",
        },
        {
          id: 8,
          title: "Soft Acoustic Guitar",
          artist: "Chill Acoustic",
          src: "audio/santai/acoustic-guitar.mp3",
          emoji: "🎸",
          duration: "3:30",
        },
        {
          id: 9,
          title: "Ocean Waves Meditation",
          artist: "Calm Waves",
          src: "audio/santai/ocean-waves.mp3",
          emoji: "🌊",
          duration: "6:15",
        },
      ],
    },
    {
      id: "energik",
      name: "⚡ Semangat & Energik",
      color: "#EC4899",
      desc: "Musik motivasi untuk semangat belajar",
      songs: [
        {
          id: 10,
          title: "Morning Motivation",
          artist: "Upbeat Study",
          src: "audio/energik/morning-motivation.mp3",
          emoji: "☀️",
          duration: "3:20",
        },
        {
          id: 11,
          title: "Power Study Mode",
          artist: "Focus EDM",
          src: "audio/energik/power-study.mp3",
          emoji: "⚡",
          duration: "4:00",
        },
        {
          id: 12,
          title: "Upbeat Instrumental",
          artist: "Happy Beats",
          src: "audio/energik/upbeat-instrumental.mp3",
          emoji: "🎶",
          duration: "3:55",
        },
        {
          id: 13,
          title: "Study Hustle",
          artist: "Productive Beats",
          src: "audio/energik/study-hustle.mp3",
          emoji: "💪",
          duration: "4:30",
        },
      ],
    },
  ],
};
