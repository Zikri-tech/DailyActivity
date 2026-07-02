<?php
// FILE: setup.php
// ⚠️ HAPUS FILE INI SETELAH AKUN BERHASIL DIBUAT!
// Akses: http://localhost/daily-activity/setup.php

session_start();

$host    = 'localhost';
$dbname  = 'daily_activity';
$dbuser  = 'root';
$dbpass  = '';

$pdo = null;
$msg = '';
$msgType = '';

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $dbuser, $dbpass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    $msg = '❌ Koneksi database gagal: ' . $e->getMessage();
    $msgType = 'error';
}

if ($pdo && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $username  = trim($_POST['username']  ?? '');
    $password  = trim($_POST['password']  ?? '');
    $full_name = trim($_POST['full_name'] ?? '');
    $email     = trim($_POST['email']     ?? '');

    if (empty($username) || empty($password) || empty($full_name)) {
        $msg = '❌ Username, password, dan nama lengkap wajib diisi.';
        $msgType = 'error';
    } elseif (strlen($password) < 6) {
        $msg = '❌ Password minimal 6 karakter.';
        $msgType = 'error';
    } else {
        try {
            $hash = password_hash($password, PASSWORD_BCRYPT);
            $stmt = $pdo->prepare(
                "INSERT INTO users (username, password, full_name, email)
                 VALUES (?, ?, ?, ?)"
            );
            $stmt->execute([$username, $hash, $full_name, $email ?: null]);
            $msg = '✅ Akun berhasil dibuat! Silakan login dan HAPUS file setup.php ini.';
            $msgType = 'success';
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                $msg = '❌ Username sudah terdaftar.';
            } else {
                $msg = '❌ Error: ' . $e->getMessage();
            }
            $msgType = 'error';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Setup DailyFlow</title>
<style>
  body{font-family:sans-serif;background:#f0eeff;display:flex;align-items:center;
       justify-content:center;min-height:100vh;margin:0}
  .box{background:#fff;border-radius:16px;padding:36px;max-width:400px;width:100%;
       box-shadow:0 8px 32px rgba(108,99,255,.15)}
  h2{color:#6C63FF;margin:0 0 8px}
  p.sub{color:#64748b;margin:0 0 24px;font-size:14px}
  label{display:block;font-size:13px;font-weight:600;color:#1e293b;margin-bottom:6px}
  input{width:100%;padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:10px;
        font-size:14px;margin-bottom:16px;box-sizing:border-box;outline:none;
        transition:.2s}
  input:focus{border-color:#6C63FF}
  button{width:100%;padding:12px;background:#6C63FF;color:#fff;border:none;
         border-radius:10px;font-size:15px;font-weight:600;cursor:pointer}
  .alert{padding:12px 16px;border-radius:10px;font-size:14px;margin-bottom:16px}
  .alert.error{background:#FFF0F0;color:#D63031;border:1px solid #FFB8B8}
  .alert.success{background:#F0FFF8;color:#00875A;border:1px solid #B3F0D8}
  .warn{background:#FFF8E1;border:1px solid #FFE082;color:#856404;padding:12px 16px;
        border-radius:10px;font-size:13px;margin-bottom:20px}
</style>
</head>
<body>
<div class="box">
  <h2>🛠️ Setup DailyFlow</h2>
  <p class="sub">Buat akun pertama untuk mengakses website.</p>
  <div class="warn">⚠️ <strong>Hapus file ini</strong> setelah akun berhasil dibuat!</div>
  <?php if ($msg): ?>
    <div class="alert <?= $msgType ?>"><?= htmlspecialchars($msg) ?></div>
  <?php endif; ?>
  <?php if ($pdo): ?>
  <form method="POST">
    <label>Nama Lengkap *</label>
    <input type="text" name="full_name" placeholder="contoh: Zikri" required>
    <label>Username *</label>
    <input type="text" name="username" placeholder="contoh: zikri123" required>
    <label>Password * (min 6 karakter)</label>
    <input type="password" name="password" placeholder="••••••" required>
    <label>Email (opsional)</label>
    <input type="email" name="email" placeholder="contoh: zikri@email.com">
    <button type="submit">Buat Akun</button>
  </form>
  <?php endif; ?>
  <?php if ($msgType === 'success'): ?>
    <p style="text-align:center;margin-top:16px">
      <a href="index.html" style="color:#6C63FF;font-weight:600">→ Ke Halaman Login</a>
    </p>
  <?php endif; ?>
</div>
</body>
</html>