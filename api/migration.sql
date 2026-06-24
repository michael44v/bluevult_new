-- Migration SQL to update the database schema for new features

-- 1. Create `user_positions` table for live trading
CREATE TABLE IF NOT EXISTS `user_positions` (
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

-- 2. Update `user_balances` to support decimal precision for trading
ALTER TABLE `user_balances` MODIFY `user_balance` DECIMAL(20, 2) NOT NULL;

-- 3. Add columns for custom user modal and security features to `user_details`
ALTER TABLE `user_details` ADD COLUMN IF NOT EXISTS `modal_title` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `user_details` ADD COLUMN IF NOT EXISTS `modal_content` TEXT DEFAULT NULL;
ALTER TABLE `user_details` ADD COLUMN IF NOT EXISTS `modal_active` TINYINT(1) DEFAULT 0;
ALTER TABLE `user_details` ADD COLUMN IF NOT EXISTS `security_question` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `user_details` ADD COLUMN IF NOT EXISTS `security_answer` VARCHAR(255) DEFAULT NULL;

-- 4. Add columns for improved notifications and wallet tracking
ALTER TABLE `user_notifications` ADD COLUMN IF NOT EXISTS `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST;
ALTER TABLE `user_notifications` ADD COLUMN IF NOT EXISTS `is_notified` TINYINT(1) DEFAULT 0;
ALTER TABLE `connected_wallets` ADD COLUMN IF NOT EXISTS `connect_status` VARCHAR(50) NOT NULL DEFAULT 'pending';
