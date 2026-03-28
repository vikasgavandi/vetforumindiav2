-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jan 22, 2026 at 03:11 AM
-- Server version: 8.0.44-0ubuntu0.24.04.1
-- PHP Version: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `vetforumindia`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `eventDate` date DEFAULT NULL,
  `description` text NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `priority` int DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `eventDate`, `description`, `photo`, `link`, `isActive`, `priority`, `createdAt`, `updatedAt`) VALUES
(1, 'Pet Health & Wellness Expo (PHAW Expo) - Mumbai', '2025-11-08', 'The Pet Health & Wellness Expo in Mumbai is a premier event dedicated to enhancing the health and well-being of pets. Taking place from November 8 to November 9, 2025, this expo brings together pet owners, veterinarians, and industry experts under one roof to explore the latest advancements in pet care. Attendees can expect a wide range of informative seminars, interactive workshops, and engaging demonstrations focused on nutrition, preventive care, and innovative health products for pets.', NULL, NULL, 1, 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(2, 'International Conference of ISAGB 2025 - Kolkata', '2025-11-13', 'The International Conference of the Indian Society of Animal Genetics and Breeding (ISAGB) is set to take place at the Biswa Bangla Convention Centre in Kolkata, India. This event, organized by the West Bengal University of Animal and Fishery Sciences, promises to be a significant gathering for professionals in the field of animal sciences. The conference is themed around \"Precision Animal Breeding through Genomics, Artificial Intelligence, and Machine Learning,\" aiming to explore the latest advancements and innovations in animal breeding practices.', NULL, NULL, 1, 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42');

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `expertId` int NOT NULL,
  `appointmentDate` datetime NOT NULL,
  `duration` int DEFAULT '30',
  `consultationFee` decimal(10,2) NOT NULL,
  `reasonForConsultation` text NOT NULL,
  `status` enum('pending','confirmed','rescheduled','completed','cancelled') DEFAULT 'pending',
  `paymentStatus` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `paymentId` varchar(255) DEFAULT NULL,
  `zoomMeetingId` varchar(255) DEFAULT NULL,
  `zoomJoinUrl` text,
  `zoomStartUrl` text,
  `zoomPassword` varchar(255) DEFAULT NULL,
  `doctorNotes` text,
  `prescriptions` json DEFAULT NULL,
  `followUpRequired` tinyint(1) DEFAULT '0',
  `followUpDate` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blogs`
--

CREATE TABLE `blogs` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `content` longtext NOT NULL,
  `excerpt` text,
  `featuredImage` varchar(255) DEFAULT NULL,
  `images` json DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `readTime` int DEFAULT NULL,
  `viewsCount` int DEFAULT '0',
  `likesCount` int DEFAULT '0',
  `commentsCount` int DEFAULT '0',
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `publishedAt` datetime DEFAULT NULL,
  `authorId` int NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blogs`
--

INSERT INTO `blogs` (`id`, `title`, `subtitle`, `content`, `excerpt`, `featuredImage`, `images`, `tags`, `readTime`, `viewsCount`, `likesCount`, `commentsCount`, `status`, `publishedAt`, `authorId`, `slug`, `createdAt`, `updatedAt`) VALUES
(1, 'Advanced Veterinary Nutrition: A Comprehensive Guide', 'Understanding the fundamentals of animal nutrition for optimal health outcomes', '\n# Introduction to Veterinary Nutrition\n\nVeterinary nutrition plays a crucial role in maintaining animal health and preventing diseases. This comprehensive guide explores the latest research and best practices in animal nutrition.\n\n## Key Nutritional Requirements\n\n### Proteins\nProteins are essential for growth, tissue repair, and immune function. Different species have varying protein requirements based on their life stage, activity level, and health status.\n\n### Carbohydrates\nWhile not essential for all animals, carbohydrates provide readily available energy and support digestive health in many species.\n\n### Fats and Lipids\nEssential fatty acids support skin health, coat quality, and various metabolic processes.\n\n## Species-Specific Considerations\n\n### Small Animals\nDogs and cats have unique nutritional needs that differ significantly from their wild counterparts.\n\n### Large Animals\nCattle, horses, and other large animals require specialized feeding programs to maintain optimal health and productivity.\n\n## Conclusion\n\nProper nutrition is the foundation of veterinary medicine. By understanding these principles, veterinarians can provide better care and improve animal welfare.\n        ', '\n# Introduction to Veterinary Nutrition\n\nVeterinary nutrition plays a crucial role in maintaining animal health and preventing diseases. This comprehensive guide explores the latest research and best ...', 'nutrition-guide.jpg', '[]', '[\"nutrition\", \"veterinary\", \"health\", \"guide\"]', 1, 0, 0, 0, 'published', '2026-01-18 10:40:42', 1, 'advanced-veterinary-nutrition-a-comprehensive-guide', '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(2, 'Emergency Veterinary Procedures: Life-Saving Techniques', 'Critical procedures every veterinarian should master', '\n# Emergency Veterinary Medicine\n\nEmergency situations require quick thinking and precise execution. This article covers essential life-saving procedures that every veterinarian should be prepared to perform.\n\n## Cardiopulmonary Resuscitation (CPR)\n\n### Assessment\n- Check for responsiveness\n- Evaluate breathing and pulse\n- Position the animal appropriately\n\n### Chest Compressions\n- Rate: 100-120 compressions per minute\n- Depth: 1/3 to 1/2 of chest width\n- Allow complete chest recoil\n\n## Airway Management\n\n### Endotracheal Intubation\nStep-by-step procedure for securing the airway in emergency situations.\n\n### Oxygen Therapy\nProper administration and monitoring of oxygen therapy.\n\n## Shock Management\n\nUnderstanding different types of shock and appropriate treatment protocols.\n\n## Conclusion\n\nEmergency preparedness saves lives. Regular training and practice of these procedures is essential for all veterinary professionals.\n        ', '\n# Emergency Veterinary Medicine\n\nEmergency situations require quick thinking and precise execution. This article covers essential life-saving procedures that every veterinarian should be prepared to ...', 'emergency-vet.jpg', '[]', '[\"emergency\", \"procedures\", \"veterinary\", \"critical-care\"]', 1, 0, 0, 0, 'published', '2026-01-18 10:40:42', 1, 'emergency-veterinary-procedures-life-saving-techniques', '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(3, 'The Future of Veterinary Medicine: Technology and Innovation', 'How emerging technologies are revolutionizing animal healthcare', '\n# Technology in Veterinary Medicine\n\nThe veterinary field is experiencing rapid technological advancement. From AI-powered diagnostics to telemedicine, technology is transforming how we care for animals.\n\n## Artificial Intelligence and Machine Learning\n\n### Diagnostic Imaging\nAI algorithms are improving the accuracy and speed of radiographic interpretation.\n\n### Predictive Analytics\nMachine learning models help predict disease outbreaks and treatment outcomes.\n\n## Telemedicine\n\n### Remote Consultations\nExpanding access to veterinary care through virtual consultations.\n\n### Monitoring Devices\nWearable technology for continuous health monitoring.\n\n## Surgical Innovations\n\n### Minimally Invasive Procedures\nAdvanced laparoscopic and arthroscopic techniques.\n\n### Robotic Surgery\nThe potential for robotic-assisted procedures in veterinary medicine.\n\n## Digital Health Records\n\nComprehensive electronic health records improving patient care coordination.\n\n## Conclusion\n\nTechnology continues to enhance our ability to provide excellent veterinary care. Staying current with these innovations is crucial for modern practice.\n        ', '\n# Technology in Veterinary Medicine\n\nThe veterinary field is experiencing rapid technological advancement. From AI-powered diagnostics to telemedicine, technology is transforming how we care for anim...', 'vet-technology.jpg', '[]', '[\"technology\", \"innovation\", \"AI\", \"telemedicine\", \"future\"]', 1, 0, 0, 0, 'published', '2026-01-18 10:40:42', 1, 'the-future-of-veterinary-medicine-technology-and-innovation', '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(4, 'Draft: Upcoming Research in Animal Behavior', 'Exploring new frontiers in understanding animal psychology', '\n# Animal Behavior Research\n\nThis is a draft article about upcoming research in animal behavior. The content is still being developed and will be published once complete.\n\n## Current Research Areas\n\n- Cognitive abilities in different species\n- Social behavior patterns\n- Stress responses and welfare indicators\n\n## Methodology\n\nResearch methodologies being employed in current studies.\n\n## Preliminary Findings\n\nEarly results from ongoing research projects.\n\nThis article is still in development and will be updated with more comprehensive information.\n        ', '\n# Animal Behavior Research\n\nThis is a draft article about upcoming research in animal behavior. The content is still being developed and will be published once complete.\n\n## Current Research Areas\n\n-...', 'animal-behavior.jpg', '[]', '[\"research\", \"behavior\", \"psychology\", \"draft\"]', 1, 0, 0, 0, 'draft', NULL, 1, 'draft-upcoming-research-in-animal-behavior', '2026-01-18 10:40:42', '2026-01-18 10:40:42');

-- --------------------------------------------------------

--
-- Table structure for table `blog_interactions`
--

CREATE TABLE `blog_interactions` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `blogId` int NOT NULL,
  `type` enum('like','comment','view') NOT NULL,
  `content` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `consultations`
--

CREATE TABLE `consultations` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `expertId` int NOT NULL,
  `reasonForConsultation` text NOT NULL,
  `status` enum('pending','paid','scheduled','completed','cancelled') DEFAULT 'pending',
  `paymentStatus` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `consultationDate` datetime DEFAULT NULL,
  `notes` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doctor_availability`
--

CREATE TABLE `doctor_availability` (
  `id` int NOT NULL,
  `expertId` int NOT NULL,
  `dayOfWeek` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `consultationFee` decimal(10,2) NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `doctor_availability`
--

INSERT INTO `doctor_availability` (`id`, `expertId`, `dayOfWeek`, `startTime`, `endTime`, `consultationFee`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'monday', '09:00:00', '17:00:00', 1500.00, 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(2, 1, 'wednesday', '09:00:00', '17:00:00', 1500.00, 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(3, 1, 'friday', '09:00:00', '17:00:00', 1500.00, 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(4, 2, 'tuesday', '10:00:00', '18:00:00', 2000.00, 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(5, 2, 'thursday', '10:00:00', '18:00:00', 2000.00, 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(6, 2, 'saturday', '09:00:00', '15:00:00', 2000.00, 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(7, 3, 'monday', '08:00:00', '16:00:00', 2500.00, 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(8, 3, 'wednesday', '08:00:00', '16:00:00', 2500.00, 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(9, 3, 'friday', '08:00:00', '16:00:00', 2500.00, 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(10, 4, 'tuesday', '11:00:00', '19:00:00', 1200.00, 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(11, 4, 'thursday', '11:00:00', '19:00:00', 1200.00, 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(12, 4, 'saturday', '10:00:00', '16:00:00', 1200.00, 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42');

-- --------------------------------------------------------

--
-- Table structure for table `experts`
--

CREATE TABLE `experts` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `designation` varchar(255) NOT NULL,
  `qualification` text,
  `specialization` varchar(255) NOT NULL,
  `yearsOfExperience` int NOT NULL,
  `publications` json DEFAULT NULL,
  `awards` json DEFAULT NULL,
  `professionalPhoto` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `experts`
--

INSERT INTO `experts` (`id`, `name`, `designation`, `qualification`, `specialization`, `yearsOfExperience`, `publications`, `awards`, `professionalPhoto`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'Dr. Jaishankar, N', 'Professor', NULL, 'Animal Nutritionist', 20, '[\"Advanced Animal Nutrition\", \"Feed Technology in Livestock\"]', '[\"Best Research Award 2020\", \"Excellence in Teaching 2019\"]', NULL, 1, '2026-01-18 10:38:45', '2026-01-18 10:38:45'),
(2, 'Dr. Meera Reddy', 'Senior Veterinarian', NULL, 'Small Animal Surgery', 15, '[\"Minimally Invasive Surgery in Dogs\"]', '[\"Surgical Excellence Award 2021\"]', NULL, 1, '2026-01-18 10:38:45', '2026-01-18 10:38:45'),
(3, 'Dr. Rajesh Gupta', 'Consultant', NULL, 'Large Animal Medicine', 12, '[\"Cattle Health Management\"]', '[\"Rural Veterinary Service Award 2020\"]', NULL, 1, '2026-01-18 10:38:45', '2026-01-18 10:38:45'),
(4, 'Dr. Venkanagouda Doddagoudar', 'Associate Professor (I/C)', 'BVSc & AH, MVSc, PhD', 'Veterinary Gynaecologist', 20, '[\"Reproductive Technologies in Cattle\", \"Gynaecological Disorders in Small Animals\", \"Advances in Veterinary Obstetrics\"]', '[\"Research Excellence Award\", \"Best Clinical Practice Award\", \"Innovation in Veterinary Medicine\"]', NULL, 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(5, 'Dr. Manjunatha, D. R', 'Associate Professor & Head', 'BVSc & AH, MVSc, PhD', 'Veterinary Surgeon', 20, '[\"Surgical Techniques in Large Animals\", \"Minimally Invasive Surgery in Veterinary Practice\", \"Emergency Surgical Procedures\"]', '[\"Surgical Excellence Award\", \"Leadership in Veterinary Education\", \"Outstanding Service Award\"]', NULL, 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(6, 'Dr. Vinayaka, M. N.', 'Veterinary Clinician', 'BVSc & AH, MVSc', 'Veterinary Surgeon', 7, '[\"Clinical Case Studies in Small Animal Surgery\", \"Diagnostic Imaging in Veterinary Practice\", \"Pain Management in Veterinary Surgery\"]', '[\"Young Veterinarian Award\", \"Clinical Excellence Recognition\", \"Best Case Presentation Award\"]', NULL, 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42');

-- --------------------------------------------------------

--
-- Table structure for table `job_vacancies`
--

CREATE TABLE `job_vacancies` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `organization` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `jobDescription` text NOT NULL,
  `designation` varchar(255) NOT NULL,
  `salary` varchar(255) DEFAULT NULL,
  `qualification` text NOT NULL,
  `noticePeriod` varchar(255) DEFAULT NULL,
  `postDate` datetime NOT NULL,
  `contactEmail` varchar(255) DEFAULT NULL,
  `contactPhone` varchar(255) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `expiryDate` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `content` text NOT NULL,
  `photos` json DEFAULT NULL,
  `likesCount` int DEFAULT '0',
  `commentsCount` int DEFAULT '0',
  `sharesCount` int DEFAULT '0',
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `userId`, `content`, `photos`, `likesCount`, `commentsCount`, `sharesCount`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'bnw dn ', '[]', 1, 4, 0, 1, '2026-01-18 10:46:59', '2026-01-18 12:00:53'),
(2, 6, 'We are done with code now we are extremist ', '[]', 1, 1, 0, 1, '2026-01-18 11:59:54', '2026-01-21 03:22:55');

-- --------------------------------------------------------

--
-- Table structure for table `post_interactions`
--

CREATE TABLE `post_interactions` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `postId` int NOT NULL,
  `type` enum('like','comment','share') NOT NULL,
  `content` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `post_interactions`
--

INSERT INTO `post_interactions` (`id`, `userId`, `postId`, `type`, `content`, `createdAt`, `updatedAt`) VALUES
(1, 1, 1, 'comment', 'wdbhcjhwbd', '2026-01-18 10:47:06', '2026-01-18 10:47:06'),
(2, 1, 1, 'comment', 'weknf2weuj', '2026-01-18 10:47:16', '2026-01-18 10:47:16'),
(4, 6, 1, 'comment', 'sdsd', '2026-01-18 10:52:48', '2026-01-18 10:52:48'),
(5, 6, 1, 'comment', 'sadsdsd', '2026-01-18 10:52:56', '2026-01-18 10:52:56'),
(9, 6, 1, 'like', NULL, '2026-01-18 12:00:53', '2026-01-18 12:00:53'),
(11, 8, 2, 'like', NULL, '2026-01-21 03:22:40', '2026-01-21 03:22:40'),
(12, 8, 2, 'comment', 'Hello', '2026-01-21 03:22:55', '2026-01-21 03:22:55');

-- --------------------------------------------------------

--
-- Table structure for table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` int NOT NULL,
  `question` text NOT NULL,
  `optionA` varchar(255) NOT NULL,
  `optionB` varchar(255) NOT NULL,
  `optionC` varchar(255) NOT NULL,
  `optionD` varchar(255) NOT NULL,
  `correctAnswer` enum('A','B','C','D') NOT NULL,
  `explanation` text,
  `category` varchar(100) DEFAULT 'Veterinary Nutrition',
  `difficulty` enum('Easy','Medium','Hard') DEFAULT 'Medium',
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quizzes`
--

INSERT INTO `quizzes` (`id`, `question`, `optionA`, `optionB`, `optionC`, `optionD`, `correctAnswer`, `explanation`, `category`, `difficulty`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'What is the primary source of energy for most animals?', 'Proteins', 'Carbohydrates', 'Fats', 'Vitamins', 'B', 'Carbohydrates are the primary source of readily available energy for most animals.', 'Veterinary Nutrition', 'Medium', 1, '2025-12-31 05:06:35', '2025-12-31 05:06:35'),
(2, 'Which vitamin is essential for blood clotting?', 'Vitamin A', 'Vitamin D', 'Vitamin K', 'Vitamin C', 'C', 'Vitamin K is essential for the synthesis of clotting factors in the liver.', 'Veterinary Nutrition', 'Medium', 1, '2025-12-31 05:06:35', '2025-12-31 05:06:35');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_attempts`
--

CREATE TABLE `quiz_attempts` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `quizCardId` int NOT NULL,
  `startTime` datetime NOT NULL,
  `endTime` datetime DEFAULT NULL,
  `score` int DEFAULT '0',
  `totalQuestions` int NOT NULL,
  `correctAnswers` int DEFAULT '0',
  `timeTaken` int DEFAULT NULL,
  `status` enum('in_progress','completed','abandoned') DEFAULT 'in_progress',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quiz_cards`
--

CREATE TABLE `quiz_cards` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(255) DEFAULT 'General',
  `difficulty` enum('Easy','Medium','Hard') NOT NULL DEFAULT 'Medium',
  `duration` int NOT NULL,
  `numberOfQuestions` int NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `passingScore` int NOT NULL DEFAULT '50',
  `status` enum('upcoming','ongoing','completed','archived') NOT NULL DEFAULT 'upcoming',
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `instructions` text,
  `isActive` tinyint(1) DEFAULT '1',
  `createdBy` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quiz_cards`
--

INSERT INTO `quiz_cards` (`id`, `title`, `description`, `category`, `difficulty`, `duration`, `numberOfQuestions`, `price`, `passingScore`, `status`, `startDate`, `endDate`, `instructions`, `isActive`, `createdBy`, `createdAt`, `updatedAt`) VALUES
(1, 'Veterinary Nutrition Fundamentals', 'Test your knowledge of basic animal nutrition principles and dietary requirements.', 'General', 'Medium', 30, 20, 0.00, 50, 'upcoming', NULL, NULL, NULL, 1, 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(2, 'Small Animal Medicine Quiz', 'Comprehensive quiz covering small animal diseases, diagnosis, and treatment.', 'General', 'Medium', 45, 25, 0.00, 50, 'upcoming', NULL, NULL, NULL, 1, 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(3, 'Large Animal Surgery Challenge', 'Advanced quiz on surgical procedures and techniques for large animals.', 'General', 'Medium', 60, 30, 0.00, 50, 'upcoming', NULL, NULL, NULL, 1, 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(4, 'Veterinary Pharmacology Speed Test', 'Quick-fire questions on veterinary drugs, dosages, and contraindications.', 'General', 'Medium', 15, 15, 0.00, 50, 'upcoming', NULL, NULL, NULL, 1, 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_questions`
--

CREATE TABLE `quiz_questions` (
  `id` int NOT NULL,
  `questionNumber` int NOT NULL,
  `question` text NOT NULL,
  `optionA` text NOT NULL,
  `optionB` text NOT NULL,
  `optionC` text NOT NULL,
  `optionD` text NOT NULL,
  `correctAnswer` enum('A','B','C','D') NOT NULL,
  `explanation` text,
  `category` varchar(255) DEFAULT 'General',
  `difficulty` enum('Easy','Medium','Hard') NOT NULL DEFAULT 'Medium',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quiz_questions`
--

INSERT INTO `quiz_questions` (`id`, `questionNumber`, `question`, `optionA`, `optionB`, `optionC`, `optionD`, `correctAnswer`, `explanation`, `category`, `difficulty`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'In ruminant nutrition, the major site for microbial synthesis of B-vitamins is:', 'Abomasum', 'Rumen', 'Small intestine', 'Cecum', 'B', 'The rumen is the primary site for microbial fermentation and B-vitamin synthesis in ruminants.', 'Ruminant Nutrition', 'Easy', 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(2, 2, 'The first limiting amino acid in a typical maize-soybean meal-based broiler diet is:', 'Methionine', 'Lysine', 'Threonine', 'Tryptophan', 'A', 'Methionine is typically the first limiting amino acid in maize-soybean based poultry diets.', 'Poultry Nutrition', 'Medium', 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(3, 3, 'Which of the following represents the correct order of energy evaluation systems from gross to net energy?', 'GE → NE → DE → ME', 'GE → DE → ME → NE', 'DE → GE → NE → ME', 'NE → ME → DE → GE', 'B', 'The correct order is Gross Energy (GE) → Digestible Energy (DE) → Metabolizable Energy (ME) → Net Energy (NE).', 'Energy Systems', 'Medium', 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(4, 4, 'In ruminants, the ratio of acetate: propionate: butyrate in the rumen under a high-forage diet typically approximates:', '40:40:20', '60:30:10', '70:20:10', '50:40:10', 'C', 'High-forage diets typically produce a VFA ratio of approximately 70:20:10 (acetate:propionate:butyrate).', 'Ruminant Nutrition', 'Medium', 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(5, 5, 'The main precursor for milk fat synthesis in ruminants is:', 'Propionate', 'Acetate', 'Butyrate', 'Lactate', 'B', 'Acetate is the primary precursor for milk fat synthesis, providing acetyl-CoA units.', 'Ruminant Nutrition', 'Easy', 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(6, 6, 'In poultry, the major site of lipid absorption is:', 'Crop', 'Proventriculus', 'Duodenum', 'Jejunum', 'D', 'The jejunum is the primary site for lipid absorption in poultry.', 'Poultry Nutrition', 'Medium', 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(7, 7, 'The Kjeldahl method estimates crude protein based on:', 'Total amino acid concentration', 'Nitrogen content multiplied by a factor', 'Peptide bond concentration', 'True protein content only', 'B', 'The Kjeldahl method measures nitrogen content and multiplies by 6.25 to estimate crude protein.', 'Protein Analysis', 'Easy', 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(8, 8, 'The metabolizable energy (ME) of ruminant feed can be predicted from digestible organic matter (DOM) using the formula:', 'ME = 0.014 × DOM (g/kg DM)', 'ME = 0.016 × DOM (g/kg DM)', 'ME = 0.018 × DOM (g/kg DM)', 'ME = 0.020 × DOM (g/kg DM)', 'B', 'ME = 0.016 × DOM (g/kg DM) is the standard formula for predicting metabolizable energy in ruminants.', 'Energy Systems', 'Hard', 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(9, 9, 'Non-protein nitrogen (NPN) sources like urea should not exceed what percentage of total dietary nitrogen in cattle rations?', '15%', '25%', '35%', '45%', 'B', 'NPN sources should not exceed 25-30% of total dietary nitrogen to avoid toxicity and inefficiency.', 'Ruminant Nutrition', 'Medium', 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(10, 10, 'In poultry, the enzyme responsible for hydrolysis of phytic acid to release phosphorus is:', 'Lipase', 'Phytase', 'Amylase', 'Protease', 'B', 'Phytase enzyme breaks down phytic acid to release bound phosphorus in poultry diets.', 'Poultry Nutrition', 'Easy', 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(11, 11, 'Among volatile fatty acids, the one that contributes most to gluconeogenesis in ruminants is:', 'Acetate', 'Propionate', 'Butyrate', 'Isobutyrate', 'B', 'Propionate is the primary gluconeogenic VFA, serving as a major glucose precursor.', 'Ruminant Nutrition', 'Medium', 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(12, 12, 'The biological value (BV) of a protein depends primarily on:', 'Protein solubility', 'Digestibility and amino acid balance', 'Crude protein percentage', 'Fiber content of the feed', 'B', 'Biological value depends on protein digestibility and amino acid composition matching animal requirements.', 'Protein Quality', 'Medium', 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(13, 13, 'Which mineral deficiency causes perosis (slipped tendon) in poultry?', 'Zinc', 'Manganese', 'Selenium', 'Copper', 'B', 'Manganese deficiency is the primary cause of perosis in growing poultry.', 'Mineral Nutrition', 'Medium', 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(14, 14, 'The primary limiting factor for microbial protein synthesis in the rumen is:', 'Crude fiber', 'Available energy (ATP)', 'Ammonia-N concentration', 'Water content', 'B', 'Available energy (ATP) from carbohydrate fermentation is the primary limiting factor for microbial protein synthesis.', 'Ruminant Nutrition', 'Hard', 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(15, 15, 'The heat increment of feeding is lowest for which nutrient class?', 'Carbohydrates', 'Fats', 'Proteins', 'Fiber', 'B', 'Fats have the lowest heat increment of feeding as they require less energy for digestion and metabolism.', 'Energy Metabolism', 'Medium', 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(16, 16, 'The term \"bypass protein\" refers to:', 'Protein not utilized by rumen microbes and digested in the abomasum', 'Undigested protein excreted in feces', 'Microbial protein synthesized in rumen', 'Protein degraded rapidly in rumen', 'A', 'Bypass protein escapes rumen degradation and is digested post-ruminally in the abomasum and intestine.', 'Protein Nutrition', 'Easy', 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(17, 17, 'A diet with a cation-anion difference (DCAD) that is too low before calving in dairy cows can lead to:', 'Milk fever', 'Ketosis', 'Acidosis', 'Laminitis', 'A', 'Low DCAD diets before calving help prevent milk fever by improving calcium metabolism.', 'Dairy Nutrition', 'Hard', 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(18, 18, 'The main anti-nutritional factor in raw soybean is:', 'Aflatoxin', 'Trypsin inhibitor', 'Gossypol', 'Tannin', 'B', 'Trypsin inhibitors in raw soybeans reduce protein digestibility and are destroyed by heat treatment.', 'Feed Processing', 'Medium', 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(19, 19, 'The metabolizable energy requirement for maintenance in cattle is primarily influenced by:', 'Age only', 'Body surface area', 'Crude protein intake', 'Volatile fatty acid profile', 'B', 'Maintenance energy requirements are primarily related to body surface area for heat loss regulation.', 'Energy Requirements', 'Medium', 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(20, 20, 'In poultry feed formulation, apparent metabolizable energy corrected for nitrogen balance (AMEn) is used instead of AME because:', 'Nitrogen retention affects gross energy', 'Nitrogen excretion contributes to energy loss', 'Nitrogen balance stabilizes crude fiber effects', 'AMEn eliminates variability due to protein deposition', 'D', 'AMEn corrects for energy lost in nitrogen excretion and reduces variability due to protein deposition.', 'Poultry Nutrition', 'Hard', 1, '2026-01-18 10:40:42', '2026-01-18 10:40:42');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `mobile` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `isVeterinarian` tinyint(1) NOT NULL DEFAULT '0',
  `isAdmin` tinyint(1) NOT NULL DEFAULT '0',
  `veterinarianType` enum('Student','Graduated') DEFAULT NULL,
  `yearOfStudy` enum('1st','2nd','3rd','4th','Final year/Internship') DEFAULT NULL,
  `studentId` varchar(50) DEFAULT NULL,
  `college` varchar(255) DEFAULT NULL,
  `university` varchar(255) DEFAULT NULL,
  `veterinarianState` varchar(255) DEFAULT NULL,
  `bio` text,
  `currentPosition` enum('Student','Government Officer','Government Teaching Professional','Private Organization','Clinician') DEFAULT NULL,
  `positionDetails` text,
  `publications` json DEFAULT NULL,
  `awards` json DEFAULT NULL,
  `profilePhoto` varchar(255) DEFAULT NULL,
  `vetRegNo` varchar(50) DEFAULT NULL,
  `qualification` varchar(200) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `firstName`, `lastName`, `email`, `mobile`, `state`, `password`, `isVeterinarian`, `isAdmin`, `veterinarianType`, `yearOfStudy`, `studentId`, `college`, `university`, `veterinarianState`, `bio`, `currentPosition`, `positionDetails`, `publications`, `awards`, `profilePhoto`, `vetRegNo`, `qualification`, `createdAt`, `updatedAt`) VALUES
(1, 'Dr. Priya', 'Sharma', 'vet@test.com', '9876543210', 'Maharashtra', '$2a$10$E94aC9z4Wo76N/ZI9llEweu3AdzrKPLGhbbPYBSNraV8VNHQc6eZG', 1, 1, 'Graduated', NULL, NULL, NULL, 'Mumbai Veterinary College', 'Maharashtra', 'Experienced veterinary surgeon specializing in small animals', 'Clinician', NULL, '[\"Advanced Surgical Techniques in Small Animals\"]', '[\"Best Veterinarian Award 2023\"]', NULL, 'VET2024001', 'MVSc in Veterinary Surgery', '2026-01-18 10:38:45', '2026-01-18 10:38:45'),
(2, 'Rahul', 'Patel', 'student@test.com', '9876543211', 'Gujarat', '$2a$10$E967A4JP2Y0FWHs/iZGe3.a6heroo8NsRP9T5T/Dl7BK8TqrTHMzy', 1, 0, 'Student', '3rd', 'STU001', 'Gujarat Veterinary College', 'Gujarat Agricultural University', 'Gujarat', 'Third-year veterinary student passionate about animal welfare', 'Student', NULL, '[]', '[]', NULL, NULL, NULL, '2026-01-18 10:38:45', '2026-01-18 10:38:45'),
(3, 'Anjali', 'Singh', 'nonvet@test.com', '9876543212', 'Delhi', '$2a$10$xg1unOsEQL3o89vNI/OZQuidJvh2rS6CoHNLUYyXErwsreGMi3YGe', 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, 'Pet owner and animal lover', NULL, NULL, '[]', '[]', NULL, NULL, NULL, '2026-01-18 10:38:45', '2026-01-18 10:38:45'),
(4, 'Dr. Amit', 'Kumar', 'admin@test.com', '9876543213', 'Karnataka', '$2a$10$OJbSQmmV3yNUC5sEv4V.U.uWFiuGclZ5Cuct3frLmxBNV6NwMtvhG', 1, 1, 'Graduated', NULL, NULL, NULL, NULL, 'Karnataka', 'Veterinary administrator and researcher', 'Government Officer', NULL, '[]', '[]', NULL, 'VET2024002', 'PhD in Veterinary Pathology', '2026-01-18 10:38:45', '2026-01-18 10:38:45'),
(5, 'Admin', 'User', 'admin@vetforumindia.com', '9999999999', 'Maharashtra', '$2a$12$rRqjwpCvzmIoUAwM0mU2Mul9seNqw4bXt52SLDzv3OOyREhsGx7OG', 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', NULL, NULL, NULL, '2026-01-18 10:40:42', '2026-01-18 10:40:42'),
(6, 'Vikas', 'Gavandi', 'vikasgavandi.dev@gmail.com', '9172656043', 'Maharashtra', '$2a$10$yDanJ.eKczeMl.2YxTf0eeTKegHhmJ9Vx2fgV7dx/kljW0AhJIvOO', 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', NULL, NULL, NULL, '2026-01-18 10:52:24', '2026-01-18 10:52:24'),
(7, 'jayesh', 'mishra', 'jayesh@gmail.com', '9876543210', 'Maharashtra', '$2a$10$jB1txOZW2TjdnY3D8WfYveEECnsUCJMgG1k2zIC3GHogRzsWICjDW', 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', NULL, NULL, NULL, '2026-01-18 11:37:53', '2026-01-18 11:37:53'),
(8, 'Dr. Preetam ', 'Sangam', 'preetamsangam07@gmail.com', '7795659574', 'Karnataka', '$2a$10$EPEooOinsMSeaIHf5zCxyOg99QF71w.Rnds3rNXDu9J5aVq3DyJgi', 1, 0, 'Graduated', NULL, NULL, NULL, NULL, 'Karnataka', NULL, NULL, NULL, '[]', '[]', NULL, 'VET2024003', 'BVSc & AH, MVSc', '2026-01-21 03:21:40', '2026-01-21 03:21:40');

-- --------------------------------------------------------

--
-- Table structure for table `user_documents`
--

CREATE TABLE `user_documents` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `documentPath` varchar(255) NOT NULL,
  `documentName` varchar(255) DEFAULT NULL,
  `documentType` varchar(100) DEFAULT NULL,
  `fileSize` int DEFAULT NULL COMMENT 'File size in bytes',
  `isVerified` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `user_quiz_progress`
--

CREATE TABLE `user_quiz_progress` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `currentQuestionNumber` int NOT NULL DEFAULT '1',
  `totalQuestionsAnswered` int NOT NULL DEFAULT '0',
  `correctAnswers` int NOT NULL DEFAULT '0',
  `isCompleted` tinyint(1) NOT NULL DEFAULT '0',
  `startedAt` datetime NOT NULL,
  `completedAt` datetime DEFAULT NULL,
  `answers` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `currentQuestionId` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `expertId` (`expertId`);

--
-- Indexes for table `blogs`
--
ALTER TABLE `blogs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `authorId` (`authorId`);

--
-- Indexes for table `blog_interactions`
--
ALTER TABLE `blog_interactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `blog_interactions_user_id_blog_id_type` (`userId`,`blogId`,`type`),
  ADD KEY `blogId` (`blogId`);

--
-- Indexes for table `consultations`
--
ALTER TABLE `consultations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `expertId` (`expertId`);

--
-- Indexes for table `doctor_availability`
--
ALTER TABLE `doctor_availability`
  ADD PRIMARY KEY (`id`),
  ADD KEY `expertId` (`expertId`);

--
-- Indexes for table `experts`
--
ALTER TABLE `experts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `job_vacancies`
--
ALTER TABLE `job_vacancies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `post_interactions`
--
ALTER TABLE `post_interactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `postId` (`postId`);

--
-- Indexes for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `quizCardId` (`quizCardId`);

--
-- Indexes for table `quiz_cards`
--
ALTER TABLE `quiz_cards`
  ADD PRIMARY KEY (`id`),
  ADD KEY `createdBy` (`createdBy`);

--
-- Indexes for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `questionNumber` (`questionNumber`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_documents`
--
ALTER TABLE `user_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `user_quiz_progress`
--
ALTER TABLE `user_quiz_progress`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `currentQuestionId` (`currentQuestionId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `blogs`
--
ALTER TABLE `blogs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `blog_interactions`
--
ALTER TABLE `blog_interactions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `consultations`
--
ALTER TABLE `consultations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `doctor_availability`
--
ALTER TABLE `doctor_availability`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `experts`
--
ALTER TABLE `experts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `job_vacancies`
--
ALTER TABLE `job_vacancies`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `post_interactions`
--
ALTER TABLE `post_interactions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quiz_cards`
--
ALTER TABLE `quiz_cards`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `user_documents`
--
ALTER TABLE `user_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_quiz_progress`
--
ALTER TABLE `user_quiz_progress`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`expertId`) REFERENCES `experts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `blogs`
--
ALTER TABLE `blogs`
  ADD CONSTRAINT `blogs_ibfk_1` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `blog_interactions`
--
ALTER TABLE `blog_interactions`
  ADD CONSTRAINT `blog_interactions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `blog_interactions_ibfk_2` FOREIGN KEY (`blogId`) REFERENCES `blogs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `consultations`
--
ALTER TABLE `consultations`
  ADD CONSTRAINT `consultations_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `consultations_ibfk_2` FOREIGN KEY (`expertId`) REFERENCES `experts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `doctor_availability`
--
ALTER TABLE `doctor_availability`
  ADD CONSTRAINT `doctor_availability_ibfk_1` FOREIGN KEY (`expertId`) REFERENCES `experts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `post_interactions`
--
ALTER TABLE `post_interactions`
  ADD CONSTRAINT `post_interactions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `post_interactions_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD CONSTRAINT `quiz_attempts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `quiz_attempts_ibfk_2` FOREIGN KEY (`quizCardId`) REFERENCES `quiz_cards` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `quiz_cards`
--
ALTER TABLE `quiz_cards`
  ADD CONSTRAINT `quiz_cards_ibfk_1` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_documents`
--
ALTER TABLE `user_documents`
  ADD CONSTRAINT `user_documents_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_quiz_progress`
--
ALTER TABLE `user_quiz_progress`
  ADD CONSTRAINT `user_quiz_progress_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_quiz_progress_ibfk_2` FOREIGN KEY (`currentQuestionId`) REFERENCES `quiz_questions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
