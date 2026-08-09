-- Cook & Create Module Database Schema
-- This file adds Cook & Create specific tables and initial data

-- --------------------------------------------------------
-- Add Cook & Create to activities table
-- --------------------------------------------------------
INSERT INTO `activities`
  (`id`, `title`, `slug`, `description`, `cover_image`, `status`, `lobby_wait_secs`, `entry_cutoff_mins`,
   `game_duration_secs`, `case_summary_view_secs`, `strategy_guide_delay_secs`, `clue_room_unlock_secs`,
   `question_response_secs`, `max_questions`, `group_size`, `auto_expire_days`, `win_bonus`,
   `participation_bonus`, `timely_response_bonus`, `no_response_penalty`, `wrong_vote_penalty`,
   `lie_detector_enabled`, `lie_detector_max_questions`, `lie_detector_timer_secs`,
   `lie_detector_voting_timer_secs`, `icon`, `created_at`, `updated_at`)
VALUES
  (2, 'Cook & Create', 'cook-and-create', 'A fun cooking-themed impostor game where players collaborate to create the best dish while finding the hidden impostor among them!', NULL, 'active',
   900, 15, 1500, 0, 0, 0, 120, 0, 5, 5, 100, 50, 20, -10, -15, 0, 0, 0, 0, '🍳',
   NOW(), NOW());

-- --------------------------------------------------------
-- Cook & Create Ingredients
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cc_ingredients` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_absurd` tinyint(1) NOT NULL DEFAULT 0,
  `activity_id` bigint UNSIGNED NOT NULL DEFAULT 2,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_id` (`activity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cook & Create Game Templates (extends activity_games)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cc_game_templates` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `activity_game_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `tagline` varchar(255) DEFAULT NULL,
  `description` text,
  `round1_ingredients_count` int UNSIGNED NOT NULL DEFAULT 10,
  `round1_votes_per_player` int UNSIGNED NOT NULL DEFAULT 2,
  `round1_top_ingredients` int UNSIGNED NOT NULL DEFAULT 4,
  `round1_timer_secs` int UNSIGNED NOT NULL DEFAULT 120,
  `round2_step_max_chars` int UNSIGNED NOT NULL DEFAULT 120,
  `round2_submit_timer_secs` int UNSIGNED NOT NULL DEFAULT 120,
  `round2_review_timer_secs` int UNSIGNED NOT NULL DEFAULT 120,
  `round3_discussion_timer_secs` int UNSIGNED NOT NULL DEFAULT 60,
  `round3_voting_timer_secs` int UNSIGNED NOT NULL DEFAULT 120,
  `round3_max_messages_per_player` int UNSIGNED NOT NULL DEFAULT 2,
  `show_host_role_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `impostor_bias_card_text` text,
  `status` enum('draft','active') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activity_game_id` (`activity_game_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cook & Create Game Template Ingredients
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cc_game_template_ingredients` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `template_id` bigint UNSIGNED NOT NULL,
  `ingredient_id` bigint UNSIGNED NOT NULL,
  `order` int UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `template_id` (`template_id`),
  KEY `ingredient_id` (`ingredient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cook & Create Clues (released during rounds)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cc_clues` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `template_id` bigint UNSIGNED NOT NULL,
  `round_number` tinyint UNSIGNED NOT NULL,
  `clue_text` text NOT NULL,
  `order` int UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `template_id` (`template_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cook & Create Game Instances (per group)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cc_game_instances` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `group_id` bigint UNSIGNED NOT NULL,
  `template_id` bigint UNSIGNED NOT NULL,
  `activity_id` bigint UNSIGNED NOT NULL DEFAULT 2,
  `status` enum('waiting','round1','round2','round3_discussion','round3_voting','completed') NOT NULL DEFAULT 'waiting',
  `impostor_participant_id` bigint UNSIGNED DEFAULT NULL,
  `show_host_participant_id` bigint UNSIGNED DEFAULT NULL,
  `dish_name` varchar(255) DEFAULT NULL,
  `dish_named_by_participant_id` bigint UNSIGNED DEFAULT NULL,
  `round1_started_at` datetime DEFAULT NULL,
  `round1_ended_at` datetime DEFAULT NULL,
  `round2_started_at` datetime DEFAULT NULL,
  `round2_ended_at` datetime DEFAULT NULL,
  `round3_discussion_started_at` datetime DEFAULT NULL,
  `round3_discussion_ended_at` datetime DEFAULT NULL,
  `round3_voting_started_at` datetime DEFAULT NULL,
  `round3_voting_ended_at` datetime DEFAULT NULL,
  `finished_at` datetime DEFAULT NULL,
  `group_won` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `group_id` (`group_id`),
  KEY `template_id` (`template_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cook & Create Round 1: Ingredient Votes
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cc_round1_votes` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `instance_id` bigint UNSIGNED NOT NULL,
  `participant_id` bigint UNSIGNED NOT NULL,
  `ingredient_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_vote` (`instance_id`, `participant_id`, `ingredient_id`),
  KEY `instance_id` (`instance_id`),
  KEY `participant_id` (`participant_id`),
  KEY `ingredient_id` (`ingredient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cook & Create Round 1: Selected Ingredients (Top N)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cc_round1_selected_ingredients` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `instance_id` bigint UNSIGNED NOT NULL,
  `ingredient_id` bigint UNSIGNED NOT NULL,
  `vote_count` int UNSIGNED NOT NULL DEFAULT 0,
  `rank` int UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_instance_ingredient` (`instance_id`, `ingredient_id`),
  KEY `instance_id` (`instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cook & Create Round 2: Submitted Cooking Steps
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cc_round2_steps` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `instance_id` bigint UNSIGNED NOT NULL,
  `participant_id` bigint UNSIGNED NOT NULL,
  `step_text` text NOT NULL,
  `step_letter` char(1) NOT NULL,
  `is_bad_step` tinyint(1) DEFAULT NULL,
  `status` enum('submitted','kept','removed') DEFAULT 'submitted',
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_participant_step` (`instance_id`, `participant_id`),
  KEY `instance_id` (`instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cook & Create Round 2: Votes on Steps (Keep/Remove)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cc_round2_step_votes` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `instance_id` bigint UNSIGNED NOT NULL,
  `participant_id` bigint UNSIGNED NOT NULL,
  `step_id` bigint UNSIGNED NOT NULL,
  `vote` enum('keep','remove') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_step_vote` (`instance_id`, `participant_id`, `step_id`),
  KEY `instance_id` (`instance_id`),
  KEY `step_id` (`step_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cook & Create Round 2: Released Clues
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cc_round2_released_clues` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `instance_id` bigint UNSIGNED NOT NULL,
  `clue_id` bigint UNSIGNED NOT NULL,
  `released_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_clue_instance` (`instance_id`, `clue_id`),
  KEY `instance_id` (`instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cook & Create Round 3: Chat Messages
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cc_round3_messages` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `instance_id` bigint UNSIGNED NOT NULL,
  `participant_id` bigint UNSIGNED NOT NULL,
  `message` text NOT NULL,
  `is_impostor_private` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `instance_id` (`instance_id`),
  KEY `participant_id` (`participant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cook & Create Round 3: Impostor Votes
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cc_round3_impostor_votes` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `instance_id` bigint UNSIGNED NOT NULL,
  `participant_id` bigint UNSIGNED NOT NULL,
  `voted_for_participant_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_vote_per_participant` (`instance_id`, `participant_id`),
  KEY `instance_id` (`instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cook & Create Rating Categories (for review page)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cc_rating_categories` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `emoji` varchar(20) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `order` int UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cook & Create Ratings (per group)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cc_ratings` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `instance_id` bigint UNSIGNED NOT NULL,
  `category_id` bigint UNSIGNED NOT NULL,
  `voting_participant_id` bigint UNSIGNED NOT NULL,
  `rated_group_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `instance_id` (`instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Seed Data: Rating Categories
-- --------------------------------------------------------
INSERT INTO `cc_rating_categories` (`name`, `slug`, `emoji`, `description`, `order`, `created_at`, `updated_at`) VALUES
  ('Most Creative Dish', 'most-creative', '🎨', 'The most creative and innovative dish!', 1, NOW(), NOW()),
  ('Funniest Dish', 'funniest-dish', '😂', 'The funniest dish or recipe!', 2, NOW(), NOW()),
  ('Most Confusing Dish', 'most-confusing', '🤯', 'The most confusing dish ever!', 3, NOW(), NOW()),
  ('Total Chaos Dish', 'total-chaos', '💥', 'Total chaos in the kitchen!', 4, NOW(), NOW()),
  ('What Did I Just Read?!', 'what-did-i-read', '😱', 'Most mind-boggling recipe!', 5, NOW(), NOW()),
  ('Least Edible Dish', 'least-edible', '🤢', 'The dish that sounds least edible!', 6, NOW(), NOW()),
  ('Too Spicy to Handle', 'too-spicy', '🌶️', 'Way too spicy or weird combinations!', 7, NOW(), NOW()),
  ('Weirdest Combination', 'weirdest-combination', '👽', 'The weirdest ingredient combinations!', 8, NOW(), NOW()),
  ('Taste Buds Destroyer', 'taste-buds-destroyer', '💀', 'Destroys taste buds guaranteed!', 9, NOW(), NOW()),
  ('MasterChef Level', 'masterchef-level', '👨‍🍳', 'The most professional & realistic recipe!', 10, NOW(), NOW()),
  ('Would Actually Eat This', 'would-eat-this', '😋', 'The dish you would actually try!', 11, NOW(), NOW());

-- --------------------------------------------------------
-- Seed Data: Default Ingredients
-- --------------------------------------------------------
INSERT INTO `cc_ingredients` (`name`, `image_url`, `is_absurd`, `activity_id`, `created_at`, `updated_at`) VALUES
  ('Chicken', '/assets/cookandcreate/chicken.jpg', 0, 2, NOW(), NOW()),
  ('Paneer', '/assets/cookandcreate/paneer.jpg', 0, 2, NOW(), NOW()),
  ('Tomatoes', '/assets/cookandcreate/tomatoes.jpg', 0, 2, NOW(), NOW()),
  ('Ice Cubes', '/assets/cookandcreate/ice-cubes.jpg', 1, 2, NOW(), NOW()),
  ('Garlic', '/assets/cookandcreate/garlic.jpg', 0, 2, NOW(), NOW()),
  ('Cream', '/assets/cookandcreate/cream.jpg', 0, 2, NOW(), NOW()),
  ('Soy Sauce', '/assets/cookandcreate/soy-sauce.jpg', 0, 2, NOW(), NOW()),
  ('Sand', '/assets/cookandcreate/sand.jpg', 1, 2, NOW(), NOW()),
  ('Onions', '/assets/cookandcreate/onions.jpg', 0, 2, NOW(), NOW()),
  ('Butter', '/assets/cookandcreate/butter.jpg', 0, 2, NOW(), NOW());

-- --------------------------------------------------------
-- Seed Activity Game & Template for Cook & Create
-- --------------------------------------------------------
INSERT INTO `activity_games` (`id`, `activity_id`, `title`, `case_summary`, `tagline`, `status`, `created_at`, `updated_at`) VALUES
  (2, 2, 'Kitchen Chaos', '<h3>Game Brief</h3><p>Welcome to the chaotic kitchen of MasterChef Impostor! Your team has 25 minutes to create the best dish you can imagine. But beware — one of you is the Hidden Impostor whose only goal is to mislead the group into creating the worst dish possible!</p><p>Round 1: Vote for the best ingredients (top 4 selected)!<br/>Round 2: Each of you submits one cooking step, then the group votes to keep or remove each step!<br/>Round 3: 60-second group chat, then vote to eliminate who you think the impostor is!</p>',
    'Create the perfect dish… while rooting out the impostor.', 'active', NOW(), NOW());

INSERT INTO `cc_game_templates`
  (`activity_game_id`, `name`, `tagline`, `description`, `round1_ingredients_count`, `round1_votes_per_player`, `round1_top_ingredients`,
   `round1_timer_secs`, `round2_step_max_chars`, `round2_submit_timer_secs`, `round2_review_timer_secs`,
   `round3_discussion_timer_secs`, `round3_voting_timer_secs`, `round3_max_messages_per_player`, `show_host_role_enabled`,
   `impostor_bias_card_text`, `created_at`, `updated_at`)
VALUES
  (2, 'Kitchen Chaos', 'Create the perfect dish… while rooting out the impostor.',
   'Standard 5-player game with impostor, show host, and 3 chef roles!',
   10, 2, 4, 120, 120, 120, 120, 60, 120, 2, 1,
   '<strong>You are the Impostor. Your Bias Card:</strong><ul><li>Always vote for the most useless/absurd ingredient in every round.</li><li>Submit one deliberately bad cooking step (but act natural!).</li><li>Try to mislead the group into removing good steps and keeping bad ones.</li><li>Deflect accusations, stay calm — don\'t deny too hard!</li></ul>',
   NOW(), NOW());

-- Link default ingredients to default template
INSERT INTO `cc_game_template_ingredients` (`template_id`, `ingredient_id`, `order`)
SELECT 1 AS template_id, id AS ingredient_id, id - 1 AS `order` FROM `cc_ingredients` ORDER BY id ASC;

-- Seed Clues for default template
INSERT INTO `cc_clues` (`template_id`, `round_number`, `clue_text`, `order`) VALUES
  (1, 1, 'Interesting — some absurd ingredients also received votes… someone in your group chose them.', 1),
  (1, 2, 'The player who voted for the absurd ingredients is also the one who submitted that surprisingly bad cooking step…', 1),
  (1, 3, 'The impostor also voted to keep their own bad step during the review phase.', 1);
