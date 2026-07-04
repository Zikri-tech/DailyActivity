-- DailyFlow - Database

-- TABLE: user
CREATE TABLE `users` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username`    VARCHAR(50)   NOT NULL UNIQUE,
  `password`    VARCHAR(255)  NOT NULL COMMENT 'bcrypt hash',
  `full_name`   VARCHAR(100)  NOT NULL,
  `email`       VARCHAR(100)  DEFAULT NULL,
  `created_at`  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  `last_login`  TIMESTAMP     NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: study_sessions (dari Stopwatch)
CREATE TABLE `study_sessions` (
  `id`           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`      INT UNSIGNED NOT NULL,
  `duration_sec` INT UNSIGNED NOT NULL COMMENT 'Durasi dalam detik',
  `subject`      VARCHAR(100) DEFAULT 'Umum',
  `mode`         ENUM('normal','pomodoro') DEFAULT 'normal',
  `session_date` DATE         NOT NULL,
  `created_at`   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: todos
CREATE TABLE `todos` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`    INT UNSIGNED NOT NULL,
  `task`       VARCHAR(255) NOT NULL,
  `priority`   ENUM('low','medium','high') DEFAULT 'medium',
  `is_done`    TINYINT(1)   DEFAULT 0,
  `due_date`   DATE         DEFAULT NULL,
  `created_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
