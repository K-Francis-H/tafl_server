-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu2.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Sep 15, 2020 at 08:43 AM
-- Server version: 5.7.31-0ubuntu0.16.04.1
-- PHP Version: 7.0.33-0ubuntu0.16.04.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tafl`
--

-- --------------------------------------------------------

--
-- Table structure for table `game`
--
-- Creation: Sep 15, 2020 at 12:41 PM
--

CREATE TABLE `game` (
  `id` char(37) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'uuidv4',
  `defender_id` char(37) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'uuidv4',
  `attacker_id` char(37) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'uuidv4',
  `variant` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ruleset` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notation` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'in progress' COMMENT 'in progress, abandoned, complete, resigned',
  `result` varchar(37) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'defender_id, attacker_id, DRAW',
  `start_date` date NOT NULL,
  `last_move_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `end_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `player`
--
-- Creation: Sep 08, 2020 at 04:28 PM
--

CREATE TABLE `player` (
  `id` char(37) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'uuidv4',
  `name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_human` tinyint(1) NOT NULL DEFAULT '1',
  `elo` int(11) NOT NULL DEFAULT '1500',
  `wins` int(11) NOT NULL DEFAULT '0',
  `losses` int(11) NOT NULL DEFAULT '0',
  `draws` int(11) NOT NULL DEFAULT '0',
  `created` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `player`
--
ALTER TABLE `player`
  ADD PRIMARY KEY (`id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
