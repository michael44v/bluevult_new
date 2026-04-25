-- Migration to improve user_notifications table and other features

-- Add primary key to user_notifications if it doesn't exist
ALTER TABLE `user_notifications` ADD COLUMN `id` INT AUTO_INCREMENT PRIMARY KEY FIRST;

-- Ensure notification_status has a default
ALTER TABLE `user_notifications` MODIFY `notification_status` VARCHAR(20) DEFAULT 'unread';

-- Add a way to track if a notification has been 'seen' by the badge
ALTER TABLE `user_notifications` ADD COLUMN `is_notified` TINYINT(1) DEFAULT 0;
