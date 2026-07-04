<?php
// FILE: login.php
session_start();
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');

// 1. PANGGIL FILE KONEKSI
// =========================
require_once __DIR__ . '/koneksi.php';

// 2. CEK APAKAH $pdo TERSEDIA
// ==============================
if (!isset($pdo)) {
    echo json_encode([
        'success' => false, 
        'message' => 'Koneksi database tidak tersedia.'
    ]);
    exit;
}

// 3. CEK METHOD REQUEST
// =======================
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false, 
        'message' => 'Metode tidak diizinkan.'
    ]);
    exit;
}

// 4. AMBIL DATA DARI FORM
// =========================
$username = trim($_POST['username'] ?? '');
$password = trim($_POST['password'] ?? '');

if (empty($username) || empty($password)) {
    echo json_encode([
        'success' => false, 
        'message' => 'Username dan password wajib diisi.'
    ]);
    exit;
}

// 5. PROSES LOGIN
// =================
try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        // Set session (PERHATIKAN: gunakan $_SESSION, BUKAN $SESSION!)
        $_SESSION['user_id']   = $user['id'];
        $_SESSION['username']  = $user['username'];
        $_SESSION['full_name'] = $user['full_name'];
        $_SESSION['logged_in'] = true;

        // Update last login
        $upd = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $upd->execute([$user['id']]);

        echo json_encode([
            'success'   => true,
            'full_name' => $user['full_name'],
            'username'  => $user['username'],
            'user_id'   => $user['id']
        ]);
    } else {
        echo json_encode([
            'success' => false, 
            'message' => 'Username atau password salah!'
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Error database: ' . $e->getMessage()
    ]);
    exit;
}
?>