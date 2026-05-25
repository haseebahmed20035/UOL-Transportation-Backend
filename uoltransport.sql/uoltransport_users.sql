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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-25 14:11:02
