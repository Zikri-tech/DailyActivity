<?php
// FILE: check_session.php
session_start();
header('Content-Type: application/json');

if (!empty($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    echo json_encode([
        'loggedIn'  => true,
        'full_name' => $_SESSION['full_name'] ?? '',
        'username'  => $_SESSION['username']  ?? '',
        'user_id'   => $_SESSION['user_id']   ?? null
    ]);
} else {
    echo json_encode(['loggedIn' => false]);
}
?>