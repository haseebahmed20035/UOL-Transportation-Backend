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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-25 14:11:02
