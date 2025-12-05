-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 05, 2025 at 04:54 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gwc_hrms`
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `user_id` varchar(11) NOT NULL,
  `time_in` time DEFAULT NULL,
  `time_out` time DEFAULT NULL,
  `status` enum('present','late','absent','undertime','on leave') DEFAULT NULL,
  `late_minutes` int(11) NOT NULL,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `user_id`, `time_in`, `time_out`, `status`, `late_minutes`, `date`) VALUES
(3, '1f57430b', '11:59:46', NULL, 'present', 0, '2025-11-07'),
(6, 'c99d2a6e', '10:29:02', NULL, 'present', 0, '2025-11-24'),
(7, '772e34cb', '14:15:11', '14:15:51', 'present', 0, '2025-11-25'),
(8, 'eb60a4c9', '11:26:09', NULL, 'present', 0, '2025-11-26'),
(9, 'c99d2a6e', '08:54:00', '13:23:12', 'present', 0, '2025-11-27');

-- --------------------------------------------------------

--
-- Table structure for table `certificate_requests`
--

CREATE TABLE `certificate_requests` (
  `id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `certificate_type` varchar(100) NOT NULL,
  `purpose` varchar(255) NOT NULL,
  `additional_details` text DEFAULT NULL,
  `request_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('Pending','Approved','Rejected','Processing') DEFAULT 'Pending',
  `approved_by` varchar(255) DEFAULT NULL,
  `approved_date` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `certificate_file_path` varchar(500) DEFAULT NULL,
  `certificate_file_name` varchar(255) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `certificate_requests`
--

INSERT INTO `certificate_requests` (`id`, `user_id`, `certificate_type`, `purpose`, `additional_details`, `request_date`, `status`, `approved_by`, `approved_date`, `rejection_reason`, `certificate_file_path`, `certificate_file_name`, `file_size`, `created_at`, `updated_at`) VALUES
(2, 'c99d2a6e', 'Certificate of Employment', 'for some reason', NULL, '2025-11-24 03:01:59', 'Approved', '3997e481', '2025-11-25 07:18:18', NULL, 'C:\\Users\\jfk\\Desktop\\expressServer\\hrmogwcAPI\\uploads\\certificates\\certificate-1764055096787-617597417-LETTER.docx', 'LETTER.docx', 447753, '2025-11-24 03:01:59', '2025-11-25 07:18:18'),
(3, '772e34cb', 'Certificate of Employment', 'Employment', NULL, '2025-11-25 06:08:58', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-25 06:08:58', '2025-11-25 06:08:58'),
(4, '403267bd', 'Certificate of Employment', 'for some reason', NULL, '2025-11-26 03:44:03', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-26 03:44:03', '2025-11-26 03:44:03'),
(5, 'c99d2a6e', 'Service Record', 'for apply', NULL, '2025-11-27 00:57:37', 'Approved', '3997e481', '2025-11-27 00:59:18', NULL, 'C:\\Users\\jfk\\Desktop\\expressServer\\hrmogwcAPI\\uploads\\certificates\\certificate-1764205158993-740159513-FOR_TESTING.docx', 'FOR_TESTING.docx', 13394, '2025-11-27 00:57:37', '2025-11-27 00:59:18'),
(6, 'c99d2a6e', 'Certificate of Employment', 'To apply ', NULL, '2025-11-27 05:27:17', 'Approved', '3997e481', '2025-11-27 05:28:40', NULL, 'C:\\Users\\jfk\\Desktop\\expressServer\\hrmogwcAPI\\uploads\\certificates\\certificate-1764221320649-299317714-FOR_TESTING__1__11.docx', 'FOR_TESTING (1) 11.docx', 13394, '2025-11-27 05:27:17', '2025-11-27 05:28:40');

-- --------------------------------------------------------

--
-- Table structure for table `certificate_types`
--

CREATE TABLE `certificate_types` (
  `id` int(11) NOT NULL,
  `type_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL,
  `room` varchar(255) NOT NULL,
  `sender_id` varchar(255) DEFAULT NULL,
  `sender_name` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `recipient_id` varchar(255) DEFAULT NULL,
  `cid` varchar(255) DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `room`, `sender_id`, `sender_name`, `message`, `created_at`, `recipient_id`, `cid`, `read_at`) VALUES
(1, 'dm:3997e481:9b61a27f', '9b61a27f', 'ronnelabuan0102@gmail.com', 'hello', '2025-11-05 05:42:49', NULL, '1762321370183', NULL),
(2, 'dm:165ae2a5:3997e481', '165ae2a5', 'aries@gmail.com', 'Good day mam', '2025-11-05 05:54:31', NULL, '1762322072051', NULL),
(3, 'dm:3997e481:9b61a27f', '9b61a27f', 'ronnelabuan0102@gmail.com', 'good afternoon', '2025-11-21 05:57:14', NULL, '1763704634865', NULL),
(4, 'dm:3997e481:9b61a27f', '9b61a27f', 'ronnelabuan0102@gmail.com', 'Good day', '2025-11-24 01:59:33', NULL, '1763949573314', NULL),
(5, 'dm:29c8e8ed:3997e481', '29c8e8ed', 'kurdapiopolikarpioephraim@gmail.com', 'hgtuyukhykhkl', '2025-11-25 05:55:50', NULL, '1764050154753', NULL),
(6, 'dm:3997e481:772e34cb', '772e34cb', 'angeloalcedo116@gmail.com', 'hello', '2025-11-25 06:25:48', NULL, '1764051948767', NULL),
(7, 'dm:3997e481:403267bd', '403267bd', 'deedomaoal14@gmail.com', 'good day', '2025-11-26 03:45:17', NULL, '1764128743310', NULL),
(8, 'dm:3997e481:c99d2a6e', 'c99d2a6e', 'ronnelabuan0102@gmail.com', 'good afternoon ma\'am', '2025-11-26 07:58:05', NULL, '1764143885313', NULL),
(9, 'dm:3997e481:c99d2a6e', 'c99d2a6e', 'ronnelabuan0102@gmail.com', 'sahod na po ba', '2025-11-27 05:45:34', NULL, '1764222360719', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `department`
--

CREATE TABLE `department` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `create_At` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_At` date DEFAULT NULL,
  `updated_By` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `department`
--

INSERT INTO `department` (`id`, `name`, `create_At`, `updated_At`, `updated_By`) VALUES
(1, 'College of Information Technology Education', '2025-10-25 23:38:07', NULL, 'College of Business Mangement'),
(2, 'College of Education', '2025-10-25 23:38:07', NULL, NULL),
(3, 'College of Business Management', '2025-10-25 23:40:39', NULL, NULL),
(5, 'College of Criminology', '2025-10-25 23:41:28', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `evaluation`
--

CREATE TABLE `evaluation` (
  `id` int(11) NOT NULL,
  `teacher_id` varchar(255) NOT NULL,
  `expires_at` datetime DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `evaluation`
--

INSERT INTO `evaluation` (`id`, `teacher_id`, `expires_at`, `password`, `status`, `created_at`, `created_by`) VALUES
(12, 'b00eb428', '2025-11-14 22:00:00', '8922', NULL, '2025-11-14 05:03:51', NULL),
(13, '165ae2a5', '2025-11-14 22:00:00', '8444', NULL, '2025-11-14 05:04:00', NULL),
(14, '165ae2a5', '2025-11-17 22:00:00', '5140', NULL, '2025-11-17 08:06:45', NULL),
(17, '772e34cb', '2025-11-25 22:00:00', '4894', NULL, '2025-11-25 06:17:47', NULL),
(18, 'c99d2a6e', '2025-11-25 22:00:00', '8405', NULL, '2025-11-25 07:30:41', NULL),
(19, '1f57430b', '2025-11-26 22:00:00', '5140', NULL, '2025-11-26 05:00:04', NULL),
(20, '1f57430b', '2025-11-26 22:00:00', '5945', NULL, '2025-11-26 05:03:59', NULL),
(21, '165ae2a5', '2025-11-26 22:00:00', '2191', NULL, '2025-11-26 05:19:02', NULL),
(22, '29c8e8ed', '2025-11-27 22:00:00', '1855', NULL, '2025-11-27 01:02:49', NULL),
(23, '403267bd', '2025-11-27 22:00:00', '7096', NULL, '2025-11-27 01:14:35', NULL),
(24, '1f57430b', '2025-11-27 22:00:00', '8096', NULL, '2025-11-27 02:30:54', NULL),
(25, '60a92626', '2025-11-27 22:00:00', '5938', NULL, '2025-11-27 05:31:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_answers`
--

CREATE TABLE `evaluation_answers` (
  `id` int(11) NOT NULL,
  `evaluation_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `student_id` varchar(11) NOT NULL,
  `rating` int(50) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `evaluation_answers`
--

INSERT INTO `evaluation_answers` (`id`, `evaluation_id`, `question_id`, `student_id`, `rating`, `remarks`) VALUES
(253, 14, 3, '20250101', 3, NULL),
(254, 14, 6, '20250101', 4, NULL),
(255, 14, 8, '20250101', 4, NULL),
(256, 14, 4, '20250101', 4, NULL),
(257, 14, 12, '20250101', 5, NULL),
(258, 14, 16, '20250101', 5, NULL),
(259, 14, 20, '20250101', 5, NULL),
(260, 14, 11, '20250101', 3, NULL),
(261, 14, 13, '20250101', 4, NULL),
(262, 14, 9, '20250101', 3, NULL),
(263, 14, 5, '20250101', 3, NULL),
(264, 14, 1, '20250101', 1, NULL),
(265, 14, 18, '20250101', 5, NULL),
(266, 14, 15, '20250101', 4, NULL),
(267, 14, 10, '20250101', 5, NULL),
(268, 14, 2, '20250101', 5, NULL),
(269, 14, 17, '20250101', 4, NULL),
(270, 14, 14, '20250101', 5, NULL),
(271, 14, 7, '20250101', 5, NULL),
(272, 14, 21, '20250101', NULL, 'Test py'),
(273, 14, 19, '20250101', 5, NULL),
(295, 17, 1, '122300834', 4, NULL),
(296, 17, 3, '122300834', 4, NULL),
(297, 17, 7, '122300834', 3, NULL),
(298, 17, 11, '122300834', 4, NULL),
(299, 17, 14, '122300834', 3, NULL),
(300, 17, 2, '122300834', 4, NULL),
(301, 17, 6, '122300834', 3, NULL),
(302, 17, 4, '122300834', 4, NULL),
(303, 17, 5, '122300834', 4, NULL),
(304, 17, 13, '122300834', 2, NULL),
(305, 17, 18, '122300834', 4, NULL),
(306, 17, 8, '122300834', 4, NULL),
(307, 17, 17, '122300834', 4, NULL),
(308, 17, 12, '122300834', 3, NULL),
(309, 17, 9, '122300834', 4, NULL),
(310, 17, 10, '122300834', 4, NULL),
(311, 17, 21, '122300834', NULL, 'pogii'),
(312, 17, 15, '122300834', 4, NULL),
(313, 17, 20, '122300834', 4, NULL),
(314, 17, 16, '122300834', 3, NULL),
(315, 17, 19, '122300834', 4, NULL),
(316, 20, 14, '122300834', 2, NULL),
(317, 20, 11, '122300834', 4, NULL),
(318, 20, 7, '122300834', 3, NULL),
(319, 20, 13, '122300834', 2, NULL),
(320, 20, 17, '122300834', 4, NULL),
(321, 20, 10, '122300834', 4, NULL),
(322, 20, 6, '122300834', 3, NULL),
(323, 20, 15, '122300834', 4, NULL),
(324, 20, 8, '122300834', 4, NULL),
(325, 20, 12, '122300834', 4, NULL),
(326, 20, 18, '122300834', 4, NULL),
(327, 20, 21, '122300834', NULL, 'fdfwdt'),
(328, 20, 20, '122300834', 4, NULL),
(329, 20, 3, '122300834', 3, NULL),
(330, 20, 2, '122300834', 4, NULL),
(331, 20, 4, '122300834', 4, NULL),
(332, 20, 19, '122300834', 4, NULL),
(333, 20, 16, '122300834', 4, NULL),
(334, 20, 9, '122300834', 4, NULL),
(335, 20, 1, '122300834', 4, NULL),
(336, 20, 5, '122300834', 4, NULL),
(337, 21, 20, '123456789', 4, NULL),
(338, 21, 1, '123456789', 4, NULL),
(339, 21, 7, '123456789', 4, NULL),
(340, 21, 16, '123456789', 3, NULL),
(341, 21, 13, '123456789', 3, NULL),
(342, 21, 14, '123456789', 3, NULL),
(343, 21, 6, '123456789', 3, NULL),
(344, 21, 18, '123456789', 4, NULL),
(345, 21, 5, '123456789', 3, NULL),
(346, 21, 21, '123456789', NULL, 'good '),
(347, 21, 9, '123456789', 2, NULL),
(348, 21, 2, '123456789', 3, NULL),
(349, 21, 10, '123456789', 4, NULL),
(350, 21, 17, '123456789', 3, NULL),
(351, 21, 15, '123456789', 2, NULL),
(352, 21, 3, '123456789', 4, NULL),
(353, 21, 19, '123456789', 4, NULL),
(354, 21, 12, '123456789', 4, NULL),
(355, 21, 11, '123456789', 3, NULL),
(356, 21, 8, '123456789', 4, NULL),
(357, 21, 4, '123456789', 4, NULL),
(358, 22, 3, '1222301720', 4, NULL),
(359, 22, 14, '1222301720', 4, NULL),
(360, 22, 10, '1222301720', 3, NULL),
(361, 22, 16, '1222301720', 3, NULL),
(362, 22, 8, '1222301720', 4, NULL),
(363, 22, 9, '1222301720', 4, NULL),
(364, 22, 7, '1222301720', 3, NULL),
(365, 22, 20, '1222301720', 4, NULL),
(366, 22, 5, '1222301720', 4, NULL),
(367, 22, 19, '1222301720', 4, NULL),
(368, 22, 17, '1222301720', 4, NULL),
(369, 22, 12, '1222301720', 4, NULL),
(370, 22, 4, '1222301720', 4, NULL),
(371, 22, 18, '1222301720', 4, NULL),
(372, 22, 6, '1222301720', 4, NULL),
(373, 22, 11, '1222301720', 4, NULL),
(374, 22, 13, '1222301720', 4, NULL),
(375, 22, 1, '1222301720', 5, NULL),
(376, 22, 15, '1222301720', 4, NULL),
(377, 22, 2, '1222301720', 4, NULL),
(378, 22, 21, '1222301720', NULL, 'b'),
(379, 24, 3, '1222301711', 4, NULL),
(380, 24, 11, '1222301711', 4, NULL),
(381, 24, 2, '1222301711', 3, NULL),
(382, 24, 16, '1222301711', 4, NULL),
(383, 24, 15, '1222301711', 4, NULL),
(384, 24, 9, '1222301711', 3, NULL),
(385, 24, 4, '1222301711', 4, NULL),
(386, 24, 1, '1222301711', 4, NULL),
(387, 24, 8, '1222301711', 4, NULL),
(388, 24, 10, '1222301711', 4, NULL),
(389, 24, 19, '1222301711', 4, NULL),
(390, 24, 5, '1222301711', 3, NULL),
(391, 24, 6, '1222301711', 3, NULL),
(392, 24, 13, '1222301711', 2, NULL),
(393, 24, 12, '1222301711', 5, NULL),
(394, 24, 17, '1222301711', 4, NULL),
(395, 24, 20, '1222301711', 4, NULL),
(396, 24, 21, '1222301711', NULL, 'agdggfgadgda'),
(397, 24, 14, '1222301711', 4, NULL),
(398, 24, 18, '1222301711', 4, NULL),
(399, 24, 7, '1222301711', 4, NULL),
(400, 25, 8, '122300834', 4, NULL),
(401, 25, 1, '122300834', 4, NULL),
(402, 25, 7, '122300834', 3, NULL),
(403, 25, 2, '122300834', 4, NULL),
(404, 25, 4, '122300834', 4, NULL),
(405, 25, 6, '122300834', 3, NULL),
(406, 25, 3, '122300834', 4, NULL),
(407, 25, 5, '122300834', 3, NULL),
(408, 25, 12, '122300834', 4, NULL),
(409, 25, 11, '122300834', 5, NULL),
(410, 25, 10, '122300834', 3, NULL),
(411, 25, 17, '122300834', 4, NULL),
(412, 25, 9, '122300834', 3, NULL),
(413, 25, 20, '122300834', 4, NULL),
(414, 25, 15, '122300834', 4, NULL),
(415, 25, 13, '122300834', 2, NULL),
(416, 25, 14, '122300834', 2, NULL),
(417, 25, 18, '122300834', 4, NULL),
(418, 25, 16, '122300834', 4, NULL),
(419, 25, 21, '122300834', NULL, 'pogi'),
(420, 25, 19, '122300834', 4, NULL),
(421, 25, 1, '1222301660', 5, NULL),
(422, 25, 2, '1222301660', 5, NULL),
(423, 25, 6, '1222301660', 5, NULL),
(424, 25, 3, '1222301660', 5, NULL),
(425, 25, 5, '1222301660', 5, NULL),
(426, 25, 4, '1222301660', 5, NULL),
(427, 25, 8, '1222301660', 5, NULL),
(428, 25, 16, '1222301660', 4, NULL),
(429, 25, 14, '1222301660', 5, NULL),
(430, 25, 11, '1222301660', 4, NULL),
(431, 25, 19, '1222301660', 4, NULL),
(432, 25, 21, '1222301660', NULL, 'Mabait '),
(433, 25, 9, '1222301660', 4, NULL),
(434, 25, 12, '1222301660', 4, NULL),
(435, 25, 7, '1222301660', 5, NULL),
(436, 25, 20, '1222301660', 3, NULL),
(437, 25, 17, '1222301660', 4, NULL),
(438, 25, 18, '1222301660', 4, NULL),
(439, 25, 10, '1222301660', 3, NULL),
(440, 25, 13, '1222301660', 4, NULL),
(441, 25, 15, '1222301660', 3, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_questions`
--

CREATE TABLE `evaluation_questions` (
  `id` int(11) NOT NULL,
  `question_text` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `evaluation_questions`
--

INSERT INTO `evaluation_questions` (`id`, `question_text`) VALUES
(1, 'Comes to class with well-prepared lessons.'),
(2, 'Presents lessons clearly and understandably.'),
(3, 'Demonstrates mastery of the subject matter.'),
(4, 'Uses appropriate teaching strategies and instructional materials.'),
(5, 'Encourages critical thinking and active participation.'),
(6, 'Assesses student performance fairly and regularly.'),
(7, 'Utilizes multiple assessment strategies and tools.'),
(8, 'Provides prompt and meaningful feedback performance and progress.'),
(9, 'Maintains discipline and a respectful classroom environment regardless of beliefs, value systems and lifestyles.'),
(10, 'Addresses student concerns appropriately.'),
(11, 'Starts and ends classes on time.'),
(12, 'Implements and promotes stewardship materials being used.'),
(13, 'Demonstrates punctuality and regular attendance.'),
(14, 'Dresses appropriately and professionally.'),
(15, 'Observes confidentiality and integrity'),
(16, 'Shows respect to colleagues, students, and administrators.'),
(17, 'Exemplifies teamwork and support to the institutional ways and processes to help deliver quality education stakeholders'),
(18, 'Models and promotes the Core Values of GWC - integrity, godliness, diligence, excellence, compassion, accessibility, Christian virtue and transformation.'),
(19, 'Encourages moral and spiritual formation among students.'),
(20, 'Integrates Vision, Mission and Core Values of GWC in teaching where applicable.'),
(21, 'Comments');

-- --------------------------------------------------------

--
-- Table structure for table `leave_cred`
--

CREATE TABLE `leave_cred` (
  `id` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `credits` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leave_cred`
--

INSERT INTO `leave_cred` (`id`, `type`, `credits`) VALUES
(1, 'Vacation', 7),
(2, 'Sick', 7),
(3, 'personal', 7),
(4, 'paternity', 7),
(5, 'maternity', 105);

-- --------------------------------------------------------

--
-- Table structure for table `leave_request`
--

CREATE TABLE `leave_request` (
  `id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `reason` varchar(255) NOT NULL,
  `is_approve` tinyint(1) DEFAULT NULL,
  `create_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leave_request`
--

INSERT INTO `leave_request` (`id`, `user_id`, `type`, `start_date`, `end_date`, `status`, `reason`, `is_approve`, `create_at`) VALUES
(5, '165ae2a5', 'vacation', '2025-11-14', '2025-11-14', 'approved', 'aa', 1, '2025-11-04 07:10:56'),
(10, '1f57430b', 'vacation', '2025-10-08', '2025-11-06', 'disapproved', 'dkj', 0, '2025-11-06 08:42:23'),
(11, '1f57430b', 'vacation', '2025-10-08', '2025-11-06', 'approved', 'dkj', 1, '2025-11-06 08:42:29'),
(12, '1f57430b', 'vacation', '2025-10-08', '2025-11-06', 'cancelled', 'dkj', NULL, '2025-11-06 08:41:15'),
(13, '1f57430b', 'vacation', '2025-10-08', '2025-11-06', 'cancelled', 'dkj', NULL, '2025-11-06 08:41:10'),
(14, '1f57430b', 'vacation', '2025-10-08', '2025-11-06', 'cancelled', 'dkj', NULL, '2025-11-06 08:38:42'),
(15, '1f57430b', 'vacation', '2025-10-08', '2025-11-06', 'cancelled', 'dkj', NULL, '2025-11-06 08:41:10'),
(18, '1f57430b', 'vacation', '2025-11-07', '2025-11-07', 'disapproved', 'lkk', 0, '2025-11-26 08:15:51'),
(19, '1f57430b', 'sick', '2025-11-07', '2025-11-07', 'disapproved', 'lk', 0, '2025-11-26 08:15:54'),
(20, '1f57430b', 'sick', '2025-11-07', '2025-11-07', 'approved', 'lk', 1, '2025-11-15 04:46:42'),
(27, '981ffb72', 'Sick', '2025-12-12', '2025-12-12', 'approved', 'FLU', 1, '2025-11-21 06:54:32'),
(29, '29c8e8ed', 'Sick', '2025-11-26', '2025-11-28', 'disapproved', 'sick', 0, '2025-11-25 05:55:31'),
(30, '772e34cb', 'Vacation', '2025-12-15', '2025-12-17', 'approved', 'Family Visit', 1, '2025-11-25 06:07:27'),
(31, '84555ee2', 'Vacation', '2025-11-26', '2025-11-28', 'approved', 'family outing', 1, '2025-11-25 07:43:23'),
(32, 'eb60a4c9', 'Vacation', '2025-12-20', '2025-12-21', 'approved', 'outing', 1, '2025-11-26 03:23:40'),
(33, '403267bd', 'Vacation', '2025-11-27', '2025-11-30', 'disapproved', 'outing', 0, '2025-11-26 03:43:09'),
(34, 'c99d2a6e', 'Vacation', '2025-11-27', '2025-11-28', 'approved', 'outing', 1, '2025-11-26 05:54:31'),
(38, '1d35d98a', 'Vacation', '2025-12-01', '2025-12-03', 'disapproved', 'outing', 0, '2025-11-26 08:08:57'),
(39, '329b45cb', 'Sick', '2025-11-26', '2025-11-27', 'disapproved', 'headache', 0, '2025-11-27 01:49:26'),
(40, 'c99d2a6e', 'Vacation', '2025-11-28', '2025-12-01', 'cancelled', 'outing', NULL, '2025-11-27 01:37:52'),
(41, 'c99d2a6e', 'maternity', '2026-01-01', '2026-04-15', 'approved', 'fdhhfahkh', 1, '2025-11-27 01:37:03'),
(42, 'c99d2a6e', 'Vacation', '2025-11-28', '2025-11-30', 'disapproved', 'Outing ', 0, '2025-11-27 01:47:52'),
(43, '329b45cb', 'Vacation', '2025-11-28', '2025-12-01', 'cancelled', 'family visit', NULL, '2025-11-27 02:50:33'),
(44, 'c99d2a6e', 'Sick', '2025-12-03', '2025-12-05', 'approved', 'back pain', 1, '2025-11-27 03:14:22'),
(45, 'c99d2a6e', 'paternity', '2025-12-01', '2025-12-05', 'approved', 'confine', 1, '2025-11-27 03:16:54'),
(46, 'eb60a4c9', 'maternity', '2025-12-01', '2026-03-15', 'approved', 'pregnant', 1, '2025-11-27 03:19:54'),
(47, 'c99d2a6e', 'Vacation', '2025-11-28', '2025-11-30', 'disapproved', 'Outing ', 0, '2025-11-27 05:26:20');

-- --------------------------------------------------------

--
-- Table structure for table `performance_metrics`
--

CREATE TABLE `performance_metrics` (
  `id` int(11) NOT NULL,
  `metric_name` varchar(50) NOT NULL,
  `metric_value` decimal(10,2) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `recorded_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `token` varchar(255) NOT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`token`, `user_id`, `expires_at`) VALUES
('000d8aaa87d2524e236323f23c80b0712211fe5b18b3d94c4d5217a99a39faf1219bafba2705d0a1007ac41422aed7bb', '3997e481', '2025-12-15 12:41:42'),
('0085dc22b8fdaf909456cdd3a645d7461af0259fc44ff01cdefe43494174d6565c2ac15541d111b7b8e9c780f139b19b', '3997e481', '2025-12-04 20:51:38'),
('0134e19a5a6dedeb89a7a2eb0bc8fd26af66cc11b77906af5fb79cc6640ab33f3556d7ca98d70167a95435d815b35072', 'eb60a4c9', '2025-12-26 11:25:46'),
('01cda23412fe31e750978dd973c10d468676e1e4f5b2c3f910caba77303b3457014a7dac1db732f59c836888d1ba1aba', '3997e481', '2025-12-04 21:01:12'),
('020a64fe3e3e2c5f6afcfa12e6a3f62fe7b7ec4c2698ca949d667f2bbae0310c08067d332638c12ab265db16caf02131', 'c99d2a6e', '2025-12-25 15:23:29'),
('02268b914bc258da530ceadb1acf2a1fbca89a1f5968cea4f7517022366210ba1e58ad4c5893e3ef1ff00e78960d2fc7', '9b61a27f', '2025-12-05 14:06:51'),
('035115da749a5aa5eb066cf2cf5faaa35627c1047616db209aef2731ae447e6fd40762398dedaa58a8a81161822d2dbb', '3997e481', '2025-12-05 13:25:58'),
('03536b3cfd8d86ddc7e7bb9fada9a34bb2a7b1d763cf65a996135577255983ee1b02c378d6a94a1652341f75a20c0dbe', '3997e481', '2025-12-24 10:54:50'),
('058833fa074f01cd99db885c27fa994fb751db014a9e1f4352df94ec4f1b2465df6dea45ca4d067233be08d917aa7d32', '9b61a27f', '2025-12-05 10:58:23'),
('05cfbcca95fce31dfabf5024ce8a3d153e42f9bc455d636d4dfc8f6c6d2910973b409018f80267ab13cdd5a3c01c71d5', '3997e481', '2025-12-26 20:34:19'),
('065890c667135c2cdd39600376176f339db3dc0a9ff43ed0498f0f35cbd5f5ef85d975ea4630bd63ad718e2409b29bc7', '3997e481', '2025-12-05 14:11:57'),
('072366b8e3bb7aed3f84e7ebbd7933d6db3300b408b5116507b91d46612892cd91843bfe1a30e472757c66fcd070e9aa', '29c8e8ed', '2025-12-25 13:52:36'),
('077b2bb74023c70ac01256a7215421686fcc9eb7579e8b4d12f2261e22b2e50328bcc7292b8363bd7b279bd21bfc4c68', '9b61a27f', '2025-12-24 09:11:31'),
('07942875583e02dba3e32e37af7589ad3228cd0641f1b403c858f8b009aeb7bd1ce3389b3b3131af03c4393f5af317b8', '165ae2a5', '2025-12-24 10:02:16'),
('082bdfa27840c8d62a04ab401f22abbd8261282827db29546b8a99f578d1641f7bff77a312b3758a1d84854f3e21f9d7', '3997e481', '2025-12-25 13:48:17'),
('08500cb7e47c413ec30ac8ebe87e8f6b93ce36d5db10143459d492eb89fa3d98175ccf9c7ee3bf8a08151f5635b0651e', '3997e481', '2025-12-26 11:17:49'),
('086b550c96d9d1a690f4300fde46a8c1eba3f1abf0e1526a4d1b7d87069ca88abf91492001fe6c8b53eafbb85c233d37', '3997e481', '2025-12-05 09:32:38'),
('098335b8aacb626c51d723e092f12c5160a7122ce068d418408b9067e21f7728a1c728e4d036f05eba27db62dac284d9', '772e34cb', '2025-12-25 14:14:09'),
('0a453a926c234d75e6b576070bea0e0e18e9f35e0615ba39d5eec3ac53ae1de1f4ef82672a44469c3a64fa0fc4cc500c', 'c99d2a6e', '2025-12-27 11:06:48'),
('0a58055350c37d6d661de16c370ae8fdb8823990104166f7c0986a58a5368e9cd4152d9940c7f60582b70f0c910085dd', '1f57430b', '2025-12-18 21:13:49'),
('0add27a22ffe9ec8d48689c1a13d2614ae06b4059b32500d1a09ff29fe0c49ecefbf7f7679059aad9a6090274d5aec4f', 'c99d2a6e', '2025-12-27 09:27:11'),
('0b771c513a1ee442fe8a5f0536e9298e19e1bd78e9c425869934a09d4f3061f10d6b6b67fdc15594f749dda04a8b0979', '3997e481', '2025-12-27 08:45:45'),
('0bc2c50727cf007485b2460131c8bb0b58354cfcb22ff96879b27d9733467b50ca1775ada593e4e078d65cee342ba83e', '9b61a27f', '2025-12-07 09:32:54'),
('0bf73449d63aa7e6bdfd40d5170d50ab9474e3a7b3f453d910e417be28c8e7594ab73524d49b60d3ce3ea0baaa1f515b', '3997e481', '2025-12-07 11:58:07'),
('0dade2c6e1dca6d0cd1f5f7f442595393eee8f17c2589cfe649f662703bca02cf93814cb00fd8ddfa6f30af27654f52b', '3997e481', '2025-12-24 09:26:39'),
('0dd6e60754b244f1ff0fc9d2d21ff357ff8c9456ad58e14f4a7e550734a7df8008a40c45e88509ec59d3788f07db9dfc', 'c99d2a6e', '2025-12-27 11:25:21'),
('0de5c4ac6d21ce58f9c3c13498a7ae33e4847b6c6e696a4c94ed80144e2ec5310c2ea35557ee50cc54c4ac35cbf7eb5f', '9b61a27f', '2025-12-15 12:39:59'),
('0ea14eef772d36ad699c40c72605cbd23ab76123e2f7c6133fd8d253205cfdf3fb09d2b9057e1eb36b2cff9ccf38ee5d', '3997e481', '2025-12-27 09:02:30'),
('0eabcdab81ae28c54dc4c0279f659f5fbde27bc2e7a60f1e340d756aab9538a5a8b4eac85bd2108150be488415987740', 'c99d2a6e', '2025-12-27 08:40:59'),
('0f58900aa0227249d1a2c93dd00a0e97a07a67521806b7aa0242582507c78241f58cf323bcb69f60be6aa05296c05959', '1f57430b', '2025-12-05 14:54:32'),
('10fec2be92549b6df52f72614f40a34c7fec72fb6cc7b28029ad0415de31c52bd561fce43abde9454631f44f9996af7d', '3997e481', '2025-12-04 16:45:14'),
('1135804df579672046675847ae28c443d9d153767ea3302357d214fff8f8f0008b57369ec364f08cb93de893f5bb6b19', 'b4669246', '2025-12-04 13:18:53'),
('12d89f2fb51e613b6f7a21d9dd353cf04fa3a41a060675ed21cf19c5482622f814a789f416191b085427fcd0468fb76c', '165ae2a5', '2025-12-24 10:04:39'),
('1347491eb611b0bc9b7c58ecc476f4fcdd9b381c0841e7cf72bc573e1449cb849195a10fcd289a31eab473227dcb8ada', '9b61a27f', '2025-12-17 11:24:50'),
('14c36f14698148f2850b7a5c5ad19ec9069da06488240e4b2b1d104301d0972a8329f25b9567df661c5c9318bb47bc67', '165ae2a5', '2025-12-06 10:33:58'),
('14d8da34cfdb2b7f84e59a99c2a7a86e5d19d461857c4f2f1592113ad4c1140920d3202017760a6ef84a5d2c4c048d31', 'b00eb428', '2025-12-26 14:04:56'),
('15505e4e39c2ef70801fc3d86fa1183b2a1681a14bade046b9e1e201e641d170d0910fa9b89f2462242f0a58a057e223', 'ea347dad', '2025-12-26 14:02:43'),
('1681c96eb4caaf3917e95f2d12ce5e1bde40e74bb6cfdbfc153aa6ae4083d4e7b714cc3633a71b451fae9bbf48a7f507', '3997e481', '2025-12-04 20:38:04'),
('16d9c48bdad53e471bdddb3b60903cc95f95bf9011328ae6be9ac3f9978994a7976bc2a1654d872ac0a45fbc03dab659', '165ae2a5', '2025-12-14 11:55:27'),
('17066859ee5d32339f55cada6fb64b620981ec6e0be1d3e42ce3cc30c2720ad400fcc15dcd33e81545cc9c0d233408b8', '3b9c36b1', '2025-12-05 09:29:18'),
('180e6c154e4381648bc7593902221122750bc1619bbd6210ac4567d242a2a51e9e9f108c7fbce595fd5fb9075a48d5ca', '9b1784c5', '2025-12-07 09:09:18'),
('1859d81b509fccf132e45849a5d91358382c8f18d288632d272df25fcd9e62b33ae09f913fe8ef0da2f2718ece412cd2', '3997e481', '2025-12-04 16:41:17'),
('18cae33e6e30c65223bdacb5a029d7aa033ea292f04534bd89eca77ba6ef548ebbe72debbbef1d76d0d6d60ed33ccab6', '9b61a27f', '2025-12-17 12:29:43'),
('18e3f010cd16c1e8a0484b6b5bcc2c99a188db4c782820a2b5d3c43cf441bd4f73e39f14bfbcda8f3b2681461212b566', '165ae2a5', '2025-12-26 15:48:17'),
('190ffde9ee6d3405b15639d1d4b4343c0e28a6dd95d4d5f386a2002dfa1a459d5216e421d89a0983a4703fedc39b19d0', 'c99d2a6e', '2025-12-25 14:14:17'),
('1988282bd7a5661fab1dc5a7cb043866bb07466c1bb1ef62a90050d47c8e7d8b5868fd3231a9dc1198a100aa2a0fb594', '3997e481', '2025-12-10 12:23:26'),
('1a25d2a97c359b8c366ab4d10438e827cd02f9855203fa629f1779f1f1ea2f8aa725b9af0bb6e6f2de1baeabee580b26', '3997e481', '2025-12-17 10:15:05'),
('1a932a80862181ce05eb48b11ef8c92d0937f68434eff46d1e857dc3217bef0983d841d849006eece82b68df8c8fb2af', '329b45cb', '2025-12-26 19:55:50'),
('1b109033b8528f429ad8e88f92c77d8104045a8ef0e609b7b8f82b597846f67e3ed566b809ed8260a65772902548371f', '3997e481', '2025-12-04 15:14:02'),
('1b419dfc1ff2d8f3f41d45d13930ffb4fc44db5eafafb439857612876828e790145393d9c91d86bb60836113aae459b3', '3997e481', '2025-12-26 13:19:14'),
('1c224f8eee886d4eb3fe8f48f6177a8743b8e4b694ca9e6a7b372582fce4e0e5e8276f5774e04a87493c2062a30b1b14', '15fb4941', '2025-12-26 15:44:36'),
('1d24c043b30d08fad3d1a1204bef7e0b356f429c835d6a6439c1b1975b7d1243dcdbfd7ed3e6097ee4c0b30e56114878', '3997e481', '2025-12-27 10:51:00'),
('1d32b71a9a9c8ede537fa63ffd53d4e83bf174642d294d47b5c5762089aba66ab926ce1d3d7785572892cd2e75fc0201', '3997e481', '2025-12-04 16:42:20'),
('1e349aa3ea55320c2cb0e5ae073e2d1aaf9aae902d4be7fdcd45e82970b467a18aa38bcb533f648dfec593683702409b', '3997e481', '2025-12-25 13:51:16'),
('1e6603e08eddd4f94ccb499e43c467f53d496671bb560009300b50ed4f534d4f258c1a3543dd70cc883e15f7f903ba0d', '3997e481', '2025-12-14 11:20:48'),
('1e7c41cb3bca8f2e09046b6236b35ff41fa47b84e69fd00ee0ea3070bb0e3dd7c31e38fc950696ab3f8c0680e91aad82', '3997e481', '2025-12-27 11:40:59'),
('1e822ed7f2bdf871d9ac714d6dcf92f330c579e4232a25f2d7d4afa9723270558bfb2a072d1f78bc0a5e931dff185f27', '3997e481', '2025-12-15 14:48:37'),
('1e8a448c656fce95034d9d30b547b34503675304d23702d025527c4e4ffd6bb3c7dcc267cbaddcdaa145f9882131cc73', 'f555291d-bc', '2025-12-04 13:40:54'),
('1f28017ef48550d4ee6359eba6891d510e5d1962ccc6248e2975e865846645f7f4f496406d6556f9638eb782548a4888', 'c99d2a6e', '2025-12-27 09:37:24'),
('203b052410c118f6c3b7e7337f4368107c44a2f70fc0778fd4703da76f5441fb6961cbff41bf1f910965d2ad310f08b8', 'c7d12f65', '2025-12-04 14:30:32'),
('242942f3f5a03891e26a6a800aff07d7b20c229b0b2dbca693b3ef46d2a5b636bb52b50328453f85d42d5bb1a3ff682e', '3997e481', '2025-12-26 19:50:52'),
('255a9bf5488f0ef4222565acfd67f40d564102bd95330d255a50833f440b70ba95b6efe0d38230f20052b89e758f9eac', '9b61a27f', '2025-12-05 13:24:37'),
('264389bac42eaa2a4a50fa40acc23093ef09eb014a4143ebd948cb550bc12ad7f5a3f42f58e3a3076b61e5357f824ee6', '3997e481', '2025-12-05 15:26:10'),
('26a0aef9442d8a4a9d4f370712859e327cba0f37bcfa3d5a2bfe78832fa076d31e48fb24512e3be450e6474bb99c88bc', '3997e481', '2025-12-27 08:58:24'),
('26ce7ca5c9bff512b27e9f83205d9b8e2db40b1db2b87eca78c0997d64f43069c13a124f461099b7cbfb0b5b7a93ec3f', 'f555291d-bc', '2025-12-04 13:10:11'),
('270e7d0dc3c0121e98ea3084d7adf7717b1442a9c1e4abb2a8548b6715db28660e3bdb79980d04f23918e87893b17b7e', '3997e481', '2025-12-27 10:31:05'),
('28971073be703c86e4a60b8341f4e543edd96279d6d2e3800c8baabf018f6caec1afe4e917b1d0171933455d907eceb4', '3997e481', '2025-12-07 11:53:45'),
('29838edc48d614b2c521d046c8f577a9040833c625339c8f7ea3aeccb006be3a10f1e80bc6457a993369aa4da53117af', '3997e481', '2025-12-25 15:43:31'),
('2a42f40ecb7f708889b4d759e9c801a037726d083dedee910200a898c09459694dc8d0525c57ca6a9167446fdae70831', '5b7db29d', '2025-12-24 10:16:10'),
('2acfe11dcd2cd1e8c25b6420ac015610124bf5e5fb15f5f4b26c4a0e6042409aa2e39c56a180fbd4c0e6d66545afa3ba', '3997e481', '2025-12-25 13:44:50'),
('2bbdf0b333f05cca6dca6c820f4f8168502fc1ead34d03f9c97b83e141e903fa4d3eaf29f10ad714962ab351df618ad9', '3997e481', '2025-12-06 10:31:01'),
('2bc2d9720f3940c6668c69e8fc24046fd42d9e315dc63c76c64a7955767aa226082ab54a54766f0cd2faab58de0bc541', '3997e481', '2025-12-25 15:16:29'),
('2bcd89cdaf75e3c8f5c4d3facdb9fee03c9814fd79c1b73228f44b9ec68d0d9f6e7225a841441796b4bf8ffbba86bf4c', 'c99d2a6e', '2025-12-27 09:45:01'),
('2e1c63b0d90c8ba5c0eb2ec4efdc58ddb2d824906e22003be1a7400d6659f13e8c51f246e51297dc892330b259f3f3e6', '9b61a27f', '2025-12-24 09:20:03'),
('2fab0ca65c4bc326cc83c6c73f8536f69a49d931adecbbfd2f12430c4070dd259e7ef9c901d60e19ea8052790654de6f', 'e00bef8a', '2025-12-27 09:47:33'),
('32dfd92a62074db872eaf22466229968f0592d9da19417fc4481d69084b24122b8d4e2e6ea7bb6aa197fa209dadee3f3', '3997e481', '2025-12-04 20:35:11'),
('33fd4716c32176e7f272c8d615dbde17202477083b42339e2854d3bda618316e94a56e498f2645449b92b9e8ba240998', '3997e481', '2025-12-05 09:24:38'),
('340ca9542b011cf1f7c436727c4924636f1b99ad9a09c6e17480f420007c53203cc676660abfac01676a6c380723ebad', '1f57430b', '2025-12-05 14:37:53'),
('34678551300cc1cbb7954ab20f193b99b5d58972302fadb228c367b411692cc236472d593a3d43c629244461dbb61b8e', '1f57430b', '2025-12-05 14:57:37'),
('34a81de0be975f8d47dfd28d5e4a2aab127789457470ebcb17773c8ddd61c959ca4a0ad4026885619ff325548c057b16', '3997e481', '2025-12-05 12:59:48'),
('35788ea049cfc43ac124049cf44ba9d8c8c0fa0b0bc67a905cd842855caf17a558e60c19b48c7ef29c472737eb4b2608', 'c99d2a6e', '2025-12-25 15:29:01'),
('36a440804020c596f3ca66414f5d059b71965a0c546059c9b551151873bf4ddda6799fec1792cb1591a136d1af2d0690', 'c99d2a6e', '2025-12-26 13:14:14'),
('36df5570cb7eec05f77bd163e33d6ce707c29ab51f18c3d2787705ac348f41cab952f4de20dbde90ca0e70c1d5fa5a86', '3997e481', '2025-12-05 14:18:56'),
('37de5bd114a42883cbadda70e11f28face3225299ea111d624cfa3fc909cb8b5a60d23166c5ffe55428aac7ef5ef9ec3', '9b61a27f', '2025-12-05 14:16:40'),
('386a88d2e2eb234aee8acaa0ef5ff3dae5a101db2a71a670891eabf9e9694068ca0fd1d46c29c874b795af3e23d4b840', 'c99d2a6e', '2025-12-26 13:52:38'),
('38ce9b3affbc9cde00825ff40e26afb8604da232ef015be3ca5f676c875fe55d51f31a22507b8be3e0164a8d26ac981e', '9b61a27f', '2025-12-21 11:12:57'),
('39026bad9f0022fca92c886ad87b993a7f2f120984953249378243597023983a86852274faabdfd1a84f7320a921e814', '9b61a27f', '2025-12-05 13:50:42'),
('398c65db7eac96753bf29ada35870902ad208a72e7d6fa84ca33e817a5b30b57622a367e0597378d1e5fa7f71a6a196e', '3997e481', '2025-12-27 11:16:46'),
('39a3da6c6cdbc325c17cbf1cb655c0e25cfcc914bc48571423e2320f554445a1990ce8e24f94f619d0bd39999123bcf0', '3997e481', '2025-12-04 20:38:16'),
('3a65968aa54c4910a8cd4b9343ccea1acd224389826e3af20c59158ee06d858edc3715c967d97f5a60ff6eae0baf6ca0', '0c38bfa8', '2025-12-07 08:58:11'),
('3b9124d05816529dadd69468d71282964f55b57356554042dd0163267fff07f9d5446f6452339882dbfaa320c340e257', '9b61a27f', '2025-12-05 13:39:12'),
('3c4fe25cc3b72aed3e5a2d570e8be0005a478f0d08e477307824d194ebee228e75ad4f5b24310c0f28c7ec1dd42e4b40', 'e8de8cc3', '2025-12-05 13:05:26'),
('3ca2629edec0080db2645d8250ffe9ed026b143a9fc9ac1a45598e5abd15db906f1d64970b33a6d9ddfd294c71e213ac', '3997e481', '2025-12-24 10:24:22'),
('3d994b6e81950f12aa14ce16aeb5ead5f112e189b178ff13114e0b196aa3308be040a5774941ed9765620c5d5593accd', '3997e481', '2025-12-21 15:16:19'),
('3e7f4eec5ccba007950da72d23de5626c1999bee3fcfad95525c59ffef0ec691b657011ccecf53ccd563b772fffd6edc', '84555ee2', '2025-12-27 12:48:58'),
('3ee668278ae469a2feb5a6676bc2f84185fb4dc5dfdb5a6df623221702594a7d56c9c6fdd3ccbb9166319bc13f810e67', '3997e481', '2025-12-24 09:24:16'),
('3ef7e64bcf9f94db02e7337510b9bedad235aa4bf78595c49dfc80ae73f90101e75029a1ea9ee28b7b111043733557cd', 'e8de8cc3', '2025-12-04 15:07:20'),
('3f77f24c5039e9587434081f23dbe2a1f8186e523e787fb33e505b83cfc532befca2daaa82c699388c42530627fe00db', '3997e481', '2025-12-25 15:02:17'),
('3fa234f16d85907475490890bd52df7a1ef07fc4bab436ffec5f887fab7abd3935da226ac3ce8123d12a3a8eab1efa6b', '3997e481', '2025-12-04 20:54:37'),
('40748f027a349ea58d720294fabbe6c5f191d4da88b3f16c5ecf9e8c62ac8ca6b8aeb1e1b12c45dc2130decd9b03b446', 'c99d2a6e', '2025-12-26 15:55:45'),
('408dae43e975688d4798776b4f70443be1de6f8f0372fc1a9bf79f4fbd2262ba09ea3c2d63436c62d7f4555ba8bb9ac5', 'c99d2a6e', '2025-12-25 13:23:34'),
('40a3a49dd6ab5bb0e547c39f8a2bef5d0cb6209530dab299d929ca6fbd3e00e03352185287ac7adab8c3ca2bb40b9aac', '3b9c36b1', '2025-12-05 09:46:00'),
('42a26d16eeecf719a1f1672d59b9d09ecaa090432c8312291214980bb3f8dd3ecd1cfbc0821560d92ca65a61257ed0a5', '3997e481', '2025-12-05 13:36:05'),
('42ac1e239c7504dccd18fdacfe5d2d5e7258f0a2b225fced6e3c3faf12e3dad559642ddc645e558e9f5436115de4e642', '506898f9', '2025-12-06 10:43:46'),
('42e0af9d3c38fb8399a8f45352f3e1851ac2ba8d2e49450a04ee25f85c4db721af7984fe9e3e5418640bea0f7afe2561', 'f555291d-bc', '2025-12-04 13:06:32'),
('446cee6aa9dc4be8fceb2b52809bf79b62c660c6831513ed8b6962c808d0855c59e9b73b17f4200df6e7afb54a9bd6c9', 'b00eb428', '2025-12-05 15:28:08'),
('44b786ef1503246c86f1a345802b9c7a5c94421e3dfd45374fdd721615c08a0411a6d86470d6d826689d274e56b1dcbe', '9b61a27f', '2025-12-15 15:06:54'),
('4512fccb9ae46fbf2d2a6f07a0af3db10902137119ba94f89ddee3fd4b9ce5dc34d4b52bcb755f89294a3841343d8db3', 'ce06c191', '2025-12-26 15:47:31'),
('47096d987dd46c3babf232a3a7324592928effe77550df733f483f0f5dfc2c1eb1425e2ddec9fa24dba851225b675c8c', 'e7b3544a', '2025-12-04 13:04:07'),
('471489b1ea1887c16a1ac1b360e1996dfe32a5a0e4214d97b88cdda22cdcb39200e13a02565f23505a1a72ef3251c978', '3997e481', '2025-12-26 16:31:15'),
('4853679b355e4a556ee625cfdefdee3804117ba84013b5c183873bf8f121d5e2d71f6cd9a016e60ea3ddce98baa741c4', '9b61a27f', '2025-12-05 13:27:33'),
('4882debda453e1813ce076f7169ef8c93f31cfca7385d9c49ae67f5c145e14b0e3bb2e09dd7b238d28d237be07914491', '3997e481', '2025-12-05 13:20:55'),
('490d2cb1fafb83924edd176d2619badfdbe71bf2b5d292edaa07bcc17fe41da645a6974dedf6263e98b8e1b06a0023c4', '3997e481', '2025-12-05 09:16:37'),
('492e471a156d3751f27e1175fd48e21981c8e773c04c71b95cdfb5f6728c46bfe3317d50911195b548c2fd490d9e927f', 'e00bef8a', '2025-12-27 10:43:48'),
('49ea4c936b274ca832f54f2950a8c81fa590a3a0a038d645bf3b541de9f5b883f6d44d6824030c5f595a97955bfceb23', '3997e481', '2025-12-05 14:05:42'),
('4bee3031246b0d5b574c7f6139043e9dedadba80d4115be57161b5120f181d5cf8a5a3d004d48d9905d680a40603210e', 'e8de8cc3', '2025-12-04 15:07:03'),
('4cde18dd2cd9bd25e80acda926c12a5b019f51c353a918a8115526c5f2e93fdf544db35540a984737e27006428769ba8', '1f57430b', '2025-12-27 10:33:36'),
('4d9eeecc4726eb75a16e285e7f076539df1533584885fa83b1b0bb5bf8c139000662be51e38b9d3fb2c8066b59a76845', '15fb4941', '2025-12-26 15:41:01'),
('4e70aa347177f1b4c50c0653b8714eb601ba95cf620587168e1edae0379479b560b8e023bf57801a9fc6293e7b543241', '1f57430b', '2025-12-25 15:00:38'),
('4f14861637dbba5cc567be467c215075d13e0f2cc85933d907ee34e508aba2b50ba59379664487b5c9e90a44e9871d63', '3997e481', '2025-12-26 15:52:00'),
('4f17dac73ee0a5d2ab37259f27502440736e95808170b6bd0321237ba4e35223bd32bbdd0da9cb00071a8532bde659fe', 'e00bef8a', '2025-12-27 13:25:56'),
('4f8fbfaa7c6ebaf792642c3d6d561e94252b3b9dd0b411a32d02735120962c5475ce0ccd8dcce351bff41f670eab9faf', '3997e481', '2025-12-26 12:28:22'),
('50805df81aad62383b9480f7ab39c3355204e6adec666cae2166af97eb8d52a7c2b40056f571acc25bab804e45814677', 'b4669246', '2025-12-04 13:19:41'),
('50dec3e56cc6357445a704bd4347858d3f340c51481beaba934e617af398e8f4e0514629e8be4e109db3d94d05e1b906', '1f57430b', '2025-12-27 08:48:55'),
('50ff1433b6226661660f0cd768d30781d02adbbba42c39c75ac533e697d50486c38a3bd5a5ea2a290248a42fc24bb477', '3997e481', '2025-12-27 13:25:37'),
('51ff2bd1bd3b60b7023ac4a51d874b0d497995dc46f6a9eadb2472973bccab786097a7c4b59a50190e033cc2827a67a8', '3997e481', '2025-12-07 08:41:10'),
('528920d7e8b56b81630b17795add5552f826fc94ce988466976e84f6365abe75ab30fc4f4318cc850b1559adef346a0c', 'c99d2a6e', '2025-12-27 11:17:19'),
('52b81296c096b792e2bb99839b6e51d33190e93e6bb182a50f1ca5b490aa70c61d25e140ef13b8b009c6605c066afc59', '3997e481', '2025-12-24 11:02:20'),
('52cfb64c7ca4b424a04a690b93c4c8c96c3e76a169019d89ecd4cf5ed9ab31396ba87756fd4aff48c19eec39fe7de266', '3997e481', '2025-12-26 13:59:47'),
('540c75558e826a401190dad1715fdee08bce6f3f718e1a93fe00c214acc4576600cdb63beb80b1facc58c578d1add124', 'f555291d-bc', '2025-12-04 13:21:06'),
('5550aa9fe3908508f21c7bd61020f1c619240154a5731bf0a22fe5c9be69f571e6def9a361376048400a7ce57dc0ea06', '1f57430b', '2025-12-25 15:29:49'),
('55d98c0b9cbe9d46a59424184c32fff28448eb352b690e1f73fe5d240e1ed9c059ef5435f4f634d977a380456f09186e', '165ae2a5', '2025-12-05 10:50:51'),
('56381bebdeb809faf6abe172ab0e79328a2bc006195f71424579388a0f4629df73a3d179455e8d7a772503011a90fb71', 'c99d2a6e', '2025-12-27 11:41:54'),
('56f1081529f7c3e65c0112db103bed2432dff55fece23d6b5c724626977f51a0afaa67ffb264f30b58eb33bc1ac70d0b', 'f555291d-bc', '2025-12-04 13:38:14'),
('5875e78ea6e895d28ce588fa8e876e3d67d368dddc0f2d662accf3b66df9b3be39e01b4daccee245d02a2352906dd291', '3997e481', '2025-12-21 15:19:46'),
('5939ce6e5a5d71a227d9f5c4904b8995e76c2db540cd79f53e0b6018fbe7ea92c808122f318b1770adae20c13126aa41', '3997e481', '2025-12-14 11:56:02'),
('59bbc9f0723e99ead8bce0f912d52f42a8f51c307da1d9d17876b5fac52b477580a42951da80f5a9a40f4397adbb84f5', '3997e481', '2025-12-07 11:36:11'),
('59d8be6420fc2d580c90d26bbf6c54105ab1fc9f9992eadad592d7ad1e12914359e6c90c00222bf32edd4efdcacfc42a', '3997e481', '2025-12-05 13:41:35'),
('59f217aa82f39ce2d7a648daf29630ea8a861cf3c3d8475a45e5f36fe1b6f7bae76f55d1cd90850883ecba6db3612cc8', '3997e481', '2025-12-25 13:10:18'),
('5aa07b176ec82078fe97c2528eb147a1785340d8051e1840730ee380104caee56c5c7b6f4007280b2df5de006041d558', 'c7d12f65', '2025-12-04 14:52:36'),
('5b4bd77a6ad29ff4c4be081a4b5bc0c1cbe0d6d504917a8ed0816f3e4d8a6b3ce731496c886cced11fd35f537bd14a61', '3997e481', '2025-12-07 11:39:37'),
('5b72894fae81a4d55ab5dff47d48e80a2df41832dd092e5bf8536f82dfeb396b5221ec73a080aa4a904adbc5258a1909', '9b61a27f', '2025-12-15 16:41:04'),
('5cde669e202daf645821c37133463fad7e9ab62873473619d2ea95558cafee128d952756e8e4b3c7477d8490ba8d293f', 'c99d2a6e', '2025-12-27 08:49:32'),
('5ce633eca22088f3f4609f2f81a8123efc0cf0678d29181b0daf5b03940bf02d79c48fe38764d4caa6f699b6cd97829f', '3997e481', '2025-12-14 08:56:56'),
('5dcb8777204a58b13c8ffe18d0a31682b4388ff539b60f19f52d2901f4d91cbeaad43268cbeb6e4c7b4703334dee92cf', '3997e481', '2025-12-26 10:03:22'),
('5e74c86a282530d12db5f9cb95c68eee3ffa571d68902713a526f57f57a84bf1cefcf2d93799b5f5d1f11ed4fe05886d', 'c99d2a6e', '2025-12-26 10:04:22'),
('5ecbb5b59a058365e078d7011d6b5bf23b12254f32ebef5df5b6316d2be27d638e8e6ef5678367d8f8f516769415b4e7', '772e34cb', '2025-12-25 14:05:30'),
('5f260743b1cc144fe2a56cd4004c280ed6891506c810e6a1c7e31631ebae5be6c13154888e5b28fef3f4d173311737cc', 'e00bef8a', '2025-12-27 13:24:36'),
('5f7cb9ce2509c842568cf478e6bfe8a2148399e2e36dc6b2dc4a4eaa9dfbd22b3f62d69e658e56dd2e683fd7ed773c2f', '3997e481', '2025-12-14 08:34:46'),
('606f0547288e1e2e67f8bcd743f5b47f7b997aacf729e7e3710bbd372364d4b499e6425cd2b0806353ba83044c036752', 'c99d2a6e', '2025-12-27 13:45:20'),
('614ef7e15cb72c08ead56d35b010d76513b013c7ccc03ce5105fbd7462652fb3a56b1d7c74d18840822d769c252ec3c8', '3997e481', '2025-12-05 13:29:31'),
('621a4d491a8549bac2094f05a81f2df4ffea16bf605a036a1c11d5e3d0ed58128cd1d444020e268ec80db1c3d6ac2870', '3997e481', '2025-12-17 12:30:37'),
('63edc6a8a15716cc958846c86609dc647d58b67275fdb7e491414ec75274c20be0556e5a48e86ad68ed88364b029987d', 'c99d2a6e', '2025-12-26 13:39:43'),
('64f84fa6a4eec9ab08b3f76c9b885fb485b037abc7409165d0973dfaddceb9fa3f51ab575e198171e19775445efa4890', 'c99d2a6e', '2025-12-24 10:28:43'),
('65042d4ef2f5c19648326dfd744135f13cfd8a9c5c0c745ea5c7bc0ac3f1864840df41140917f52a2651fb7325c5a0d5', '1f57430b', '2025-12-26 21:36:40'),
('66a74816ad05ff56757f8ec683ce9c55d78270f6db24f0a67a8fdccefb8715a1abc8791ff5abcb7499e11815b165292d', '3997e481', '2025-12-21 13:51:23'),
('6971fd48866c355ce49902c97483557592e0ba3bb3185a76d02a9e2b74f789ea972e940921dcf1ee444d6c0def58b23d', 'eb60a4c9', '2025-12-26 11:21:37'),
('69c72dfe499b4b037426786f77fc39d64b2f0cd59b9c4efdab10bde0e7974bcc75b10e45a42a5ff9aa0b53a1a968c191', '9b61a27f', '2025-12-21 11:32:13'),
('6a067eaf23db7499263570bc4c769cbdfbca0e635d31a184670b56e86af4b1ba7bb8032d6e9207d5307ac724d1d729cd', '3997e481', '2025-12-27 14:01:17'),
('6a12c1f63f8bbc176d1750c966419956482ccd8a4fb5aa20417a8c6f8ead78a88bf8350ca723220a6abf1dfb523d07f9', '165ae2a5', '2025-12-05 14:07:56'),
('6b73b9aef70068367aa555c2b0dfe7f89c8ecc141434b8bead148e7823f10e612e065af36a8f4c604a38a8e9bd76802c', '9b61a27f', '2025-12-14 08:49:10'),
('6b7ff01a57174e97ad20a176b886a4ede8eeae0f6616bf5ae632dcb43d06038772d71b26fb7a88d659bdb1eafa9fb969', '3997e481', '2025-12-07 09:08:54'),
('6b87820abd4f609eb3f3b9c9fe4319675edb4779374b6b9afce87adb0f9c182a6e3b16648f0ac2ac44a2f5d616e0803a', '1cc8e241', '2025-12-04 13:39:47'),
('6bd43c20d10bea05c6277c300218b1eb2c2b85c0ef7744b8bd944a68636f6dc5c3e1cd45d68e97d0f50f2b4e09737f54', '3997e481', '2025-12-05 15:13:43'),
('6c1449d906e7ee5bde3b79394094558c60c490b1ad1cc53163b23bc5ecf9730c1bbc334d172529ad791ba15d686ac33d', 'f555291d-bc', '2025-12-04 13:38:56'),
('6c59d2fd0d17816fbc9407274348a7bf3ee225e70bf6cbd1d325fcaf610e8dbbec49978c98068c41b635a9343a42a147', 'eb60a4c9', '2025-12-26 11:20:02'),
('6cd64eb4b654c46eb81ec795828e7f439fe23269904c28dfd82b6c9cf781ce314c1bf420f921ee084b7144387da3e147', '3997e481', '2025-12-17 17:21:07'),
('6d34961ed4d0f38f237286ea27eb99b33dd006daa50cee0f1f3ddc87605499d414879bd9eb78e0bb6067e3e9e47ec642', '329b45cb', '2025-12-26 19:53:58'),
('6e5d6ceae23d1909c1d784c300268d46615a26d5e0145ab147adc2a75dfcc1c78b50001683f18a56b841897c67f58408', '1cc8e241', '2025-12-04 13:41:11'),
('6f1fd2e0ee5ad8d5edc0be4ae97c0a1bef1634e1ab6b700c2d8f590b44b444f7225e0d872b863f141959ad8a63a264c0', '3997e481', '2025-12-17 12:32:45'),
('6f4de6a2a253a9a2a8d0d9338f9232c5944ef841b94bb5fb8f47fc308e6a6271c3bdc864c41305a50c1d88d43c5a57a9', '3997e481', '2025-12-27 10:10:36'),
('6f590fec38c38070896f00972b866bd2b80278e75f381991d82df73e56de6f44b3f933894cba3ed22e5871a22af2d777', '3997e481', '2025-12-26 10:05:35'),
('700fd7a7bbfde08fddcda4b26a955fae2295093d4ddacb67489f9dd2e66d43388bc330ad8400d6f3f25257cd579762ff', '3997e481', '2025-12-05 10:05:51'),
('701aa42e59c0b6ef1ba2b653065dc7dcb32cbec2a31d2bca9abb089cc85e1760a25795f357fd959dcc573119e478638a', 'f555291d-bc', '2025-12-04 13:52:10'),
('708985dee11335099718199cee0cfacaa514c430b508654c27122b635938c50456e80d55a4c645a31ada571d806ea853', '3997e481', '2025-12-21 11:29:56'),
('70bdd307507e49f4f6f249c77d1bf9d93ca90a5ae9bcdd69f41c71d5ec5b26f1ee56c00345882a24df0b71bf4f2349cb', '3997e481', '2025-12-10 12:05:12'),
('70c4faf558cc1e7504238a0ea722957f1b03fa5b5a2a59d4383655acac33d5f6d36d6e7b1bd1c96ece5f1846956771a8', '329b45cb', '2025-12-26 20:50:04'),
('70c5d3a2e864949d1bc9bcf9958b8410cc4b6497eb7b05a16e8545b7d8cd99e15df006a78f97a30c68f493c4c8d51f8e', '1f57430b', '2025-12-26 16:14:08'),
('710d22a1a8a45229a2cb3c0ada8bc9478da2b4aed64619d69ac42a0bc7b2b40ad67b7509b76377a9ed6fc2c142850a73', 'b00eb428', '2025-12-27 10:18:23'),
('7157e371ea0390bd5bdae44d71e510c17e2df402c307dcc45e569e067997bb02085b6f12c8923b8ab35aa1c56434fcb4', '3997e481', '2025-12-24 09:44:29'),
('71b9917d5314e09f9bc35753b47b818a80423b9225426ae25a2f18e50377701981d5e49387a28e848097271350b4f814', '3997e481', '2025-12-04 18:18:48'),
('71dad7b959d71b54d367bc207c66561f1ecc875ba34cc17bc730c84f4c7a5d2fb704e144477c6e0dd4e1f986bdb12616', '3997e481', '2025-12-26 11:26:29'),
('71f3e5c5f0975c05a421e235874041bda3ba6ff4cfd4c7a130f267ac2b8b9353fb886e0a28417865684f22636c79d699', '165ae2a5', '2025-12-07 09:46:44'),
('71f6d44620d5990cb45726366314729f46c9e21a2cb2acd8fc8c5ebefd76e441e06c6e1e56fdaf7b0995a44c419dc98d', '3997e481', '2025-12-27 09:36:06'),
('7265b69e692a3de53303c19c011589af9328fd36b251786640f99bec2f96c63d7c6d48fad01feebc595df0530dd13b7f', 'e00bef8a', '2025-12-27 13:38:34'),
('727d6e08717d2bd589939dd56858ae184bad11271c1310a6f475cb976592b7c93b876fa495fd0a8cd823bb98a4c723c4', 'e8de8cc3', '2025-12-04 15:03:22'),
('727fed09957347783688c87815fe38305d58b2e3733e0982dc5be35251839fdebdecdc4c0733bcf05dc4695c43f96b10', '9b61a27f', '2025-12-24 09:56:56'),
('731736444a441ee8f8eb986aa8462e295398dc946f48983214b3eca512085dcae81ee32432dab87c82bea2680d20c847', '3997e481', '2025-12-24 10:29:18'),
('7398fe45cda34a4ee3deb5d40d356f79e734002ab836c82c3d2a854db1329cd6f97ebb55554c736fbfd83a84b8cb6689', '3997e481', '2025-12-05 13:43:37'),
('74235acb194ed7f0cabf6b2e82d65d454f8d3347a54438a6667115796c007e7d73b9053e317e14734f215367503a4d99', '165ae2a5', '2025-12-05 13:45:52'),
('75529f79a4f2177d5ac31f3902bac3ea6fbfea3f94e8a8429407da4cab15244bf4de2aa8416c219633ee8c7246aa96ba', '165ae2a5', '2025-12-24 10:15:53'),
('7571ca81a89bc7ae58750eb08d085f3f3db18131675f724708a9383460826e470125ad11914d4edc6a1f5351a051dd3b', '3997e481', '2025-12-07 09:13:05'),
('76252420357e809bff00f672724771845a4a255fe443566194aedf235f12bc9124bc5d0b2e9bd9f096ba7a134b965945', '165ae2a5', '2025-12-05 13:53:41'),
('77c3311bab9434a4b933807a963eada841a7935c180e07cfe06adfacd8fa387e87f3a4fbfac048d89f16d4c8cdd73319', 'e7b3544a', '2025-12-04 13:40:47'),
('77ce7b0f8d1530ac2e0ef31bbab7fe3cac73074dd31f0a76f9f36fbdff3cdc94efc73cf864517d81e9b7176f8fdafc53', '165ae2a5', '2025-12-07 09:10:28'),
('7a29bcd90cf1e480586a5c4c148ec971860c526886e538b23e073b604e133020f7d10dff015e3002b3e9dbcf1b810ea6', 'b00eb428', '2025-12-26 15:37:16'),
('7a69a85e64a283dc73db4835fbfea1847075bb7b0a8dac8aa89d54cc33f02f619c7c98e26b98025597f3da0ab0d08b4d', '1f57430b', '2025-12-05 13:29:16'),
('7afa88d005623ceb427f706eeab16b1f77dd259f8a13f5aa6dfa7677d2c90f2ed9f643081c53c5454f5c16216e439aca', '3997e481', '2025-12-05 13:23:50'),
('7c1846456a696fe74d434815c1258b97c297cb285a2b3f42b0aed0f72a172ba5d07a9eb95296c3e878d2ab660a889c41', '3997e481', '2025-12-04 20:34:56'),
('7c3e17d795e53dae3dba13cb7630dfa4be7b50cbb43f59f1cbed9701dbb78bbe87b55cfb3c8c552562c4fe59009da7a7', '3997e481', '2025-12-07 11:07:41'),
('7c486f6c509914d54d5d43c4b235b668b16e224b396dc4de12ecebdb067fc6cefad7ac5914de8afee92aebc9fdb38784', 'b4669246', '2025-12-04 13:17:01'),
('7ce3c4fa3ec48328916db2836c8e0bbf40eea1a5fbb94cdcd1276a20d1c0dca5a23b0f1ad1a859533badcec0d16d968b', '3997e481', '2025-12-17 15:35:08'),
('7ceff1f45add101dd8520fac17d2bb4a1392e5efa4a65d05d6fc2b4cc36524a091d55250def0f75533702dd3214c4090', '3997e481', '2025-12-04 15:05:48'),
('7d4352da20e43c79ab2a26f2978e1120408d2204b5c6851cedacc1fe396af5e07a7e4a9cb736a65633e9669f801ee0ee', '3b9c36b1', '2025-12-05 10:06:06'),
('7f85b131314c4b4e4e29a90f5c3f4841e1397096d4255dc34981e96febeec1cc9000973e0c921e1a9517821c61398c13', '3997e481', '2025-12-27 12:52:34'),
('821b901e23e11fc3e41221bf636f17b1d6b5eb317e8b3a6352fc0046e3e9ac4a3c39ad411147dbec1a0a1f990559ce6b', '3997e481', '2025-12-21 11:11:35'),
('834f4ee72911db46097d31a5038496a5fd6e8922f31990470cd34fa4b06b368e8d14c1f0f8837e6c10fe925cc95d0d3f', '3997e481', '2025-12-26 13:00:19'),
('83ec23899f2f2ffc30891d3a8c11a859265d82cf3b629ed28db44d4b76ab34f616bc55214d8084d1120aa7627cd5d85f', '3997e481', '2025-12-04 15:07:06'),
('8408118892e976a5c48a940f6c29762a243eadb499712195c04b37bda178c2e4a7f00ae4659be592d6ebe94b07328ac2', 'c99d2a6e', '2025-12-25 15:25:14'),
('84235a72be50fe9b3e7fb59e81067b312bcd287bbc419281e4ce7f98665e1bbe74221a811c2f10cd59f01786eaf21688', '3997e481', '2025-12-15 16:02:46'),
('85200b78f2cbb23a8970c2073e06dbf515736e50f7c388366e37fb8c5d19731e8999211c39b67012f44a52c4d2248ff3', 'b4669246', '2025-12-04 13:14:43'),
('861f908e6f0289ab429f0e72b9847caf15bae85cfb6723de7766ba23efbf6e291a04a5033eed41d18851422ef505e640', '3997e481', '2025-12-26 13:53:45'),
('885a10aea8b436e143c10c92c52ba396f26c8587e37ab4ea64373a6978370b7b1c7c762dbc9c0464a291a2b8d8bc59af', '3997e481', '2025-12-27 09:46:11'),
('89a87fa64380fcfd29aab708913a826a8472d8fdd85ddc748294555f8b5afe8e560cc24753054b1f1ad85d243e061683', 'c99d2a6e', '2025-12-27 11:25:01'),
('89eab34b02820766147d207442b035ff288ad2b432217eabc2654874fa5517270ca49215165cacc535e28d9b38b85612', '1d35d98a', '2025-12-26 15:53:54'),
('8a2e4408da058b74627ae59d1b62381a1faa4ff144529267773c5dcd701f1980f8ff3098a6ef82f4687e1bf79e12b38b', '3b9c36b1', '2025-12-05 09:39:37'),
('8b303c3499241be1a462ff3c681c444252b3c983b9ee2fe6d1b840642f82cc0e95461750a72513ef3b485f960b09ca04', '9b61a27f', '2025-12-21 14:03:48'),
('8b6c1319376d98364647f596b80ec473a71452e877e95cb077629a8a23d01de330be20e1d0feae11f74115fbce25c612', '9b61a27f', '2025-12-17 12:31:38'),
('8b813e677f365dd98cb106a14be09ca3ca2e544c86fa1bd5699f247a3c0640bb84ed34f5a60c8c554e8c2a0d4e826d10', 'c99d2a6e', '2025-12-25 13:31:44'),
('8cc6fdf92ce38aa688ded6c9b0a7866ec16fb8b18f4397d66261b70464dae620d3685155226323e44b793ba6d2f1c404', 'eb60a4c9', '2025-12-27 11:18:44'),
('8ddfe0f0083be6d79e564ae9eb5f638b9dad17f7787e4dbbc8852d7b10e788ccbab0722240057fc53fe77df44dc205a4', '3997e481', '2025-12-27 13:27:29'),
('8de72a25ce972ae93af149a2e4db376bb26eac825a0c6805c5621b8c1acd46d1e8c02b8c08fc8788f358e8669c60b6fd', '3997e481', '2025-12-04 18:44:38'),
('8ea2b329a90a90e1ca96f9f2041af3f383214dcc54d23b77fc5f14a906aa2949dc810c60a0e2c34566d9aa6e7c90ef34', '3997e481', '2025-12-05 13:24:41'),
('8ef4399a476719a1241c530dcbc20e93fc96b58e7c82fa4a43053d998e3ab130017e76006818a8d35ff5348ae564373a', '3997e481', '2025-12-05 13:05:44'),
('8f57ba240707e929a67bb1010a45df129a70b9a0c464165a9b6903c6dc4de4c8ab3b0c5a7017b05ad6c7333d82cb75e5', '329b45cb', '2025-12-27 10:49:15'),
('8ff4424ce187004af0cd789e760aa60b4f21d6668d20d2d37cd7532440dc4ffd2d9a84a1914b8c9560e26596babdc903', '1f57430b', '2025-12-26 15:45:19'),
('908f87a6afd6f2afb606e7f63bdb3a5247f4d145013c5d31660aea3383663020cb6a9784908f7962a72e0c43b482d723', '3997e481', '2025-12-24 10:04:23'),
('9107c9ee4cef7a1c065da21c12ddf52fe80ae95455b5a83033a0a4e084344075af4439e11792f23ab516ade1e32ed802', '1f57430b', '2025-12-05 13:38:54'),
('920c12ae70b7cfbdfc2ac8d2ae7360a798ce199172155df75e37be00ccacea55b89a112d45a805db27c7321e6b2eb6b1', '3997e481', '2025-12-27 13:30:42'),
('920d6710f5278f10231b2d30db79b2c29e889f2fc13988a42ff7a3e9cc3b74d491c6177cdb5e36dfc08fc3c10784eb14', '3997e481', '2025-12-21 14:06:27'),
('9235f029970417e368ddd270c365468c20e3390258c0ea9f9fc0e551b5ad1b1043f19eda35027f703c4e94a80b8b82a0', 'e00bef8a', '2025-12-27 09:43:14'),
('9291dccce848daab79a09a9ca4b422d8cf4de56597561db3844e5d7e4188d43b89c702945f67f60dd5c4c25ef20ff50b', '3997e481', '2025-12-21 12:42:15'),
('92abc7f2275078f0d7bada33a889531b93b81e4c577facc31b2d3622d48720f1756e6791a0a5d0cd72e996f8bf503d65', 'eb60a4c9', '2025-12-26 11:28:10'),
('92ee72760d3048095bffc9886171bf5baa35842d34ae9f89cd08921a36be07d73c9aa86e50685108376b45bb0fa54c70', 'b4669246', '2025-12-04 13:25:19'),
('9321d48242456ef2ae05b482bab487d3e9f85347424acd9d0b1beb1ef64c314489e6c6ce3250fad66556c5b43144599e', '165ae2a5', '2025-12-05 10:57:41'),
('9615207c33cd050bf695291f9630eb97f4fc6293c943666b8b002a9c66a1b77082a21d6938c9a0c6caea20c5eacfc277', '329b45cb', '2025-12-26 19:56:19'),
('966fc3bf518c8ad21b1097965c2d161222b75b068c7a127af03f7c589264802e6891b49bdf8f4600a71e4c42220a2ce5', '9b61a27f', '2025-12-05 13:42:39'),
('976c07a6b122a325f516f3e1b93d35fd48819469159810d2e193975d958ae6d409d2aeebcede8f5dbc00e45d17aaf137', '165ae2a5', '2025-12-05 10:57:39'),
('984cd3abae6a62ed27ae208ce487f8c6e7dafa578d248d9fb9394ae13341e5e96e9946d32a756f2e90b17a989bfa5220', 'c99d2a6e', '2025-12-26 13:54:48'),
('99600e83fa8ae153a28f274186d04b4d691a9e1ba238cffc80127a60a8eb2c663779d12b5b00799b566846d064e8af44', '1f57430b', '2025-12-05 14:44:28'),
('99d2a0511f17e3993cd0c61de605b1c8d21f6755ee37f323345a6113823e3f0a9c32edfa6dc82143d07f4604009283ce', '165ae2a5', '2025-12-24 10:25:26'),
('9a54d6d4fc9a2b6bf1cc29a74015c6e2c93b8017deb02d82025b55e25ea5f7f2ed68afdeb77f976998f5638202c1ef6e', '3997e481', '2025-12-27 12:16:57'),
('9b1c80e8c4414a04cc9a7c853b6477670e8ad75a121c9e6184cd77bc79882b320b3f9c4693ab0e88a040face0744cbb5', '1f57430b', '2025-12-25 15:24:26'),
('9bbbb087390e4a079bc4c047072ce7af72bd46be95fdb91b133f9d945cc857a74bacda1b7f22447a6261285faa797f3a', '3997e481', '2025-12-15 14:59:04'),
('9be738cab2ad3a60ddacc550906d04e640cdd5eb8083aa076a4e5a1613140597ee947f9efb71308281a102bf67954fd4', '3997e481', '2025-12-07 09:08:34'),
('9c06de552372191068450afca15574189465f244ec8b99b6d37100e80625d3e5e1bd8fa04c931cf512a718c32873b158', '3997e481', '2025-12-07 09:48:16'),
('9d67d8d54c081823710bbdb97b0c0b89061e579d6dd14bb6190c6faf365e802739729a6e3883e3aba82e680f32de4a0e', '9b61a27f', '2025-12-15 14:56:54'),
('9df53ed32c7ee9f4dfcddf9ffb082b0c3b1e08e58998e28fc76965311200aab7154b9d54177b52a0075744c6b4fe0a71', '3997e481', '2025-12-04 15:59:59'),
('9e5a8328a65016fa9e817ba1ee58280433a691cbd25f81620f754915662028073c80a2ff42e069285857351bdb43d230', '9b61a27f', '2025-12-05 10:48:09'),
('9e7e96a9b5b24c75a7b0eb7e5afc84763f9a6322a226a010c43600eaaa9149739ddd0018bbd9cefac1dfdbf6a5e02666', '1f57430b', '2025-12-05 15:14:25'),
('9efcb2b73e68594449813f08a1989621c4c0e7593928497cde3effe289d0c5f29ed57cc5e9788dad200326ec40756241', '9b61a27f', '2025-12-15 17:05:31'),
('9f10dc9244be7f771ae058f5867d89ee26d1c234ff96688bfb12cf6df15fb0eb4ff6ad7daa8f7d6c3c020dbf51dd71da', '3997e481', '2025-12-15 13:04:53'),
('9fb17ab11a5c8e0ee787260cb0aa92fddbd310d1f06e3e581d734b81aed556ca312293e3e5b8a7676694af77c8cf5dc1', '165ae2a5', '2025-12-07 09:12:40'),
('9fc2054852c887c7af5f6b7a08858bc62d17db63524b48c62dbfd6da18c9d31f54d7b27fc8807d47b37bcda60261c298', '84555ee2', '2025-12-25 15:41:50'),
('a00da9975b0141289778c41f3bc04e3cee4c4107d618db512e59c3ae5161fb7d2dd8720997ce492e72b07a1856b6e388', 'f555291d-bc', '2025-12-04 13:05:54'),
('a0c6de4d973c693efc29e609edbc8a8feea9c639dcd88da8b125fe2085b50325f17573d0185f0233c0ef9eac83545683', '3997e481', '2025-12-10 12:37:33'),
('a1a6ef3a3618af98229cfd06307e1cc13a0a0da51336427b018bf47620bd2e1ef90ec2287a21f33eb023a6045e8e21be', '9b61a27f', '2025-12-24 09:59:18'),
('a1b94df457c04a64fc808a2a262ac3808615dbcdd55a26464a97a5792f84ace2ff35e6b7c195f570a35bd366693e187b', '3997e481', '2025-12-06 16:41:46'),
('a21ecd2f87596ccff62150ddfe08518b018a45ab814f2c3bac833182673707dc0200ed987f873f4f6003e694fc3f346b', '3997e481', '2025-12-05 09:44:14'),
('a349de75068eccc13493cbfb6cc13feafa3d28fcf2fd3995959dc64d77ca91e3bf69100e5873c5d8f52049ed56183c33', '3997e481', '2025-12-21 12:43:27'),
('a3afd3aa5f62b5782e92a7d6ff7f3352e5a88a4174343bb3368e9c583fb400875ed13056e8baba5447181f050116264f', '165ae2a5', '2025-12-04 15:11:24'),
('a45b956f6a0cffa5ed843c06f2fc8a3b3f8dc8b7483ca42a47912f29604a3c3caa0470147ba38b6cfe377425fee1a4d9', '3997e481', '2025-12-24 09:09:38'),
('a48d8a7d70b1074da4c573e1d51ef33690fc5016e13f745c7b3837d1b5d664b222b6567b33f543170bf323f99c4216d2', '9b61a27f', '2025-12-21 15:21:28'),
('a5aa1a82c2640c45663da95fca946dfb9d25ec0a95d2bf6f3f3747cd43d8d4c926574341cd8385018bdf3d82991a64d9', '3997e481', '2025-12-27 08:50:02'),
('a7d9478940c9abb17b050cbcf918d176a86cb4e9105baae097c4823e64f7cf06d0178c0db0b5b53e5abffbdf885fc4ee', '3997e481', '2025-12-07 10:52:56'),
('a8cff93f88d2c33878bca6d7a2a376f016734d13223d56baaa6b8251dda1b36bc4f3b6bb5500fa0f91b608c4565c0442', '3997e481', '2025-12-05 09:43:10'),
('a8e629265d9af35aacf82352e48b84bf9c6f59fd0bc0f833138473a8b1873ece42a754f1651d80dbae2d58f476fa6faa', '3997e481', '2025-12-07 08:29:30'),
('a95883b435cad09ac643baebeaf2226f208350cc5a961b0d241918e92690f1d26fc5109ad5517ce66d900346c5501954', '9b61a27f', '2025-12-24 09:36:52'),
('ab28e88665bffcc7ce1868592b23367aa159ffe264fca8252c1f0988ededd47ccfad2c3aa73bbefdb9be595e81b9787d', '3997e481', '2025-12-27 11:35:11'),
('ac49b6125623143a0fcde760f530aa49fa7a4a794de52e5ef83a684aac17551826934fa6f7054a51f19d7957c23b8113', 'f555291d-bc', '2025-12-04 13:31:16'),
('aca337b33a2324bdad03b38dd4f9e4779730b420e8435418d7da07d8f0cb015f40a7c34229e2ae9cf9064e95332f278b', '3997e481', '2025-12-26 15:58:30'),
('acb196a21c8436aa5096c7490cf76f0e1475cbc0cb72b4078b87d8ea482071c5e2eccb17d67738e4a88f0176b81c8707', '3997e481', '2025-12-05 10:11:16'),
('acb1e4fc48f5eb258092511980beeb30eb9f6759d57eed9541b755dc3fc20b2e2e940261956b2826a0bb6d9b0993cf78', '3997e481', '2025-12-10 11:51:17'),
('ad1178ec95c837f0f07af863a1b3f29b8cce3b47bb77176eafe797e2dee1af8ca0099e57eb347327fdc7d355c2e09b24', '9b61a27f', '2025-12-15 14:54:42'),
('adf75c2360ed9666f4e6f5c0fb13087a4f45b02fd4d833ec200689730de2b105db3e2c836061c60a88302055a533ef6e', '9b61a27f', '2025-12-07 08:41:41'),
('ae0d9393f0a29df9735c0d3b8d28b8b47e9b23889cf26ddf28ad78f87bc2f8aa902b44e83bed1bf52c3f1b8df77a3295', '165ae2a5', '2025-12-07 09:04:35'),
('ae18a7c603f5d08c4f6d66119897011164aaffc52a3b430a32ffeaca90b95024939d4de04f8721b5a8a370392c658d8d', '3997e481', '2025-12-05 13:55:06'),
('ae695e4254da0c757cd49c7fe9cd267d65acf7278fb87d8684b6ffae1157da89ae875193fc8aa62da659a656e8f6daf2', '3997e481', '2025-12-15 12:38:45'),
('b033003aec2e173386385a1d650a440a7dfca33612db5147a403653066f17ed332c1b387cd292d50526d59d9218e0b94', '403267bd', '2025-12-26 11:40:04'),
('b03ea168d3a79afeac193fe3d94f2c37b00ec7ca59f41882f849a2f9409acb251be4be90acca2915c60df9d0a13f37ab', '165ae2a5', '2025-12-25 15:38:36'),
('b104a2e1470a763ed4d053cefd2b1a5dfe75a046926a2f92186d4d59038d13781cf5f65f19c20b5d2b1e269df5600977', '9b61a27f', '2025-12-21 15:14:55'),
('b24a5e34ce55ecf51b60f315a05855e0920fa39e04d9c7113af38496cdcf601e397d5a98a086b38ea053070dec868576', 'f555291d-bc', '2025-12-04 13:59:32'),
('b2c27da0b8bc78ad5579b9f6132620b6bd4d4a0bc60066bc003b810853fc0de776d7dd61b9478084da050f7a31a8801d', 'b00eb428', '2025-12-26 21:26:43'),
('b3b0a01cbdd08b92795190e06493239a3a153158de04bb01acfb3edb6f31cca42bf26993c62b4fc0c7b27e8333203fff', 'c99d2a6e', '2025-12-27 08:59:43'),
('b5473d9d9c00ff21dfae8109938f068176f0ed28f8d01183f227ec76273d213abe88ffdc7c5ad0bc43055025dbf3e35a', '3b9c36b1', '2025-12-05 09:43:39'),
('b620dc04b63238b203c9947142953ed7973318eee2f70f6937a9f5478ded7c2ff7f6a611e6a7d22833591c56a1cc232f', '15fb4941', '2025-12-26 15:48:51'),
('b672a50ebebdf26ea25ff0774358ca5f328a3e12e3194e795d90e90066f8893dd4b8a54a0ae03876f925de01f1bcf578', '3997e481', '2025-12-15 14:58:31'),
('b6774fa67d5d68579a2446f387e67291ca50b5f90f1f0594e3aee3a9d11ec57f8ade91dcc2693bfb4ed05f556b574467', '9b61a27f', '2025-12-14 09:05:04'),
('b855b7c8396f1cc060acd5082f1f13f8929286242779cd06e63f6d8d66777b5ef927cdf5633f5f15fdf8dc1ea8f389e8', '3997e481', '2025-12-26 20:33:47'),
('b911878d08d85675b5ef98c5eb57568cb992200db576f0b7726ce57abefcd2ebf05615bf27f6f8937cfab9e1de0c8b34', 'e00bef8a', '2025-12-27 08:47:35'),
('b91e6023c210babe607ca22d6b1116d5bb6e52b8e2fc3c427c04edf28557fe68282c806127237b01f1370df6e71233d0', '9b61a27f', '2025-12-07 09:43:56'),
('b9eeb8c49f0f3498b43eb38424eb86705e172546899d8f93397063a7b61e9a1efe4705e304492a29d945adf2b093aac2', '9b61a27f', '2025-12-21 13:59:09'),
('ba7bb2ed3b01ebb4ff004f50590a2d8066c32fdfc90cc373727412ba68c4fabe0fdd4cabfac8e5bba0711e4f3280503f', '3997e481', '2025-12-05 10:05:20'),
('bc11983d98667f29a615cdb4968c6c405284ac52687e3b7729ece1978ac8e8762755cefa05098c6cd6a1ebf25c7f9aa3', 'bbf62ec2', '2025-12-26 13:59:09'),
('bc2d3400ce79a3b2ad0ba5bf5d577da28afdc11215cd4a52167de0d85db2233b1066a24a899237d38edbadfac4f338f4', '3997e481', '2025-12-17 17:17:52'),
('bcdc13fbbb330c3eb8a764f20bd9d78f434cee7ed2a2ec72ecb5f338e5febe783835d278b7be84893caf6c542c936bba', 'f555291d-bc', '2025-12-04 13:29:18'),
('bce3a46d77552ba36fe3e98d882f4174ae87bf6f42633282e4a44ae76b73c72c5571c0f39e4997489532226784db6867', '3997e481', '2025-12-26 15:44:08'),
('bcf7887fbcf6bef3b7202c97c67a055e010e14ab2921928c8cd71dab1169a388f4e97e1755ceb02b753f5dc26d29b0a8', '3997e481', '2025-12-17 16:02:54'),
('be6e6b4c4376ef2289dcee3a59ad8cc26e722d1a7186deaa59dc4c9a22eaf435befe178826fed43e03f74cb04bfb3fc9', '3997e481', '2025-12-04 18:50:06'),
('c1c6b430ce6272a3733450f50e0ecd679ea44f6cb22dcf439389f47d6e36e7cfa9f8acc1d4a98edb97fe3ed46e4d1544', '3997e481', '2025-12-05 13:49:56'),
('c2591056009712c852cf62ff3a942096d88e3f6687580c149692726012398a8321134befe29eea3ec60aa9b0e0d978c9', '3997e481', '2025-12-07 09:45:01'),
('c37cd23f9cd0297fd255ac514215890bed43ce56d52d4d8fcde5fe764d2d520eb6cdac57da2f1b070aa4cece561ee26f', 'e8de8cc3', '2025-12-07 08:31:00'),
('c4480bd1e2fc7791af6505602455dccb6dd35d65c9f3076982473ebc1657dfb24007c6e2d49e8b799e6e86925f74ce2b', '3997e481', '2025-12-06 10:39:26'),
('c4931348b5c59f40444820fb47d6040dd10c656d1e4e37fa2f3582dad614746223254457e8e80494b81c5338585f66a4', '1d35d98a', '2025-12-25 13:37:36'),
('c4e481ec5e1fbb1c5a696c35bd9a02ae35033a8d9094d670e357ee53311fb044bbce8961fe456e2d4264956c2b959243', '3997e481', '2025-12-26 14:03:28'),
('c57eb6e37cbf75fb05659d5fd7e46d7e5e2f1cdaa5cd5d088bb08073a75728459db5c39d038d6fe0b3550eaa7a4d399d', 'c99d2a6e', '2025-12-27 08:56:46'),
('c60ccc01b6242f246e643df3baeefc5ce7778cc610740780c67a0cd5baab6dd62550c5dd0d0f9b46f93f8f0c3f7106d6', '9b61a27f', '2025-12-06 10:45:21'),
('c62a45e7dac873c34934ecb2445113d24e33eb430eb9cc85556a77ef95fa19665ca25bfa570a73b707d743bf08e697ab', '9b61a27f', '2025-12-17 15:54:17'),
('c702e598da8fa5c0d17ee8bf428bb2b04f6361ad4c367755f2005c9dfd9cc560dfcffb70dd44b47ab63299a7fc42ea5d', '3997e481', '2025-12-27 10:29:56'),
('c72b4c81ea7d9481e4002b579d5c4879553ce9af95397fb4516fa0c93ed84ff0d8874977a3c984959c5c6bd84ed7a57c', '3997e481', '2025-12-05 10:54:20'),
('c7abe46e25e3190ebe7656ac3e699654e4ce55454c41a176e37a415e0f6220d19082a1dca3b7252774b8677e02555edb', '9b61a27f', '2025-12-05 10:16:35'),
('c7ceda627c7e772062f09cc00090b88686e8485dae7c140aa1bbf40b9c233583e2506b40bb4ce94b2403c0697d0d7eb9', 'f555291d-bc', '2025-12-04 13:02:13'),
('c8d39713ba20b0f861ccdb4783c7d5d4651297e9eb2ca1d6e1783bbbb6ce9573c8d588875c062ee3f666e1ef4049198d', '3997e481', '2025-12-25 13:58:43'),
('c8eeead7e18e51ccc433ea86defc6c36366f70b094a12ff4f60fa7f5b6f26c607bff0095e582e9283daee9880cad6309', '3997e481', '2025-12-24 09:44:04'),
('ca682444bf45080f063271a67eb23525c101f8896785493b7954fd1f469874391fae0cb3dafb10238d50ede0e170eb5e', '9b61a27f', '2025-12-15 15:16:31'),
('cb028fbf0098cc6bcf9efa020dadee7e9b73f771c0a7a213c9cb312c170e371976a33f29642e23a3c190355d029bd760', 'c99d2a6e', '2025-12-27 13:18:27'),
('cb4977a46f95d0f37c81918b25ceadac648f45d2bc4245f788eb40bddd85cec1d8801b71b9c3b08cf510ae17430f49eb', '1f57430b', '2025-12-05 13:06:38'),
('cc24d5943ad4437f9614b19c1d411f3421d3b6c692dbc118716d9c3176826d772b8b0f7f71ed2ecd17ec08d8515e22d4', '9b61a27f', '2025-12-05 10:16:17'),
('cc848ec9a7e6ebde44ce61e3b02af8600e488647bcefd491ff3a9a7fbf1a2fd572dc80da6f81409cb5aabd15970e3306', '1f57430b', '2025-12-07 11:59:18'),
('cd2e9283327320dcedce31d0f1a41ad4892c3da610825a3b07eef35740a8276646fff7aed476d3e8ec2112f8383810b8', '3997e481', '2025-12-10 12:12:09'),
('cd4f180082ecb04b39376cc1c15be70bd2dc343b3ff398fcc38aa408d50b5a32e47705561c9e8da09efac10ea19f61ea', 'c99d2a6e', '2025-12-27 13:22:18'),
('cd4fdd4fc7788430e9d1413d4a6ebcaf3d32cf61c211b912dfde8d1108b8a8e7231a0d1190662b1c26a45f6a9619b3a9', '9b61a27f', '2025-12-05 13:22:31'),
('cd974a87d309fe68056481e6af8329b695d204c5154d8fa8b6f49b34b6788d9c19728100ca68168b3529c9283500fa1e', '3997e481', '2025-12-18 18:37:23'),
('cea78b9ebafa148baf9131a4729f0740642cdf2df01ea8e6a4c6cd09fd660e30738e0d5399e323649d68999204fff8a4', '3997e481', '2025-12-14 14:15:20'),
('cf1b25baeeca9597d37b210c21c5040ac63cc067919d8821ca3be78f886bdf04d565b9befd717b6324e010177ff3ca17', '9b61a27f', '2025-12-21 15:20:24'),
('cf2344c36aa21abf25748c657b8c17fa17700631255a78ff6acdec04225a9da2bd886950b59c55dda7113fdc4715f11d', 'c99d2a6e', '2025-12-27 10:00:18'),
('cfbe8a7859f7263c48861574c386392348f80648849dc4a3bf9730f6a2edb9ab6f1dc30a7f7c983a695367ed8112fd44', '9b61a27f', '2025-12-05 14:15:09'),
('d04b8a5d2dc04a973cb877a317be3d49c236662311f4ce4c53091582759b5dd3cd75e4095a76e66438140af03d317da7', 'bbf62ec2', '2025-12-26 14:02:06'),
('d0b741f95237e7fe853161eea398af420f12aa29f0d10d16343fbdacc08f628738a87ff587720d2234559f5388ee39f8', '3997e481', '2025-12-05 10:55:08'),
('d34649d73dca209b4b952471d34bec8f2e60651b30e052f9c9b31876bf5f5df0415c1950920c46d3fffc747fe40f8ada', '3997e481', '2025-12-07 08:31:40'),
('d36c1e9aaa75f3477c7d47c5ac59b039f41f9716d5ffa773207dc60703d435a6853823979e7af5598053473eb3f7b283', 'b4669246', '2025-12-04 13:13:27'),
('d3b13f7c520c37b05f167e0d22c5e23ea11dd13e501a59e71c06bffce735e76ae990a7caf6915f77a1b63393fea134e2', 'f555291d-bc', '2025-12-04 13:43:23'),
('d4a43c64553e574d1f4497ef8ca9010214a2002941387a940b6e598d2378f7351b352ddb663229cd4716f105af518ba3', '9b61a27f', '2025-12-21 11:38:18'),
('d4ab86ae686b6388ce0d3f110eba89880a3e1742483cc7d3b226974be03ff3b6f9a8edded428758d0e95dd7b9d57deae', 'c99d2a6e', '2025-12-27 13:29:02'),
('d51c3e304039c18f6b69a1a3ce92d697559554d41248955de1a541927816cf28f87d331ae22aece59164f782f5c3f318', '9b61a27f', '2025-12-21 15:10:45'),
('d621fe5987b3ee442b439f16ca475479403153b6518c9ed2f7a61df17c9a4c8d8cb0ec8b63f2b1f66233da09f2104f77', 'ea347dad', '2025-12-26 14:00:49'),
('d6813bd1f573d7f7f4bf810ee27216618a2dee17025c5d0b22b090a8c62bdd12802fd8b64d0c843ea42ca1891280be1c', '3997e481', '2025-12-07 09:11:32'),
('d68baaf67065a5dab484362e559f1a0ad5cb970f903662f139fd01e9fca7bd71bbe2c75cc01c2ffdfe02419950fa1f4e', '1f57430b', '2025-12-07 09:45:36'),
('d77a40d7b47b83c48e0fbc46e46f80eb831498ec86e1e56c49a2bddcd9dce6ff1129a1b80f340868c61c2b57ec64ee97', '165ae2a5', '2025-12-05 13:26:41'),
('d7b6df6d465df72629378daf9ad37333a015f7fd5177b0e29ea38de71fda09e8f9f3426a6efc7ab74464f704a84d7ff3', 'dee47147', '2025-12-27 13:42:18'),
('d883f48aac755dbac3b8fd7e2ccef719b8bb01f6a9375d1f83a457daec309a2670e75c7707f3213ec654d90c81cfd426', 'f555291d-bc', '2025-12-04 13:05:33'),
('da6422e1314d546bea0f1fe84eefb0acac75ff6eab760f8926b525e5f7cba7049ff8ad8fab898b6f98901e9d62debbe7', '5b7db29d', '2025-12-24 10:23:11'),
('da7a07e0a3fdcd7a7a8e317ba8fb75a58c5889dddd344c6eca2c98e9eaa101aaa1a69daddb9a882698e4f8994944261c', '3997e481', '2025-12-26 13:46:09'),
('db2367d53086629dcfa4cbc343c7fb27c15dc52807f43ce4f87b426800fc245cbb78babb6c08c9cf06e248ae52287b48', '981ffb72', '2025-12-21 14:48:16'),
('db61f226df1634fe6c692e0d7f2795f173e61611805b61270275408d77f3843e1ad8bb7646c83a9106064524320c697c', 'c99d2a6e', '2025-12-25 15:20:02'),
('dbd9fae6499d00dcd555724c481ee2a964f9ece63a6972183102de7557be981e5bdf1eb7b8070671ff36afb9fe65bee7', 'c99d2a6e', '2025-12-26 12:59:32'),
('dbea6675ae08e2c85d00ce89836c59449be9439a762d05ad1a485ee149bd01264200532a3709d5820eeae040549e5102', '1f57430b', '2025-12-26 12:36:46'),
('dc1d5b858fffcdbf053fd9aaeb923df47f313aa9776776d7d3bab83957a265587a1234a088a348bc21ff2668cf3bd612', '3997e481', '2025-12-25 13:33:48'),
('ddb24b7977e3c41134de2accf17511d75ebf8f0eaff633fe55150ce0ad0659935da4e293ec584fd4a9b0f5cb0d5f362d', 'dee47147', '2025-12-27 14:34:18'),
('ddbe3834b35c2b25f5d354202eebad3866aa4652f43087387f6ad52b78c59d009b827c2ec37f7903d7ff00d077c1ce05', '3997e481', '2025-12-06 10:23:42'),
('de43fda07530f0298df7aa5e02fa9fdabb83dab9e79e0d0a9c4bcbb80540909ffa0f6dcaad27ab7d41c8d7fcc2fd4659', 'c99d2a6e', '2025-12-27 13:24:04'),
('de6bd83d682eb579124d08cd8a8d0101730cd87c32775adaf2df3a5e342333e20232ef351480529ac2604d05dc3c70c8', '3997e481', '2025-12-15 14:55:00'),
('df55a7e24f3528317adbf8b6d1b6e7840a71b9c419667ded2d1ac64f4f21bad2ec752467b1d23a5bf7d082b3fc81f67d', '3997e481', '2025-12-26 14:13:55'),
('e02d559e9f90046acc6615f039a702acc0b9897af84b2c48c3a53b9d5f14c865a8378f2bab59604485c3ae4c5078fd82', '9b61a27f', '2025-12-06 10:26:00'),
('e0655a0378ab33e21ae086cb11c44cc6c2eb1fb184e0d1a20ec38e312e0f4af9748a70480dc2ccbc9a938fd7d2ac2979', '0c38bfa8', '2025-12-07 08:59:24'),
('e0c63d95d71667f921cf92d1c2651210bbe5e764a72acf1d13c41253cbe718cf49ed8ece912ae38aca5f8db6a1d74d92', '3997e481', '2025-12-05 15:27:11'),
('e143ca703c5cac030a63ed909898ba5014459f4ee2e9bf35a3425d76f86e210850a32b1a52d49a1f0e120462e4273ea1', '3997e481', '2025-12-17 10:11:50'),
('e1f61c461e578c1babe4a49ad0c816d74b0934175f56cc807aff59f0f00120c8e0fc57098533dca5585458aa53b9d9e3', '1f57430b', '2025-12-26 13:56:35'),
('e1fe0a06666dfac71f5f78d6ddcb0631ea251e73b738bcf93b02551af4b66fe05934c81796885d0f8637e79792b59bf1', 'e00bef8a', '2025-12-27 10:30:37'),
('e2b75c46187c69c722ca7a9822418b61a9ba72f50f1ed68e567b40aae70e846ca4ea8c70ed8d64ee31e812c5f206125d', '9b61a27f', '2025-12-07 09:02:06'),
('e314d7351e81e20195d4c562f0494a6ac58112f4b3be1bbdaf2ee4a5d00bb235e2cf49c305494aae7506008d1cd0fac7', '3997e481', '2025-12-21 11:41:19'),
('e314d9eeada87e499a32f6c2676b2d9ca8316b3abdc94103e957fc431417605701e9d2bac691728b195b9ece9c3b9006', '1f57430b', '2025-12-06 16:36:13'),
('e38be3047f796d03a8dc1b6bde24d67249c9a4c325802c329036ae2ebae6cb83bd0fdd2fc403e7e4b2ce25fd71dd398a', '165ae2a5', '2025-12-26 13:18:06'),
('e47d2cfd1a793cd0ca9e39d24896736721442078df5c0e68b18be349a9d94c7dcf1acf61cdbe5d1960ddbf45bb378ba6', 'c99d2a6e', '2025-12-27 12:56:41'),
('e53c71d2c981f0364690d9813b52747395fdf428b63fca6620230bde36ad6ab6f7b5131f8a36fd482e3bbddff3bfddc3', '3997e481', '2025-12-05 09:32:56'),
('e5574acf4ebd88c23b4c8b2a1f8b6ed16efe148b4375398b722742ca16c7ee351660eab09b57fbcaa7a32becd4e74e64', '3997e481', '2025-12-27 11:20:37'),
('e577a10b77d257bf0f5f80e9925972419eda4f8dd7308e72fd4ba73175a4ff6c40ce66f50e5c1344742535efeaf7d018', '3997e481', '2025-12-24 10:08:47'),
('e63fe29dfbfab695d309f4d262339ecec4dc95d417b1c5b3658de173f785eb42e8452e125d29eb3cfe3579ab31028e2f', '1f57430b', '2025-12-26 13:37:15'),
('e7b91495826470a6f2c37c2bccb3295226ec309bab148b4d321cccf1c254b50b4349ef35e966a0867d3e5407f6908a3e', '165ae2a5', '2025-12-04 15:09:12');
INSERT INTO `refresh_tokens` (`token`, `user_id`, `expires_at`) VALUES
('e80dcf7b94b8583b5ea01985debb00785fa95d1821fd7489848f4c59d65234cf43c3627d2e4d550652116f180ebe192e', '165ae2a5', '2025-12-04 15:08:08'),
('e87a4330a1089e6ea028622b96dc1ef780a6bddf2d62356998725ab21839ba9a8b40484a57c926b1479de99ab41c83c6', '9b61a27f', '2025-12-05 13:35:25'),
('e8e3362c14ca29e3d59f337e309bddbd68f4cff61287e2cdfc339d1858897dad13d5d8f76237004ae0034781d0567016', 'c99d2a6e', '2025-12-26 13:36:35'),
('e9d56b4eb1a4dc64c5062601563394b1af34240d5bea6b9233e1032e2418f2d4f2c87dc0925bb794e7dbf85f03fe252a', 'c99d2a6e', '2025-12-27 08:55:18'),
('ea270b68085a0b892a0572e7e89216c839cd2b536f8850a9cd326bf51b5a718b235162dd2ecb47243cff3157567bad73', '3997e481', '2025-12-15 17:56:21'),
('eb8793a383075f2c507ebc12ef52a3d8974c3eb5b02d7543efca0c41450d54664fe4852ff686ba85e1940c481c3ea878', '1f57430b', '2025-12-07 11:49:26'),
('eb8b483199d076cfbc81e1d2c9f2832319a3adf32b8dda52df3d5a3096a1ca0add72e7b75b08e934a98876839f411ff7', '3997e481', '2025-12-21 13:57:30'),
('ec45492ee355ebd31a8cb750c1de8320191339fd1c843258efdbc7cad95d81c6e476ab0fd300e4103b1278f5dd94ca72', '3997e481', '2025-12-21 14:02:32'),
('ed2391576c0fc304f5fa0ba1d40c10151868e8379359a05e8a8fb39f504c68c3fbd130b60256aa38d21e45cd46a9cc71', '1f57430b', '2025-12-26 21:25:05'),
('ed57bd65c05650dc2b7fe70e0e900e8aa5ba5823e6c3b5966d15a3764cb37621eee159af01a264693de67d8ea8ecbbd2', '1f57430b', '2025-12-25 15:45:51'),
('edf3bbf90b84405fc06a054be54c9fbef6b99db2c54cffbf31165b3c3ebdc1d2a5af76a1bb6319499058beeeb8454cd7', 'f555291d-bc', '2025-12-04 13:42:43'),
('ef1b20841dad7a72ba6b65c40f5174fa8ddb590160a776f3a7be3d04e1f9626080c061d70bb336f0a45646b7cd74a4c1', '3997e481', '2025-12-04 18:48:32'),
('ef6fef7478576324f8ec57c86baa020685c60e9c6988d2efecdebabba8f515323d006eb676dca29c851ab7a40c3762f7', '3997e481', '2025-12-07 11:22:52'),
('f07d850b7f57a50350df9317f934bfd671d5c15308ef0c39989ea737405eb897acde9d597d5d4ddf9302f12a7fa798aa', '3997e481', '2025-12-05 10:18:56'),
('f118a116c97279def995795a4607a5b620617bbe15c37e254b3df2d09389bc4f0dfdcd2cfa0ee5e9bd7555fd08e9a3f1', '9b61a27f', '2025-12-05 10:19:28'),
('f1e30b65d00c6f66b32a983ced9c44d7642f244a8f2ec6077f70a1c53c0a04716633874bb5390769223aa05ad3bfced1', '3997e481', '2025-12-27 10:45:47'),
('f35ee424f423631606a8eb68d9f37576ff0403d9741be9de0c8969ab466939d7b41c542440821c320d868cfbae5a74df', '3997e481', '2025-12-27 09:48:08'),
('f39b3cdf595886f279948c2970df80174a41ff2c3ca4db226ebd9d2ca4c3043015aa16d450451badb069a6489748ce25', '9b61a27f', '2025-12-21 13:55:51'),
('f3ebd6a77547b0adc91e969b1e8e53d8463d467c64d17bd024a8097492e787c56a2b72d94f9df6df0f953a9715a81086', '9b61a27f', '2025-12-21 12:28:50'),
('f4079ad467072b231ec010e3632ee623e1a5e14ce658f1beb25c0698288f4e239e7b195311f825a36a0d2c04b84ae9c3', '165ae2a5', '2025-12-26 13:31:30'),
('f4f4f19bdb56e8c842232378c6c6dd9ce744c96a2b5760ed5dc7da3dfc72e161e27ee162e1d0a7921e53632f11f91336', '1f57430b', '2025-12-26 21:21:39'),
('f5502fba0137bac56b2e3212a8cd7674e05eb89cedd18762697db87cad4da4f4ed5e093d5eb4db398a906f4f27a2e742', '1f57430b', '2025-12-07 08:33:04'),
('f828cbd75a29c30ab81b97f26395d2300b2a64ce35b6ea743634dea2aa213bc2688245f6481d536783dd51241fe5da7e', 'e7b3544a', '2025-12-04 13:22:32'),
('f8c789b97a1c39f36be071daa11ec810c5f0d4c300ca3986d2bf38990cdc89512b53964c8fb6741559727dcb0f9c2f99', 'c99d2a6e', '2025-12-24 11:01:18'),
('f91e9d66b6297136914224690d4ea39b65b94306bafcc33a45f65179af14065a0e0957aa7a0b030ede34e35710ab3756', '1f57430b', '2025-12-05 14:11:17'),
('f9419212addb1f6bdc1069e1aa656177a2e3b797bc477119726997440b5f00047ee61bfdb378682ea7e568e7fdf1d0ae', '3997e481', '2025-12-04 15:09:53'),
('f95369e5e72b144052e479208f03cf988bb216d9b22229bfaa3ba11c21cc09d01fc7009f431a44f0e4b39bb14ada403d', '1f57430b', '2025-12-26 12:58:47'),
('fa08050305c2154d9902b38c53aa25c58b4e813af5194b8fa4ce4ea168db75813e6faf125e52428680e971f13038cc3e', '3997e481', '2025-12-26 11:35:16'),
('facc12f342967224b95fb75cabd234f9d97245c014d187164bd1594ff502180ab170130b9ec5b1c12e81ef06ffb498da', '3997e481', '2025-12-27 08:39:22'),
('fba337f5e0c479bb02e36af323a1e7e0435175a429d215ae892b83a297ca0e4ca4e4b8aa309d87d2baf9e7d53767e503', '3997e481', '2025-12-27 11:59:28'),
('fbab5726ac24e076df5fecca696107d8feb96d080906ac51fa364348f38653abe0d0f2d7468244b47dba67bd17a889e4', '9b61a27f', '2025-12-07 08:37:03'),
('fc11c5cc981d32c1c7a3f6c3ed66aeb22f6ec6758a398ff79053558cf1b958bcd4164132cc128d96dd2715d71bcd8602', '165ae2a5', '2025-12-05 13:58:16'),
('fc6051298c6cf063d779100689ce5ceddd7f1b1bd44eafb38a24759e69649825fcac6a16d3557b0d158fadeab500b02e', '9b61a27f', '2025-12-17 10:49:29'),
('fc6a238d7ef92aad3c1cf383db26260f1588ce960d091c438e123488b7e543cf383bc8c56611562bcd80c30be3f968c9', '3997e481', '2025-12-15 13:12:00'),
('fd9a2caeebbb881b87f2e44ab36b509dee2cbf3573a060bdf6a891b905a1bba25c94d0a6436697c8757e1d4aa19f15e9', '1f57430b', '2025-12-24 10:30:03'),
('fe0536cce0748aa49d87c6f1ff8f38a1df98d29a7a3d46b7a6ed387f724d81d32bbe6dbbde659a0535d7b542b9f1c4ed', 'b00eb428', '2025-12-27 13:42:44'),
('ff3a8b8cef6284ae98e480d2c082b79a362c1d541d8369b7b5fd0060319313cf9ed349367ec4b5049dd3c5232fb89898', '165ae2a5', '2025-12-21 11:26:18'),
('ff7ec66f7093c075da430b3576f554cd0429790e0f585e3c155cd63ede5bc9bbd580c21363d394859d8f3f70f1904779', '9b61a27f', '2025-12-21 11:24:37'),
('ffce61f8ce4a677ceccab457617bd7857cf0d493b47ba8fd84f76f1e4c3e6a7eab33fe746cb0b62348ead7a2e3b315e7', '3997e481', '2025-12-26 15:01:57'),
('ffdaf19f67cf652c8f260a0197b8adb0d706f6cf621590fab61afe9feebf5f76c531bfb2c522a823e79fa4a690370c87', '165ae2a5', '2025-12-05 13:38:28');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'admin'),
(2, 'faculty'),
(3, 'staff'),
(4, 'dean'),
(5, 'dev');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` varchar(150) NOT NULL,
  `name` varchar(255) NOT NULL,
  `year` varchar(50) NOT NULL,
  `course` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `name`, `year`, `course`) VALUES
('1222301660', 'Ruby May Cabarlo', '1st Year', 'Bachelor of Science in Information Technology'),
('1222301711', 'Gideon Rosete', '3rd Year', 'Bachelor of Science in Information Technology'),
('1222301720', 'Lelanie mae Ancheta', '4th Year', 'Bachelor of Science in Information Technology'),
('122300834', 'Ronnel Abuan', '4th Year', 'Bachelor of Science in Information Technology'),
('20250101', 'Kairos Molina', '4th Year', 'Bachelor of Science in Information Technology');

-- --------------------------------------------------------

--
-- Table structure for table `system_logs`
--

CREATE TABLE `system_logs` (
  `id` int(11) NOT NULL,
  `timestamp` datetime DEFAULT current_timestamp(),
  `type` enum('info','warning','error','critical') NOT NULL,
  `message` text NOT NULL,
  `module` varchar(50) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `resolved` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_status`
--

CREATE TABLE `system_status` (
  `id` int(11) NOT NULL,
  `component` varchar(50) NOT NULL,
  `status` enum('operational','issues','down','maintenance') NOT NULL DEFAULT 'operational',
  `last_check` datetime DEFAULT current_timestamp(),
  `response_time_ms` int(11) DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `uptime_percentage` decimal(5,2) DEFAULT 100.00,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_status`
--

INSERT INTO `system_status` (`id`, `component`, `status`, `last_check`, `response_time_ms`, `error_message`, `uptime_percentage`, `created_at`, `updated_at`) VALUES
(1, 'leave_management', 'operational', '2025-08-28 20:43:31', NULL, NULL, 100.00, '2025-08-28 20:43:31', '2025-08-28 20:43:31'),
(2, 'certificate_management', 'operational', '2025-08-28 20:43:31', NULL, NULL, 100.00, '2025-08-28 20:43:31', '2025-08-28 20:43:31'),
(3, 'attendance_system', 'operational', '2025-08-28 20:43:31', NULL, NULL, 100.00, '2025-08-28 20:43:31', '2025-08-28 20:43:31'),
(4, 'user_authentication', 'operational', '2025-08-28 20:43:31', NULL, NULL, 100.00, '2025-08-28 20:43:31', '2025-08-28 20:43:31'),
(5, 'database', 'operational', '2025-08-28 20:43:31', NULL, NULL, 100.00, '2025-08-28 20:43:31', '2025-08-28 20:43:31'),
(6, 'api_server', 'operational', '2025-08-28 20:43:31', NULL, NULL, 100.00, '2025-08-28 20:43:31', '2025-08-28 20:43:31');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `code` int(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` date DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role_id`, `department_id`, `code`, `created_at`, `updated_at`, `updated_by`) VALUES
('06766b19', 'Jv Manuel', 'johnmanuel01123@gmail.com', '$2b$10$BWRo3GBzPAUdvAfx3CTsO.liDSsSZ3oyH8wUBlf4Rpz/hog9mPdSq', 2, 1, 123456789, '2025-11-27 05:41:13', NULL, NULL),
('165ae2a5', 'Aries Caasi', 'aries@gmail.com', '$2b$10$RqtVN.ONd/pqEYOLlWQzqOFDb9uZOXPpICYKMqScSL1PLJBcc7zqi', 4, 3, 100001, '2025-11-04 07:07:45', NULL, NULL),
('1d35d98a', 'Mark Anthony Romero', 'sirmarkanthony2204@gmail.com', '$2b$10$UDxvAvQLOkAI7d4Wa0DGj.VYdkR.pYeL0I3qd0A8laCZQYG48cKZS', 3, 1, 2022042299, '2025-11-25 05:36:32', NULL, NULL),
('1f57430b', 'dean', 'dean@gmail.com', '$2b$10$A/9cS41h8G4KeKe1fyl20uHEgaLiML2bs2.rzUvxOEYeKYOxz5T2q', 4, 2, 1234, '2025-11-05 05:06:14', NULL, NULL),
('29c8e8ed', 'Ephraim De Vera', 'kurdapiopolikarpioephraim@gmail.com', '$2b$10$B7IK9PgsrZNneY5yCpgMQ.JrVIv0gPGV5bfiTpVXK6TCrwZvpveWW', 2, 2, 12345, '2025-11-25 05:50:20', NULL, NULL),
('329b45cb', 'staff', 'staff@gmail.com', '$2b$10$hjPZKuHStNxK31.7nH1vJeKKRqVTHiRqFZRms2RpQQ2kD7MfQPKwm', 3, NULL, 9845, '2025-11-26 11:55:55', NULL, NULL),
('3997e481', 'hr', 'hr@gmail.com', '$2b$10$rv0p0Iy3v16.S5sKGJgEsOnz34IFElOhwMOQ5CvunhX7fq5Ku0qVe', 1, NULL, 987, '2025-11-04 07:02:46', NULL, NULL),
('403267bd', 'Dether Domaoal', 'deedomaoal14@gmail.com', '$2b$10$r93biK2KldLbMIYdHNfJmOzBA6kbzFOE0hrwZbY9CK3LVmVmU.Tdy', 2, 2, 2147483647, '2025-11-26 03:38:41', NULL, NULL),
('60a92626', 'Kairos Molina', 'molinakairos@gmail.com', '$2b$10$rjfgL.P3CofReaKol94BtuqlNE1tbTbX0ABIFNbMxCsjGWtoTIVUW', 2, 1, 12345678, '2025-11-27 05:20:37', NULL, NULL),
('772e34cb', 'Angelo Alcedo', 'angeloalcedo116@gmail.com', '$2b$10$e19t4c.mjSlwu8vOq6CAG.CmJlM6O6ZgZlPfqVwBk2WJqiNMQ9Dl6', 2, 1, 12345678, '2025-11-25 06:00:42', NULL, NULL),
('84555ee2', 'Roberto Santiago', 'roberto@gmail.com', '$2b$10$DITbmKbmI.8sntyxhCZWNuo6Eb23Mi38HAw7oW.lbStdFw1Jtujbe', 2, 3, 12345678, '2025-11-25 07:40:40', NULL, NULL),
('981ffb72', 'Cherry Mae Notar', 'dacocoscherrymae237@gmail.com', '$2b$10$oW0O6LplINBF.ks1lvPEPuhfdoSlRymK3YdmibcPqOsXr4bj5GhKy', 3, 2, 2147483647, '2025-11-21 06:47:18', NULL, NULL),
('b00eb428', 'faculty', 'faculty@gmail.com', '$2b$10$Desy/QiH.JSadsFEioeD2eBCg/0vExoDS1GpF0L.missYLG3Y/h2C', 2, 1, 987, '2025-11-05 07:27:50', NULL, NULL),
('c99d2a6e', 'Ronnel Abuan', 'ronnelabuan0102@gmail.com', '$2b$10$VBpc5rIH/QaT3pczjNmEn.ejtRIDnppy/9BYZf2hMI1b4TmVyI46q', 2, 1, 122300834, '2025-11-25 07:28:25', '2025-11-25', NULL),
('ce06c191', 'Domingo Bacon', 'Bacon@gmail.com', '$2b$10$1kBKBz6IW.JbLGr8Bwr1oOY.mEQbmq9rws1Ya8Ik2WPZ3UrgbAn9a', 4, 5, 12345, '2025-11-26 07:36:04', NULL, NULL),
('dee47147', 'Jv Manuel', 'gwc.manuel@gmail.com', '$2b$10$itDX1koY27MB3bOvcvrM9.5i02lTOKT1H2FM7CGCnSg7JwDx/kT6S', 2, 1, 123456789, '2025-11-27 05:40:05', NULL, NULL),
('e00bef8a', 'Denzel Valdez', 'valdez@gmail.com', '$2b$10$DXLBVn6u.bgZnB36egUCa.5tTbgahgUN1Fe7itWRxKqdmnaBGNM/6', 4, 1, 12345, '2025-11-27 00:47:01', NULL, NULL),
('eb60a4c9', 'Joyce Raon', 'raonjoycer18@gmail.com', '$2b$10$3bsP9WasctHGjH.gfiimaeEyian3pt1swwNB.OOJuSZ12wNLfdan6', 2, 1, 10030167, '2025-11-26 03:18:45', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_attendance_user` (`user_id`);

--
-- Indexes for table `certificate_requests`
--
ALTER TABLE `certificate_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_certificate_requests_user` (`user_id`);

--
-- Indexes for table `certificate_types`
--
ALTER TABLE `certificate_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `department`
--
ALTER TABLE `department`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `evaluation`
--
ALTER TABLE `evaluation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_evaluation_teacher` (`teacher_id`);

--
-- Indexes for table `evaluation_answers`
--
ALTER TABLE `evaluation_answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_evaluation_answers_evaluation` (`evaluation_id`),
  ADD KEY `fk_evaluation_answers_question` (`question_id`),
  ADD KEY `fk_evaluation_answers_student` (`student_id`);

--
-- Indexes for table `evaluation_questions`
--
ALTER TABLE `evaluation_questions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leave_cred`
--
ALTER TABLE `leave_cred`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leave_request`
--
ALTER TABLE `leave_request`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_leave_request_user` (`user_id`);

--
-- Indexes for table `performance_metrics`
--
ALTER TABLE `performance_metrics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_metric_name` (`metric_name`),
  ADD KEY `idx_recorded_at` (`recorded_at`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`token`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_timestamp` (`timestamp`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_module` (`module`);

--
-- Indexes for table `system_status`
--
ALTER TABLE `system_status`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `component` (`component`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_users_role` (`role_id`),
  ADD KEY `fk_users_department` (`department_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `certificate_requests`
--
ALTER TABLE `certificate_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `certificate_types`
--
ALTER TABLE `certificate_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `department`
--
ALTER TABLE `department`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `evaluation`
--
ALTER TABLE `evaluation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `evaluation_answers`
--
ALTER TABLE `evaluation_answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=442;

--
-- AUTO_INCREMENT for table `evaluation_questions`
--
ALTER TABLE `evaluation_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `leave_cred`
--
ALTER TABLE `leave_cred`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `leave_request`
--
ALTER TABLE `leave_request`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `performance_metrics`
--
ALTER TABLE `performance_metrics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `system_status`
--
ALTER TABLE `system_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `fk_attendance_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `certificate_requests`
--
ALTER TABLE `certificate_requests`
  ADD CONSTRAINT `fk_certificate_requests_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `evaluation`
--
ALTER TABLE `evaluation`
  ADD CONSTRAINT `fk_evaluation_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `evaluation_answers`
--
ALTER TABLE `evaluation_answers`
  ADD CONSTRAINT `fk_evaluation_answers_evaluation` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_evaluation_answers_question` FOREIGN KEY (`question_id`) REFERENCES `evaluation_questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `leave_request`
--
ALTER TABLE `leave_request`
  ADD CONSTRAINT `fk_leave_request_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_department` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
