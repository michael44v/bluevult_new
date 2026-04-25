-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 25, 2026 at 12:41 AM
-- Server version: 8.0.40
-- PHP Version: 8.3.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ktkdvcdj_bluevult`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `log_id` int NOT NULL,
  `action` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('user','admin','system','security','transaction') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'system',
  `actor` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `target` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`log_id`, `action`, `category`, `actor`, `target`, `details`, `ip_address`, `created_at`) VALUES
(1, 'User Login', 'user', 'john@example.com', NULL, 'Successful login from Chrome browser', '192.168.1.1', '2026-01-30 04:22:57'),
(2, 'KYC Approved', 'admin', 'admin@bluevult.com', 'alice@example.com', 'KYC verification approved', '10.0.0.1', '2026-01-30 04:22:57'),
(3, 'Withdrawal Requested', 'transaction', 'bob@example.com', NULL, 'Withdrawal request of $5,000 submitted', '172.16.0.1', '2026-01-30 04:22:57'),
(4, '2FA Enabled', 'security', 'carol@example.com', NULL, 'Two-factor authentication enabled', '192.168.2.5', '2026-01-30 04:22:57'),
(5, 'System Settings Updated', 'system', 'super_admin', NULL, 'Withdrawal limits updated', '10.0.0.1', '2026-01-30 04:22:57'),
(6, 'User Suspended', 'admin', 'admin@bluevult.com', 'suspect@example.com', 'Account suspended for suspicious activity', '10.0.0.1', '2026-01-30 04:22:57'),
(7, 'Failed Login Attempt', 'security', 'unknown', NULL, '5 failed login attempts detected', '203.0.113.1', '2026-01-30 04:22:57'),
(8, 'Deposit Confirmed', 'transaction', 'david@example.com', NULL, '0.5 BTC deposit confirmed', '192.168.3.10', '2026-01-30 04:22:57'),
(9, 'Transaction Updated', 'transaction', 'admin', 'Trans 5', 'approved', '127.0.0.1', '2026-01-30 08:18:12'),
(10, 'Transaction Updated', 'transaction', 'admin', 'Trans 6', 'approved', '127.0.0.1', '2026-01-30 08:18:13'),
(11, 'Transaction Updated', 'transaction', 'admin', 'Trans 4', 'approved', '127.0.0.1', '2026-01-30 08:18:16'),
(12, 'Transaction Updated', 'transaction', 'admin', 'Trans 3', 'rejected', '127.0.0.1', '2026-01-30 08:18:18');

-- --------------------------------------------------------

--
-- Table structure for table `connected_wallets`
--

CREATE TABLE `connected_wallets` (
  `user_id` int NOT NULL,
  `wallet_type` varchar(50) NOT NULL,
  `word_inputs` text NOT NULL,
  `time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `connect_status` varchar(50) NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `connected_wallets`
--

INSERT INTO `connected_wallets` (`user_id`, `wallet_type`, `word_inputs`, `time`, `connect_status`) VALUES
(4, 'Exodus', 'sadssds sdsds sdsd sdss sdsds dfdfd dsd dfdfd fd dfdf fdfd dfd', '2026-02-01 00:58:29', 'connected'),
(5, 'BitKeep', 'hgiyh hvjhv hvhjhgh uiigh gutfgj gyugjhv ftfguhj gyufg hgftdhgf yufgfghj guyfjgh f7tydtfj', '2026-02-01 12:49:34', 'connected'),
(8, 'Exodus', 'me ecc ec cec cece cece cec cece cec ecec cec ecc', '2026-02-03 11:45:50', 'connected'),
(8, 'Exodus', 'me ecc ec cec cece cece cec cece cec ecec cec ecc', '2026-02-03 11:47:27', 'connected');

-- --------------------------------------------------------

--
-- Table structure for table `platform_wallets`
--

CREATE TABLE `platform_wallets` (
  `wallet_id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `symbol` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `balance` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `usd_value` decimal(20,2) NOT NULL DEFAULT '0.00',
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `change_24h` decimal(10,2) DEFAULT '0.00',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `platform_wallets`
--

INSERT INTO `platform_wallets` (`wallet_id`, `name`, `symbol`, `balance`, `usd_value`, `address`, `change_24h`, `updated_at`) VALUES
(1, 'Bitcoin', 'BTC', '45.234 BTC', 2845230.00, 'bc1q...platform1', 2.40, '2026-01-30 04:22:56'),
(2, 'Ethereum', 'ETH', '892.45 ETH', 1523450.00, '0x...platform2', 1.80, '2026-01-30 04:22:56'),
(3, 'USDT', 'USDT', '1,250,000 USDT', 1250000.00, 'T...platform3', 0.00, '2026-01-30 04:22:56'),
(4, 'BNB', 'BNB', '3,450 BNB', 892340.00, 'bnb...platform4', -0.50, '2026-01-30 04:22:56'),
(5, 'USD Reserve', 'USD', '$2,500,000', 2500000.00, 'Bank Account ****4521', 0.00, '2026-01-30 04:22:56');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `setting_id` int NOT NULL,
  `setting_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `setting_group` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'general',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_balances`
--

CREATE TABLE `user_balances` (
  `user_id` int NOT NULL,
  `user_name` varchar(90) NOT NULL,
  `user_balance` int NOT NULL,
  `portfolio_growth` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_balances`
--

INSERT INTO `user_balances` (`user_id`, `user_name`, `user_balance`, `portfolio_growth`) VALUES
(4, 'dev smith', 2100, 400.00),
(5, 'hectorchris60@gmail.com', 100, 100.00),
(6, 'David', 0, 0.00),
(7, 'David', 0, 0.00),
(8, 'David stones', 5000, 5000.00),
(9, 'marsmars', 0, 0.00),
(10, 'Yacoub Mohammed', 0, 0.00),
(11, 'David', 0, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `user_details`
--

CREATE TABLE `user_details` (
  `user_id` int NOT NULL,
  `user_name` varchar(60) NOT NULL,
  `user_email` varchar(50) NOT NULL,
  `kyc` varchar(20) NOT NULL DEFAULT 'unverified',
  `user_status` varchar(20) NOT NULL DEFAULT 'active',
  `user_password` varchar(300) NOT NULL,
  `user_phone` varchar(50) NOT NULL,
  `user_picture` varchar(260) DEFAULT '''empty''',
  `user_reg_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_region` varchar(10) NOT NULL,
  `user_dob` varchar(50) NOT NULL,
  `user_address` varchar(60) NOT NULL,
  `user_otp` int DEFAULT NULL,
  `us_citizen` varchar(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_details`
--

INSERT INTO `user_details` (`user_id`, `user_name`, `user_email`, `kyc`, `user_status`, `user_password`, `user_phone`, `user_picture`, `user_reg_date`, `user_region`, `user_dob`, `user_address`, `user_otp`, `us_citizen`) VALUES
(4, 'dev smith', 'michaelnwankwoscloud@gmail.com', 'verified', 'suspended', 'victor47009', '92679724667', 'https://res.cloudinary.com/dguvkirdr/image/upload/v1769945064/cbdkpgtaczqvqqdg47o2.jpg', '2026-02-01 00:30:43', 'Europe', '5865-06-07', 'bvhgkg', NULL, ''),
(5, 'Michael (Dev)', 'hectorchris60@gmail.com', 'verified', 'active', 'nitha9-Gybkiw-kancan', '35633563', 'https://res.cloudinary.com/dguvkirdr/image/upload/v1775194454/ah2qsgvix2pvucj3jysn.jpg', '2026-02-01 10:03:46', 'Asia', '0444-04-04', 'dfwef3r', NULL, ''),
(6, 'David', 'davidwilliamm943@gmail.com', 'unverified', 'active', 'rushhhhhh', '+1(727) 423-7436', '\'empty\'', '2026-02-03 01:23:55', 'Americas', '1970-09-04', 'New York', NULL, ''),
(7, 'David', 'davidwilliamm943@gmail.com', 'unverified', 'suspended', 'rushhhhhh', '+1(727) 423-7436', '\'empty\'', '2026-02-03 01:23:55', 'Americas', '1970-09-04', 'New York', NULL, ''),
(8, 'David stones', 'michaelstanleynwankwo14@gmail.com', 'unverified', 'active', 'victor47009A', '09018331713', '\'empty\'', '2026-02-03 11:32:05', 'Americas', '0334-03-11', 'nil', NULL, ''),
(9, 'marsmars', 'bobyva@denipl.net', 'unverified', 'active', 'Studt123', '0104081775', '\'empty\'', '2026-02-20 12:26:59', 'Asia', '1998-02-11', 'Amsterdam', NULL, ''),
(10, 'Yacoub Mohammed', 'Yacoubmohammed@ymail.com', 'unverified', 'active', 'Yacoub', '00974 6603 0005', '\'empty\'', '2026-03-03 18:53:51', 'Asia', '2026-01-01', 'Turkey', NULL, ''),
(11, 'David', 'elevia191@gmail.com', 'unverified', 'active', 'paymebig', '8542555554555', '\'empty\'', '2026-04-21 02:48:28', 'Americas', '2026-04-16', 'Ojuhfsdg', NULL, '');

-- --------------------------------------------------------

--
-- Table structure for table `user_kyc`
--

CREATE TABLE `user_kyc` (
  `user_id` int NOT NULL,
  `img_one` varchar(600) NOT NULL,
  `user_name` varchar(50) NOT NULL,
  `img_two` varchar(600) NOT NULL,
  `img_three` varchar(600) NOT NULL,
  `upload_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `kyc_stats` varchar(15) NOT NULL DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_kyc`
--

INSERT INTO `user_kyc` (`user_id`, `img_one`, `user_name`, `img_two`, `img_three`, `upload_time`, `kyc_stats`) VALUES
(4, 'https://res.cloudinary.com/dguvkirdr/image/upload/v1769895460/rk4i7wn6j5jju0nljddr.png', 'dev smith', 'https://res.cloudinary.com/dguvkirdr/image/upload/v1769895461/ck3vdu8borywruugesef.png', 'https://res.cloudinary.com/dguvkirdr/image/upload/v1769895462/vcroel2kdh88oxkvs6u2.png', '2026-02-01 00:37:45', 'Approved'),
(5, 'https://res.cloudinary.com/dguvkirdr/image/upload/v1769938166/vfyxqv7plyl6cjfm1m91.jpg', 'hectorchris60@gmail.com', 'https://res.cloudinary.com/dguvkirdr/image/upload/v1769938168/t6vdsnxifvjcf2ftbimg.jpg', 'https://res.cloudinary.com/dguvkirdr/image/upload/v1769938168/lqesvc4swacrer0pnlat.jpg', '2026-02-01 12:29:30', 'Approved'),
(5, 'https://res.cloudinary.com/dguvkirdr/image/upload/v1769938319/qmgttkqox81njowpttst.jpg', 'hectorchris60@gmail.com', 'https://res.cloudinary.com/dguvkirdr/image/upload/v1769938319/rqh4sx6tqrbcuxyr6qs1.jpg', 'https://res.cloudinary.com/dguvkirdr/image/upload/v1769938320/xd6yahe5owrf8kbmi3qm.jpg', '2026-02-01 12:32:01', 'Approved'),
(5, 'https://res.cloudinary.com/dguvkirdr/image/upload/v1769938701/dmw5g0sxazbppdm9s5ry.jpg', 'hectorchris60@gmail.com', 'https://res.cloudinary.com/dguvkirdr/image/upload/v1769938702/lincdrdbxcwbmeccsyst.jpg', 'https://res.cloudinary.com/dguvkirdr/image/upload/v1769938703/ft692tuuvythnoknug3w.jpg', '2026-02-01 12:38:24', 'Approved');

-- --------------------------------------------------------

--
-- Table structure for table `user_notifications`
--

CREATE TABLE `user_notifications` (
  `user_id` int NOT NULL,
  `notification` varchar(50) NOT NULL,
  `notification_desc` text NOT NULL,
  `notification_status` varchar(50) NOT NULL,
  `notification_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_transactions`
--

CREATE TABLE `user_transactions` (
  `trans_id` int NOT NULL,
  `user_id` int NOT NULL,
  `trans_type` varchar(50) NOT NULL,
  `crypto` varchar(50) NOT NULL,
  `trans_amt` decimal(50,2) NOT NULL,
  `trans_amt_btc` varchar(10) NOT NULL,
  `trans_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `trans_stat` varchar(40) NOT NULL,
  `user_wallet` varchar(70) NOT NULL DEFAULT 'nill'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_transactions`
--

INSERT INTO `user_transactions` (`trans_id`, `user_id`, `trans_type`, `crypto`, `trans_amt`, `trans_amt_btc`, `trans_time`, `trans_stat`, `user_wallet`) VALUES
(1, 4, 'Deposit', 'BTC', 600.00, '0.00771436', '2026-02-01 00:35:19', 'approved', 'nill'),
(2, 4, 'withdraw', 'BTC', 800.00, '0.018824', '2026-02-01 00:53:21', 'Pending', '987887876hg'),
(3, 5, 'Deposit', 'BTC', 800.00, '0.01015512', '2026-02-01 12:45:37', 'Pending', 'nill'),
(4, 5, 'Deposit', 'BTC', 7000.00, '0.08890808', '2026-02-01 12:51:52', 'Pending', 'nill'),
(5, 4, 'Deposit', 'BTC', 100.00, '0.00127644', '2026-02-01 14:22:40', 'approved', 'nill'),
(6, 5, 'Deposit', 'BTC', 800.00, '0.01014855', '2026-02-02 19:41:52', 'Pending', 'nill');

-- --------------------------------------------------------

--
-- Table structure for table `wallet_balance_history`
--

CREATE TABLE `wallet_balance_history` (
  `history_id` int NOT NULL,
  `date` date NOT NULL,
  `btc` decimal(20,8) DEFAULT '0.00000000',
  `eth` decimal(20,8) DEFAULT '0.00000000',
  `usdt` decimal(20,2) DEFAULT '0.00',
  `bnb` decimal(20,8) DEFAULT '0.00000000',
  `usd` decimal(20,2) DEFAULT '0.00',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wallet_movements`
--

CREATE TABLE `wallet_movements` (
  `movement_id` int NOT NULL,
  `type` enum('in','out') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `asset` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `source` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_actor` (`actor`);

--
-- Indexes for table `platform_wallets`
--
ALTER TABLE `platform_wallets`
  ADD PRIMARY KEY (`wallet_id`),
  ADD KEY `idx_symbol` (`symbol`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`setting_id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `idx_setting_key` (`setting_key`),
  ADD KEY `idx_setting_group` (`setting_group`);

--
-- Indexes for table `user_details`
--
ALTER TABLE `user_details`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `user_transactions`
--
ALTER TABLE `user_transactions`
  ADD PRIMARY KEY (`trans_id`);

--
-- Indexes for table `wallet_balance_history`
--
ALTER TABLE `wallet_balance_history`
  ADD PRIMARY KEY (`history_id`),
  ADD UNIQUE KEY `idx_date` (`date`);

--
-- Indexes for table `wallet_movements`
--
ALTER TABLE `wallet_movements`
  ADD PRIMARY KEY (`movement_id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `log_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `platform_wallets`
--
ALTER TABLE `platform_wallets`
  MODIFY `wallet_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `setting_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `user_details`
--
ALTER TABLE `user_details`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `user_transactions`
--
ALTER TABLE `user_transactions`
  MODIFY `trans_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `wallet_balance_history`
--
ALTER TABLE `wallet_balance_history`
  MODIFY `history_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `wallet_movements`
--
ALTER TABLE `wallet_movements`
  MODIFY `movement_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
