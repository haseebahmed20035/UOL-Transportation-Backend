-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: uoltransport
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_notifications`
--

DROP TABLE IF EXISTS `admin_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `target_role` enum('all','student','driver') NOT NULL DEFAULT 'all',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_notifications`
--

LOCK TABLES `admin_notifications` WRITE;
/*!40000 ALTER TABLE `admin_notifications` DISABLE KEYS */;
INSERT INTO `admin_notifications` VALUES (1,'Test','Xyz','all',6,'2026-05-21 15:23:48'),(2,'Test','Xyz','all',6,'2026-05-21 15:24:15'),(3,'Test','Xyz','all',6,'2026-05-21 15:24:25'),(4,'Test','Xyz','all',6,'2026-05-21 15:26:22'),(5,'Chutti','Kal chutti hai guys','student',6,'2026-05-21 15:51:34'),(6,'Hey','Hh','student',6,'2026-05-21 16:28:40'),(7,'Helloooooo','Hdjdjd','all',6,'2026-05-21 16:35:31'),(8,'Hokidayy','Holidayy','all',6,'2026-05-21 16:54:07'),(9,'Bus','Bus driver aram kro','driver',6,'2026-05-21 16:56:26'),(10,'hi','hi','all',6,'2026-05-23 13:46:55'),(11,'hi','hi','all',6,'2026-05-23 13:47:39');
/*!40000 ALTER TABLE `admin_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (6,'Haseeb','admin@uol.com','1234','admin',6);
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bus_live_locations`
--

DROP TABLE IF EXISTS `bus_live_locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bus_live_locations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bus_id` int NOT NULL,
  `driver_id` int NOT NULL,
  `route_id` int NOT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `status` enum('running','ended') DEFAULT 'running',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=138 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bus_live_locations`
--

LOCK TABLES `bus_live_locations` WRITE;
/*!40000 ALTER TABLE `bus_live_locations` DISABLE KEYS */;
INSERT INTO `bus_live_locations` VALUES (1,28,6,14,31.4535924,74.2802264,'running','2026-05-20 19:10:57'),(2,28,6,14,31.4535924,74.2802264,'running','2026-05-20 19:10:58'),(3,28,6,14,31.4535924,74.2802264,'ended','2026-05-20 19:11:27'),(4,28,6,14,31.4536435,74.2802935,'running','2026-05-21 11:18:19'),(5,28,6,14,31.4536435,74.2802935,'running','2026-05-21 11:18:21'),(6,28,6,14,31.4536435,74.2802935,'ended','2026-05-21 11:18:32'),(7,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:44:52'),(8,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:44:53'),(9,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:45:01'),(10,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:45:10'),(11,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:45:18'),(12,28,6,14,31.4536542,74.2803082,'ended','2026-05-21 11:45:18'),(13,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:45:46'),(14,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:45:47'),(15,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:45:56'),(16,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:46:04'),(17,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:46:12'),(18,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:46:20'),(19,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:46:28'),(20,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:46:37'),(21,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:46:45'),(22,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:46:53'),(23,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:47:02'),(24,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:47:10'),(25,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:47:18'),(26,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:47:27'),(27,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:47:35'),(28,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:47:43'),(29,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:47:52'),(30,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:48:00'),(31,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:48:08'),(32,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:48:16'),(33,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:48:25'),(34,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:48:33'),(35,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:48:41'),(36,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:48:50'),(37,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:48:58'),(38,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:49:06'),(39,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:49:14'),(40,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:49:23'),(41,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:49:31'),(42,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:49:39'),(43,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:49:48'),(44,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:49:56'),(45,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:50:04'),(46,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:50:12'),(47,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:50:21'),(48,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:50:29'),(49,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:50:37'),(50,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:50:45'),(51,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:50:53'),(52,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:51:02'),(53,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:51:10'),(54,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:51:18'),(55,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:51:26'),(56,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:51:34'),(57,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:51:43'),(58,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:51:51'),(59,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:51:59'),(60,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:52:07'),(61,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:52:15'),(62,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:52:24'),(63,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:52:32'),(64,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:52:41'),(65,28,6,14,31.4536542,74.2803082,'ended','2026-05-21 11:52:45'),(66,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:52:50'),(67,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:52:51'),(68,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:52:59'),(69,28,6,14,31.4536542,74.2803082,'running','2026-05-21 11:53:07'),(70,28,6,14,31.4536542,74.2803082,'ended','2026-05-21 11:53:13'),(71,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:01:03'),(72,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:01:04'),(73,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:01:12'),(74,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:01:20'),(75,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:01:28'),(76,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:01:37'),(77,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:01:45'),(78,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:01:53'),(79,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:02:01'),(80,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:02:10'),(81,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:02:18'),(82,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:02:26'),(83,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:02:34'),(84,28,6,14,31.4536438,74.280295,'ended','2026-05-21 12:02:35'),(85,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:07:41'),(86,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:07:42'),(87,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:07:50'),(88,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:07:58'),(89,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:08:07'),(90,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:08:15'),(91,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:08:23'),(92,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:08:31'),(93,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:08:40'),(94,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:08:48'),(95,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:08:57'),(96,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:09:05'),(97,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:09:13'),(98,28,6,14,31.4536438,74.280295,'running','2026-05-21 12:09:21'),(99,28,6,14,31.4536438,74.280295,'ended','2026-05-21 12:09:27'),(100,28,6,14,31.4536638,74.2803134,'running','2026-05-22 20:56:14'),(101,28,6,14,31.4536638,74.2803134,'running','2026-05-22 20:56:15'),(102,28,6,14,31.4536638,74.2803134,'running','2026-05-22 20:56:23'),(103,28,6,14,31.4536638,74.2803134,'running','2026-05-22 20:56:32'),(104,28,6,14,31.4536638,74.2803134,'running','2026-05-22 20:56:40'),(105,28,6,14,31.4536638,74.2803134,'running','2026-05-22 20:56:49'),(106,28,6,14,31.4536638,74.2803134,'running','2026-05-22 20:56:57'),(107,28,6,14,31.4536638,74.2803134,'running','2026-05-22 20:57:06'),(108,28,6,14,31.4536638,74.2803134,'running','2026-05-22 20:57:14'),(109,28,6,14,31.4536638,74.2803134,'running','2026-05-22 20:57:23'),(110,28,6,14,31.4536638,74.2803134,'running','2026-05-22 20:57:31'),(111,28,6,14,31.4536638,74.2803134,'running','2026-05-22 20:57:39'),(112,28,6,14,31.4536638,74.2803134,'ended','2026-05-22 21:02:20'),(113,28,6,14,31.453742044977844,74.28030654788017,'running','2026-05-23 10:57:15'),(114,28,6,14,31.453715432435274,74.28023010492325,'running','2026-05-23 10:57:18'),(115,28,6,14,31.453715432435274,74.28023010492325,'ended','2026-05-23 10:57:24'),(116,28,6,14,31.45375675521791,74.28038894198835,'running','2026-05-23 12:27:31'),(117,28,6,14,31.453812494874,74.28039715625346,'running','2026-05-23 12:27:35'),(118,28,6,14,31.453981432132423,74.280393300578,'running','2026-05-23 12:27:47'),(119,28,6,14,31.453981432132423,74.280393300578,'ended','2026-05-23 12:27:51'),(120,28,6,14,31.453694268129766,74.28043118678033,'running','2026-05-23 13:50:26'),(121,28,6,14,31.453708852641284,74.2803882714361,'running','2026-05-23 13:50:30'),(122,28,6,14,31.453833365812898,74.28024074994028,'running','2026-05-23 13:50:42'),(123,28,6,14,31.453839652240276,74.28028550930321,'running','2026-05-23 13:50:53'),(124,28,6,14,31.45381735637784,74.28031459450722,'running','2026-05-23 13:51:03'),(125,28,6,14,31.453786133788526,74.2803829908371,'running','2026-05-23 13:51:14'),(126,28,6,14,31.45355714019388,74.2803946416825,'running','2026-05-23 13:52:28'),(127,28,6,14,31.45360386930406,74.28042221814394,'running','2026-05-23 13:52:50'),(128,28,6,14,31.45360386930406,74.28042221814394,'ended','2026-05-23 13:55:35'),(129,28,6,14,31.453762245364487,74.28025206550956,'running','2026-05-23 13:55:40'),(130,28,6,14,31.4536976,74.2803027,'running','2026-05-24 14:53:17'),(131,28,6,14,31.4536976,74.2803027,'ended','2026-05-24 14:53:48'),(132,28,6,14,31.4536976,74.2803027,'running','2026-05-24 14:53:50'),(133,28,6,14,31.4536976,74.2803027,'ended','2026-05-24 14:57:43'),(134,28,6,14,31.45372292,74.28043899,'running','2026-05-24 14:57:54'),(135,28,6,14,31.45372292,74.28043899,'ended','2026-05-24 16:17:38'),(136,28,6,14,31.45372839,74.28028346,'running','2026-05-24 16:45:59'),(137,28,6,14,31.45372839,74.28028346,'ended','2026-05-24 16:46:49');
/*!40000 ALTER TABLE `bus_live_locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bus_locations`
--

DROP TABLE IF EXISTS `bus_locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bus_locations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bus_id` int DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `recorded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bus_id` (`bus_id`),
  CONSTRAINT `bus_locations_ibfk_1` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bus_locations`
--

LOCK TABLES `bus_locations` WRITE;
/*!40000 ALTER TABLE `bus_locations` DISABLE KEYS */;
/*!40000 ALTER TABLE `bus_locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `buses`
--

DROP TABLE IF EXISTS `buses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `buses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bus_number` varchar(50) DEFAULT NULL,
  `route_id` int DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `driver_name` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive','maintenance','running') DEFAULT 'active',
  `route_name` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `driver_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `route_id` (`route_id`),
  CONSTRAINT `buses_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `buses`
--

LOCK TABLES `buses` WRITE;
/*!40000 ALTER TABLE `buses` DISABLE KEYS */;
INSERT INTO `buses` VALUES (28,'BUS-006',16,30,'Haseeb','active','Wanda town ÔåÆ UOL','2026-05-19 17:10:47',6),(29,'BUS-007',12,30,'Stan','active','Johar Town ÔåÆ UOL','2026-05-19 17:23:59',8),(30,'BUS-008',11,30,NULL,'active','Revenue Route','2026-05-24 16:48:16',NULL);
/*!40000 ALTER TABLE `buses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaints`
--

DROP TABLE IF EXISTS `complaints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaints` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` text NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` enum('pending','in_progress','resolved') DEFAULT 'pending',
  `admin_response` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `complaints_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaints`
--

LOCK TABLES `complaints` WRITE;
/*!40000 ALTER TABLE `complaints` DISABLE KEYS */;
INSERT INTO `complaints` VALUES (1,10,'Testing','Bus Delay','sjfnewfwijio',NULL,'resolved','We will try to resolve your issue','2026-05-13 15:53:49','2026-05-13 15:56:53'),(2,11,'Testing....','Bus Delay','Bus is delayed today',NULL,'resolved','...','2026-05-14 18:45:53','2026-05-14 18:46:41'),(3,13,'Seat issue in bus','Seat Issue','Seat',NULL,'resolved','Apparently issue resolved hojayega','2026-05-24 16:53:35','2026-05-24 16:56:55');
/*!40000 ALTER TABLE `complaints` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departure_timings`
--

DROP TABLE IF EXISTS `departure_timings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departure_timings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `route_id` int DEFAULT NULL,
  `departure_time` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departure_timings`
--

LOCK TABLES `departure_timings` WRITE;
/*!40000 ALTER TABLE `departure_timings` DISABLE KEYS */;
INSERT INTO `departure_timings` VALUES (1,2,'2:00 PM'),(2,2,'4:00 PM'),(3,2,'6:00 PM'),(4,11,'2:00 PM'),(5,11,'4:00 PM'),(6,11,'6:00 PM'),(7,12,'5:00PM'),(8,12,'7:00PM'),(9,12,'5:00 PM'),(10,13,'5:00 PM'),(11,11,'5:00 PM'),(12,11,'4:00PM');
/*!40000 ALTER TABLE `departure_timings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drivers`
--

DROP TABLE IF EXISTS `drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drivers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `is_available` tinyint DEFAULT '1',
  `bus_id` int DEFAULT NULL,
  `father_name` varchar(255) DEFAULT NULL,
  `cnic` varchar(50) DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'driver',
  `fcm_token` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drivers`
--

LOCK TABLES `drivers` WRITE;
/*!40000 ALTER TABLE `drivers` DISABLE KEYS */;
INSERT INTO `drivers` VALUES (6,'Haseeb','03349646308',0,NULL,'Asim Pervaiz','3520280711689','2026-05-15','70135821@student.uol.edu.pk','1234','driver',NULL),(8,'Stan','03054715344',0,29,'Asim','9565659594','2026-05-19','Saadan_pk@hotmail.com','e6g60nx4','driver',NULL);
/*!40000 ALTER TABLE `drivers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `memberships`
--

DROP TABLE IF EXISTS `memberships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `memberships` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int DEFAULT NULL,
  `plan_type` varchar(50) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `memberships_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `memberships`
--

LOCK TABLES `memberships` WRITE;
/*!40000 ALTER TABLE `memberships` DISABLE KEYS */;
/*!40000 ALTER TABLE `memberships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message` text,
  `type` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `method` varchar(50) DEFAULT NULL,
  `status` enum('pending','completed','failed') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,5000.00,'JazzCash','completed','2026-04-13 17:30:23'),(2,2,5000.00,'Easypaisa','completed','2026-04-13 17:30:23');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `route_stops`
--

DROP TABLE IF EXISTS `route_stops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `route_stops` (
  `id` int NOT NULL AUTO_INCREMENT,
  `route_id` int DEFAULT NULL,
  `stop_name` varchar(100) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `stop_order` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `route_id` (`route_id`),
  CONSTRAINT `route_stops_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `route_stops`
--

LOCK TABLES `route_stops` WRITE;
/*!40000 ALTER TABLE `route_stops` DISABLE KEYS */;
INSERT INTO `route_stops` VALUES (16,7,'Unknown Location',31.40333864,74.24979240,NULL),(17,7,'Unknown Location',31.42838761,74.25025575,NULL),(18,7,'Unknown Location',31.44663286,74.26906876,NULL),(19,7,'Unknown Location',31.45603944,74.27747916,NULL),(20,7,'Unknown Location',31.45390525,74.28168386,NULL),(21,8,'Unknown Location',31.43742500,74.26274814,NULL),(22,8,'Unknown Location',31.44327391,74.26792916,NULL),(23,8,'Unknown Location',31.45257758,74.27366473,NULL),(24,8,'Unknown Location',31.46065143,74.28409450,NULL),(29,10,'Unknown Location',31.52415829,74.36055589,NULL),(30,10,'Unknown Location',31.52551552,74.37157407,NULL),(31,10,'Unknown Location',31.52589991,74.37837549,NULL),(32,11,'Loading address...',31.45669324,74.27886318,NULL),(33,11,'Loading address...',31.45447698,74.27535016,NULL),(34,11,'Loading address...',31.44672010,74.26906105,NULL),(35,11,'Loading address...',31.42882647,74.25081331,NULL),(36,11,'Loading address...',31.39425618,74.24260508,NULL),(37,12,'Loading address...',31.45680020,74.27932017,NULL),(38,12,'Loading address...',31.45165489,74.27194040,NULL),(39,12,'Loading address...',31.41889729,74.24873795,NULL),(40,12,'Loading address...',31.39420553,74.24208641,NULL),(41,13,'Location Selected',31.44839824,74.28338841,NULL),(42,13,'Location Selected',31.44256624,74.27820336,NULL),(43,13,'Location Selected',31.41401857,74.26668797,NULL),(44,13,'Location Selected',31.39404440,74.24220677,NULL),(45,14,'Loading address...',31.45352972,74.28047352,NULL),(46,14,'Loading address...',31.45599682,74.27739233,NULL),(47,14,'Loading address...',31.42930939,74.25151806,NULL),(48,14,'Loading address...',31.39429425,74.24298864,NULL),(52,16,'Loading address...',31.44815054,74.28288281,NULL),(53,16,'Loading address...',31.44216835,74.27622154,NULL),(54,16,'Loading address...',31.43403026,74.26738936,NULL);
/*!40000 ALTER TABLE `route_stops` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `routes`
--

DROP TABLE IF EXISTS `routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `routes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `source` varchar(100) DEFAULT NULL,
  `destination` varchar(100) DEFAULT NULL,
  `estimated_time` varchar(50) DEFAULT NULL,
  `route_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `routes`
--

LOCK TABLES `routes` WRITE;
/*!40000 ALTER TABLE `routes` DISABLE KEYS */;
INSERT INTO `routes` VALUES (7,'Unknown Location','Unknown Location','29 mins','Route 1'),(8,'UOL','AWT','50 mins','Route2'),(10,'Unknown Location','Unknown Location','13 mins','Testing'),(11,'Revenue Society','UOL','36 mins','Revenue Route'),(12,'Johar Town','UOL','31 mins','Testing123'),(13,'Johar Town','UOL','30 mins','Testing'),(14,'Ayesha Masjid','UOL','31 mins','Testinggggg'),(16,'Wanda town','UOL','14 mins','Wanda town route');
/*!40000 ALTER TABLE `routes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedules`
--

DROP TABLE IF EXISTS `schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bus_id` int DEFAULT NULL,
  `route_id` int DEFAULT NULL,
  `arrival_time` time DEFAULT NULL,
  `departure_time` time DEFAULT NULL,
  `day` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bus_id` (`bus_id`),
  KEY `route_id` (`route_id`),
  CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`),
  CONSTRAINT `schedules_ibfk_2` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedules`
--

LOCK TABLES `schedules` WRITE;
/*!40000 ALTER TABLE `schedules` DISABLE KEYS */;
/*!40000 ALTER TABLE `schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reg_no` varchar(50) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `route_day` int DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_student_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (8,'70195993','AHS','active','2026-05-05 20:03:31',NULL,17),(10,'70135821','CS','active','2026-05-09 13:19:38',NULL,1),(11,'70135821','CS','active','2026-05-13 17:06:01',NULL,9),(12,'70135555','CS','active','2026-05-13 17:13:13',NULL,121),(13,'70137373','Accounting','active','2026-05-24 16:49:15',NULL,122);
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transport_requests`
--

DROP TABLE IF EXISTS `transport_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transport_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `route_id` int NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `request_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `approved_at` timestamp NULL DEFAULT NULL,
  `assigned_bus_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transport_requests`
--

LOCK TABLES `transport_requests` WRITE;
/*!40000 ALTER TABLE `transport_requests` DISABLE KEYS */;
INSERT INTO `transport_requests` VALUES (1,10,7,'rejected','2026-05-09 13:39:04',NULL,NULL),(2,10,8,'approved','2026-05-09 13:40:27','2026-05-09 13:48:32',NULL),(3,10,8,'approved','2026-05-10 19:51:38','2026-05-10 19:52:00',NULL),(4,10,8,'approved','2026-05-10 19:52:53','2026-05-10 19:53:17',NULL),(5,10,8,'approved','2026-05-10 20:31:08','2026-05-10 20:31:31',22),(6,10,11,'approved','2026-05-11 20:42:37','2026-05-11 20:43:04',25),(7,11,8,'approved','2026-05-13 17:49:43','2026-05-13 17:50:02',22),(8,11,12,'approved','2026-05-14 18:42:40','2026-05-14 18:44:51',26),(9,11,14,'approved','2026-05-23 13:49:11','2026-05-23 13:49:33',28),(10,13,12,'approved','2026-05-24 16:51:57','2026-05-24 16:52:40',29);
/*!40000 ALTER TABLE `transport_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_notifications`
--

DROP TABLE IF EXISTS `user_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `notification_id` int NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `is_read` tinyint DEFAULT '0',
  `shown_in_panel` tinyint DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_notification` (`notification_id`,`user_id`),
  CONSTRAINT `user_notifications_ibfk_1` FOREIGN KEY (`notification_id`) REFERENCES `admin_notifications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_notifications`
--

LOCK TABLES `user_notifications` WRITE;
/*!40000 ALTER TABLE `user_notifications` DISABLE KEYS */;
INSERT INTO `user_notifications` VALUES (1,4,'1',0,0,'2026-05-21 15:26:22'),(2,4,'8',0,0,'2026-05-21 15:26:22'),(4,4,'17',0,0,'2026-05-21 15:26:22'),(5,4,'18',0,0,'2026-05-21 15:26:22'),(6,4,'99',0,0,'2026-05-21 15:26:22'),(7,4,'120',0,0,'2026-05-21 15:26:22'),(8,4,'121',0,0,'2026-05-21 15:26:22'),(9,5,'1',0,0,'2026-05-21 15:51:34'),(11,5,'17',0,0,'2026-05-21 15:51:34'),(12,5,'18',0,0,'2026-05-21 15:51:34'),(13,5,'99',0,0,'2026-05-21 15:51:34'),(14,5,'120',0,0,'2026-05-21 15:51:34'),(15,5,'121',0,0,'2026-05-21 15:51:34'),(16,6,'1',0,0,'2026-05-21 16:28:40'),(18,6,'17',0,0,'2026-05-21 16:28:40'),(19,6,'18',0,0,'2026-05-21 16:28:40'),(20,6,'99',0,0,'2026-05-21 16:28:40'),(21,6,'120',0,0,'2026-05-21 16:28:40'),(22,6,'121',0,0,'2026-05-21 16:28:40'),(23,7,'1',0,0,'2026-05-21 16:35:31'),(24,7,'8',0,0,'2026-05-21 16:35:31'),(26,7,'17',0,0,'2026-05-21 16:35:31'),(27,7,'18',0,0,'2026-05-21 16:35:31'),(28,7,'99',0,0,'2026-05-21 16:35:31'),(29,7,'120',0,0,'2026-05-21 16:35:31'),(30,7,'121',0,0,'2026-05-21 16:35:31'),(31,8,'1',0,0,'2026-05-21 16:54:07'),(33,8,'17',0,0,'2026-05-21 16:54:07'),(34,8,'18',0,0,'2026-05-21 16:54:07'),(35,8,'99',0,0,'2026-05-21 16:54:07'),(36,8,'120',0,0,'2026-05-21 16:54:07'),(37,8,'121',0,0,'2026-05-21 16:54:07'),(39,8,'driver_7',0,0,'2026-05-21 16:54:07'),(41,9,'driver_7',0,0,'2026-05-21 16:56:26'),(42,10,'1',0,0,'2026-05-23 13:46:55'),(44,10,'17',0,0,'2026-05-23 13:46:55'),(45,10,'99',0,0,'2026-05-23 13:46:55'),(46,10,'120',0,0,'2026-05-23 13:46:55'),(47,10,'121',0,0,'2026-05-23 13:46:55'),(49,10,'driver_7',0,0,'2026-05-23 13:46:55'),(50,10,'driver_8',0,0,'2026-05-23 13:46:55'),(51,11,'1',0,0,'2026-05-23 13:47:39'),(53,11,'17',0,0,'2026-05-23 13:47:39'),(54,11,'99',0,0,'2026-05-23 13:47:39'),(55,11,'120',0,0,'2026-05-23 13:47:39'),(56,11,'121',0,0,'2026-05-23 13:47:39'),(57,11,'driver_6',1,0,'2026-05-23 13:47:39'),(58,11,'driver_7',0,0,'2026-05-23 13:47:39'),(59,11,'driver_8',0,0,'2026-05-23 13:47:39');
/*!40000 ALTER TABLE `user_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `fcm_token` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=123 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'student@uol.edu.pk','1234','student','Haseeb Ahmed',NULL),(6,'admin@uol.com','1234','admin','Admin','cOmy_u2sR4GsyVlXUnogUZ:APA91bFTE6YQGe9hxlMyWIMQaq3wCTjdbLF9OVRvdey7Iy5C_GwsFXoIYa5BctNB8JrrcoDR1T51ZflFsTDvU5J4zgvohkOk1xOwWEnYAFu-Q0CEW19IF9Q'),(8,'driver@uol.com','1234','driver','Driver','dlLOJfcjQxiTfFNSD8gZeG:APA91bHae1Z43jhSD_cYV7Jm7kmMXx8rh6gVDaGi9Mo2bxKeZrxAHVrzp2SaPkv9K2B1X0KwgqHWNrgTntC-ZQADgmSZeazHgXnEe6DzfTnGxzIb8m_k1Uo'),(9,'student@uol.com','1234','student','Haseeb Ahmed','cOmy_u2sR4GsyVlXUnogUZ:APA91bFTE6YQGe9hxlMyWIMQaq3wCTjdbLF9OVRvdey7Iy5C_GwsFXoIYa5BctNB8JrrcoDR1T51ZflFsTDvU5J4zgvohkOk1xOwWEnYAFu-Q0CEW19IF9Q'),(17,'t6334668@gmail.com','1234','student','Hadia Virk',NULL),(99,'temp99@gmail.com','1234','student','Temp User',NULL),(120,'temp120@gmail.com','1234','student','Temp User 120',NULL),(121,'haseeb.ahmed2003@hotmail.com','1234456','student','Haseeb Mughal',NULL),(122,'Asim-299@hotmail.com','wwfoafxe','student','Asim pervaiz',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'uoltransport'
--

--
-- Dumping routines for database 'uoltransport'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-25 13:23:49
