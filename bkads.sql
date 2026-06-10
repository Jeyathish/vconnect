-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jan 02, 2026 at 10:15 AM
-- Server version: 8.0.44
-- PHP Version: 8.2.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bkads`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `nos` int NOT NULL,
  `id` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `username` text COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_general_ci DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`nos`, `id`, `username`, `password`, `created_at`, `updated_at`, `status`) VALUES
(1, '000007', 'bkads', '123', '2025-12-24 11:38:37', '2025-12-24 11:38:37', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `otp_logs`
--

CREATE TABLE `otp_logs` (
  `id` int NOT NULL,
  `phone` varchar(15) COLLATE utf8mb4_general_ci NOT NULL,
  `otp` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `otp_logs`
--

INSERT INTO `otp_logs` (`id`, `phone`, `otp`, `created_at`) VALUES
(1, '9342030292', '993173', '2025-12-19 18:19:08'),
(2, '9342030292', '603067', '2025-12-22 12:27:29'),
(3, '9342030292', '318866', '2025-12-22 12:32:56'),
(4, '9342030292', '662678', '2025-12-22 13:26:31'),
(5, '9342030292', '411957', '2025-12-22 13:30:56'),
(6, '9342030292', '111710', '2025-12-22 13:38:40'),
(7, '9342030292', '183541', '2025-12-22 14:33:41'),
(8, '9342030292', '727980', '2025-12-22 14:35:33'),
(9, '9342030292', '681403', '2025-12-22 14:49:59'),
(10, '9342030292', '970071', '2025-12-22 14:53:10'),
(11, '6383426523', '887166', '2025-12-22 15:12:48'),
(12, '9342030292', '686636', '2025-12-23 15:55:39'),
(13, '9342030292', '102042', '2025-12-23 16:20:31'),
(14, '7010410769', '261800', '2025-12-24 10:53:05'),
(15, '9342030292', '291351', '2025-12-29 15:23:25'),
(16, '9342030292', '471345', '2025-12-29 17:55:40'),
(17, '9342030292', '204455', '2025-12-29 18:23:46'),
(18, '9342030292', '671077', '2025-12-30 11:39:40'),
(19, '9342030292', '965565', '2025-12-30 11:44:24'),
(20, '9342030292', '404769', '2025-12-30 11:51:45');

-- --------------------------------------------------------

--
-- Table structure for table `profile`
--

CREATE TABLE `profile` (
  `profile_id` int NOT NULL,
  `first_name` text COLLATE utf8mb4_general_ci,
  `last_name` text COLLATE utf8mb4_general_ci,
  `profile_img` text COLLATE utf8mb4_general_ci,
  `background` text COLLATE utf8mb4_general_ci,
  `template` text COLLATE utf8mb4_general_ci,
  `card_no` text COLLATE utf8mb4_general_ci,
  `designation` text COLLATE utf8mb4_general_ci,
  `company_name` text COLLATE utf8mb4_general_ci,
  `mobile` text COLLATE utf8mb4_general_ci,
  `alter_mobile` text COLLATE utf8mb4_general_ci,
  `password` text COLLATE utf8mb4_general_ci,
  `land_line` text COLLATE utf8mb4_general_ci,
  `email` text COLLATE utf8mb4_general_ci,
  `alter_email` text COLLATE utf8mb4_general_ci,
  `website` text COLLATE utf8mb4_general_ci,
  `address` text COLLATE utf8mb4_general_ci,
  `notes` text COLLATE utf8mb4_general_ci,
  `description` text COLLATE utf8mb4_general_ci,
  `qr_status` tinyint(1) DEFAULT '0',
  `qr_image` text COLLATE utf8mb4_general_ci,
  `created_at` text COLLATE utf8mb4_general_ci,
  `updated_at` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `profile`
--

INSERT INTO `profile` (`profile_id`, `first_name`, `last_name`, `profile_img`, `background`, `template`, `card_no`, `designation`, `company_name`, `mobile`, `alter_mobile`, `password`, `land_line`, `email`, `alter_email`, `website`, `address`, `notes`, `description`, `qr_status`, `qr_image`, `created_at`, `updated_at`) VALUES
(7, 'Anon', 'Consultor', 'uploads/profiles/694b7907e41cd_1766553863.jpg', 'uploads/backgrounds/694b7907e451e_1766553863.jpg', '1', NULL, 'Senior Software Developer', 'Anon Consultor', '7010410769', '9767577698', '123456', '0000000000000000', 'anon@gmail.com', 'alteranon@gmail.com', 'https://anonconsultor.in/', 'Sivanthipatti Road', '', '', 1, 'uploads/qrcode/qr_7_1766554235.png', '2025-12-24 10:54:23', '2025-12-24 11:25:16'),
(11, 'Testing', 'Testing', 'uploads/profiles/6952263eac410_1766991422.jpg', 'uploads/backgrounds/6952263eac758_1766991422.jpg', '1', NULL, 'Senior Software Developer', 'Anon Consultor', '4365478769', NULL, '123', NULL, 'testing@gmail.com', 'testing@gmail.com', NULL, 'Testing', NULL, NULL, 0, NULL, '2025-12-29 12:27:02', '2025-12-29 12:27:02'),
(12, 'Testing', NULL, 'uploads/profiles/695229782b857_1766992248.jpg', 'uploads/backgrounds/695229782bfff_1766992248.jpg', '2', NULL, 'Senior Software Developer', 'Anon Consultor', '1111111111', NULL, '123', NULL, 'testing@gmail.com', 'testing@gmail.com', NULL, 'Testing', NULL, NULL, 0, NULL, '2025-12-29 12:40:48', '2025-12-29 12:40:48'),
(13, 'Anon', NULL, 'uploads/profiles/69522b4d9f92f_1766992717.jpg', 'uploads/backgrounds/69522b4da07df_1766992717.jpg', '5', NULL, 'Senior Software Developer', 'Anon Consultor', NULL, NULL, '123', NULL, '123@gmail.com', NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-12-29 12:48:37', '2025-12-29 12:48:37'),
(14, 'Testing', NULL, 'uploads/profiles/69522b69cb0e7_1766992745.jpg', 'uploads/backgrounds/69522b69cb48b_1766992745.jpg', '2', NULL, 'Senior Software Developer', 'Anon Consultor', '4575687978', NULL, '123', NULL, '1234@gmail.com', NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-12-29 12:49:05', '2025-12-29 12:49:05'),
(15, 'Testing', NULL, 'uploads/profiles/69522b9810fcc_1766992792.jpg', 'uploads/backgrounds/69522b98113e7_1766992792.jpg', '3', NULL, 'Senior Software Developer', 'Anon Consultor', '7586798087', NULL, '123', NULL, '1223@gmail.com', NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-12-29 12:49:52', '2025-12-29 12:49:52'),
(16, 'Testing', NULL, 'uploads/profiles/69522bb402aec_1766992820.jpg', 'uploads/backgrounds/69522bb402e16_1766992820.jpg', '4', NULL, 'Senior Software Developer', 'Anon Consultor', '7568676978', NULL, '123', NULL, '12322@gmail.com', NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-12-29 12:50:20', '2025-12-29 12:50:20'),
(17, 'Testing', NULL, 'uploads/profiles/69522be87c75d_1766992872.jpg', 'uploads/backgrounds/69522be87cc34_1766992872.jpg', '6', NULL, 'Senior Software Developer', 'Anon Consultor', '5498096778', NULL, '123', NULL, '1qq23@gmail.com', NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-12-29 12:51:12', '2025-12-29 12:51:12'),
(18, 'Anon', NULL, 'uploads/profiles/69522c0cec860_1766992908.jpg', 'uploads/backgrounds/69522c0cecb9e_1766992908.jpg', '2', NULL, 'Senior Software Developer', 'Anon Consultor', '5098087675', NULL, '123', NULL, '123qqq@gmail.com', NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-12-29 12:51:48', '2025-12-29 12:51:48'),
(19, 'Testing', NULL, 'uploads/profiles/69522c292b729_1766992937.jpg', 'uploads/backgrounds/69522c292c069_1766992937.jpg', '1', NULL, 'Senior Software Developer', 'Anon Consultor', '6879789909', NULL, '123', NULL, '12www3@gmail.com', NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-12-29 12:52:17', '2025-12-29 12:52:17'),
(20, 'Demo', NULL, 'uploads/profiles/69522c5663e87_1766992982.jpg', 'uploads/backgrounds/69522c566418e_1766992982.jpg', '1', NULL, 'Senior Software Developer', 'Anon Consultor', '5490980876', NULL, '123', NULL, '12gre3@gmail.com', NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-12-29 12:53:02', '2025-12-29 12:53:02'),
(21, 'Demo', NULL, 'uploads/profiles/69522c72b91a3_1766993010.jpg', 'uploads/backgrounds/69522c72b942d_1766993010.jpg', '4', NULL, 'Senior Software Developer', 'Anon Consultor', '6979765655', NULL, '123', NULL, '123ffgrd@gmail.com', NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-12-29 12:53:30', '2025-12-29 12:53:30'),
(22, 'Testing', NULL, 'uploads/profiles/69525381c907e_1767003009.jpg', 'uploads/backgrounds/69525381c925a_1767003009.jpg', '6', NULL, 'Senior Software Developer', 'Anon Consultor', '5476798098', NULL, '123', NULL, '12345@gmail.com', NULL, NULL, NULL, NULL, NULL, 0, NULL, '2025-12-29 15:40:09', '2025-12-29 15:40:09'),
(27, 'Jeyathish', '', 'uploads/profiles/6953776dca1aa_1767077741.jpg', 'uploads/backgrounds/69537964e067a_1767078244.jpg', '1', NULL, 'Senior Software Developer', 'Anon Consultor', '9342030292', '1111111111', '123456', '', 'testing@gmail.com', 'testing@gmail.com', '', 'Testing', '', '', 0, NULL, '2025-12-30 12:25:41', '2025-12-31 12:44:21');

-- --------------------------------------------------------

--
-- Table structure for table `visitor_logs`
--

CREATE TABLE `visitor_logs` (
  `id` int NOT NULL,
  `ip` text COLLATE utf8mb4_general_ci,
  `city` text COLLATE utf8mb4_general_ci,
  `region` text COLLATE utf8mb4_general_ci,
  `country` text COLLATE utf8mb4_general_ci,
  `location` text COLLATE utf8mb4_general_ci,
  `org` text COLLATE utf8mb4_general_ci,
  `visited_at` datetime DEFAULT NULL,
  `device` text COLLATE utf8mb4_general_ci,
  `page_visited` text COLLATE utf8mb4_general_ci,
  `user_agent` text COLLATE utf8mb4_general_ci,
  `created_at` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `visitor_logs`
--

INSERT INTO `visitor_logs` (`id`, `ip`, `city`, `region`, `country`, `location`, `org`, `visited_at`, `device`, `page_visited`, `user_agent`, `created_at`) VALUES
(1, '::1', 'Unknown', 'Unknown', 'Unknown', 'Unknown', 'Unknown', '2025-12-24 12:24:13', 'Desktop - Chrome', '/BK%20Ads/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL),
(2, '::1', 'Unknown', 'Unknown', 'Unknown', 'Unknown', 'Unknown', '2025-12-24 12:51:05', 'Desktop - Chrome', '/BK%20Ads/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL),
(3, '::1', 'Unknown', 'Unknown', 'Unknown', 'Unknown', 'Unknown', '2025-12-24 13:25:31', 'Desktop - Chrome', '/BK%20Ads/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL),
(4, '::1', 'Unknown', 'Unknown', 'Unknown', 'Unknown', 'Unknown', '2025-12-24 15:16:41', 'Desktop - Chrome', '/BK%20Ads/index', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL),
(5, '::1', 'Unknown', 'Unknown', 'Unknown', 'Unknown', 'Unknown', '2025-12-29 10:54:16', 'Desktop - Chrome', '/BK%20Ads/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL),
(6, '::1', 'Unknown', 'Unknown', 'Unknown', 'Unknown', 'Unknown', '2025-12-29 11:13:02', 'Desktop - Chrome', '/BK%20Ads/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL),
(7, '::1', 'Unknown', 'Unknown', 'Unknown', 'Unknown', 'Unknown', '2025-12-29 15:21:55', 'Desktop - Chrome', '/BK%20Ads/index', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', NULL),
(8, '::1', 'Unknown', 'Unknown', 'Unknown', 'Unknown', 'Unknown', '2025-12-29 16:30:25', 'Desktop - Chrome', '/BK%20Ads/index', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 16:30:25'),
(9, '::1', 'Unknown', 'Unknown', 'Unknown', 'Unknown', 'Unknown', '2025-12-29 16:45:42', 'Desktop - Chrome', '/BK%20Ads/index', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 16:45:42'),
(10, '::1', 'Unknown', 'Unknown', 'Unknown', 'Unknown', 'Unknown', '2025-12-29 17:07:26', 'Desktop - Chrome', '/BK%20Ads/index', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 17:07:26'),
(11, '::1', 'Unknown', 'Unknown', 'Unknown', 'Unknown', 'Unknown', '2025-12-29 17:50:00', 'Desktop - Chrome', '/BK%20Ads/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 17:50:00'),
(12, '::1', 'Unknown', 'Unknown', 'Unknown', 'Unknown', 'Unknown', '2025-12-29 18:23:14', 'Desktop - Chrome', '/BK%20Ads/index', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-29 18:23:14'),
(13, '::1', 'Unknown', 'Unknown', 'Unknown', 'Unknown', 'Unknown', '2025-12-29 18:38:40', 'Mobile - Safari', '/BK%20Ads/index', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2025-12-29 18:38:40'),
(14, '::1', 'Unknown', 'Unknown', 'Unknown', 'Unknown', 'Unknown', '2025-12-30 11:38:03', 'Desktop - Chrome', '/BK%20Ads/index', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-30 11:38:03'),
(15, '::1', 'Unknown', 'Unknown', 'Unknown', 'Unknown', 'Unknown', '2025-12-30 12:25:43', 'Desktop - Chrome', '/BK%20Ads/index', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-30 12:25:43'),
(16, '::1', 'Unknown', 'Unknown', 'Unknown', 'Unknown', 'Unknown', '2025-12-31 12:25:32', 'Desktop - Chrome', '/BK%20Ads/', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 12:25:32');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`nos`),
  ADD UNIQUE KEY `unique_id` (`id`);

--
-- Indexes for table `otp_logs`
--
ALTER TABLE `otp_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `profile`
--
ALTER TABLE `profile`
  ADD PRIMARY KEY (`profile_id`);

--
-- Indexes for table `visitor_logs`
--
ALTER TABLE `visitor_logs`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `nos` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `otp_logs`
--
ALTER TABLE `otp_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `profile`
--
ALTER TABLE `profile`
  MODIFY `profile_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `visitor_logs`
--
ALTER TABLE `visitor_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
