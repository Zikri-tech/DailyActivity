<?php
// Halaman Registrasi
session_start();
require_once __DIR__ . '/koneksi.php';

$error   = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username  = trim($_POST['username']  ?? '');
    $fullName  = trim($_POST['full_name'] ?? '');
    $email     = trim($_POST['email']     ?? '');
    $password  = $_POST['password']       ?? '';
    $confirm   = $_POST['confirm']        ?? '';

    // Validasi
    if (empty($username) || empty($fullName) || empty($password) || empty($confirm)) {
        $error = 'Semua field wajib diisi!';
    } elseif (strlen($username) < 3) {
        $error = 'Username minimal 3 karakter.';
    } elseif (strlen($password) < 6) {
        $error = 'Password minimal 6 karakter.';
    } elseif ($password !== $confirm) {
        $error = 'Konfirmasi password tidak cocok!';
    } else {
        try {
            // Cek username sudah ada atau belum
            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? LIMIT 1");
            $stmt->execute([$username]);
            if ($stmt->fetch()) {
                $error = 'Username sudah digunakan, pilih yang lain.';
            } else {
                // Hash password dan simpan
                $hash = password_hash($password, PASSWORD_BCRYPT);
                $stmt = $pdo->prepare("INSERT INTO users (username, password, full_name, email) VALUES (?, ?, ?, ?)");
                $stmt->execute([$username, $hash, $fullName, $email ?: null]);
                $success = 'Akun berhasil dibuat! Silakan login.';
            }
        } catch (PDOException $e) {
            $error = 'Error database: ' . $e->getMessage();
        }
    }
}
?>
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DailyFlow — Buat Akun</title>
    <link
      rel="icon"
      href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📅</text></svg>"
    />
    <link rel="stylesheet" href="css/login.css" />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
    />
    <style>
      .msg-box {
        display: flex;
        align-items: center;
        gap: 8px;
        border-radius: 10px;
        padding: 11px 14px;
        font-size: 13px;
        margin-bottom: 14px;
        animation: fadeU 0.3s ease both;
      }
      .msg-error {
        background: #fff2f2;
        border: 1px solid #ffcdd0;
        color: #c0392b;
      }
      .msg-success {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        color: #16a34a;
      }
    </style>
  </head>
  <body>
    <!-- Animated Background -->
    <div class="bg-gradient"></div>
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>
    <div class="particles" id="particles"></div>

    <!-- Main Wrapper -->
    <div class="login-wrapper">
      <!-- LEFT: Form Panel -->
      <div class="login-left">
        <!-- Brand -->
        <div class="brand-wrap">
          <div class="brand-logo">
            <div class="brand-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <span class="brand-name-text">DailyFlow</span>
          </div>
          <p class="brand-tagline">
            Aktivitas harian yang lebih produktif & teratur
          </p>
        </div>

        <!-- Form -->
        <h2 class="form-title">Buat Akun Baru 🚀</h2>
        <p class="form-subtitle">Daftar untuk mulai mengatur aktivitas harianmu.</p>

        <!-- Messages -->
        <?php if ($error): ?>
          <div class="msg-box msg-error">
            <i class="fas fa-exclamation-circle"></i>
            <span><?= htmlspecialchars($error) ?></span>
          </div>
        <?php endif; ?>
        <?php if ($success): ?>
          <div class="msg-box msg-success">
            <i class="fas fa-check-circle"></i>
            <span><?= htmlspecialchars($success) ?></span>
          </div>
        <?php endif; ?>

        <form method="POST" action="setup.php" novalidate>
          <!-- Full Name -->
          <div class="field" style="animation-delay: 0.05s">
            <label class="field-label" for="full_name">
              <i class="fas fa-id-card"></i> Nama Lengkap
            </label>
            <div class="input-wrap">
              <input
                type="text"
                id="full_name"
                name="full_name"
                placeholder="Masukkan nama lengkap"
                value="<?= htmlspecialchars($_POST['full_name'] ?? '') ?>"
                required
              />
            </div>
          </div>

          <!-- Username -->
          <div class="field" style="animation-delay: 0.1s">
            <label class="field-label" for="username">
              <i class="fas fa-user"></i> Username
            </label>
            <div class="input-wrap">
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Masukkan username"
                autocomplete="username"
                value="<?= htmlspecialchars($_POST['username'] ?? '') ?>"
                required
                spellcheck="false"
              />
            </div>
          </div>

          <!-- Email (opsional) -->
          <div class="field" style="animation-delay: 0.15s">
            <label class="field-label" for="email">
              <i class="fas fa-envelope"></i> Email <span style="color:var(--t3);font-weight:400">(opsional)</span>
            </label>
            <div class="input-wrap">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Masukkan email"
                value="<?= htmlspecialchars($_POST['email'] ?? '') ?>"
              />
            </div>
          </div>

          <!-- Password -->
          <div class="field" style="animation-delay: 0.2s">
            <label class="field-label" for="password">
              <i class="fas fa-lock"></i> Password
            </label>
            <div class="input-wrap">
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Minimal 6 karakter"
                autocomplete="new-password"
                required
              />
              <button
                type="button"
                class="input-suffix"
                onclick="togglePwd('password','eyeIcon1')"
                aria-label="Tampilkan password"
              >
                <i class="fas fa-eye" id="eyeIcon1"></i>
              </button>
            </div>
          </div>

          <!-- Confirm Password -->
          <div class="field" style="animation-delay: 0.25s">
            <label class="field-label" for="confirm">
              <i class="fas fa-lock"></i> Konfirmasi Password
            </label>
            <div class="input-wrap">
              <input
                type="password"
                id="confirm"
                name="confirm"
                placeholder="Ulangi password"
                autocomplete="new-password"
                required
              />
              <button
                type="button"
                class="input-suffix"
                onclick="togglePwd('confirm','eyeIcon2')"
                aria-label="Tampilkan password"
              >
                <i class="fas fa-eye" id="eyeIcon2"></i>
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button type="submit" class="btn-login" id="registerBtn">
            <span class="btn-text">Buat Akun</span>
            <i class="fas fa-arrow-right"></i>
          </button>
        </form>

        <div class="login-footer">
          Sudah punya akun?
          <a href="index.html">Masuk di sini</a>
        </div>
      </div>
      <!-- /login-left -->

      <!-- RIGHT: Illustration Panel -->
      <div class="login-right">
        <div class="right-pattern"></div>
        <div class="right-content">
          <p class="right-eyebrow">Bergabung sekarang</p>
          <h2 class="right-headline">
            Mulai Atur<br /><span>Harimu</span><br />Sekarang
          </h2>
          <p class="right-desc">
            Buat akun gratis dan mulai kelola waktu belajar, jadwal, tugas, dan
            dengarkan musik fokus dalam satu platform.
          </p>

          <!-- Feature Pills -->
          <div class="feature-pills">
            <div class="feature-pill" style="animation-delay: 0.15s">
              <div class="pill-icon purple">
                <i class="fas fa-stopwatch"></i>
              </div>
              <div class="pill-text">
                <h4>Stopwatch Belajar</h4>
                <p>Lacak waktu belajar efektif & mode Pomodoro</p>
              </div>
            </div>
            <div class="feature-pill" style="animation-delay: 0.25s">
              <div class="pill-icon pink"><i class="fas fa-music"></i></div>
              <div class="pill-text">
                <h4>Musik Fokus</h4>
                <p>Lo-fi, ambient & playlist belajar pilihan</p>
              </div>
            </div>
            <div class="feature-pill" style="animation-delay: 0.35s">
              <div class="pill-icon green">
                <i class="fas fa-calendar-alt"></i>
              </div>
              <div class="pill-text">
                <h4>Jadwal Cerdas</h4>
                <p>Rekomendasi jadwal & teknik belajar efektif</p>
              </div>
            </div>
            <div class="feature-pill" style="animation-delay: 0.45s">
              <div class="pill-icon amber"><i class="fas fa-tasks"></i></div>
              <div class="pill-text">
                <h4>To-Do List</h4>
                <p>Kelola tugas dengan prioritas & deadline</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Decorative dots -->
        <div class="dots-grid">
          <span></span><span></span><span></span><span></span><span></span>
          <span></span><span></span><span></span><span></span><span></span>
          <span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>
      <!-- /login-right -->
    </div>
    <!-- /login-wrapper -->

    <script>
      function togglePwd(fieldId, iconId) {
        const pwd = document.getElementById(fieldId);
        const icon = document.getElementById(iconId);
        if (pwd.type === "password") {
          pwd.type = "text";
          icon.className = "fas fa-eye-slash";
        } else {
          pwd.type = "password";
          icon.className = "fas fa-eye";
        }
      }

      // Particle generator (sama seperti halaman login)
      (function () {
        const container = document.getElementById("particles");
        if (!container) return;
        for (let i = 0; i < 20; i++) {
          const p = document.createElement("div");
          p.className = "particle";
          const size = Math.random() * 8 + 3;
          p.style.cssText = `
            width: ${size}px; height: ${size}px;
            left: ${Math.random() * 100}%; top: ${Math.random() * 100}%;
            animation-duration: ${Math.random() * 15 + 10}s;
            animation-delay: ${Math.random() * -15}s;
          `;
          container.appendChild(p);
        }
      })();
    </script>
  </body>
</html>
