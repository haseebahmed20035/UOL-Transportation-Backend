-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: uoltransport
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-25 14:11:01
