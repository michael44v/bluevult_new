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
