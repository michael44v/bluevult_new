-- SQL to set up the live trading feature

-- Table structure for table `user_positions`
CREATE TABLE `user_positions` (
  `position_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `asset_symbol` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `side` enum('long','short') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `leverage` int NOT NULL,
  `margin` decimal(20,8) NOT NULL,
  `size` decimal(20,8) NOT NULL,
  `entry_price` decimal(20,8) NOT NULL,
  `close_price` decimal(20,8) DEFAULT NULL,
  `pnl` decimal(20,8) DEFAULT '0.00000000',
  `status` enum('open','closed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `closed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`position_id`),
  KEY `idx_user_status` (`user_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update `user_balances` to support decimal precision for trading
-- Note: Use with caution if existing data is present.
-- In index.php, we assume user_balance is a decimal.
ALTER TABLE `user_balances` MODIFY `user_balance` DECIMAL(20, 2) NOT NULL;

-- New columns for custom user modal and security features
ALTER TABLE `user_details` ADD COLUMN `modal_title` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `user_details` ADD COLUMN `modal_content` TEXT DEFAULT NULL;
ALTER TABLE `user_details` ADD COLUMN `modal_active` TINYINT(1) DEFAULT 0;
ALTER TABLE `user_details` ADD COLUMN `security_question` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `user_details` ADD COLUMN `security_answer` VARCHAR(255) DEFAULT NULL;

-- GTpayout Schema Updates

-- Add OTP support to user_details
ALTER TABLE `user_details` ADD COLUMN `otp_enabled` TINYINT(1) DEFAULT 0;
ALTER TABLE `user_details` ADD COLUMN `otp_code` VARCHAR(10) DEFAULT NULL;

-- Trading Wallets
CREATE TABLE IF NOT EXISTS `trading_wallets` (
  `wallet_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `balance` decimal(20,8) DEFAULT '0.00000000',
  `total_profit` decimal(20,8) DEFAULT '0.00000000',
  `total_loss` decimal(20,8) DEFAULT '0.00000000',
  `roi` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`wallet_id`),
  UNIQUE KEY `idx_user_wallet` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wallet Transfers
CREATE TABLE IF NOT EXISTS `wallet_transfers` (
  `transfer_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `from_wallet` enum('main','trading') NOT NULL,
  `to_wallet` enum('main','trading') NOT NULL,
  `amount` decimal(20,8) NOT NULL,
  `status` enum('pending','completed','failed') DEFAULT 'completed',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transfer_id`),
  KEY `idx_user_transfers` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trades (Binary/Options style for GTpayout)
CREATE TABLE IF NOT EXISTS `trades` (
  `trade_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `asset_symbol` varchar(20) NOT NULL,
  `direction` enum('up','down') NOT NULL,
  `amount` decimal(20,8) NOT NULL,
  `entry_price` decimal(20,8) NOT NULL,
  `exit_price` decimal(20,8) DEFAULT NULL,
  `duration` varchar(10) NOT NULL, -- e.g. '1m', '5m'
  `status` enum('open','won','lost','expired') DEFAULT 'open',
  `pnl` decimal(20,8) DEFAULT '0.00000000',
  `is_bot` tinyint(1) DEFAULT 0,
  `start_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `end_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`trade_id`),
  KEY `idx_user_trades` (`user_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trade Logs
CREATE TABLE IF NOT EXISTS `trade_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `trade_id` int NOT NULL,
  `message` text NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `idx_trade_logs` (`trade_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bot Sessions
CREATE TABLE IF NOT EXISTS `bot_sessions` (
  `session_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `mode` enum('conservative','balanced','aggressive','custom') NOT NULL,
  `status` enum('running','paused','stopped') DEFAULT 'running',
  `start_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `end_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`session_id`),
  KEY `idx_user_bot` (`user_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bot Settings
CREATE TABLE IF NOT EXISTS `bot_settings` (
  `settings_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `max_trades` int DEFAULT 10,
  `risk_percentage` decimal(5,2) DEFAULT '1.00',
  `trade_frequency` int DEFAULT 5, -- minutes between trades
  `max_daily_loss` decimal(20,8) DEFAULT '100.00000000',
  `max_daily_profit` decimal(20,8) DEFAULT '500.00000000',
  `stop_loss` decimal(5,2) DEFAULT '2.00',
  `take_profit` decimal(5,2) DEFAULT '5.00',
  PRIMARY KEY (`settings_id`),
  UNIQUE KEY `idx_user_settings` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Market Assets
CREATE TABLE IF NOT EXISTS `market_assets` (
  `asset_id` int NOT NULL AUTO_INCREMENT,
  `symbol` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('crypto','forex','commodity') NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `payout_percent` decimal(5,2) DEFAULT '80.00',
  PRIMARY KEY (`asset_id`),
  UNIQUE KEY `idx_symbol` (`symbol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Asset Prices (for simulation/history)
CREATE TABLE IF NOT EXISTS `asset_prices` (
  `price_id` bigint NOT NULL AUTO_INCREMENT,
  `asset_symbol` varchar(20) NOT NULL,
  `price` decimal(20,8) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`price_id`),
  KEY `idx_symbol_time` (`asset_symbol`, `timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trade Signals (AI)
CREATE TABLE IF NOT EXISTS `trade_signals` (
  `signal_id` int NOT NULL AUTO_INCREMENT,
  `asset_symbol` varchar(20) NOT NULL,
  `direction` enum('up','down') NOT NULL,
  `confidence` decimal(5,2) NOT NULL,
  `reason` text,
  `expected_probability` decimal(5,2),
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`signal_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Performance Stats
CREATE TABLE IF NOT EXISTS `performance_stats` (
  `stat_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `date` date NOT NULL,
  `daily_profit` decimal(20,8) DEFAULT '0.00000000',
  `daily_loss` decimal(20,8) DEFAULT '0.00000000',
  `win_rate` decimal(5,2) DEFAULT '0.00',
  `total_trades` int DEFAULT 0,
  PRIMARY KEY (`stat_id`),
  UNIQUE KEY `idx_user_date` (`user_id`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Leaderboard
CREATE TABLE IF NOT EXISTS `leaderboard` (
  `leader_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `rank` int DEFAULT NULL,
  `roi` decimal(10,2) DEFAULT '0.00',
  `profit` decimal(20,8) DEFAULT '0.00000000',
  `win_rate` decimal(5,2) DEFAULT '0.00',
  `month` varchar(7) NOT NULL, -- YYYY-MM
  PRIMARY KEY (`leader_id`),
  KEY `idx_month` (`month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
