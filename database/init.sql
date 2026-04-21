-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Апр 21 2026 г., 17:20
-- Версия сервера: 10.4.32-MariaDB
-- Версия PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `nexthost`
--

-- --------------------------------------------------------

--
-- Структура таблицы `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `tariff_id` int(11) NOT NULL,
  `date` datetime DEFAULT current_timestamp(),
  `status` varchar(20) DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `tariff_id` int(11) NOT NULL,
  `tariff_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `pay_code` varchar(6) NOT NULL,
  `pay_code_expires` datetime NOT NULL,
  `status` enum('pending','confirmed','expired','canceled') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `confirmed_at` datetime DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `payments`
--

INSERT INTO `payments` (`id`, `tariff_id`, `tariff_name`, `email`, `phone`, `amount`, `pay_code`, `pay_code_expires`, `status`, `created_at`, `confirmed_at`, `order_id`) VALUES
(1, 0, 'Pro', 'T_abilay12@mail.ru', '', 2500.00, '', '0000-00-00 00:00:00', '', '2025-12-07 16:52:24', '2025-12-07 16:52:24', 0),
(2, 0, 'Start', 'T_abilay12@mail.ru', '', 1200.00, '', '0000-00-00 00:00:00', '', '2025-12-07 16:57:21', '2025-12-07 16:57:21', 0),
(3, 3, 'Business', 'T_abilay12@mail.ru', '+77067145056', 5000.00, '1810', '0000-00-00 00:00:00', '', '2025-12-07 16:59:33', '2025-12-07 16:59:33', 0),
(4, 3, 'Business', 'T_abilay12@mail.ru', '+77067145056', 5000.00, '1810', '0000-00-00 00:00:00', '', '2025-12-07 16:59:34', '2025-12-07 16:59:34', 0),
(5, 1, 'Start', 'T_abilay12@mail.ru', '+77067145056', 1200.00, '4253', '0000-00-00 00:00:00', '', '2025-12-07 17:00:10', '2025-12-07 17:00:10', 0),
(6, 2, 'Pro', 'T_abilay12@mail.ru', '+77067145056', 2500.00, '5848', '0000-00-00 00:00:00', '', '2025-12-07 18:19:43', '2025-12-07 18:19:43', 0),
(7, 2, 'Pro', 'T_abilay12@mail.ru', '+77067145056', 2500.00, '5848', '0000-00-00 00:00:00', '', '2025-12-07 18:19:44', '2025-12-07 18:19:44', 0),
(8, 2, 'Pro', 'T_abilay12@mail.ru', '+77067145056', 2500.00, '7755', '0000-00-00 00:00:00', '', '2025-12-10 09:34:42', '2025-12-10 09:34:42', 0),
(9, 0, 'Баланс толтыру', 'korol5056@gmail.com', '+77067145056', 120.00, '7177', '0000-00-00 00:00:00', '', '2025-12-10 09:40:14', '2025-12-10 09:40:14', 0),
(10, 0, 'Баланс толтыру', 'korol5056@gmail.com', '+77067145056', 120.00, '7177', '0000-00-00 00:00:00', '', '2025-12-10 09:40:19', '2025-12-10 09:40:19', 0),
(11, 2, 'Pro', 'T_abilay12@mail.ru', '+77067145056', 2500.00, '5082', '0000-00-00 00:00:00', '', '2025-12-10 09:51:28', '2025-12-10 09:51:28', 0),
(12, 2, 'Pro', 'T_abilay12@mail.ru', '+77067145056', 2500.00, '8507', '0000-00-00 00:00:00', '', '2025-12-11 10:09:18', '2025-12-11 10:09:18', 0),
(13, 2, 'Pro', 'T_abilay12@mail.ru', '+77067145056', 2500.00, '3045', '0000-00-00 00:00:00', '', '2025-12-22 09:01:13', '2025-12-22 09:01:13', 0);

-- --------------------------------------------------------

--
-- Структура таблицы `referrals`
--

CREATE TABLE `referrals` (
  `id` int(11) NOT NULL,
  `inviter_id` int(11) NOT NULL,
  `friend_id` int(11) NOT NULL,
  `bonus` float DEFAULT 0,
  `date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `user_name` varchar(100) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `comment` text DEFAULT NULL,
  `date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `reviews`
--

INSERT INTO `reviews` (`id`, `user_name`, `rating`, `comment`, `date`) VALUES
(1, 'Амир', 3, 'классно, но могли бы лучше', '2025-12-07 17:28:34'),
(2, 'Жанна', 3, 'Негызы унады ', '2026-03-05 15:22:42'),
(3, 'Жанна', 4, 'fggdfgfgfh', '2026-03-05 16:25:03');

-- --------------------------------------------------------

--
-- Структура таблицы `tariffs`
--

CREATE TABLE `tariffs` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `price` float NOT NULL,
  `memory_gb` int(11) DEFAULT NULL,
  `sites` int(11) DEFAULT NULL,
  `traffic_gb` int(11) DEFAULT NULL,
  `php_mysql` tinyint(1) DEFAULT 1,
  `ssl` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `tariffs`
--

INSERT INTO `tariffs` (`id`, `name`, `description`, `price`, `memory_gb`, `sites`, `traffic_gb`, `php_mysql`, `ssl`) VALUES
(1, 'Start', 'Для блогов и визиток', 1200, 5, 1, 50, 1, 1),
(2, 'Pro', 'Для интернет-магазинов', 2500, 10, 3, 200, 1, 1),
(3, 'Business', 'Для корпоративных сайтов', 4500, 25, 10, 500, 1, 1),
(4, 'Enterprise', 'Для крупных проектов', 9500, 100, 30, 2000, 1, 1);

-- --------------------------------------------------------

--
-- Структура таблицы `tickets`
--

CREATE TABLE `tickets` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `screenshot_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `tickets`
--

INSERT INTO `tickets` (`id`, `name`, `email`, `message`, `created_at`, `screenshot_path`) VALUES
(2, 'Абыл', 'T_abilay12@mail.ru', 'все еще тест', '2025-10-29 19:21:09', 'uploads/1761765669_Снимок экрана 2025-10-29 233726.png'),
(3, 'абыл', 'T_abilay12@mail.ru', 'скрин', '2025-10-29 19:29:56', 'uploads/1761766196_Снимок экрана 2025-10-29 233726.png'),
(4, 'альфа', 'alfa@gmail.com', 'окей', '2025-10-30 03:30:59', 'uploads/1761795059_nurbek.jpg'),
(5, 'Нурбек', 'nurbek2288@gmail.com', 'подписка акшасын кайтара аласызба', '2025-10-30 03:40:02', 'uploads/1761795602_nurbek.jpg'),
(6, 'Жасмин', 'atabidullina@mail.ru', 'верните денбги за подписку ', '2025-11-12 14:48:59', 'uploads/1762958939_What is VPS and Why Do You Need It_.jpg'),
(7, 'Альфараби', 'atabidulla@gmail.com', 'Саламатсызба, менын балам сыздын сайтынызда байкаусызда менын картам аркылы, подписканыз алып койды\r\nАкшасын кайтара аласызба', '2025-11-29 05:46:13', 'uploads/1764395173_ceo.jpeg'),
(8, 'Абылайхан', 'T_abilay12@mail.ru', 'подпискам акшасын кайтара аласызба', '2025-12-10 04:52:48', NULL),
(9, 'Нурбек', 'korol5056@gmail.com', 'й', '2026-03-05 11:19:51', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email_verified` tinyint(1) DEFAULT 0,
  `verification_code` varchar(100) DEFAULT NULL,
  `reset_token` varchar(100) DEFAULT NULL,
  `phone_verified` tinyint(1) DEFAULT 0,
  `balance` float DEFAULT 1000,
  `date_created` datetime DEFAULT current_timestamp(),
  `reset_token_expires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `username`, `phone`, `email`, `password`, `email_verified`, `verification_code`, `reset_token`, `phone_verified`, `balance`, `date_created`, `reset_token_expires`) VALUES
(5, 'Бабыл', '+77778145056', 'atabidulla@gmail.com', '$2y$10$1V8D3L4pSJDb600Mrwgk0.s49hDYm0fYelqHeVM6zcLGwIpfdsc7G', 0, '251e9afcf6', '21c816f84cd4ff113f603900236a7a8b', 0, 1000, '2025-11-10 23:44:10', '2025-11-10 20:55:30'),
(24, 'Нурдаулет', '+77778145056', 'my.nexthost222@gmail.com', '$2y$10$ZDM8Kv4JWmgWw4tL/y.hR.euOHdSElOwNoSkby3zQ8X.gbKmMj/W2', 1, NULL, '0a7d444803d6648f1caef4705870e2d2', 0, 1000, '2025-11-11 01:49:19', '2025-11-10 23:29:17'),
(25, 'боббииии', '+77778145056', 'abalay5056@gmail.com', '$2y$10$V1WRrrzCDbpEF1QicbV2f.gPaH692uHIcvvEoXzgNFbqjVrgGt7i2', 1, NULL, '0063188c1e8fe7e9a3c510076c41e500', 0, 1000, '2025-11-11 01:58:12', '2025-11-12 06:47:29'),
(26, 'Жасмин', '+77778145056', 'tabidullina@mail.ru', '$2y$10$iYTNL18uYKiH4BQrqyO1mO4cou4exZANZ.SkBBIiv3sxeyocAvp8y', 0, '84471ebe36efd7bbf8c79fa2dc5e59e7', NULL, 0, 1000, '2025-11-12 19:46:31', NULL),
(29, 'Мухамеддали', '+77778145056', 'alitulenov35@gmail.com', '$2y$10$GrbgATvzMGhuNfqFVYARjePVeuwhqktneRkNZWAYY4GWogxX/ySdm', 0, '115af04bf0e721738342d41f358c1d55', NULL, 0, 1000, '2025-11-26 09:24:16', NULL),
(34, 'Нурбекк', '+77778145056', 'korol5056@gmail.com', '$2y$10$.ooegOUthoXdDGU4xLOr.uQ4ZO0zvu08VM4x0TfxMNqxrwdbDT2CO', 1, NULL, NULL, 0, 1000, '2025-12-10 09:49:01', NULL),
(35, 'Azhar', '87471373279', 'azhar.shyrynkhan.06@mail.ru', '$2y$10$z2olfoRuSaB.nhWT91/o5e7RdZ4CbNOI2PgIfb2z0UQbhHlYSqasW', 0, '6dd3337ccb9c64c7bf536b60128ae1ed', NULL, 0, 1000, '2026-03-05 14:46:31', NULL),
(37, 'Абыл', '+77067145056', 'T_abilay12@mail.ru', '$2y$10$yE5jArfK6rteNeGvTrLGuOqbfRdY7lKOJM/or0mkwmhh6F7Ir/nV6', 1, NULL, NULL, 0, 1000, '2026-03-05 16:10:21', NULL);

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `tariff_id` (`tariff_id`);

--
-- Индексы таблицы `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tariff_id` (`tariff_id`),
  ADD KEY `phone` (`phone`),
  ADD KEY `status` (`status`);

--
-- Индексы таблицы `referrals`
--
ALTER TABLE `referrals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inviter_id` (`inviter_id`),
  ADD KEY `friend_id` (`friend_id`);

--
-- Индексы таблицы `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `tariffs`
--
ALTER TABLE `tariffs`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT для таблицы `referrals`
--
ALTER TABLE `referrals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT для таблицы `tariffs`
--
ALTER TABLE `tariffs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT для таблицы `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`tariff_id`) REFERENCES `tariffs` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `referrals`
--
ALTER TABLE `referrals`
  ADD CONSTRAINT `referrals_ibfk_1` FOREIGN KEY (`inviter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `referrals_ibfk_2` FOREIGN KEY (`friend_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
