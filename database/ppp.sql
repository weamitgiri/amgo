-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 29, 2026 at 12:29 PM
-- Server version: 8.0.45-0ubuntu0.24.04.1
-- PHP Version: 8.4.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ppp`
--

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `cover_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','active') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `lobby_wait_secs` int UNSIGNED NOT NULL DEFAULT '900',
  `entry_cutoff_mins` int UNSIGNED NOT NULL DEFAULT '15',
  `game_duration_secs` int UNSIGNED NOT NULL DEFAULT '1200',
  `case_summary_view_secs` int UNSIGNED NOT NULL DEFAULT '300',
  `strategy_guide_delay_secs` int UNSIGNED NOT NULL DEFAULT '120',
  `clue_room_unlock_secs` int UNSIGNED NOT NULL DEFAULT '600',
  `question_response_secs` int UNSIGNED NOT NULL DEFAULT '120',
  `max_questions` int UNSIGNED NOT NULL DEFAULT '5',
  `group_size` int UNSIGNED NOT NULL DEFAULT '5',
  `auto_expire_days` int UNSIGNED NOT NULL DEFAULT '5',
  `win_bonus` int NOT NULL DEFAULT '100',
  `participation_bonus` int NOT NULL DEFAULT '50',
  `timely_response_bonus` int NOT NULL DEFAULT '20',
  `no_response_penalty` int NOT NULL DEFAULT '-10',
  `wrong_vote_penalty` int NOT NULL DEFAULT '-15',
  `lie_detector_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `lie_detector_max_questions` int UNSIGNED NOT NULL DEFAULT '3',
  `lie_detector_timer_secs` int UNSIGNED NOT NULL DEFAULT '420',
  `lie_detector_voting_timer_secs` int UNSIGNED NOT NULL DEFAULT '30',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`id`, `title`, `slug`, `description`, `cover_image`, `status`, `lobby_wait_secs`, `entry_cutoff_mins`, `game_duration_secs`, `case_summary_view_secs`, `strategy_guide_delay_secs`, `clue_room_unlock_secs`, `question_response_secs`, `max_questions`, `group_size`, `auto_expire_days`, `win_bonus`, `participation_bonus`, `timely_response_bonus`, `no_response_penalty`, `wrong_vote_penalty`, `lie_detector_enabled`, `lie_detector_max_questions`, `lie_detector_timer_secs`, `lie_detector_voting_timer_secs`, `created_at`, `updated_at`) VALUES
(1, 'Detective Mystery', 'detective-mystery', 'A high-stakes investigative game where teams must identify the culprit among them.', NULL, 'active', 900, 15, 1200, 300, 120, 600, 120, 5, 5, 5, 100, 50, 20, -10, -15, 1, 3, 420, 30, '2026-05-26 12:29:06', '2026-05-26 12:29:06');

-- --------------------------------------------------------

--
-- Table structure for table `activity_games`
--

CREATE TABLE `activity_games` (
  `id` bigint UNSIGNED NOT NULL,
  `activity_id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `case_summary` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `timeline` json DEFAULT NULL,
  `quick_facts` json DEFAULT NULL,
  `tagline` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','active') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_games`
--

INSERT INTO `activity_games` (`id`, `activity_id`, `title`, `case_summary`, `timeline`, `quick_facts`, `tagline`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'The Bungalow Secret', '<h3>Case Plot</h3><p>An old wealthy businessman, Raghav Malhotra, is found dead in his luxury bungalow on the night of his greatest triumph — the approval celebration for his ambitious Dream City Project.</p><p>The project, a large-scale real estate development, was built on land acquired from local farming communities under disputed and allegedly forced conditions.</p><p>The party was in full swing. Guests, business associates, and family were present. But behind the celebrations, tensions ran deep.</p><p>Medical estimation places time of death at approximately 11:30 PM.</p><p>Businessman was found dead in the room.</p>', '[{\"time\": \"10:00 PM\", \"event\": \"Party begins at the Bungalow — guests, associates, media arrive\"}, {\"time\": \"10:30 PM\", \"event\": \"Raghav Malhotra gives victory speech celebrating Dream City Project approval\"}, {\"time\": \"10:45 PM\", \"event\": \"Guest dancing and enjoying with loud music, dinner\"}, {\"time\": \"11:00 PM\", \"event\": \"Farmer’s leader Kartar Sah arrives uninvited and starts shouting in party\"}, {\"time\": \"11:10 PM\", \"event\": \"Raghav Malhotra asks him to come to his private room to discuss peacefully\"}, {\"time\": \"11:20 PM\", \"event\": \"Raghav calls his son Vikram — call lasts 4 minutes (last call on his phone)\"}, {\"time\": \"11:30 PM\", \"event\": \"Kartar Sah exits study, leaves bungalow — confirmed by gate guard.\"}, {\"time\": \"11:50 PM\", \"event\": \"Raju enters with tea — finds dead body. Raju informs police.\"}]', '{\"weather\": \"Clear Night\", \"location\": \"Luxury Bungalow, Mumbai\", \"date_time\": \"26th May, 11:30 PM (Est. Death)\", \"cctv_status\": \"Operational (Limited Coverage)\"}', 'Not everything is as it seems in the Willow Bungalow.', 'active', '2026-05-26 12:29:06', '2026-05-26 12:31:22');

-- --------------------------------------------------------

--
-- Table structure for table `answers`
--

CREATE TABLE `answers` (
  `id` bigint UNSIGNED NOT NULL,
  `question_id` bigint UNSIGNED NOT NULL,
  `participant_session_id` bigint UNSIGNED NOT NULL,
  `answer_text` text NOT NULL,
  `penalty_applied` int DEFAULT '0',
  `answered_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blogs`
--

CREATE TABLE `blogs` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `featured_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `banner_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category_id` bigint UNSIGNED NOT NULL,
  `author_id` bigint UNSIGNED NOT NULL,
  `seo_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seo_description` text COLLATE utf8mb4_unicode_ci,
  `seo_keywords` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `og_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `canonical_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `published_at` datetime DEFAULT NULL,
  `scheduled_at` datetime DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `is_pinned` tinyint(1) NOT NULL DEFAULT '0',
  `is_trending` tinyint(1) NOT NULL DEFAULT '0',
  `show_on_homepage` tinyint(1) NOT NULL DEFAULT '0',
  `allow_comments` tinyint(1) NOT NULL DEFAULT '1',
  `show_author` tinyint(1) NOT NULL DEFAULT '1',
  `show_related_blogs` tinyint(1) NOT NULL DEFAULT '1',
  `reading_time` int DEFAULT NULL,
  `views_count` int NOT NULL DEFAULT '0',
  `comments_count` int NOT NULL DEFAULT '0',
  `external_source_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blogs`
--

INSERT INTO `blogs` (`id`, `title`, `slug`, `short_description`, `content`, `featured_image`, `banner_image`, `category_id`, `author_id`, `seo_title`, `seo_description`, `seo_keywords`, `og_image`, `canonical_url`, `status`, `published_at`, `scheduled_at`, `is_featured`, `is_pinned`, `is_trending`, `show_on_homepage`, `allow_comments`, `show_author`, `show_related_blogs`, `reading_time`, `views_count`, `comments_count`, `external_source_url`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'The Future of Corporate Team Building', 'the-future-of-corporate-team-building', 'Exploring how technology is reshaping how teams connect and collaborate.', '<p>Corporate team building has evolved beyond simple trust falls. Today, immersive digital experiences and gamified challenges are leading the way in creating meaningful connections among remote and hybrid teams.</p>', NULL, NULL, 2, 1, NULL, NULL, NULL, NULL, NULL, 'published', '2026-05-26 17:59:06', NULL, 1, 0, 0, 1, 1, 1, 1, NULL, 0, 0, NULL, 1, NULL, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(2, 'Top 5 Productivity Hacks for 2026', 'top-5-productivity-hacks-for-2026', 'Stay ahead of the curve with these essential productivity tips for the modern professional.', '<p>Productivity in 2026 is all about focused work and leveraging AI tools effectively. We dive into five strategies that will help you reclaim your time and achieve more with less effort.</p>', NULL, NULL, 7, 1, NULL, NULL, NULL, NULL, NULL, 'published', '2026-05-26 17:59:06', NULL, 1, 0, 0, 1, 1, 1, 1, NULL, 0, 0, NULL, 1, NULL, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(3, 'Designing Immersive Game Experiences', 'designing-immersive-game-experiences', 'What makes a game truly engaging? Our lead designer shares insights into the creative process.', '<p>Creating an immersive game requires a perfect blend of narrative, mechanics, and visual storytelling. Learn about the design principles we use to build our signature Mystery Quest series.</p>', NULL, NULL, 1, 1, NULL, NULL, NULL, NULL, NULL, 'published', '2026-05-26 17:59:06', NULL, 1, 0, 0, 1, 1, 1, 1, NULL, 0, 0, NULL, 1, NULL, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(4, 'Planning Your Next Virtual Event', 'planning-your-next-virtual-event', 'A comprehensive guide to hosting successful online gatherings that people actually enjoy.', '<p>Virtual events don\'t have to be boring. With the right platform and engaging activities, you can host an event that leaves a lasting impression on your attendees.</p>', NULL, NULL, 6, 1, NULL, NULL, NULL, NULL, NULL, 'published', '2026-05-26 17:59:06', NULL, 1, 0, 0, 1, 1, 1, 1, NULL, 0, 0, NULL, 1, NULL, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(5, 'Healthy Habits for Hybrid Workers', 'healthy-habits-for-hybrid-workers', 'Maintaining physical and mental well-being while navigating the split between home and office.', '<p>The hybrid work model offers flexibility but also challenges. Discover how to build a routine that supports your health, no matter where your desk is located today.</p>', NULL, NULL, 3, 1, NULL, NULL, NULL, NULL, NULL, 'published', '2026-05-26 17:59:06', NULL, 1, 0, 0, 1, 1, 1, 1, NULL, 0, 0, NULL, 1, NULL, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `blog_categories`
--

CREATE TABLE `blog_categories` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blog_categories`
--

INSERT INTO `blog_categories` (`id`, `name`, `slug`, `description`, `icon`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Technology', 'technology', 'Latest technology news, tutorials, and insights.', 'fas fa-microchip', 1, 1, 1, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(2, 'Business', 'business', 'Business tips, marketing, and entrepreneurship.', 'fas fa-briefcase', 1, 1, 1, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(3, 'Lifestyle', 'lifestyle', 'Articles about lifestyle, productivity, and wellness.', 'fas fa-heart', 1, 1, 1, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(4, 'Tutorials', 'tutorials', 'How-to guides and tutorials for developers.', 'fas fa-graduation-cap', 1, 1, 1, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(5, 'News', 'news', 'Industry news and announcements.', 'fas fa-newspaper', 1, 1, 1, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(6, 'Events', 'events', NULL, NULL, 1, NULL, NULL, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(7, 'Productivity', 'productivity', NULL, NULL, 1, NULL, NULL, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `blog_comments`
--

CREATE TABLE `blog_comments` (
  `id` bigint UNSIGNED NOT NULL,
  `blog_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `approved` tinyint(1) NOT NULL DEFAULT '0',
  `approved_by` bigint UNSIGNED DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blog_media`
--

CREATE TABLE `blog_media` (
  `id` bigint UNSIGNED NOT NULL,
  `blog_id` bigint UNSIGNED NOT NULL,
  `media_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `media_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `caption` text COLLATE utf8mb4_unicode_ci,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blog_tags`
--

CREATE TABLE `blog_tags` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blog_tags`
--

INSERT INTO `blog_tags` (`id`, `name`, `slug`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Laravel', 'laravel', 1, 1, 1, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(2, 'PHP', 'php', 1, 1, 1, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(3, 'Web Development', 'web-development', 1, 1, 1, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(4, 'SEO', 'seo', 1, 1, 1, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(5, 'Business', 'business', 1, 1, 1, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(6, 'Productivity', 'productivity', 1, 1, 1, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `blog_tag_items`
--

CREATE TABLE `blog_tag_items` (
  `id` bigint UNSIGNED NOT NULL,
  `blog_id` bigint UNSIGNED NOT NULL,
  `blog_tag_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blog_views`
--

CREATE TABLE `blog_views` (
  `id` bigint UNSIGNED NOT NULL,
  `blog_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('356a192b7913b04c54574d18c28d46e6395428ab', 'i:1;', 1779968930),
('356a192b7913b04c54574d18c28d46e6395428ab:timer', 'i:1779968930;', 1779968930),
('424f74a6a7ed4d4ed4761507ebcd209a6ef0937b', 'i:4;', 1779861437),
('424f74a6a7ed4d4ed4761507ebcd209a6ef0937b:timer', 'i:1779861437;', 1779861437),
  `payment_status` enum('pending','paid','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `account_status` enum('pending','active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
('5c785c036466adea360111aa28563bfd556b5fba', 'i:1;', 1779964370),
('5c785c036466adea360111aa28563bfd556b5fba:timer', 'i:1779964370;', 1779964370);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clue_rooms`
--

CREATE TABLE `clue_rooms` (
  `id` bigint UNSIGNED NOT NULL,
  `group_id` bigint UNSIGNED NOT NULL,
  `clue_id` bigint UNSIGNED NOT NULL,
  `is_unlocked` tinyint(1) DEFAULT '0',
  `unlocked_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cms_pages`
--

CREATE TABLE `cms_pages` (
  `id` bigint UNSIGNED NOT NULL,
  `page_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_keywords` text COLLATE utf8mb4_unicode_ci,
  `featured_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '1=published,0=draft',
  `published_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cms_pages`
--

INSERT INTO `cms_pages` (`id`, `page_name`, `slug`, `title`, `content`, `meta_title`, `meta_description`, `meta_keywords`, `featured_image`, `status`, `published_at`, `created_by`, `updated_by`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 'Homepage Content', 'homepage', 'Welcome to Our Platform', '<h1>Welcome to Our Admin Panel</h1>\n                            <p>This is your homepage content. You can edit this using the CMS management system.</p>\n                            <h2>Key Features</h2>\n                            <ul>\n                                <li>Enterprise-level content management</li>\n                                <li>SEO optimization tools</li>\n                                <li>Rich text editing capabilities</li>\n                                <li>Image management system</li>\n                            </ul>', 'Welcome to Our Platform', 'Professional admin panel with comprehensive content management system', 'admin, cms, content, management', NULL, 1, '2026-05-26 12:29:06', NULL, NULL, NULL, '2026-05-26 12:29:06', '2026-05-26 12:29:06'),
(2, 'Footer Content', 'footer', 'Footer Information', '<div class=\"footer-content\">\n                            <h4>About Us</h4>\n                            <p>Professional content management system built for modern businesses.</p>\n                            <h4>Contact</h4>\n                            <p>Email: support@example.com<br>Phone: +1 (555) 000-0000</p>\n                            <h4>Follow Us</h4>\n                            <p>Visit our social media channels for updates and news.</p>\n                            </div>', 'Footer', 'Footer content and contact information', 'footer, contact, information', NULL, 1, '2026-05-26 12:29:06', NULL, NULL, NULL, '2026-05-26 12:29:06', '2026-05-26 12:29:06'),
(3, 'Terms & Conditions', 'terms-conditions', 'Terms & Conditions', '<h1>Terms & Conditions</h1>\n                            <p>Last Updated: May 26, 2026</p>\n                            <h2>1. Acceptance of Terms</h2>\n                            <p>By accessing and using this platform, you accept and agree to be bound by the terms and provision of this agreement.</p>\n                            <h2>2. Use License</h2>\n                            <p>Permission is granted to temporarily download one copy of the materials on our platform for personal, non-commercial transitory viewing only.</p>\n                            <h2>3. Disclaimer</h2>\n                            <p>The materials on our platform are provided on an \'as is\' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties.</p>\n                            <h2>4. Limitations</h2>\n                            <p>In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use the materials.</p>\n                            <h2>5. Accuracy of Materials</h2>\n                            <p>The materials appearing on our platform could include technical, typographical, or photographic errors. We do not warrant that any of the materials are accurate, complete, or current.</p>', 'Terms & Conditions', 'Read our terms and conditions before using our platform', 'terms, conditions, legal, agreement', NULL, 1, '2026-05-26 12:29:06', NULL, NULL, NULL, '2026-05-26 12:29:06', '2026-05-26 12:29:06'),
(4, 'Privacy Policy', 'privacy-policy', 'Privacy Policy', '<h1>Privacy Policy</h1>\n                            <p>Last Updated: May 26, 2026</p>\n                            <h2>1. Introduction</h2>\n                            <p>We are committed to protecting your privacy. This policy explains how we collect, use, and disclose information.</p>\n                            <h2>2. Information Collection</h2>\n                            <p>We collect information you provide directly, such as when you create an account or contact us for support.</p>\n                            <h2>3. Use of Information</h2>\n                            <p>We use the information we collect to provide, maintain, and improve our services, and to communicate with you about changes to our policies.</p>\n                            <h2>4. Information Sharing</h2>\n                            <p>We do not sell or share your personal information with third parties except as necessary to provide our services or as required by law.</p>\n                            <h2>5. Data Security</h2>\n                            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access and alteration.</p>\n                            <h2>6. Your Rights</h2>\n                            <p>You have the right to access, correct, or delete your personal information. Please contact us to exercise these rights.</p>\n                            <h2>7. Contact Us</h2>\n                            <p>If you have questions about this privacy policy, please contact us at privacy@example.com</p>', 'Privacy Policy', 'Review our privacy policy to understand how we protect your data', 'privacy, policy, data protection, gdpr', NULL, 1, '2026-05-26 12:29:06', NULL, NULL, NULL, '2026-05-26 12:29:06', '2026-05-26 12:29:06'),
(5, 'Refund Policy', 'refund-policy', 'Refund Policy', '<h1>Refund Policy</h1>\n                            <p>Last Updated: May 26, 2026</p>\n                            <h2>1. Refund Eligibility</h2>\n                            <p>You may request a refund within 30 days of your purchase if you are not satisfied with our services.</p>\n                            <h2>2. Refund Process</h2>\n                            <p>To request a refund, please contact our support team with your order number and reason for the refund request.</p>\n                            <h2>3. Refund Timeline</h2>\n                            <p>Once we receive and process your refund request, you should expect to receive your refund within 5-7 business days.</p>\n                            <h2>4. Non-Refundable Items</h2>\n                            <p>Digital services that have been fully used or consumed are not eligible for refunds.</p>\n                            <h2>5. Partial Refunds</h2>\n                            <p>In some cases, we may offer partial refunds based on the nature of your complaint and our assessment.</p>\n                            <h2>6. Customer Support</h2>\n                            <p>Before requesting a refund, please contact our support team. We may be able to resolve your issue.</p>\n                            <h2>7. Contact Support</h2>\n                            <p>Email: support@example.com<br>Phone: +1 (555) 000-0000</p>', 'Refund Policy', 'Learn about our refund policy and how to request a refund', 'refund, policy, returns, customer service', NULL, 1, '2026-05-26 12:29:06', NULL, NULL, NULL, '2026-05-26 12:29:06', '2026-05-26 12:29:06');

-- --------------------------------------------------------

--
-- Table structure for table `email_templates`
--

CREATE TABLE `email_templates` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `variables` json DEFAULT NULL COMMENT 'Available variables in template',
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '1=active,0=inactive',
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `usage_count` int NOT NULL DEFAULT '0',
  `last_used_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `email_templates`
--

INSERT INTO `email_templates` (`id`, `name`, `slug`, `subject`, `body`, `variables`, `description`, `status`, `created_by`, `updated_by`, `usage_count`, `last_used_at`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 'Welcome Email', 'welcome-email', 'Welcome to Our Platform - {name}!', '<h2>Welcome to Our Platform!</h2>\n                            <p>Hello {name},</p>\n                            <p>Thank you for joining our community. We\'re excited to have you on board!</p>\n                            <h3>Getting Started</h3>\n                            <p>To get started, please verify your email address by clicking the link below:</p>\n                            <p><a href=\"{verify_url}\" style=\"background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;\">Verify Email Address</a></p>\n                            <p>If you have any questions, feel free to contact our support team at <strong>support@example.com</strong></p>\n                            <p>Best regards,<br>The Support Team</p>', NULL, 'Sent when a new user creates an account', 1, NULL, NULL, 0, NULL, NULL, '2026-05-26 12:29:06', '2026-05-26 12:29:06'),
(2, 'Email Verification', 'email-verification', 'Verify Your Email Address - {verification_code}', '<h2>Email Verification Required</h2>\n                            <p>Hello {name},</p>\n                            <p>Please verify your email address using the verification code below:</p>\n                            <div style=\"background-color: #f0f0f0; padding: 20px; border-radius: 4px; text-align: center; margin: 20px 0;\">\n                                <h3 style=\"margin: 0; font-family: monospace; letter-spacing: 5px; color: #007bff;\">{verification_code}</h3>\n                            </div>\n                            <p>This code will expire in 24 hours.</p>\n                            <p>If you did not request this verification, please ignore this email.</p>\n                            <p>Best regards,<br>The Support Team</p>', NULL, 'Sent when user requests email verification', 1, NULL, NULL, 0, NULL, NULL, '2026-05-26 12:29:06', '2026-05-26 12:29:06'),
(3, 'Password Reset', 'password-reset', 'Password Reset Request - {app_name}', '<h2>Password Reset Request</h2>\n                            <p>Hello {name},</p>\n                            <p>We received a request to reset your password. If you did not make this request, please ignore this email.</p>\n                            <p>To reset your password, click the link below:</p>\n                            <p><a href=\"{reset_url}\" style=\"background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;\">Reset Password</a></p>\n                            <p><strong>This link will expire in 1 hour.</strong></p>\n                            <p>For security reasons, never share your password with anyone.</p>\n                            <p>Best regards,<br>The Support Team</p>', NULL, 'Sent when user requests password reset', 1, NULL, NULL, 0, NULL, NULL, '2026-05-26 12:29:06', '2026-05-26 12:29:06'),
(4, 'Account Activated', 'account-activated', 'Your Account Has Been Activated - Welcome!', '<h2>Account Activation Confirmed</h2>\n                            <p>Hello {name},</p>\n                            <p>Great news! Your account has been successfully activated.</p>\n                            <p>You can now log in to your account using your email and password.</p>\n                            <p><a href=\"{login_url}\" style=\"background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;\">Log In to Your Account</a></p>\n                            <p><strong>Account Details:</strong></p>\n                            <ul>\n                                <li>Email: {email}</li>\n                                <li>Username: {username}</li>\n                            </ul>\n                            <p>If you have any questions or need assistance, please contact our support team.</p>\n                            <p>Best regards,<br>The Support Team</p>', NULL, 'Sent when admin activates a user account', 1, NULL, NULL, 0, NULL, NULL, '2026-05-26 12:29:06', '2026-05-26 12:29:06'),
(5, 'Password Changed', 'password-changed', 'Your Password Has Been Changed Successfully', '<h2>Password Change Confirmation</h2>\n                            <p>Hello {name},</p>\n                            <p>This is to confirm that your password has been successfully changed.</p>\n                            <p>If you did not make this change or suspect unauthorized access to your account, please <a href=\"{support_url}\">contact our support team</a> immediately.</p>\n                            <div style=\"background-color: #f0f0f0; padding: 15px; border-radius: 4px; margin: 20px 0;\">\n                                <p style=\"margin: 0;\"><strong>Security Tip:</strong> Never share your password with anyone. Our team will never ask for your password.</p>\n                            </div>\n                            <p>Best regards,<br>The Support Team</p>', NULL, 'Sent when user changes their password', 1, NULL, NULL, 0, NULL, NULL, '2026-05-26 12:29:06', '2026-05-26 12:29:06'),
(6, 'Contact Form Reply', 'contact-form-reply', 'We Received Your Message - {ticket_number}', '<h2>Thank You for Contacting Us</h2>\n                            <p>Hello {name},</p>\n                            <p>We have received your message and will get back to you as soon as possible.</p>\n                            <div style=\"background-color: #f0f0f0; padding: 15px; border-radius: 4px; margin: 20px 0;\">\n                                <p style=\"margin: 0;\"><strong>Ticket Number:</strong> {ticket_number}</p>\n                                <p style=\"margin: 10px 0 0 0;\"><strong>Subject:</strong> {subject}</p>\n                            </div>\n                            <p>Your message has been recorded in our support system. You can track the status using your ticket number above.</p>\n                            <p>Expected response time: 24-48 hours</p>\n                            <p>Best regards,<br>The Support Team</p>', NULL, 'Sent as automatic reply to contact form submissions', 1, NULL, NULL, 0, NULL, NULL, '2026-05-26 12:29:06', '2026-05-26 12:29:06'),
(7, 'General Notification', 'general-notification', '{notification_title}', '<h2>{notification_title}</h2>\n                            <p>Hello {name},</p>\n                            <p>{notification_message}</p>\n                            <p>{notification_content}</p>\n                            @if({action_url})\n                                <p><a href=\"{action_url}\" style=\"background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;\">{action_text}</a></p>\n                            @endif\n                            <p>Best regards,<br>The Support Team</p>', NULL, 'General purpose template for system notifications', 1, NULL, NULL, 0, NULL, NULL, '2026-05-26 12:29:06', '2026-05-26 12:29:06');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faqs`
--

CREATE TABLE `faqs` (
  `id` bigint UNSIGNED NOT NULL,
  `question` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` bigint UNSIGNED NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `status` tinyint NOT NULL DEFAULT '1',
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faqs`
--

INSERT INTO `faqs` (`id`, `question`, `answer`, `category_id`, `sort_order`, `is_featured`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'What services do you offer?', '<p>We offer a comprehensive range of digital services including web development, mobile app development, digital marketing, UI/UX design, and consulting services. Our team specializes in creating custom solutions tailored to your business needs.</p>', 1, 1, 1, 1, 1, 1, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(2, 'How do I get started with your services?', '<p>Getting started is easy! Simply contact us through our website, email, or phone. We\'ll schedule a free consultation to discuss your project requirements and provide a customized proposal. Once you approve the proposal, we\'ll begin working on your project immediately.</p>', 1, 2, 1, 1, 1, 1, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(3, 'Do you provide ongoing support after project completion?', '<p>Yes, we provide comprehensive post-launch support and maintenance services. This includes bug fixes, updates, performance optimization, and technical support. We offer various support packages to suit different needs and budgets.</p>', 1, 3, 0, 1, 1, 1, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(4, 'How can I update my billing information?', '<p>You can update your billing information by logging into your dashboard and navigating to the Settings -> Billing section. There you can add new payment methods or update existing ones.</p>', 2, 4, 1, 1, 1, 1, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(5, 'What payment methods do you accept?', '<p>We accept all major credit/debit cards, UPI, Paytm, and NetBanking. All payments are processed securely through our payment gateway partners.</p>', 2, 5, 0, 1, 1, 1, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `faq_categories`
--

CREATE TABLE `faq_categories` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `updated_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faq_categories`
--

INSERT INTO `faq_categories` (`id`, `name`, `slug`, `description`, `icon`, `status`, `sort_order`, `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'General', 'general', 'General questions about our services', 'fas fa-question-circle', 1, 1, 1, 1, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(2, 'Account & Billing', 'account-billing', 'Questions about accounts and billing', 'fas fa-credit-card', 1, 2, 1, 1, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(3, 'Technical Support', 'technical-support', 'Technical issues and troubleshooting', 'fas fa-cog', 1, 3, 1, 1, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(4, 'Privacy & Security', 'privacy-security', 'Privacy and security related questions', 'fas fa-shield-alt', 1, 4, 1, 1, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(5, 'Policies', 'policies', 'Company policies and terms', 'fas fa-file-contract', 1, 5, 1, 1, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `game_clues`
--

CREATE TABLE `game_clues` (
  `id` bigint UNSIGNED NOT NULL,
  `game_id` bigint UNSIGNED NOT NULL,
  `clue_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clue_short_description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `clue_detail` longtext COLLATE utf8mb4_unicode_ci,
  `clue_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `game_clues`
--

INSERT INTO `game_clues` (`id`, `game_id`, `clue_title`, `clue_short_description`, `clue_detail`, `clue_image`, `created_at`, `updated_at`) VALUES
(2, 1, 'The Study Evidence', 'Forensic investigators have marked key evidence found at the crime scene.', 'White circles indicate areas of interest. What they mean — is for you to determine.', 'clues/placeholder.jpg', '2026-05-26 12:31:22', '2026-05-26 12:31:22');

-- --------------------------------------------------------

--
-- Table structure for table `game_full_story`
--

CREATE TABLE `game_full_story` (
  `id` bigint UNSIGNED NOT NULL,
  `game_id` bigint UNSIGNED NOT NULL,
  `part_number` tinyint UNSIGNED NOT NULL,
  `part_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `part_body` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `game_full_story`
--

INSERT INTO `game_full_story` (`id`, `game_id`, `part_number`, `part_title`, `part_body`, `created_at`, `updated_at`) VALUES
(4, 1, 1, 'The Motive', 'Vikram and Priya were drowning in debt...', '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(5, 1, 2, 'The Opportunity', 'Priya used the private corridor while the music was loud...', '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(6, 1, 3, 'The Final Reveal', 'The broken phone contained a recording...', '2026-05-26 12:31:22', '2026-05-26 12:31:22');

-- --------------------------------------------------------

--
-- Table structure for table `game_groups`
--

CREATE TABLE `game_groups` (
  `id` bigint UNSIGNED NOT NULL,
  `booking_id` bigint UNSIGNED NOT NULL,
  `group_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('waiting','active','finished') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'waiting',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `game_participants`
--

CREATE TABLE `game_participants` (
  `id` bigint UNSIGNED NOT NULL,
  `booking_id` bigint UNSIGNED NOT NULL,
  `game_id` bigint UNSIGNED NOT NULL,
  `group_id` bigint UNSIGNED DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otp` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otp_expires_at` timestamp NULL DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `join_token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('joined','playing','finished') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'joined',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `game_photos`
--

CREATE TABLE `game_photos` (
  `id` bigint UNSIGNED NOT NULL,
  `game_id` bigint UNSIGNED NOT NULL,
  `photo_number` tinyint UNSIGNED NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `game_photos`
--

INSERT INTO `game_photos` (`id`, `game_id`, `photo_number`, `label`, `image`, `created_at`, `updated_at`) VALUES
(6, 1, 1, 'Photo 1 — The Party Scene (Before)', 'game_photos/placeholder.jpg', '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(7, 1, 2, 'Photo 2 — Kartar Sah Arrives (Tension Moment)', 'game_photos/placeholder.jpg', '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(8, 1, 3, 'Photo 3 — The Private Study (Crime Scene — Wide)', 'game_photos/placeholder.jpg', '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(9, 1, 4, 'Photo 4 — Suspects hall (Close Detail)', 'game_photos/placeholder.jpg', '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(10, 1, 5, 'Photo 5 — The Broken Phone', 'game_photos/placeholder.jpg', '2026-05-26 12:31:22', '2026-05-26 12:31:22');

-- --------------------------------------------------------

--
-- Table structure for table `game_roles`
--

CREATE TABLE `game_roles` (
  `id` bigint UNSIGNED NOT NULL,
  `game_id` bigint UNSIGNED NOT NULL,
  `role_type` enum('investigator','culprit','suspect','witness','participant') COLLATE utf8mb4_unicode_ci NOT NULL,
  `character_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `objective` text COLLATE utf8mb4_unicode_ci,
  `what_you_know` json DEFAULT NULL,
  `keep_in_mind` json DEFAULT NULL,
  `footer_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `game_roles`
--

INSERT INTO `game_roles` (`id`, `game_id`, `role_type`, `character_name`, `subtitle`, `role_image`, `objective`, `what_you_know`, `keep_in_mind`, `footer_text`, `created_at`, `updated_at`) VALUES
(1, 1, 'investigator', 'Investigator', 'You are the Investigator. The only one allowed to question everyone.', NULL, 'Find and accuse the real Hidden Culprit before time runs out.', '[\"Everyone in the house is a suspect\", \"Statements may not be truthful\", \"The timeline holds key inconsistencies\"]', '[\"You can ask up to 5 questions in total\", \"You can use the Lie Detector round for up to 7 minutes\", \"You can reopen the Case Brief only once when the session starts\", \"You win if you correctly identifies the Hidden Culprit\", \"+10 points per question asked\"]', 'Keep your role secret. CTA button: Okay, continue', '2026-05-26 12:29:06', '2026-05-26 12:29:06'),
(2, 1, 'culprit', 'Priya Malhotra (Daughter-in-law)', 'You are the one who did it. Stay calm. Stay hidden.', NULL, 'Avoid getting caught by the Investigator and ensure someone else is identified as the accused.', '[\"Your alibi has been assigned — stick to it\", \"A Person of Interest has been named in the case — use them\", \"The Investigator has only 5 questions — make them count for nothing\"]', '[\"Act like a normal participant — not too silent, not too defensive\", \"Slightly redirect facts instead of outright lying\", \"Casually raise doubts about the Person of Interest in your answers\", \"Stick to one story throughout the entire session\", \"You win if you are not identified.\", \"Your role is confidential. Do not reveal it directly or indirectly.\"]', 'Keep your role secret. CTA button: Okay, continue', '2026-05-26 12:29:06', '2026-05-26 12:29:06'),
(3, 1, 'suspect', 'Kartar Sah (Farmer Leader)', 'You are under suspicion. Prove you are innocent.', NULL, 'Avoid being wrongly identified as the accused by the Investigator.', '[\"Your presence or connection to the incident raises doubt\", \"The case may reference details that appear to implicate you\", \"You are innocent — but you must prove it through your answers\"]', '[\"Stay calm and composed under questioning\", \"Give clear, consistent answers — do not change your story\", \"Do not panic or over-explain when challenged\", \"You win if you correctly identifies the Hidden Culprit\", \"Your role is confidential. Do not reveal it directly or indirectly.\"]', 'Keep your role secret. CTA button: Okay, continue', '2026-05-26 12:29:06', '2026-05-26 12:29:06'),
(4, 1, 'witness', 'Raju (Servant)', 'You saw something. Help the Investigator — carefully.', NULL, 'Help the Investigator identify the Hidden Culprit without revealing everything too easily.', '[\"You have partial knowledge of the incident\", \"You may have noticed suspicious behaviour or movements\", \"You hold one Secret Passcard — a private hint to the Investigator\"]', '[\"Share information gradually — do not give everything away at once\", \"Be truthful but controlled in your responses\", \"Use your Secret Passcard wisely\", \"You win if you correctly identifies the Hidden Culprit\", \"Your role is confidential. Do not reveal it directly or indirectly.\"]', 'Keep your role secret. CTA button: Okay, continue', '2026-05-26 12:29:06', '2026-05-26 12:29:06'),
(5, 1, 'participant', 'Vikram Malhotra (Son)', 'You are a neutral observer. Stay active and think clearly.', NULL, 'Help ensure the correct accused is identified by actively participating.', '[\"You have no hidden agenda\", \"You are not under special suspicion\", \"Your observations and logical reasoning are your only tools\"]', '[\"Stay active — do not go silent\", \"Answer questions honestly and consistently\", \"Observe others carefully for inconsistencies\", \"You win if you correctly identifies the Hidden Culprit\", \"Your role is confidential. Do not reveal it directly or indirectly.\"]', 'Keep your role secret. CTA button: Okay, continue', '2026-05-26 12:29:06', '2026-05-26 12:29:06');

-- --------------------------------------------------------

--
-- Table structure for table `game_rules`
--

CREATE TABLE `game_rules` (
  `id` bigint UNSIGNED NOT NULL,
  `game_id` bigint UNSIGNED NOT NULL,
  `rule_text` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order` smallint UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `game_rules`
--

INSERT INTO `game_rules` (`id`, `game_id`, `rule_text`, `order`, `created_at`, `updated_at`) VALUES
(7, 1, 'The Investigator has 5 questions to examine any participant and establish the truth.', 1, '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(8, 1, 'First 5 minutes — all participants must review the Case Summary carefully. The Case Summary closes automatically after 5 minutes.', 2, '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(9, 1, 'Each participant has 2 minutes to respond when questioned. Failure to respond carries a penalty of -10 points.', 3, '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(10, 1, 'The Clue Room opens when 10 minutes remain in the session — one key piece of evidence becomes accessible.', 4, '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(11, 1, 'The Lie Detector round may be initiated once by the Investigator — up to 7 minutes, with max 3 questions.', 5, '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(12, 1, 'The Investigator must identify the accused before the session concludes. Total duration: 25 minutes.', 6, '2026-05-26 12:31:22', '2026-05-26 12:31:22');

-- --------------------------------------------------------

--
-- Table structure for table `investigator_cards`
--

CREATE TABLE `investigator_cards` (
  `id` bigint UNSIGNED NOT NULL,
  `game_id` bigint UNSIGNED NOT NULL,
  `card_number` tinyint UNSIGNED NOT NULL,
  `suspect_label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tag` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_text` longtext COLLATE utf8mb4_unicode_ci,
  `why_suspicious` json DEFAULT NULL,
  `suggested_questions` json DEFAULT NULL,
  `appears_at_secs` int UNSIGNED NOT NULL,
  `closes_at_secs` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `investigator_cards`
--

INSERT INTO `investigator_cards` (`id`, `game_id`, `card_number`, `suspect_label`, `tag`, `profile_text`, `why_suspicious`, `suggested_questions`, `appears_at_secs`, `closes_at_secs`, `created_at`, `updated_at`) VALUES
(5, 1, 1, 'Suspect 1: Kartar Sah', 'Farmer Leader — Uninvited Guest', 'Kartar Sah was the last known person inside the study with Raghav Malhotra. He left at exactly 11:30 PM — the estimated time of death. He had the loudest, most public motive — two years of protests, legal battles, and public threats against Raghav. Land registry papers with his name were found scattered across the study floor.', NULL, NULL, 5, 35, '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(6, 1, 2, 'Suspect 2: Vikram Malhotra', 'The Heir', 'Vikram Malhotra is the only son of Raghav Malhotra and the sole heir. At 11:20 PM — 10 minutes before the death — Raghav called Vikram. The call lasted 4 minutes. It was the last call ever made from Raghav\'s phone.', NULL, NULL, 155, 185, '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(7, 1, 3, 'Suspect 3: Raju', 'The Servant', 'Raju has worked in the bungalow for 11 years. He knows every private corridor. Kitchen log shows the kettle was boiled at 11:20 PM — unusually early. He is the only staff member who knew Kartar Sah personally.', NULL, NULL, 305, 335, '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(8, 1, 4, 'Suspect 4: Priya Malhotra', 'The Daughter-in-law', 'Priya Malhotra claims she was socialising near the dining area. However, no guest can confirm her exact location between 11:25 PM and 11:45 PM. She was seen near the kitchen at 11:15 PM.', NULL, NULL, 455, 485, '2026-05-26 12:31:22', '2026-05-26 12:31:22');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` bigint UNSIGNED DEFAULT NULL,
  `available_at` bigint UNSIGNED NOT NULL,
  `created_at` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lie_detector_rounds`
--

CREATE TABLE `lie_detector_rounds` (
  `id` bigint UNSIGNED NOT NULL,
  `group_id` bigint UNSIGNED NOT NULL,
  `suspect_id` bigint UNSIGNED NOT NULL,
  `status` enum('active','completed') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `menu`
--

CREATE TABLE `menu` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link` text COLLATE utf8mb4_unicode_ci,
  `parent_id` int NOT NULL DEFAULT '0',
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `table_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order` int DEFAULT NULL,
  `single_route` int DEFAULT NULL,
  `permission_type` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `menu`
--

INSERT INTO `menu` (`id`, `name`, `link`, `parent_id`, `icon`, `status`, `table_type`, `order`, `single_route`, `permission_type`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Activities', 'admin/activities', 0, 'fas fa-tasks', 'Active', NULL, 5, NULL, 2, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `menu_permissions`
--

CREATE TABLE `menu_permissions` (
  `id` bigint UNSIGNED NOT NULL,
  `manager_id` int DEFAULT NULL,
  `manager_action_id` int DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `showing_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'web',
  `status` enum('0','1') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1',
  `permission_type` enum('0','1','2') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '2',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2017_08_24_000000_create_settings_table', 1),
(5, '2026_05_10_000000_create_menu_tables', 1),
(6, '2026_05_10_000001_create_roles_table', 1),
(7, '2026_05_10_000002_create_permissions_table', 1),
(8, '2026_05_10_000003_create_model_has_roles_table', 1),
(9, '2026_05_10_000004_create_model_has_permissions_table', 1),
(10, '2026_05_10_000005_create_role_has_permissions_table', 1),
(11, '2026_05_10_100001_create_cms_pages_table', 1),
(12, '2026_05_10_110001_create_email_templates_table', 1),
(13, '2026_05_10_120001_create_blog_categories_table', 1),
(14, '2026_05_10_120002_create_blog_tags_table', 1),
(15, '2026_05_10_120003_create_blogs_table', 1),
(16, '2026_05_10_120004_create_blog_tag_items_table', 1),
(17, '2026_05_10_120005_create_blog_media_table', 1),
(18, '2026_05_10_120006_create_blog_comments_table', 1),
(19, '2026_05_10_120007_create_blog_views_table', 1),
(20, '2026_05_10_120008_create_faq_categories_table', 1),
(21, '2026_05_10_120009_create_faqs_table', 1),
(22, '2026_05_10_160001_create_packages_table', 1),
(23, '2026_05_10_160002_create_package_purchases_table', 1),
(24, '2026_05_26_000001_replace_game_structure_with_activities', 1),
(25, '2026_05_26_000002_create_organizer_management_tables', 2),
(26, '2026_05_26_182521_make_game_id_nullable_in_organizer_bookings_table', 3),
(27, '2026_05_26_183736_create_game_participants_table', 4);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `organizers`
--

CREATE TABLE `organizers` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otp` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otp_expires_at` timestamp NULL DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `organizers`
--

INSERT INTO `organizers` (`id`, `name`, `email`, `company_name`, `company_website`, `otp`, `otp_expires_at`, `email_verified_at`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'asdfasdf', 'asdfa@info.com', 'absad', NULL, NULL, NULL, NULL, 'active', '2026-05-28 10:44:45', '2026-05-28 10:44:45', NULL),
(2, 'John Doe', 'john@example.com', 'Example Corp', 'https://example.com', '544071', '2026-05-29 05:26:55', NULL, 'active', NULL, NULL, NULL),
(3, 'Amgo', 'amgo@ai.com', 'Example Corp', 'https://example.com', NULL, NULL, '2026-05-29 05:18:55', 'active', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `organizer_billings`
--

CREATE TABLE `organizer_billings` (
  `id` bigint UNSIGNED NOT NULL,
  `booking_id` bigint UNSIGNED NOT NULL,
  `gst_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billing_address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pin_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `package_price` decimal(12,2) NOT NULL,
  `taxes` decimal(12,2) NOT NULL DEFAULT '0.00',
  `additional_charges` decimal(12,2) NOT NULL DEFAULT '0.00',
  `gst_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_payable` decimal(12,2) NOT NULL,
  `payment_method` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_status` enum('pending','paid','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `confirmation_details` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `organizer_billings`
--

INSERT INTO `organizer_billings` (`id`, `booking_id`, `gst_number`, `billing_address`, `city`, `state`, `pin_code`, `package_price`, `taxes`, `additional_charges`, `gst_amount`, `total_payable`, `payment_method`, `payment_status`, `confirmation_details`, `created_at`, `updated_at`) VALUES
(1, 1, '235423', 'sdfgsdfgsdfgds', 'sgdfgs', 'sdfgsdf', '65565656', 2999.00, 539.82, 0.00, 539.82, 3538.82, 'cash', 'paid', '{\"Date\": \"4\", \"Amount\": \"4564\", \"Remarks\": \"dfgsdfg\", \"Bank Name\": \"idgfsdf\", \"Reference ID\": \"sdfgsdfgsdfg\"}', '2026-05-28 10:44:45', '2026-05-28 10:44:45'),
(2, 2, '22AAAAA0000A1Z5', '123 Business St', 'Tech City', 'Digital State', '123456', 499.00, 0.00, 0.00, 89.82, 588.82, 'razorpay', 'paid', '{\"authorization\": true, \"terms_accepted\": true, \"validity_accepted\": true, \"participant_consent\": true, \"non_refundable_accepted\": true}', NULL, NULL),
(3, 2, '22AAAAA0000A1Z5', '123 Business St', 'Tech City', 'Digital State', '123456', 499.00, 0.00, 0.00, 89.82, 588.82, 'razorpay', 'paid', '{\"authorization\": true, \"terms_accepted\": true, \"validity_accepted\": true, \"participant_consent\": true, \"non_refundable_accepted\": true}', NULL, NULL),
(4, 2, '22AAAAA0000A1Z5', '123 Business St', 'Tech City', 'Digital State', '123456', 499.00, 0.00, 0.00, 89.82, 588.82, 'razorpay', 'paid', '{\"authorization\": true, \"terms_accepted\": true, \"validity_accepted\": true, \"participant_consent\": true, \"non_refundable_accepted\": true}', NULL, NULL),
(5, 2, '22AAAAA0000A1Z5', '123 Business St', 'Tech City', 'Digital State', '123456', 499.00, 0.00, 0.00, 89.82, 588.82, 'razorpay', 'paid', '{\"authorization\": true, \"terms_accepted\": true, \"validity_accepted\": true, \"participant_consent\": true, \"non_refundable_accepted\": true}', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `organizer_bookings`
--

CREATE TABLE `organizer_bookings` (
  `id` bigint UNSIGNED NOT NULL,
  `organizer_id` bigint UNSIGNED NOT NULL,
  `activity_id` bigint UNSIGNED NOT NULL,
  `game_id` bigint UNSIGNED DEFAULT NULL,
  `package_id` bigint UNSIGNED NOT NULL,
  `scheduled_date` date NOT NULL,
  `scheduled_time` time NOT NULL,
  `status` enum('pending_activation','active','completed','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending_activation',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `invitation_link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link_clicks` int DEFAULT '0',
  `is_rescheduled` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `organizer_bookings`
--

INSERT INTO `organizer_bookings` (`id`, `organizer_id`, `activity_id`, `game_id`, `package_id`, `scheduled_date`, `scheduled_time`, `status`, `created_at`, `updated_at`, `invitation_link`, `link_clicks`, `is_rescheduled`) VALUES
(1, 1, 1, NULL, 2, '2026-06-20', '16:00:00', 'pending_activation', '2026-05-28 10:44:45', '2026-05-28 10:44:45', '0gqRFNn9tlzUkOWdaioH', 0, 0),
(2, 3, 1, 1, 1, '2026-06-20', '16:00:00', 'pending_activation', NULL, NULL, NULL, 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `packages`
--

CREATE TABLE `packages` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `max_users` bigint UNSIGNED NOT NULL DEFAULT '0',
  `total_groups` bigint UNSIGNED NOT NULL DEFAULT '0',
  `validity_days` bigint UNSIGNED NOT NULL,
  `short_description` text COLLATE utf8mb4_unicode_ci,
  `features` json DEFAULT NULL,
  `game_access` json DEFAULT NULL,
  `status` enum('active','inactive','draft') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `sort_order` bigint UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `packages`
--

INSERT INTO `packages` (`id`, `name`, `slug`, `price`, `max_users`, `total_groups`, `validity_days`, `short_description`, `features`, `game_access`, `status`, `sort_order`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Trial Pack', 'trial-pack', 499.00, 5, 1, 30, 'Best for: Small teams, workshops, family events', '[\"Up to 5 participants\", \"1 auto-created group\", \"Single session\", \"Lets you test before buying\"]', '[\"cricket\", \"football\", \"tennis\", \"casino\", \"esports\"]', 'active', 1, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(2, 'Starter Pack', 'starter-pack', 2999.00, 50, 10, 30, 'Best for: Training sessions, mid-size teams', '[\"Up to 50 participants\", \"10 auto-created groups\", \"Even user distribution\", \"Instant activation\"]', '[\"cricket\", \"football\", \"tennis\", \"casino\", \"esports\"]', 'active', 2, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(3, 'Growth Pack', 'growth-pack', 4999.00, 100, 20, 30, 'Best for: Corporate events and team engagement', '[\"Up to 100 participants\", \"20 auto-created groups\", \"Even user distribution\", \"Instant activation\"]', '[\"cricket\", \"football\", \"tennis\", \"casino\", \"esports\"]', 'active', 3, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(4, 'Business Pack', 'business-pack', 8999.00, 300, 60, 30, 'Best for: Large corporate events and offsites', '[\"Up to 300 participants\", \"60 auto-created groups\", \"Even user distribution\", \"Instant activation\"]', '[\"cricket\", \"football\", \"tennis\", \"casino\", \"esports\"]', 'active', 4, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL),
(5, 'Enterprise Pack', 'enterprise-pack', 19999.00, 500, 100, 30, 'Best for: Training sessions, mid-size teams', '[\"Up to 500 participants\", \"100 auto-created groups\", \"Even user distribution\", \"Fully managed setup\"]', '[\"cricket\", \"football\", \"tennis\", \"casino\", \"esports\"]', 'active', 5, '2026-05-26 12:29:06', '2026-05-26 12:29:06', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `package_purchases`
--

CREATE TABLE `package_purchases` (
  `id` bigint UNSIGNED NOT NULL,
  `package_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','expired','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `starts_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `participant_sessions`
--

CREATE TABLE `participant_sessions` (
  `id` bigint UNSIGNED NOT NULL,
  `group_id` bigint UNSIGNED NOT NULL,
  `participant_id` bigint UNSIGNED NOT NULL,
  `role_id` bigint UNSIGNED DEFAULT NULL,
  `socket_id` varchar(255) DEFAULT NULL,
  `is_online` tinyint(1) DEFAULT '0',
  `total_score` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'web',
  `group` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` bigint UNSIGNED NOT NULL,
  `group_id` bigint UNSIGNED NOT NULL,
  `asked_by` bigint UNSIGNED NOT NULL,
  `asked_to` bigint UNSIGNED NOT NULL,
  `question_text` text NOT NULL,
  `points_awarded` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `results`
--

CREATE TABLE `results` (
  `id` bigint UNSIGNED NOT NULL,
  `group_id` bigint UNSIGNED NOT NULL,
  `identified_culprit_id` bigint UNSIGNED NOT NULL,
  `investigator_reasoning` text,
  `is_correct` tinyint(1) DEFAULT '0',
  `winner_ids` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'web',
  `status` tinyint NOT NULL DEFAULT '1',
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `guard_name`, `status`, `description`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Super Admin', 'admin', 1, 'Super Administrator with full access', '2026-05-26 12:29:05', '2026-05-26 12:29:05', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint UNSIGNED NOT NULL,
  `role_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `score_logs`
--

CREATE TABLE `score_logs` (
  `id` bigint UNSIGNED NOT NULL,
  `participant_session_id` bigint UNSIGNED NOT NULL,
  `points` int NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('3jvUUHzGuMWJICiOQaTM4pJca1IHGmvzcGN1BJtt', 1, '127.0.0.1', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:151.0) Gecko/20100101 Firefox/151.0', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoiejZnMUI3ZEp1Y3dNV24zaDlRWGJydHJCcDhQTThlSmx3OTVDT2xnQyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NTc6Imh0dHA6Ly9sb2NhbGhvc3QvcC9wdWJsaWMvZnJvbnQvYXNzZXRzL2ltYWdlcy9wcm9maWxlLnBuZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTI6ImxvZ2luX2FkbWluXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTtzOjIyOiJQSFBERUJVR0JBUl9TVEFDS19EQVRBIjthOjA6e319', 1779968918);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int UNSIGNED NOT NULL,
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `key`, `value`) VALUES
(1, 'website_name', 'Poll Application'),
(2, 'website_url', 'https://example.com'),
(3, 'tagline', 'Engage teams with smart game packages'),
(4, 'admin_email', 'admin@example.com'),
(5, 'support_email', 'support@example.com'),
(6, 'contact_number', '+91-9999999999'),
(7, 'company_address', 'Bengaluru, Karnataka, India'),
(8, 'timezone', 'Asia/Kolkata'),
(9, 'date_format', 'd M Y'),
(10, 'currency', 'INR'),
(11, 'primary_color', '#6f42c1'),
(12, 'secondary_color', '#343a40'),
(13, 'button_color', '#007bff'),
(14, 'logo', ''),
(15, 'favicon', ''),
(16, 'footer_logo', ''),
(17, 'login_logo', ''),
(18, 'meta_title', 'Poll Application'),
(19, 'meta_description', 'Interactive polls and package-based plans.'),
(20, 'meta_keywords', 'poll, package, team games, engagement'),
(21, 'og_image', ''),
(22, 'google_analytics_code', ''),
(23, 'facebook_pixel_code', ''),
(24, 'mail_driver', 'smtp'),
(25, 'smtp_host', 'smtp.mailtrap.io'),
(26, 'smtp_port', '587'),
(27, 'smtp_username', 'smtp-user'),
(28, 'smtp_password', 'smtp-password'),
(29, 'from_email', 'no-reply@example.com'),
(30, 'from_name', 'Poll App'),
(31, 'otp_expiry_time', '300'),
(32, 'otp_resend_limit', '3'),
(33, 'otp_retry_attempts', '5'),
(34, 'razorpay_key_id', ''),
(35, 'razorpay_key_secret', ''),
(36, 'stripe_key', ''),
(37, 'stripe_secret', ''),
(38, 'payment_mode', 'test'),
(39, 'payment_option_upi', '1'),
(40, 'payment_option_card', '1'),
(41, 'payment_option_net_banking', '1');

-- --------------------------------------------------------

--
-- Table structure for table `strategy_cards`
--

CREATE TABLE `strategy_cards` (
  `id` bigint UNSIGNED NOT NULL,
  `role_id` bigint UNSIGNED NOT NULL,
  `card_number` tinyint UNSIGNED NOT NULL,
  `heading` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `heading_color` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#7F77DD',
  `body_content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `strategy_cards`
--

INSERT INTO `strategy_cards` (`id`, `role_id`, `card_number`, `heading`, `heading_color`, `body_content`, `created_at`, `updated_at`) VALUES
(17, 2, 1, 'Your Role', '#7f77dd', 'You did it. You know it. Nobody else does yet. Your only job tonight is to walk out of this without being named.', '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(18, 2, 2, 'Your Alibi', '#7f77dd', 'You were socialising near the dining area between 11:15 PM and 11:45 PM. You stepped away briefly to wash face. Stick to one version.', '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(19, 2, 3, 'Person of Interest', '#7f77dd', 'Kartar Sah was in the room at the time of death and he was shouting in party. That is a fact available to everyone.', '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(20, 2, 4, 'Stay In The Game', '#7f77dd', 'Act normal — grief is natural tonight. Less is more — short answers are safer. One story — never contradict yourself.', '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(21, 3, 1, 'Your Situation', '#7f77dd', 'All eyes are on you. But you didn\'t do it. Objective: Survive the investigation. You arrived uninvited. You were alone with Raghav. You left at exactly the time they say he died.', '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(22, 3, 2, 'What You Actually Know', '#7f77dd', 'Facts: You came to confront Raghav about the land issue. Discussion was heated but you left him alive. You walked out at 11:30 PM. The gate guard saw you leave.', '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(23, 3, 3, 'Your Weak Points', '#7f77dd', 'Land papers with your name found at the scene. Your history of public threats. Don\'t panic.', '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(24, 3, 4, 'How To Stay Alive', '#7f77dd', 'Anger is natural — own it but separate it from violence. Stay calm. Tell your truth.', '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(25, 4, 1, 'Your Situation', '#7f77dd', 'You have worked here 11 years. You found the body. You did nothing wrong. But you knew Kartar Sah personally. The Investigator will notice.', '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(26, 4, 2, 'What You Actually Know', '#7f77dd', 'Facts: You were in the kitchen from 11:20 PM. You entered study at 11:50 PM. You know Kartar from home district. You boiled kettle early for a simple reason — pick one and stick to it.', '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(27, 4, 3, 'Your Weak Points', '#7f77dd', 'Why was the kettle boiled 30 minutes early? Your personal connection to Kartar Sah.', '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(28, 4, 4, 'How To Handle The Investigation', '#7f77dd', 'You are not a suspect. Kartar connection — a shared district is not a crime. You have nothing to hide except one small habit.', '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(29, 5, 1, 'Your Situation', '#7f77dd', 'Your father called you at 11:20 PM. Last call. You walked toward study after. Staff saw you near east corridor at 11:26 PM. You turned back without entering.', '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(30, 5, 2, 'What You Actually Know', '#7f77dd', 'Facts: Father called at 11:20 PM (4 mins). He was planning to transfer 95% of estate to farmer trust. You were shocked and walked toward study. You heard voices and turned back.', '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(31, 5, 3, 'Your Weak Points', '#7f77dd', 'What father said in those 4 mins. Why you walked toward study. Why you turned back. Where you were between 11:24 and 11:40 PM.', '2026-05-26 12:31:22', '2026-05-26 12:31:22'),
(32, 5, 4, 'How To Handle The Investigation', '#7f77dd', 'You are grieving — it\'s real. Own your corridor movement. Phone call content — you decide if you want to share.', '2026-05-26 12:31:22', '2026-05-26 12:31:22');

-- --------------------------------------------------------

--
-- Table structure for table `timers`
--

CREATE TABLE `timers` (
  `id` bigint UNSIGNED NOT NULL,
  `group_id` bigint UNSIGNED NOT NULL,
  `timer_type` varchar(50) NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` bigint UNSIGNED DEFAULT '0',
  `admin_id` bigint UNSIGNED DEFAULT NULL,
  `superadmin_id` bigint UNSIGNED DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `platform` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_photo_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `balance` decimal(15,2) NOT NULL DEFAULT '0.00',
  `exposure` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` tinyint NOT NULL DEFAULT '1',
  `usertype` tinyint NOT NULL DEFAULT '0' COMMENT '0=superadmin,1=admin,2=subadmin,3=user',
  `last_activity` timestamp NULL DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `email`, `role_id`, `admin_id`, `superadmin_id`, `phone`, `platform`, `currency`, `ip`, `profile_photo_path`, `balance`, `exposure`, `status`, `usertype`, `last_activity`, `email_verified_at`, `password`, `remember_token`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'admin', 'admin@info.com', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 1, 0, '2026-05-28 10:32:38', NULL, '$2y$12$BpN5vfmq04dsYwCfAZT1FepAhekFhfSOcq..FxO/r.etL5mFZ1BQW', NULL, NULL, '2026-05-26 12:29:05', '2026-05-28 10:32:38'),
(2, 'Administrator', 'admin_demo', 'admin@example.com', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, 0.00, 1, 1, NULL, NULL, '$2y$12$q9fGK0cVZgHJXABa4QJjLuNIhO0geY6BYn76z3qK8FJkF2nfTK/Ae', NULL, NULL, '2026-05-26 12:29:06', '2026-05-26 12:29:06');

-- --------------------------------------------------------

--
-- Table structure for table `witness_passcards`
--

CREATE TABLE `witness_passcards` (
  `id` bigint UNSIGNED NOT NULL,
  `group_id` bigint UNSIGNED NOT NULL,
  `participant_session_id` bigint UNSIGNED NOT NULL,
  `is_used` tinyint(1) DEFAULT '0',
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `activities_slug_unique` (`slug`);

--
-- Indexes for table `activity_games`
--
ALTER TABLE `activity_games`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activity_games_activity_id_foreign` (`activity_id`);

--
-- Indexes for table `answers`
--
ALTER TABLE `answers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `blogs`
--
ALTER TABLE `blogs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `blogs_slug_unique` (`slug`),
  ADD KEY `blogs_created_by_foreign` (`created_by`),
  ADD KEY `blogs_updated_by_foreign` (`updated_by`),
  ADD KEY `blogs_slug_index` (`slug`),
  ADD KEY `blogs_status_index` (`status`),
  ADD KEY `blogs_category_id_index` (`category_id`),
  ADD KEY `blogs_author_id_index` (`author_id`),
  ADD KEY `blogs_published_at_index` (`published_at`),
  ADD KEY `blogs_is_featured_index` (`is_featured`),
  ADD KEY `blogs_views_count_index` (`views_count`);

--
-- Indexes for table `blog_categories`
--
ALTER TABLE `blog_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `blog_categories_name_unique` (`name`),
  ADD UNIQUE KEY `blog_categories_slug_unique` (`slug`),
  ADD KEY `blog_categories_slug_index` (`slug`),
  ADD KEY `blog_categories_status_index` (`status`),
  ADD KEY `blog_categories_created_by_index` (`created_by`),
  ADD KEY `blog_categories_updated_by_foreign` (`updated_by`);

--
-- Indexes for table `blog_comments`
--
ALTER TABLE `blog_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `blog_comments_approved_by_foreign` (`approved_by`),
  ADD KEY `blog_comments_blog_id_index` (`blog_id`),
  ADD KEY `blog_comments_user_id_index` (`user_id`),
  ADD KEY `blog_comments_approved_index` (`approved`);

--
-- Indexes for table `blog_media`
--
ALTER TABLE `blog_media`
  ADD PRIMARY KEY (`id`),
  ADD KEY `blog_media_blog_id_index` (`blog_id`),
  ADD KEY `blog_media_media_type_index` (`media_type`);

--
-- Indexes for table `blog_tags`
--
ALTER TABLE `blog_tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `blog_tags_name_unique` (`name`),
  ADD UNIQUE KEY `blog_tags_slug_unique` (`slug`),
  ADD KEY `blog_tags_slug_index` (`slug`),
  ADD KEY `blog_tags_status_index` (`status`),
  ADD KEY `blog_tags_created_by_foreign` (`created_by`),
  ADD KEY `blog_tags_updated_by_foreign` (`updated_by`);

--
-- Indexes for table `blog_tag_items`
--
ALTER TABLE `blog_tag_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `blog_tag_items_blog_id_blog_tag_id_unique` (`blog_id`,`blog_tag_id`),
  ADD KEY `blog_tag_items_blog_id_index` (`blog_id`),
  ADD KEY `blog_tag_items_blog_tag_id_index` (`blog_tag_id`);

--
-- Indexes for table `blog_views`
--
ALTER TABLE `blog_views`
  ADD PRIMARY KEY (`id`),
  ADD KEY `blog_views_blog_id_index` (`blog_id`),
  ADD KEY `blog_views_user_id_index` (`user_id`),
  ADD KEY `blog_views_created_at_index` (`created_at`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `clue_rooms`
--
ALTER TABLE `clue_rooms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cms_pages`
--
ALTER TABLE `cms_pages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cms_pages_page_name_unique` (`page_name`),
  ADD UNIQUE KEY `cms_pages_slug_unique` (`slug`),
  ADD KEY `cms_pages_slug_index` (`slug`),
  ADD KEY `cms_pages_status_index` (`status`),
  ADD KEY `cms_pages_created_by_index` (`created_by`);

--
-- Indexes for table `email_templates`
--
ALTER TABLE `email_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_templates_name_unique` (`name`),
  ADD UNIQUE KEY `email_templates_slug_unique` (`slug`),
  ADD KEY `email_templates_slug_index` (`slug`),
  ADD KEY `email_templates_status_index` (`status`),
  ADD KEY `email_templates_created_by_index` (`created_by`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `faqs_created_by_foreign` (`created_by`),
  ADD KEY `faqs_updated_by_foreign` (`updated_by`),
  ADD KEY `faqs_category_id_index` (`category_id`),
  ADD KEY `faqs_status_index` (`status`),
  ADD KEY `faqs_sort_order_index` (`sort_order`),
  ADD KEY `faqs_is_featured_index` (`is_featured`);

--
-- Indexes for table `faq_categories`
--
ALTER TABLE `faq_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `faq_categories_name_unique` (`name`),
  ADD UNIQUE KEY `faq_categories_slug_unique` (`slug`),
  ADD KEY `faq_categories_slug_index` (`slug`),
  ADD KEY `faq_categories_status_index` (`status`),
  ADD KEY `faq_categories_sort_order_index` (`sort_order`),
  ADD KEY `faq_categories_created_by_foreign` (`created_by`),
  ADD KEY `faq_categories_updated_by_foreign` (`updated_by`);

--
-- Indexes for table `game_clues`
--
ALTER TABLE `game_clues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `game_clues_game_id_foreign` (`game_id`);

--
-- Indexes for table `game_full_story`
--
ALTER TABLE `game_full_story`
  ADD PRIMARY KEY (`id`),
  ADD KEY `game_full_story_game_id_foreign` (`game_id`);

--
-- Indexes for table `game_groups`
--
ALTER TABLE `game_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_id` (`booking_id`,`group_name`);

--
-- Indexes for table `game_participants`
--
ALTER TABLE `game_participants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `game_participants_join_token_unique` (`join_token`),
  ADD KEY `game_participants_booking_id_foreign` (`booking_id`),
  ADD KEY `game_participants_game_id_foreign` (`game_id`);

--
-- Indexes for table `game_photos`
--
ALTER TABLE `game_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `game_photos_game_id_foreign` (`game_id`);

--
-- Indexes for table `game_roles`
--
ALTER TABLE `game_roles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `game_roles_game_id_foreign` (`game_id`);

--
-- Indexes for table `game_rules`
--
ALTER TABLE `game_rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `game_rules_game_id_foreign` (`game_id`);

--
-- Indexes for table `investigator_cards`
--
ALTER TABLE `investigator_cards`
  ADD PRIMARY KEY (`id`),
  ADD KEY `investigator_cards_game_id_foreign` (`game_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `lie_detector_rounds`
--
ALTER TABLE `lie_detector_rounds`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `menu_permissions`
--
ALTER TABLE `menu_permissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `organizers`
--
ALTER TABLE `organizers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organizers_email_unique` (`email`);

--
-- Indexes for table `organizer_billings`
--
ALTER TABLE `organizer_billings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `organizer_billings_booking_id_foreign` (`booking_id`);

--
-- Indexes for table `organizer_bookings`
--
ALTER TABLE `organizer_bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organizer_bookings_invitation_link_unique` (`invitation_link`),
  ADD KEY `organizer_bookings_organizer_id_foreign` (`organizer_id`),
  ADD KEY `organizer_bookings_activity_id_foreign` (`activity_id`),
  ADD KEY `organizer_bookings_game_id_foreign` (`game_id`),
  ADD KEY `organizer_bookings_package_id_foreign` (`package_id`);

--
-- Indexes for table `packages`
--
ALTER TABLE `packages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `packages_slug_unique` (`slug`),
  ADD KEY `packages_status_sort_order_index` (`status`,`sort_order`);

--
-- Indexes for table `package_purchases`
--
ALTER TABLE `package_purchases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `package_purchases_package_id_status_index` (`package_id`,`status`),
  ADD KEY `package_purchases_user_id_index` (`user_id`);

--
-- Indexes for table `participant_sessions`
--
ALTER TABLE `participant_sessions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_unique` (`name`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `results`
--
ALTER TABLE `results`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_unique` (`name`);

--
-- Indexes for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indexes for table `score_logs`
--
ALTER TABLE `score_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `settings_key_index` (`key`);

--
-- Indexes for table `strategy_cards`
--
ALTER TABLE `strategy_cards`
  ADD PRIMARY KEY (`id`),
  ADD KEY `strategy_cards_role_id_foreign` (`role_id`);

--
-- Indexes for table `timers`
--
ALTER TABLE `timers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_username_unique` (`username`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_role_id_index` (`role_id`),
  ADD KEY `users_admin_id_index` (`admin_id`),
  ADD KEY `users_superadmin_id_index` (`superadmin_id`),
  ADD KEY `users_status_index` (`status`),
  ADD KEY `users_usertype_index` (`usertype`);

--
-- Indexes for table `witness_passcards`
--
ALTER TABLE `witness_passcards`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `activity_games`
--
ALTER TABLE `activity_games`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `answers`
--
ALTER TABLE `answers`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `blogs`
--
ALTER TABLE `blogs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `blog_categories`
--
ALTER TABLE `blog_categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `blog_comments`
--
ALTER TABLE `blog_comments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `blog_media`
--
ALTER TABLE `blog_media`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `blog_tags`
--
ALTER TABLE `blog_tags`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `blog_tag_items`
--
ALTER TABLE `blog_tag_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `blog_views`
--
ALTER TABLE `blog_views`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `clue_rooms`
--
ALTER TABLE `clue_rooms`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cms_pages`
--
ALTER TABLE `cms_pages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `email_templates`
--
ALTER TABLE `email_templates`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faqs`
--
ALTER TABLE `faqs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `faq_categories`
--
ALTER TABLE `faq_categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `game_clues`
--
ALTER TABLE `game_clues`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `game_full_story`
--
ALTER TABLE `game_full_story`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `game_groups`
--
ALTER TABLE `game_groups`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `game_participants`
--
ALTER TABLE `game_participants`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `game_photos`
--
ALTER TABLE `game_photos`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `game_roles`
--
ALTER TABLE `game_roles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `game_rules`
--
ALTER TABLE `game_rules`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `investigator_cards`
--
ALTER TABLE `investigator_cards`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lie_detector_rounds`
--
ALTER TABLE `lie_detector_rounds`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `menu`
--
ALTER TABLE `menu`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `menu_permissions`
--
ALTER TABLE `menu_permissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `organizers`
--
ALTER TABLE `organizers`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `organizer_billings`
--
ALTER TABLE `organizer_billings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `organizer_bookings`
--
ALTER TABLE `organizer_bookings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `packages`
--
ALTER TABLE `packages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `package_purchases`
--
ALTER TABLE `package_purchases`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `participant_sessions`
--
ALTER TABLE `participant_sessions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `results`
--
ALTER TABLE `results`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `score_logs`
--
ALTER TABLE `score_logs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `strategy_cards`
--
ALTER TABLE `strategy_cards`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `timers`
--
ALTER TABLE `timers`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `witness_passcards`
--
ALTER TABLE `witness_passcards`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_games`
--
ALTER TABLE `activity_games`
  ADD CONSTRAINT `activity_games_activity_id_foreign` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `blogs`
--
ALTER TABLE `blogs`
  ADD CONSTRAINT `blogs_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `blogs_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `blog_categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `blogs_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `blogs_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `blog_categories`
--
ALTER TABLE `blog_categories`
  ADD CONSTRAINT `blog_categories_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `blog_categories_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `blog_comments`
--
ALTER TABLE `blog_comments`
  ADD CONSTRAINT `blog_comments_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `blog_comments_blog_id_foreign` FOREIGN KEY (`blog_id`) REFERENCES `blogs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `blog_comments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `blog_media`
--
ALTER TABLE `blog_media`
  ADD CONSTRAINT `blog_media_blog_id_foreign` FOREIGN KEY (`blog_id`) REFERENCES `blogs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `blog_tags`
--
ALTER TABLE `blog_tags`
  ADD CONSTRAINT `blog_tags_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `blog_tags_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `blog_tag_items`
--
ALTER TABLE `blog_tag_items`
  ADD CONSTRAINT `blog_tag_items_blog_id_foreign` FOREIGN KEY (`blog_id`) REFERENCES `blogs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `blog_tag_items_blog_tag_id_foreign` FOREIGN KEY (`blog_tag_id`) REFERENCES `blog_tags` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `blog_views`
--
ALTER TABLE `blog_views`
  ADD CONSTRAINT `blog_views_blog_id_foreign` FOREIGN KEY (`blog_id`) REFERENCES `blogs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `blog_views_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `faqs`
--
ALTER TABLE `faqs`
  ADD CONSTRAINT `faqs_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `faq_categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `faqs_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `faqs_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `faq_categories`
--
ALTER TABLE `faq_categories`
  ADD CONSTRAINT `faq_categories_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `faq_categories_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `game_clues`
--
ALTER TABLE `game_clues`
  ADD CONSTRAINT `game_clues_game_id_foreign` FOREIGN KEY (`game_id`) REFERENCES `activity_games` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `game_full_story`
--
ALTER TABLE `game_full_story`
  ADD CONSTRAINT `game_full_story_game_id_foreign` FOREIGN KEY (`game_id`) REFERENCES `activity_games` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `game_participants`
--
ALTER TABLE `game_participants`
  ADD CONSTRAINT `game_participants_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `organizer_bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `game_participants_game_id_foreign` FOREIGN KEY (`game_id`) REFERENCES `activity_games` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `game_photos`
--
ALTER TABLE `game_photos`
  ADD CONSTRAINT `game_photos_game_id_foreign` FOREIGN KEY (`game_id`) REFERENCES `activity_games` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `game_roles`
--
ALTER TABLE `game_roles`
  ADD CONSTRAINT `game_roles_game_id_foreign` FOREIGN KEY (`game_id`) REFERENCES `activity_games` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `game_rules`
--
ALTER TABLE `game_rules`
  ADD CONSTRAINT `game_rules_game_id_foreign` FOREIGN KEY (`game_id`) REFERENCES `activity_games` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `investigator_cards`
--
ALTER TABLE `investigator_cards`
  ADD CONSTRAINT `investigator_cards_game_id_foreign` FOREIGN KEY (`game_id`) REFERENCES `activity_games` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `organizer_billings`
--
ALTER TABLE `organizer_billings`
  ADD CONSTRAINT `organizer_billings_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `organizer_bookings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `organizer_bookings`
--
ALTER TABLE `organizer_bookings`
  ADD CONSTRAINT `organizer_bookings_activity_id_foreign` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `organizer_bookings_game_id_foreign` FOREIGN KEY (`game_id`) REFERENCES `activity_games` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `organizer_bookings_organizer_id_foreign` FOREIGN KEY (`organizer_id`) REFERENCES `organizers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `organizer_bookings_package_id_foreign` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `package_purchases`
--
ALTER TABLE `package_purchases`
  ADD CONSTRAINT `package_purchases_package_id_foreign` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `strategy_cards`
--
ALTER TABLE `strategy_cards`
  ADD CONSTRAINT `strategy_cards_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `game_roles` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
