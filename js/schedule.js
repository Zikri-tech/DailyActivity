// Logic halaman Jadwal Belajar
// ==============================

const TIPS = [
  {
    q: "Kapan waktu terbaik untuk belajar?",
    a: "Pagi hari (07:00–11:00) adalah golden hour karena otak paling segar setelah tidur. Hindari belajar materi baru setelah makan siang berat karena tubuh mengalami post-lunch dip. Malam hari cocok untuk review dan membuat rangkuman.",
  },
  {
    q: "Berapa lama sebaiknya satu sesi belajar?",
    a: "Penelitian menunjukkan konsentrasi optimal manusia adalah 25–50 menit. Lebih dari itu, kualitas belajar menurun drastis. Gunakan teknik Pomodoro (25+5) atau 50/10 tergantung jenis tugas. Untuk hafalan, sesi pendek 20–25 menit lebih efektif.",
  },
  {
    q: "Apakah mendengarkan musik saat belajar efektif?",
    a: "Tergantung jenis tugasnya. Untuk tugas yang membutuhkan kreativitas dan fokus moderat (membaca, mengetik), musik instrumental lo-fi terbukti membantu. Untuk tugas matematika atau hafalan kompleks, sebaiknya tanpa musik atau dengan white noise. Hindari musik dengan lirik.",
  },
  {
    q: "Bagaimana cara menghindari prokrastinasi?",
    a: "Gunakan aturan 2 menit: jika tugas bisa diselesaikan dalam 2 menit, kerjakan sekarang. Untuk tugas besar, pecah menjadi sub-tugas kecil. Buat environment belajar yang kondusif — rapikan meja, matikan notifikasi HP, gunakan teknik Pomodoro untuk memulai.",
  },
  {
    q: "Seberapa penting tidur untuk kemampuan belajar?",
    a: "Tidur 7–9 jam KRUSIAL untuk belajar. Saat tidur, otak memproses dan mengonsolidasi memori dari hari tersebut. Kurang tidur mengurangi kemampuan fokus, memori, dan kreativitas hingga 40%. Tidur 20 menit (power nap) setelah belajar terbukti meningkatkan retensi memori.",
  },
  {
    q: "Bagaimana cara belajar materi yang sulit?",
    a: "Gunakan metode chunking: pecah materi menjadi bagian kecil yang bermakna. Mulai dari konsep dasar sebelum yang kompleks. Cari analogi dari kehidupan sehari-hari. Ajarkan konsep tersebut kepada orang lain (teknik Feynman). Buat soal sendiri dan coba jawab.",
  },
  {
    q: "Apa itu sleep procrastination dan bagaimana mengatasinya?",
    a: "Sleep procrastination (menunda tidur padahal mengantuk) adalah kebiasaan buruk yang merusak siklus belajar. Tetapkan waktu tidur konsisten. Buat rutinitas wind-down 30 menit sebelum tidur: hindari layar, minum air hangat, baca buku fisik. Pertahankan selama 21 hari.",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  renderTips();
});

function renderTips() {
  const container = document.getElementById("tipsContainer");
  if (!container) return;

  container.innerHTML = TIPS.map(
    (tip, i) => `
    <div class="tip-item" id="tip-${i}">
      <div class="tip-trigger" onclick="toggleTip(${i})">
        <div class="tip-num">${i + 1}</div>
        <div class="tip-question">${tip.q}</div>
        <i class="fas fa-chevron-right tip-chevron"></i>
      </div>
      <div class="tip-body">${tip.a}</div>
    </div>
  `,
  ).join("");
}

function toggleTip(i) {
  const item = document.getElementById(`tip-${i}`);
  if (!item) return;
  const wasOpen = item.classList.contains("open");
  // Close all
  document
    .querySelectorAll(".tip-item")
    .forEach((el) => el.classList.remove("open"));
  // Open if was closed
  if (!wasOpen) item.classList.add("open");
}
