-- Remove security question feature columns
ALTER TABLE `user_details` DROP COLUMN `security_question`;
ALTER TABLE `user_details` DROP COLUMN `security_answer`;
