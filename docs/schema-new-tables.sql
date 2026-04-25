-- =============================================
-- NEW TABLES FOR ADMIN DASHBOARD
-- Run these SQL statements to create the required tables
-- =============================================

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    category ENUM('user', 'admin', 'system', 'security', 'transaction') NOT NULL DEFAULT 'system',
    actor VARCHAR(255) NOT NULL,
    target VARCHAR(255) NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_created_at (created_at),
    INDEX idx_actor (actor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_group VARCHAR(50) DEFAULT 'general',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key),
    INDEX idx_setting_group (setting_group)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, setting_group) VALUES
('platform_name', 'BlueVult', 'platform'),
('maintenance_mode', 'false', 'platform'),
('registration_enabled', 'true', 'platform'),
('min_deposit', '50', 'transactions'),
('max_deposit', '100000', 'transactions'),
('min_withdrawal', '100', 'transactions'),
('max_withdrawal', '50000', 'transactions'),
('withdrawal_fee', '2.5', 'transactions'),
('require_2fa', 'false', 'security'),
('kyc_required', 'true', 'security'),
('session_timeout', '30', 'security'),
('email_notifications', 'true', 'notifications'),
('sms_notifications', 'false', 'notifications'),
('admin_alerts', 'true', 'notifications')
ON DUPLICATE KEY UPDATE setting_key = setting_key;

-- Platform Wallets Table (for admin wallet management)
CREATE TABLE IF NOT EXISTS platform_wallets (
    wallet_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    balance VARCHAR(50) NOT NULL,
    usd_value DECIMAL(20, 2) NOT NULL DEFAULT 0,
    address VARCHAR(255) NOT NULL,
    change_24h DECIMAL(10, 2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_symbol (symbol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample platform wallets
INSERT INTO platform_wallets (name, symbol, balance, usd_value, address, change_24h) VALUES
('Bitcoin', 'BTC', '45.234 BTC', 2845230.00, 'bc1q...platform1', 2.4),
('Ethereum', 'ETH', '892.45 ETH', 1523450.00, '0x...platform2', 1.8),
('USDT', 'USDT', '1,250,000 USDT', 1250000.00, 'T...platform3', 0),
('BNB', 'BNB', '3,450 BNB', 892340.00, 'bnb...platform4', -0.5),
('USD Reserve', 'USD', '$2,500,000', 2500000.00, 'Bank Account ****4521', 0)
ON DUPLICATE KEY UPDATE wallet_id = wallet_id;

-- Wallet Movements Table
CREATE TABLE IF NOT EXISTS wallet_movements (
    movement_id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('in', 'out') NOT NULL,
    asset VARCHAR(10) NOT NULL,
    amount VARCHAR(50) NOT NULL,
    source VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample wallet movements
INSERT INTO wallet_movements (type, asset, amount, source) VALUES
('in', 'BTC', '+0.5 BTC', 'User Deposit'),
('out', 'ETH', '-2.3 ETH', 'Withdrawal'),
('in', 'USDT', '+50,000 USDT', 'User Deposit'),
('out', 'BTC', '-0.25 BTC', 'Withdrawal'),
('in', 'ETH', '+5.0 ETH', 'User Deposit');

-- Wallet Balance History Table
CREATE TABLE IF NOT EXISTS wallet_balance_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    btc DECIMAL(20, 8) DEFAULT 0,
    eth DECIMAL(20, 8) DEFAULT 0,
    usdt DECIMAL(20, 2) DEFAULT 0,
    bnb DECIMAL(20, 8) DEFAULT 0,
    usd DECIMAL(20, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample balance history (last 7 days)
INSERT INTO wallet_balance_history (date, btc, eth, usdt) VALUES
(DATE_SUB(CURDATE(), INTERVAL 6 DAY), 42.5, 850, 1100000),
(DATE_SUB(CURDATE(), INTERVAL 5 DAY), 43.2, 865, 1150000),
(DATE_SUB(CURDATE(), INTERVAL 4 DAY), 44.1, 870, 1180000),
(DATE_SUB(CURDATE(), INTERVAL 3 DAY), 44.8, 880, 1200000),
(DATE_SUB(CURDATE(), INTERVAL 2 DAY), 45.0, 888, 1220000),
(DATE_SUB(CURDATE(), INTERVAL 1 DAY), 45.1, 890, 1240000),
(CURDATE(), 45.2, 892, 1250000)
ON DUPLICATE KEY UPDATE date = date;

-- Insert sample activity logs
INSERT INTO activity_logs (action, category, actor, target, details, ip_address) VALUES
('User Login', 'user', 'john@example.com', NULL, 'Successful login from Chrome browser', '192.168.1.1'),
('KYC Approved', 'admin', 'admin@bluevult.com', 'alice@example.com', 'KYC verification approved', '10.0.0.1'),
('Withdrawal Requested', 'transaction', 'bob@example.com', NULL, 'Withdrawal request of $5,000 submitted', '172.16.0.1'),
('2FA Enabled', 'security', 'carol@example.com', NULL, 'Two-factor authentication enabled', '192.168.2.5'),
('System Settings Updated', 'system', 'super_admin', NULL, 'Withdrawal limits updated', '10.0.0.1'),
('User Suspended', 'admin', 'admin@bluevult.com', 'suspect@example.com', 'Account suspended for suspicious activity', '10.0.0.1'),
('Failed Login Attempt', 'security', 'unknown', NULL, '5 failed login attempts detected', '203.0.113.1'),
('Deposit Confirmed', 'transaction', 'david@example.com', NULL, '0.5 BTC deposit confirmed', '192.168.3.10');