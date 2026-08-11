-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: hebratech
-- ------------------------------------------------------
-- Server version	8.0.44

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
-- Table structure for table `_migracion_log`
--

DROP TABLE IF EXISTS `_migracion_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_migracion_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bloque` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ejecutado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('OK','ERROR') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'OK',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Registro de ejecución de migraciones HebraTech';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_migracion_log`
--

LOCK TABLES `_migracion_log` WRITE;
/*!40000 ALTER TABLE `_migracion_log` DISABLE KEYS */;
INSERT INTO `_migracion_log` VALUES (1,'INICIO','Inicio de migración completa HebraTech v1.0','2026-06-08 13:10:06','OK'),(2,'BLOQUE 1','Eliminada productos.cantidad; agregado UNIQUE en inventario.idProducto','2026-06-08 13:10:06','OK'),(3,'BLOQUE 2','devoluciones: FK a ordenes/clientes agregada; columnas redundantes eliminadas','2026-06-08 13:10:06','OK'),(4,'INICIO','Inicio de migración completa HebraTech v1.0','2026-06-08 13:10:15','OK'),(5,'INICIO','Inicio de migración completa HebraTech v1.0','2026-06-08 13:10:19','OK');
/*!40000 ALTER TABLE `_migracion_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asignacion_tareas`
--

DROP TABLE IF EXISTS `asignacion_tareas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignacion_tareas` (
  `idAsignacion` int NOT NULL AUTO_INCREMENT,
  `idTarea` int NOT NULL,
  `idOperario` int NOT NULL COMMENT 'FK a operarios',
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fechaAsignacion` date NOT NULL,
  `fechaInicio` date NOT NULL,
  `fechaFinalizacion` date DEFAULT NULL,
  `estado` enum('Pendiente','En Progreso','Completada','Cancelada') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Pendiente',
  `prioridad` enum('Baja','Media','Alta','Urgente') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Media',
  `horasEstimadas` decimal(5,2) NOT NULL,
  `tipoPrenda` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cantidadPrendas` int DEFAULT NULL,
  `horasReales` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`idAsignacion`),
  KEY `fk_asig_tarea` (`idTarea`),
  KEY `fk_asig_operario` (`idOperario`),
  CONSTRAINT `fk_asig_operario` FOREIGN KEY (`idOperario`) REFERENCES `operarios` (`idOperario`) ON UPDATE CASCADE,
  CONSTRAINT `fk_asig_tarea` FOREIGN KEY (`idTarea`) REFERENCES `tareas` (`idTarea`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignacion_tareas`
--

LOCK TABLES `asignacion_tareas` WRITE;
/*!40000 ALTER TABLE `asignacion_tareas` DISABLE KEYS */;
INSERT INTO `asignacion_tareas` VALUES (1,1,1,'Cortar tela algodón lote 500 camisetas Éxito','2026-01-10','2026-01-11','2026-01-12','Completada','Alta',16.00,NULL,NULL,15.50),(2,2,2,'Confeccionar 300 pantalones clásicos Koaj temporada verano','2026-01-15','2026-01-16','2026-06-23','Pendiente','Alta',24.00,NULL,NULL,NULL),(3,3,2,'Ensamblar 200 chaquetas denim colección Eliot','2026-01-20','2026-01-21','2026-06-23','Pendiente','Urgente',32.00,NULL,NULL,NULL),(4,4,3,'Bordar diseño exclusivo en 150 blusas Arturo Calle','2026-02-01','2026-02-02',NULL,'En Progreso','Alta',20.00,NULL,NULL,NULL),(5,5,4,'Aplicar estampado reflectivo en 400 bermudas Tennis','2026-02-10','2026-02-11',NULL,'Pendiente','Media',18.00,NULL,NULL,NULL),(6,6,5,'Planchar pliegues en 180 faldas midi Punto Blanco','2026-02-20','2026-02-21',NULL,'Pendiente','Media',12.00,NULL,NULL,NULL),(7,7,6,'Inspección final de calidad en 220 vestidos Studio F','2026-03-01','2026-03-02',NULL,'Pendiente','Baja',10.00,NULL,NULL,NULL),(8,2,2,'pantalon','2026-07-29','2026-07-29',NULL,'Pendiente','Urgente',50.00,'Pantalones',300,NULL),(9,8,5,'Rematar pantalones','2026-07-30','2026-07-30',NULL,'Pendiente','Baja',15.00,'Pantalones',100,NULL);
/*!40000 ALTER TABLE `asignacion_tareas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audi_ordenes`
--

DROP TABLE IF EXISTS `audi_ordenes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audi_ordenes` (
  `idAuditoria` int NOT NULL AUTO_INCREMENT,
  `idOrden` int DEFAULT NULL,
  `accion` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `datos_antes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `datos_despues` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `usuario_bd` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  PRIMARY KEY (`idAuditoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audi_ordenes`
--

LOCK TABLES `audi_ordenes` WRITE;
/*!40000 ALTER TABLE `audi_ordenes` DISABLE KEYS */;
/*!40000 ALTER TABLE `audi_ordenes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audi_tareas`
--

DROP TABLE IF EXISTS `audi_tareas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audi_tareas` (
  `idAuditoria` int NOT NULL AUTO_INCREMENT,
  `idTarea` int DEFAULT NULL,
  `accion` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `datos_antes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `datos_despues` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `usuario_bd` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  PRIMARY KEY (`idAuditoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audi_tareas`
--

LOCK TABLES `audi_tareas` WRITE;
/*!40000 ALTER TABLE `audi_tareas` DISABLE KEYS */;
/*!40000 ALTER TABLE `audi_tareas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audi_usuarios`
--

DROP TABLE IF EXISTS `audi_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audi_usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int DEFAULT NULL,
  `accion` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `datos_antes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `datos_despues` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `usuario_bd` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audi_usuarios`
--

LOCK TABLES `audi_usuarios` WRITE;
/*!40000 ALTER TABLE `audi_usuarios` DISABLE KEYS */;
INSERT INTO `audi_usuarios` VALUES (1,3,'UPDATE','Nombre: Lucía, Apellido: Vargas, Correo: lucia.vargas@hebratech.com','Nombre: Laura, Apellido: Gomez, Correo: lucia.vargas@hebratech.com','root@localhost','2026-03-19 07:37:27'),(2,36,'INSERT',NULL,'Nombre: Jorge, Apellido: Almanza, Correo: jorgeformulaone@gmail.com','root@localhost','2026-06-17 16:23:45'),(3,37,'INSERT',NULL,'Nombre: Almacenes, Apellido: Exito, Correo: exitocompras@gmail.com','root@localhost','2026-06-21 11:52:54'),(4,36,'UPDATE','Nombre: Jorge, Apellido: Almanza, Correo: jorgeformulaone@gmail.com','Nombre: Jorge, Apellido: Almanza, Correo: jorgeformulaone@gmail.com','root@localhost','2026-06-21 11:59:03'),(5,38,'INSERT',NULL,'Nombre: Prueba, Apellido: Grupo, Correo: grupo@hebratech.com','root@localhost','2026-06-22 21:57:09'),(6,38,'UPDATE','Nombre: Prueba, Apellido: Grupo, Correo: grupo@hebratech.com','Nombre: Prueba, Apellido: Grupo, Correo: grupo@hebratech.com','root@localhost','2026-06-22 21:58:26'),(7,4,'UPDATE','Nombre: Carlos, Apellido: Méndez, Correo: carlos.mendez@hebratech.com','Nombre: Carlos, Apellido: Méndez, Correo: carlos.mendez@hebratech.com','root@localhost','2026-06-23 16:10:00'),(8,39,'INSERT',NULL,'Nombre: Juan, Apellido: Castro, Correo: juan.castro@hebratech.com','root@localhost','2026-06-23 17:19:17'),(9,39,'UPDATE','Nombre: Juan, Apellido: Castro, Correo: juan.castro@hebratech.com','Nombre: Juan, Apellido: Castro, Correo: juan.castro@hebratech.com','root@localhost','2026-06-23 17:25:46');
/*!40000 ALTER TABLE `audi_usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',3,'add_permission'),(6,'Can change permission',3,'change_permission'),(7,'Can delete permission',3,'delete_permission'),(8,'Can view permission',3,'view_permission'),(9,'Can add group',2,'add_group'),(10,'Can change group',2,'change_group'),(11,'Can delete group',2,'delete_group'),(12,'Can view group',2,'view_group'),(13,'Can add user',4,'add_user'),(14,'Can change user',4,'change_user'),(15,'Can delete user',4,'delete_user'),(16,'Can view user',4,'view_user'),(17,'Can add content type',5,'add_contenttype'),(18,'Can change content type',5,'change_contenttype'),(19,'Can delete content type',5,'delete_contenttype'),(20,'Can view content type',5,'view_contenttype'),(21,'Can add session',6,'add_session'),(22,'Can change session',6,'change_session'),(23,'Can delete session',6,'delete_session'),(24,'Can view session',6,'view_session'),(25,'Can add cliente',7,'add_cliente'),(26,'Can change cliente',7,'change_cliente'),(27,'Can delete cliente',7,'delete_cliente'),(28,'Can view cliente',7,'view_cliente'),(29,'Can add orden',8,'add_orden'),(30,'Can change orden',8,'change_orden'),(31,'Can delete orden',8,'delete_orden'),(32,'Can view orden',8,'view_orden'),(33,'Can add producto',9,'add_producto'),(34,'Can change producto',9,'change_producto'),(35,'Can delete producto',9,'delete_producto'),(36,'Can view producto',9,'view_producto'),(37,'Can add usuario',10,'add_usuario'),(38,'Can change usuario',10,'change_usuario'),(39,'Can delete usuario',10,'delete_usuario'),(40,'Can view usuario',10,'view_usuario'),(41,'Can add prenda',12,'add_prenda'),(42,'Can change prenda',12,'change_prenda'),(43,'Can delete prenda',12,'delete_prenda'),(44,'Can view prenda',12,'view_prenda'),(45,'Can add orden produccion',11,'add_ordenproduccion'),(46,'Can change orden produccion',11,'change_ordenproduccion'),(47,'Can delete orden produccion',11,'delete_ordenproduccion'),(48,'Can view orden produccion',11,'view_ordenproduccion'),(49,'Can add usuario',13,'add_usuario'),(50,'Can change usuario',13,'change_usuario'),(51,'Can delete usuario',13,'delete_usuario'),(52,'Can view usuario',13,'view_usuario'),(53,'Can add produccion',14,'add_produccion'),(54,'Can change produccion',14,'change_produccion'),(55,'Can delete produccion',14,'delete_produccion'),(56,'Can view produccion',14,'view_produccion'),(57,'Can add producto',15,'add_producto'),(58,'Can change producto',15,'change_producto'),(59,'Can delete producto',15,'delete_producto'),(60,'Can view producto',15,'view_producto'),(61,'Can add asignacion tarea',16,'add_asignaciontarea'),(62,'Can change asignacion tarea',16,'change_asignaciontarea'),(63,'Can delete asignacion tarea',16,'delete_asignaciontarea'),(64,'Can view asignacion tarea',16,'view_asignaciontarea'),(65,'Can add cliente',17,'add_cliente'),(66,'Can change cliente',17,'change_cliente'),(67,'Can delete cliente',17,'delete_cliente'),(68,'Can view cliente',17,'view_cliente'),(69,'Can add operario',18,'add_operario'),(70,'Can change operario',18,'change_operario'),(71,'Can delete operario',18,'delete_operario'),(72,'Can view operario',18,'view_operario'),(73,'Can add orden',19,'add_orden'),(74,'Can change orden',19,'change_orden'),(75,'Can delete orden',19,'delete_orden'),(76,'Can view orden',19,'view_orden'),(77,'Can add tarea',20,'add_tarea'),(78,'Can change tarea',20,'change_tarea'),(79,'Can delete tarea',20,'delete_tarea'),(80,'Can view tarea',20,'view_tarea'),(81,'Can add usuario',21,'add_usuario'),(82,'Can change usuario',21,'change_usuario'),(83,'Can delete usuario',21,'delete_usuario'),(84,'Can view usuario',21,'view_usuario'),(85,'Can add password reset token',22,'add_passwordresettoken'),(86,'Can change password reset token',22,'change_passwordresettoken'),(87,'Can delete password reset token',22,'delete_passwordresettoken'),(88,'Can view password reset token',22,'view_passwordresettoken'),(89,'Can add incidencia',23,'add_incidencia'),(90,'Can change incidencia',23,'change_incidencia'),(91,'Can delete incidencia',23,'delete_incidencia'),(92,'Can view incidencia',23,'view_incidencia'),(93,'Can add proveedor',24,'add_proveedor'),(94,'Can change proveedor',24,'change_proveedor'),(95,'Can delete proveedor',24,'delete_proveedor'),(96,'Can view proveedor',24,'view_proveedor'),(97,'Can add asignacion tarea',25,'add_asignaciontarea'),(98,'Can change asignacion tarea',25,'change_asignaciontarea'),(99,'Can delete asignacion tarea',25,'delete_asignaciontarea'),(100,'Can view asignacion tarea',25,'view_asignaciontarea'),(101,'Can add incidencia',26,'add_incidencia'),(102,'Can change incidencia',26,'change_incidencia'),(103,'Can delete incidencia',26,'delete_incidencia'),(104,'Can view incidencia',26,'view_incidencia'),(105,'Can add operario',27,'add_operario'),(106,'Can change operario',27,'change_operario'),(107,'Can delete operario',27,'delete_operario'),(108,'Can view operario',27,'view_operario'),(109,'Can add tarea',28,'add_tarea'),(110,'Can change tarea',28,'change_tarea'),(111,'Can delete tarea',28,'delete_tarea'),(112,'Can view tarea',28,'view_tarea'),(113,'Can add usuario',29,'add_usuario'),(114,'Can change usuario',29,'change_usuario'),(115,'Can delete usuario',29,'delete_usuario'),(116,'Can view usuario',29,'view_usuario');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user`
--

DROP TABLE IF EXISTS `auth_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `first_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `last_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(254) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user`
--

LOCK TABLES `auth_user` WRITE;
/*!40000 ALTER TABLE `auth_user` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_groups`
--

DROP TABLE IF EXISTS `auth_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_groups`
--

LOCK TABLES `auth_user_groups` WRITE;
/*!40000 ALTER TABLE `auth_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_user_permissions`
--

DROP TABLE IF EXISTS `auth_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_user_permissions`
--

LOCK TABLES `auth_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `auth_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `idCliente` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL COMMENT 'FK a usuarios',
  `tipoCliente` enum('Natural','Empresa') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Natural',
  `empresa` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Nombre empresa (si aplica)',
  `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Nombre del contacto principal del cliente',
  `correoElectronico` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Correo de contacto del cliente (puede diferir del usuario)',
  `telefono` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Teléfono de contacto',
  `ciudad` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Ciudad de ubicación del cliente',
  `direccion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Dirección de entrega',
  `nit` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'NIT o cédula tributaria',
  `estado` enum('activo','inactivo','bloqueado') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`idCliente`),
  UNIQUE KEY `uq_cliente_usuario` (`idUsuario`),
  KEY `idx_cliente_nit` (`nit`),
  CONSTRAINT `fk_cli_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,37,'Empresa','Almacenes Éxito S.A.','Tati Zuluaga',NULL,'301258945','Bogota','Calle 47B Sur #24B - 33','860502316-1','activo'),(2,11,'Empresa','Koaj Colombia',NULL,NULL,NULL,NULL,NULL,'830115498-2','activo'),(3,12,'Empresa','Manufacturas Eliot',NULL,NULL,NULL,NULL,NULL,'900456789-0','activo'),(4,13,'Natural','Arturo Calle',NULL,NULL,NULL,NULL,NULL,'800234567-1','activo'),(5,14,'Empresa','Tennis S.A.',NULL,NULL,NULL,NULL,NULL,'890123456-3','activo'),(6,15,'Natural','Punto Blanco',NULL,NULL,NULL,NULL,NULL,'701234567-2','activo'),(7,16,'Empresa','Studio F',NULL,NULL,NULL,NULL,NULL,'901098765-4','activo'),(9,40,'Natural',NULL,'Jorginho Soares','almanzajorgedaniel96@gmail.com',NULL,NULL,NULL,NULL,'activo');
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devolucion_inventario`
--

DROP TABLE IF EXISTS `devolucion_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devolucion_inventario` (
  `idDevInv` int NOT NULL AUTO_INCREMENT,
  `idDevolucion` int NOT NULL,
  `idInventario` int NOT NULL,
  `cantidadDevuelta` int NOT NULL COMMENT 'Unidades de este producto en esta devolución',
  `razon` enum('Talla incorrecta','Defecto de fabricacion','Daño en transporte','Error de pedido','Color incorrecto','Producto incompleto','Otro') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Otro',
  `descripcionRazon` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `condicion` enum('Reutilizable','Requiere reparacion','No reutilizable') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Reutilizable' COMMENT 'Determina si puede re-ingresar al inventario',
  `reingresoInventario` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 = reingresada al stock, 0 = pendiente',
  `fechaRegistro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`idDevInv`),
  UNIQUE KEY `uq_devolucion_inventario` (`idDevolucion`,`idInventario`),
  KEY `fk_dinv_devolucion` (`idDevolucion`),
  KEY `fk_dinv_inventario` (`idInventario`),
  CONSTRAINT `fk_dinv_devolucion` FOREIGN KEY (`idDevolucion`) REFERENCES `devoluciones` (`idDevolucion`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_dinv_inventario` FOREIGN KEY (`idInventario`) REFERENCES `inventario` (`idInventario`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla pivote M:M entre devoluciones e inventario.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devolucion_inventario`
--

LOCK TABLES `devolucion_inventario` WRITE;
/*!40000 ALTER TABLE `devolucion_inventario` DISABLE KEYS */;
INSERT INTO `devolucion_inventario` VALUES (1,1,1,20,'Defecto de fabricacion','Costuras abiertas en hombros. Requieren repaso en overlock.','Requiere reparacion',0,'2026-03-26 22:50:30','Lote #1 Éxito — pendiente de reparación'),(2,2,2,10,'Talla incorrecta','Cliente recibió talla 34 solicitando talla 32. Prendas en perfecto estado.','Reutilizable',1,'2026-03-26 22:50:30','Reingresadas al stock. Ver salida_devolucion.'),(3,3,3,5,'Defecto de fabricacion','Estampado corrido, pigmento fijado incorrectamente.','No reutilizable',0,'2026-03-26 22:50:30','Pendiente decisión de descarte o donación'),(4,4,4,8,'Defecto de fabricacion','Cremalleras YKK fallidas en bolsillos laterales.','Requiere reparacion',0,'2026-03-26 22:50:30','Enviadas a taller para reemplazo de cremallera'),(5,5,5,15,'Defecto de fabricacion','Elástico de cintura pierde tensión tras primer lavado.','Requiere reparacion',0,'2026-03-26 22:50:30','Posible reclamación a proveedor de elásticos'),(6,6,6,6,'Defecto de fabricacion','Bordado en pecho con hilo faltante en puntos del logo AC.','Requiere reparacion',0,'2026-03-26 22:50:30','Operario de bordado asignado para corrección'),(7,7,7,12,'Defecto de fabricacion','Pliegues deformados por exceso de temperatura en planchado.','Requiere reparacion',0,'2026-03-26 22:50:30','Evaluando si el daño en poliéster es reversible');
/*!40000 ALTER TABLE `devolucion_inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devoluciones`
--

DROP TABLE IF EXISTS `devoluciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devoluciones` (
  `idDevolucion` int NOT NULL AUTO_INCREMENT,
  `idOrden` int DEFAULT NULL COMMENT 'FK a la orden de origen de la devolución',
  `idCliente` int DEFAULT NULL COMMENT 'Desnormalización para consultas rápidas por cliente',
  `fechaDevolucion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estadoDevolucion` enum('Recibida','Inspeccionada','Rechazada','Completada') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Recibida',
  PRIMARY KEY (`idDevolucion`),
  KEY `fk_dev_orden` (`idOrden`),
  KEY `fk_dev_cliente` (`idCliente`),
  CONSTRAINT `fk_dev_cliente` FOREIGN KEY (`idCliente`) REFERENCES `clientes` (`idCliente`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_dev_orden` FOREIGN KEY (`idOrden`) REFERENCES `ordenes` (`idOrden`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devoluciones`
--

LOCK TABLES `devoluciones` WRITE;
/*!40000 ALTER TABLE `devoluciones` DISABLE KEYS */;
INSERT INTO `devoluciones` VALUES (1,1,1,'2026-01-26 09:00:00','Inspeccionada'),(2,2,2,'2026-01-31 10:00:00','Completada'),(3,7,7,'2026-02-16 11:00:00','Recibida'),(4,3,3,'2026-02-11 08:30:00','Inspeccionada'),(5,5,5,'2026-02-26 14:00:00','Recibida'),(6,4,4,'2026-03-06 09:30:00','Recibida'),(7,6,6,'2026-03-19 10:00:00','Recibida');
/*!40000 ALTER TABLE `devoluciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `object_repr` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `model` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(16,'administrador','asignaciontarea'),(17,'administrador','cliente'),(23,'administrador','incidencia'),(18,'administrador','operario'),(19,'administrador','orden'),(20,'administrador','tarea'),(21,'administrador','usuario'),(2,'auth','group'),(3,'auth','permission'),(4,'auth','user'),(7,'clientes','cliente'),(8,'clientes','orden'),(9,'clientes','producto'),(10,'clientes','usuario'),(5,'contenttypes','contenttype'),(25,'operarios','asignaciontarea'),(26,'operarios','incidencia'),(27,'operarios','operario'),(28,'operarios','tarea'),(29,'operarios','usuario'),(11,'produccion','ordenproduccion'),(12,'produccion','prenda'),(14,'produccion','produccion'),(15,'produccion','producto'),(24,'proveedores','proveedor'),(6,'sessions','session'),(22,'usuarios','passwordresettoken'),(13,'usuarios','usuario');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2026-06-21 16:57:47.689715'),(2,'auth','0001_initial','2026-06-21 16:57:48.584832'),(3,'admin','0001_initial','2026-06-21 16:57:48.790484'),(4,'admin','0002_logentry_remove_auto_add','2026-06-21 16:57:48.802748'),(5,'admin','0003_logentry_add_action_flag_choices','2026-06-21 16:57:48.816399'),(6,'contenttypes','0002_remove_content_type_name','2026-06-21 16:57:48.968288'),(7,'auth','0002_alter_permission_name_max_length','2026-06-21 16:57:49.066133'),(8,'auth','0003_alter_user_email_max_length','2026-06-21 16:57:49.114241'),(9,'auth','0004_alter_user_username_opts','2026-06-21 16:57:49.137122'),(10,'auth','0005_alter_user_last_login_null','2026-06-21 16:57:49.232453'),(11,'auth','0006_require_contenttypes_0002','2026-06-21 16:57:49.236827'),(12,'auth','0007_alter_validators_add_error_messages','2026-06-21 16:57:49.250125'),(13,'auth','0008_alter_user_username_max_length','2026-06-21 16:57:49.337726'),(14,'auth','0009_alter_user_last_name_max_length','2026-06-21 16:57:49.412392'),(15,'auth','0010_alter_group_name_max_length','2026-06-21 16:57:49.469000'),(16,'auth','0011_update_proxy_permissions','2026-06-21 16:57:49.483361'),(17,'auth','0012_alter_user_first_name_max_length','2026-06-21 16:57:49.598536'),(18,'clientes','0001_initial','2026-06-21 16:57:49.607402'),(19,'sessions','0001_initial','2026-06-21 16:57:49.659967'),(20,'produccion','0001_initial','2026-06-23 00:14:46.254635'),(21,'produccion','0002_alter_ordenproduccion_options_alter_prenda_options','2026-06-23 00:14:46.271448'),(22,'administrador','0001_initial','2026-06-23 00:38:32.476780'),(23,'produccion','0003_produccion_producto_delete_ordenproduccion_and_more','2026-06-23 00:38:32.486547'),(24,'usuarios','0001_initial','2026-06-23 00:38:32.494470'),(25,'administrador','0002_incidencia','2026-07-31 01:07:15.781160'),(26,'operarios','0001_initial','2026-07-31 01:07:15.812479'),(27,'proveedores','0001_initial','2026-07-31 01:07:15.829794'),(28,'usuarios','0002_passwordresettoken','2026-07-31 01:07:15.839091');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `session_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
INSERT INTO `django_session` VALUES ('7ver0ftqmguporf9v430yb2lt7g5zf3s','.eJyrViotLk0sysyPz0xRsjLRgXPz8nOTilKVrJScE4ty8ouVEDJF-TlA4fyC1CIQFyiRmeIP41gZ1QIAwl0dCA:1wpIcl:rXBN5T5U_kOCr1pJJlGwfcU93vFeLFtJBI5kJKFqsMw','2026-08-13 04:44:03.935971'),('d162q34h9vnv2o5fswwzjkl21edxxmgc','.eJyrViotLk0sysyPz0xRsjI214Hz8_Jzk4pSlayUHHNyE5NT81KLlRCSRfk5SlZKyTmZqXklqUq1AHa9GPw:1wpdCL:XqXh1iDPrePilQi4EZdFRSfDciZS-Z3XBQ0do6AI25g','2026-08-14 02:42:09.559068'),('qg7t3nzbl2gaq9aacsmpjm5ck2qhbtqv','.eJyrViotLk0sysyPz0xRsjI214Hz8_Jzk4pSlayUHHNyE5NT81KLlRCSRfk5SlZKyTmZqXklqUq1AHa9GPw:1wbPgn:aooMkZTLMN63__zrsXb97f8p_UgO_fx-wTC8js8UTkw','2026-07-05 21:26:49.486515'),('sodmxcm5kyes53sysmjsfnsx2jbpwiwr','.eJyrViotLk0sysyPz0xRsjI214Hz8_Jzk4pSlayUHHNyE5NT81KLlRCSRfk5SlZKyTmZqXklqUq1AHa9GPw:1wpdCL:XqXh1iDPrePilQi4EZdFRSfDciZS-Z3XBQ0do6AI25g','2026-08-14 02:42:09.762626'),('te18lx69em4qgcfhwzilsd30cp15vcya','.eJyrViotLk0sysyPz0xRsjI214Hz8_Jzk4pSlayUHHNyE5NT81KLlRCSRfk5SlZKyTmZqXklqUq1AHa9GPw:1wpdFN:ISbliGKDJ433vBUaQM3vCvrgcEAQaLxt_GdvXCjBO5k','2026-08-14 02:45:17.318431');
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entrada_materiales`
--

DROP TABLE IF EXISTS `entrada_materiales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entrada_materiales` (
  `idEntrada` int NOT NULL AUTO_INCREMENT,
  `idProveedor` int NOT NULL COMMENT 'FK a proveedores',
  `idMaterial` int NOT NULL COMMENT 'FK a materiales',
  `fechaEntrada` date NOT NULL,
  `cantidad` decimal(10,2) NOT NULL DEFAULT '0.00',
  `precioUnitario` decimal(10,2) NOT NULL DEFAULT '0.00',
  `subtotal` decimal(12,2) GENERATED ALWAYS AS ((`cantidad` * `precioUnitario`)) STORED COMMENT 'Calculado automáticamente',
  `unidad` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'unidad',
  `numeroRemision` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `estado` enum('Pendiente','Recibida','Cancelada') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Pendiente',
  `fechaRegistro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idEntrada`),
  KEY `fk_em_proveedor` (`idProveedor`),
  KEY `fk_em_material` (`idMaterial`),
  KEY `idx_em_proveedor` (`idProveedor`),
  KEY `idx_em_material` (`idMaterial`),
  CONSTRAINT `fk_em_material` FOREIGN KEY (`idMaterial`) REFERENCES `materiales` (`idMaterial`) ON UPDATE CASCADE,
  CONSTRAINT `fk_em_proveedor` FOREIGN KEY (`idProveedor`) REFERENCES `proveedores` (`idProveedor`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entrada_materiales`
--

LOCK TABLES `entrada_materiales` WRITE;
/*!40000 ALTER TABLE `entrada_materiales` DISABLE KEYS */;
INSERT INTO `entrada_materiales` (`idEntrada`, `idProveedor`, `idMaterial`, `fechaEntrada`, `cantidad`, `precioUnitario`, `unidad`, `numeroRemision`, `observaciones`, `estado`, `fechaRegistro`) VALUES (1,1,1,'2026-02-01',1000.00,4500.00,'Metro','REM-2026-T001','Tela algodón peinado para temporada verano','Recibida','2026-02-01 08:00:00'),(2,2,2,'2026-02-03',50.00,8500.00,'Cono','REM-2026-H002','Hilos poliéster 40/2 para producción confección','Recibida','2026-02-03 09:00:00'),(3,3,3,'2026-02-05',2000.00,150.00,'Unidad','REM-2026-B003','Botones nácar colores surtidos colección formal','Recibida','2026-02-05 08:30:00'),(4,4,4,'2026-02-10',500.00,1200.00,'Unidad','REM-2026-C004','Cremalleras YKK para chaquetas y faldas plisadas','Recibida','2026-02-10 10:00:00'),(5,5,5,'2026-02-15',800.00,800.00,'Metro','REM-2026-E005','Elástico plano 2 cm para bermudas y faldas','Recibida','2026-02-15 08:00:00'),(6,6,6,'2026-02-20',600.00,2200.00,'Metro','REM-2026-EN006','Entretela fusionable para blusas y chaquetas','Pendiente','2026-02-20 09:30:00'),(7,7,7,'2026-02-25',3000.00,350.00,'Unidad','REM-2026-ET007','Etiquetas tejidas toda la colección 2026','Pendiente','2026-02-25 11:00:00');
/*!40000 ALTER TABLE `entrada_materiales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facturas`
--

DROP TABLE IF EXISTS `facturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facturas` (
  `idFactura` int NOT NULL AUTO_INCREMENT,
  `idOrden` int NOT NULL,
  `idCliente` int NOT NULL,
  `numeroFactura` varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
  `fechaEmision` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `rutaPDF` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` varchar(20) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Emitida',
  PRIMARY KEY (`idFactura`),
  UNIQUE KEY `numeroFactura` (`numeroFactura`),
  KEY `fk_factura_orden` (`idOrden`),
  KEY `fk_factura_cliente` (`idCliente`),
  CONSTRAINT `fk_factura_cliente` FOREIGN KEY (`idCliente`) REFERENCES `clientes` (`idCliente`),
  CONSTRAINT `fk_factura_orden` FOREIGN KEY (`idOrden`) REFERENCES `ordenes` (`idOrden`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facturas`
--

LOCK TABLES `facturas` WRITE;
/*!40000 ALTER TABLE `facturas` DISABLE KEYS */;
INSERT INTO `facturas` VALUES (3,13,1,'F-20260730-0013','2026-07-31 02:32:54','facturas/F-20260730-0013.pdf',5500000.00,'Emitida');
/*!40000 ALTER TABLE `facturas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incidencias`
--

DROP TABLE IF EXISTS `incidencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incidencias` (
  `idIncidencia` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL COMMENT 'Operario que genera la incidencia',
  `tipoIncidencia` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Ej: desempeño, ventas, inventario',
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `estado` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Generado',
  `fechaGeneracion` date NOT NULL,
  `fechaRevision` date DEFAULT NULL,
  PRIMARY KEY (`idIncidencia`),
  KEY `fk_inc_operario` (`idUsuario`),
  CONSTRAINT `fk_inc_operario` FOREIGN KEY (`idUsuario`) REFERENCES `operarios` (`idOperario`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incidencias`
--

LOCK TABLES `incidencias` WRITE;
/*!40000 ALTER TABLE `incidencias` DISABLE KEYS */;
INSERT INTO `incidencias` VALUES (1,1,'Error de corte','Exceso de desperdicio de tela algodón en lote camisetas #1 (15% sobre lo estimado)','Revisado','2026-01-12','2026-01-13'),(2,2,'Retraso','Entrega del lote de pantalones Koaj con 2 días de retraso por falla de maquinaria','Revisado','2026-01-31','2026-02-01'),(3,3,'Calidad','Bordado fuera de especificación en 15 blusas del lote: hilo corrido en pecho','Pendiente','2026-02-05',NULL),(4,4,'Máquina','Falla en máquina de serigrafía que detuvo producción de bermudas durante 4 horas','Pendiente','2026-02-12',NULL),(5,5,'Procedimiento','Temperatura incorrecta en planchado de faldas: pliegues deformados en 12 unidades','Pendiente','2026-02-22',NULL),(6,6,'Calidad','Aprobó prendas con costuras flojas en la revisión de calidad del lote vestidos','Pendiente','2026-03-02',NULL),(7,7,'Retraso','Retraso en empaque lote Studio F por agotamiento de bolsas antihumedad','Pendiente','2026-03-03',NULL),(8,2,'Fallo de maquina','Se apago repentinamente','Generado','2026-06-23',NULL);
/*!40000 ALTER TABLE `incidencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventario`
--

DROP TABLE IF EXISTS `inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario` (
  `idInventario` int NOT NULL AUTO_INCREMENT,
  `idProducto` int NOT NULL,
  `cantidadDisponible` int NOT NULL DEFAULT '0',
  `minimoDefinido` int NOT NULL DEFAULT '0',
  `nivelStock` int DEFAULT NULL,
  `unidades` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'unidades',
  `ubicacion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fechaActualizacion` date DEFAULT NULL,
  `cantidadIngresada` int NOT NULL DEFAULT '0' COMMENT 'Acumulado histórico de unidades ingresadas',
  `cantidadEgresada` int NOT NULL DEFAULT '0' COMMENT 'Acumulado histórico de unidades egresadas',
  `fechaIngreso` date DEFAULT NULL COMMENT 'Fecha del último ingreso de unidades',
  `fechaSalida` date DEFAULT NULL COMMENT 'Fecha de la última salida de unidades',
  PRIMARY KEY (`idInventario`),
  UNIQUE KEY `uq_inv_producto` (`idProducto`),
  KEY `fk_inv_producto` (`idProducto`),
  CONSTRAINT `fk_inv_producto` FOREIGN KEY (`idProducto`) REFERENCES `productos` (`idProducto`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario`
--

LOCK TABLES `inventario` WRITE;
/*!40000 ALTER TABLE `inventario` DISABLE KEYS */;
INSERT INTO `inventario` VALUES (1,1,200,50,200,'Unidades','Bodega Confección A','2026-03-01',200,0,'2026-01-01',NULL),(2,2,150,30,150,'Unidades','Bodega Confección A','2026-03-01',150,0,'2026-01-01',NULL),(3,3,80,20,80,'Unidades','Bodega Confección B','2026-03-01',80,0,'2026-01-01',NULL),(4,4,60,15,60,'Unidades','Bodega Denim','2026-03-01',60,0,'2026-01-01',NULL),(5,5,120,40,120,'Unidades','Bodega Deportiva','2026-03-01',120,0,'2026-01-01',NULL),(6,6,90,25,90,'Unidades','Bodega Formal','2026-03-01',90,0,'2026-01-01',NULL),(7,7,70,20,70,'Unidades','Bodega Formal','2026-03-01',70,0,'2026-01-01',NULL);
/*!40000 ALTER TABLE `inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `materiales`
--

DROP TABLE IF EXISTS `materiales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materiales` (
  `idMaterial` int NOT NULL AUTO_INCREMENT,
  `nombreMaterial` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `stockActual` decimal(10,2) NOT NULL DEFAULT '0.00',
  `stockMinimo` decimal(10,2) NOT NULL DEFAULT '0.00',
  `unidadBase` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'unidad',
  `costoUnitario` decimal(10,2) NOT NULL DEFAULT '0.00',
  `fechaActualizacion` date DEFAULT NULL,
  PRIMARY KEY (`idMaterial`),
  UNIQUE KEY `uq_nombre_material` (`nombreMaterial`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materiales`
--

LOCK TABLES `materiales` WRITE;
/*!40000 ALTER TABLE `materiales` DISABLE KEYS */;
INSERT INTO `materiales` VALUES (1,'Tela Algodón Peinado','Tela 100% algodón peinado 180 g/m², ancho 1.5 m',2500.00,500.00,'Metro',4500.00,'2026-03-01'),(2,'Hilo Poliéster 40/2','Hilo de coser poliéster resistente 40/2, cono 5000 m',150.00,30.00,'Cono',8500.00,'2026-03-01'),(3,'Botón Nácar 4 Huecos','Botón nácar sintético 4 huecos 15 mm, colores surtidos',800.00,200.00,'Unidad',150.00,'2026-03-01'),(4,'Cremallera Metálica YKK','Cremallera metálica YKK #5 de 25 cm, color negro',300.00,100.00,'Unidad',1200.00,'2026-03-01'),(5,'Elástico Plano 2 cm','Elástico tejido plano 2 cm de ancho, alta resistencia al lavado',500.00,100.00,'Metro',800.00,'2026-03-01'),(6,'Entretela Fusionable','Entretela no tejida fusionable media rigidez, ancho 90 cm',400.00,80.00,'Metro',2200.00,'2026-03-01'),(7,'Etiqueta Tejida Marca','Etiqueta jacquard tejida con marca, talla y país de origen',1000.00,200.00,'Unidad',350.00,'2026-03-01');
/*!40000 ALTER TABLE `materiales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operarios`
--

DROP TABLE IF EXISTS `operarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operarios` (
  `idOperario` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL COMMENT 'FK a usuarios',
  `especialidad` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fechaIngreso` date NOT NULL,
  `estado` enum('activo','inactivo') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`idOperario`),
  KEY `fk_op_usuario` (`idUsuario`),
  CONSTRAINT `fk_op_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operarios`
--

LOCK TABLES `operarios` WRITE;
/*!40000 ALTER TABLE `operarios` DISABLE KEYS */;
INSERT INTO `operarios` VALUES (1,23,'Corte','2025-02-01','activo'),(2,4,'Confección','2025-02-01','activo'),(3,5,'Bordado','2025-02-15','activo'),(4,6,'Estampado','2025-03-01','activo'),(5,7,'Planchado','2025-03-01','activo'),(6,8,'Control de Calidad','2025-03-15','activo'),(7,9,'Empaque','2025-04-01','activo'),(8,42,'Control de Calidad','2026-07-25','activo');
/*!40000 ALTER TABLE `operarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordenes`
--

DROP TABLE IF EXISTS `ordenes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordenes` (
  `idOrden` int NOT NULL AUTO_INCREMENT,
  `idCliente` int NOT NULL COMMENT 'FK a clientes',
  `idProducto` int DEFAULT NULL,
  `fechaCreacion` date NOT NULL,
  `fechaEntregaEstimada` date DEFAULT NULL,
  `instrucciones` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `cantidad` int DEFAULT NULL COMMENT 'Unidades pedidas',
  `precioUnitario` decimal(10,2) DEFAULT NULL COMMENT 'Precio unitario al momento de la orden',
  `subtotal` decimal(10,2) GENERATED ALWAYS AS ((`cantidad` * `precioUnitario`)) STORED COMMENT 'Calculado automáticamente',
  `prioridad` enum('Normal','Urgente') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Normal',
  `estado` enum('Pendiente','Procesando','Enviado','Entregado','Cancelado') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Pendiente',
  PRIMARY KEY (`idOrden`),
  KEY `fk_ord_cliente` (`idCliente`),
  KEY `idx_orden_estado` (`estado`),
  KEY `fk_orden_producto` (`idProducto`),
  CONSTRAINT `fk_ord_cliente` FOREIGN KEY (`idCliente`) REFERENCES `clientes` (`idCliente`) ON UPDATE CASCADE,
  CONSTRAINT `fk_orden_producto` FOREIGN KEY (`idProducto`) REFERENCES `productos` (`idProducto`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordenes`
--

LOCK TABLES `ordenes` WRITE;
/*!40000 ALTER TABLE `ordenes` DISABLE KEYS */;
INSERT INTO `ordenes` (`idOrden`, `idCliente`, `idProducto`, `fechaCreacion`, `fechaEntregaEstimada`, `instrucciones`, `cantidad`, `precioUnitario`, `prioridad`, `estado`) VALUES (1,1,NULL,'2026-01-10','2026-01-25','Camisetas con logo bordado en pecho izquierdo, bolsa individual',500,35000.00,'Normal','Entregado'),(2,2,NULL,'2026-01-15','2026-01-30','Pantalones slim tallas 30-38, etiqueta interna y swing tag',300,85000.00,'Normal','Enviado'),(3,3,NULL,'2026-01-20','2026-02-10','Chaquetas denim acabado vintage, instrucciones de lavado incluidas',200,130000.00,'Urgente','Procesando'),(4,4,NULL,'2026-02-01','2026-02-15','Blusas con bordado exclusivo logo AC, empacar en caja individual',150,75000.00,'Normal','Procesando'),(5,5,NULL,'2026-02-10','2026-02-25','Bermudas deportivas colección verano, etiqueta reflectiva lateral',400,55000.00,'Normal','Pendiente'),(6,6,NULL,'2026-02-20','2026-03-05','Faldas plisadas midi temporada, control de calidad exhaustivo',180,70000.00,'Urgente','Pendiente'),(7,7,NULL,'2026-03-01','2026-03-18','Vestidos casuales fondo negro, estampado floral, empacar con papel',220,95000.00,'Normal','Pendiente'),(13,1,5,'2026-07-30','2026-08-08','Sin instrucciones',100,8000.00,'Urgente','Entregado');
/*!40000 ALTER TABLE `ordenes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordenes_produccion`
--

DROP TABLE IF EXISTS `ordenes_produccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordenes_produccion` (
  `idOrdenProduccion` int NOT NULL AUTO_INCREMENT,
  `numero` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `cliente` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `cantidad` int NOT NULL,
  `producidas` int NOT NULL,
  `operario` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `lineaProduccion` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fechaEntrega` date NOT NULL,
  `prioridad` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `estado` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `observaciones` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `fechaCreacion` date NOT NULL,
  `idPrenda` int NOT NULL,
  PRIMARY KEY (`idOrdenProduccion`),
  UNIQUE KEY `numero` (`numero`),
  KEY `ordenes_produccion_idPrenda_e87d8fd6_fk_prendas_idPrenda` (`idPrenda`),
  CONSTRAINT `ordenes_produccion_idPrenda_e87d8fd6_fk_prendas_idPrenda` FOREIGN KEY (`idPrenda`) REFERENCES `prendas` (`idPrenda`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordenes_produccion`
--

LOCK TABLES `ordenes_produccion` WRITE;
/*!40000 ALTER TABLE `ordenes_produccion` DISABLE KEYS */;
/*!40000 ALTER TABLE `ordenes_produccion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `idToken` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `token` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fechaCreacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expira` datetime NOT NULL,
  `usado` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`idToken`),
  UNIQUE KEY `token` (`token`),
  KEY `fk_reset_usuario` (`idUsuario`),
  CONSTRAINT `fk_reset_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
INSERT INTO `password_reset_tokens` VALUES (1,40,'OVCLxk100k3ylnRhU9QPsMhSqzznD0IuA9bR6OwyEws','2026-07-17 12:37:57','2026-07-17 12:52:57',0);
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prendas`
--

DROP TABLE IF EXISTS `prendas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prendas` (
  `idPrenda` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `codigo` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `categoria` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `tallas` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `tiempoMinutos` int NOT NULL,
  `stockObjetivo` int NOT NULL,
  `descripcion` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `estado` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`idPrenda`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prendas`
--

LOCK TABLES `prendas` WRITE;
/*!40000 ALTER TABLE `prendas` DISABLE KEYS */;
INSERT INTO `prendas` VALUES (1,'Camiseta Algodon','123','Camisa','M',120,10,'Prenda a confeccionar','Activo');
/*!40000 ALTER TABLE `prendas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produccion`
--

DROP TABLE IF EXISTS `produccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produccion` (
  `idProduccion` int NOT NULL AUTO_INCREMENT,
  `idOrden` int DEFAULT NULL COMMENT 'FK a ordenes (puede ser NULL)',
  `idProducto` int NOT NULL COMMENT 'FK a productos',
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `cantidadRequerida` int NOT NULL,
  `fechaInicio` date NOT NULL,
  `fechaEstimadaFin` date NOT NULL,
  `estado` enum('Pendiente','En Progreso','Completado','Detenido') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Pendiente',
  `fechaRealFin` date DEFAULT NULL,
  PRIMARY KEY (`idProduccion`),
  KEY `fk_prod_orden` (`idOrden`),
  KEY `fk_prod_producto` (`idProducto`),
  CONSTRAINT `fk_prod_orden` FOREIGN KEY (`idOrden`) REFERENCES `ordenes` (`idOrden`) ON UPDATE CASCADE,
  CONSTRAINT `fk_prod_producto` FOREIGN KEY (`idProducto`) REFERENCES `productos` (`idProducto`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produccion`
--

LOCK TABLES `produccion` WRITE;
/*!40000 ALTER TABLE `produccion` DISABLE KEYS */;
INSERT INTO `produccion` VALUES (1,1,1,'Lote camisetas básicas — orden Éxito',500,'2026-01-10','2026-01-24','Completado',NULL),(2,2,2,'Lote pantalones clásicos — orden Koaj',300,'2026-01-15','2026-01-29','En Progreso',NULL),(3,3,4,'Lote chaquetas denim — orden Eliot',200,'2026-01-20','2026-02-09','En Progreso',NULL),(4,4,6,'Lote blusas formales — orden Arturo Calle',150,'2026-02-01','2026-02-14','En Progreso',NULL),(5,5,5,'Lote bermudas deportivas — orden Tennis',400,'2026-02-10','2026-02-24','Pendiente',NULL),(6,6,7,'Lote faldas plisadas — orden Punto Blanco',180,'2026-02-20','2026-03-04','Pendiente',NULL),(7,7,3,'Lote vestidos casuales — orden Studio F',220,'2026-03-01','2026-03-17','Pendiente',NULL),(8,NULL,1,'Lote de Camisetas Orden Exitosa',50,'2026-06-22','2026-06-27','En Progreso',NULL),(9,NULL,1,'Camiseta Seleccion Colombia',20,'2026-06-25','2026-06-27','En Progreso',NULL);
/*!40000 ALTER TABLE `produccion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `idProducto` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `categoria` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`idProducto`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'Camiseta Básica','Camiseta 100% algodón peinado 180 g/m², corte recto unisex',35000.00,'Camisetas'),(2,'Pantalón Clásico','Pantalón gabardina stretch corte slim, tallas 28-38',85000.00,'Pantalones'),(3,'Vestido Casual','Vestido viscosa estampada manga corta, talla única ajustable',95000.00,'Vestidos'),(4,'Chaqueta Denim','Chaqueta denim 12 oz acabado desgastado, botones metálicos',130000.00,'Chaquetas'),(5,'Bermuda Deportiva','Bermuda tela sintética transpirable con bolsillos laterales',55000.00,'Bermudas'),(6,'Blusa Formal','Blusa popelina con bordado exclusivo en pecho, manga larga',75000.00,'Blusas'),(7,'Falda Plisada','Falda plisada poliéster largo midi, pretina elástica reforzada',70000.00,'Faldas'),(8,'Jeans azules','pantalones unisex baggy',20000.00,'[value-5]');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedores`
--

DROP TABLE IF EXISTS `proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedores` (
  `idProveedor` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL COMMENT 'FK a usuarios — administrador que gestiona el proveedor',
  `nombreEmpresa` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nombreContacto` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `correo` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `direccion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nit` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` enum('activo','inactivo') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'activo',
  `fechaRegistro` date NOT NULL DEFAULT '2026-01-01',
  PRIMARY KEY (`idProveedor`),
  KEY `fk_prov_usuario` (`idUsuario`),
  KEY `idx_prov_usuario` (`idUsuario`),
  CONSTRAINT `fk_prov_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedores`
--

LOCK TABLES `proveedores` WRITE;
/*!40000 ALTER TABLE `proveedores` DISABLE KEYS */;
INSERT INTO `proveedores` VALUES (1,1,'Textiles Colombia S.A.','Jorge Bedoya','3002000001','ventas@textilescol.com','Calle 13 #34-20, Bogotá','830456789-1','activo','2025-12-01'),(2,2,'Hilos y Fibras Andinas','Carmen Ríos','3152000002','pedidos@hilosandinos.com','Carrera 50 #12-30, Medellín','900234567-2','activo','2025-12-05'),(3,1,'Botones y Avíos del Norte','Ricardo Peña','3203000003','avios@btnorte.com','Av. 80 #65-10, Barranquilla','901345678-3','activo','2025-12-10'),(4,2,'Cremalleras YKK Colombia','Sandra López','3104000004','ventas@ykkco.com','Calle 100 #19-60, Bogotá','830567890-4','activo','2026-01-05'),(5,1,'Elásticos y Cintas S.A.S.','Mauricio Silva','3005000005','pedidos@elasticos.com','Carrera 7 #45-80, Bogotá','900678901-5','activo','2026-01-10'),(6,2,'Entretelas del Pacífico','Gloria Muñoz','3156000006','entretelas@pacifico.com','Calle 5 #10-20, Cali','901789012-6','activo','2026-01-15'),(7,1,'Etiquetas y Marcas Print','Héctor Duarte','3107000007','ventas@etiquetasprint.com','Carrera 15 #88-20, Bogotá','830890123-7','activo','2026-01-20');
/*!40000 ALTER TABLE `proveedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salida_devolucion`
--

DROP TABLE IF EXISTS `salida_devolucion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salida_devolucion` (
  `idSalida` int NOT NULL AUTO_INCREMENT,
  `idInventario` int NOT NULL COMMENT 'FK a inventario',
  `tipoSalida` enum('Venta','Donacion','Descarte','Reintegro al cliente','Transferencia interna') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `cantidadSalida` int NOT NULL COMMENT 'Puede ser parcial',
  `precioUnitario` decimal(10,2) DEFAULT NULL COMMENT 'Solo aplica si tipoSalida = Venta',
  `subtotal` decimal(12,2) GENERATED ALWAYS AS ((`cantidadSalida` * `precioUnitario`)) STORED,
  `destinatario` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Cliente, fundación u organización',
  `numeroDocumento` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Factura, remisión o soporte',
  `fechaSalida` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`idSalida`),
  KEY `fk_sal_inventario` (`idInventario`),
  CONSTRAINT `fk_sal_inventario` FOREIGN KEY (`idInventario`) REFERENCES `inventario` (`idInventario`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Destino final de cada ítem devuelto: venta, donación, descarte, etc.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salida_devolucion`
--

LOCK TABLES `salida_devolucion` WRITE;
/*!40000 ALTER TABLE `salida_devolucion` DISABLE KEYS */;
INSERT INTO `salida_devolucion` (`idSalida`, `idInventario`, `tipoSalida`, `cantidadSalida`, `precioUnitario`, `destinatario`, `numeroDocumento`, `fechaSalida`, `observaciones`) VALUES (1,2,'Venta',7,60000.00,'Koaj Colombia','FAC-DEV-2026-001','2026-03-26 22:50:30','Pantalones talla 32 revendidos con 29% de descuento'),(2,2,'Donacion',3,NULL,'Fundación Tejiendo Sueños Bogotá','DON-2026-001','2026-03-26 22:50:30','Unidades en buen estado donadas a fundación de Kennedy');
/*!40000 ALTER TABLE `salida_devolucion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tarea_materiales`
--

DROP TABLE IF EXISTS `tarea_materiales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tarea_materiales` (
  `idTareaMaterial` int NOT NULL AUTO_INCREMENT,
  `idTarea` int NOT NULL,
  `idMaterial` int NOT NULL,
  `cantidadUsada` decimal(10,2) NOT NULL COMMENT 'Cantidad consumida del material',
  `unidad` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'unidad',
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `fechaRegistro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idTareaMaterial`),
  UNIQUE KEY `uq_tarea_material` (`idTarea`,`idMaterial`) COMMENT 'Un material no se repite en la misma tarea',
  KEY `fk_tm_tarea` (`idTarea`),
  KEY `fk_tm_material` (`idMaterial`),
  CONSTRAINT `fk_tm_material` FOREIGN KEY (`idMaterial`) REFERENCES `materiales` (`idMaterial`) ON UPDATE CASCADE,
  CONSTRAINT `fk_tm_tarea` FOREIGN KEY (`idTarea`) REFERENCES `tareas` (`idTarea`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tarea_materiales`
--

LOCK TABLES `tarea_materiales` WRITE;
/*!40000 ALTER TABLE `tarea_materiales` DISABLE KEYS */;
INSERT INTO `tarea_materiales` VALUES (1,1,1,3.50,'Metro','Tela algodón cortada según moldes camiseta tallas S-XL','2026-01-11 08:00:00'),(2,2,2,2.00,'Cono','Hilo para costuras principales y dobladillo del pantalón','2026-01-16 08:00:00'),(3,3,4,1.00,'Unidad','Cremallera YKK en bolsillo lateral de la chaqueta denim','2026-01-21 08:00:00'),(4,4,3,6.00,'Unidad','Botones nácar para decoración en cuello de blusa formal','2026-02-02 08:00:00'),(5,5,5,0.30,'Metro','Elástico para cintura interior de bermuda deportiva','2026-02-11 08:00:00'),(6,6,6,0.50,'Metro','Entretela fusionable en pretina de falda plisada','2026-02-21 08:00:00'),(7,7,7,1.00,'Unidad','Etiqueta de marca y talla aplicada en costado del vestido','2026-03-02 08:00:00');
/*!40000 ALTER TABLE `tarea_materiales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tareas`
--

DROP TABLE IF EXISTS `tareas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tareas` (
  `idTarea` int NOT NULL AUTO_INCREMENT,
  `idProduccion` int DEFAULT NULL COMMENT 'Tarea vinculada a un proceso de producción',
  `nombreTarea` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `descripcionTarea` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fechaCreacion` date NOT NULL,
  `proceso` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `complejidad` enum('baja','media','alta') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`idTarea`),
  KEY `fk_tarea_produccion` (`idProduccion`),
  CONSTRAINT `fk_tarea_produccion` FOREIGN KEY (`idProduccion`) REFERENCES `produccion` (`idProduccion`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tareas`
--

LOCK TABLES `tareas` WRITE;
/*!40000 ALTER TABLE `tareas` DISABLE KEYS */;
INSERT INTO `tareas` VALUES (1,1,'Corte de tela — camisetas','Cortar tela algodón según moldes de camiseta básica tallas S-XL','2026-01-10','Corte','media'),(2,2,'Confección de pantalones','Unir piezas, coser costuras principales y colocar cremallera','2026-01-15','Confección','alta'),(3,3,'Ensamble chaquetas denim','Unir delantero, espalda y mangas; remache de botones metálicos','2026-01-20','Confección','alta'),(4,4,'Bordado blusas formales','Aplicar bordado exclusivo logo AC en pecho izquierdo de la blusa','2026-02-01','Bordado','alta'),(5,5,'Estampado bermudas','Aplicar estampado reflectivo lateral con serigrafía en 2 colores','2026-02-10','Estampado','media'),(6,6,'Planchado faldas plisadas','Planchar pliegues con vapor industrial 160°C; controlar temperatura','2026-02-20','Planchado','media'),(7,7,'Control de calidad vestidos','Inspeccionar costuras, estampado y acabados del lote Studio F','2026-03-01','Control de Calidad','baja'),(8,NULL,'Remate','Rematar pantalones','2026-07-30','Ultimo proceso','media');
/*!40000 ALTER TABLE `tareas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `idUsuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `apellido` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `correoElectronico` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `contrasena` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Almacenar siempre hasheada (bcrypt/argon2)',
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `direccion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `rol` enum('administrador','operario','cliente','sin_asignar') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'cliente',
  `estado` enum('activo','inactivo','pendiente','reportado') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'activo',
  `fotoPerfil` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`idUsuario`),
  UNIQUE KEY `uq_correo` (`correoElectronico`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Andrea','Rios','andrea.rios@hebratech.com','$2b$10$HASH_PENDIENTE','3001000001','Bogotá','administrador','activo',NULL),(2,'Miguel','Torres','miguel.torres@hebratech.com','$2b$10$HASH_PENDIENTE','3001000002','Bogotá','administrador','activo',NULL),(4,'Carlos','Méndez','carlos.mendez@hebratech.com','pbkdf2_sha256$1200000$FMiUMeNZrDzKIn85CbdM5L$gj6DfxCrf4NH+e5gXsqV3WGM3einBMuSz7zIqdjnKJo=','3101000002',NULL,'operario','activo',NULL),(5,'Diana','Puentes','diana.puentes@hebratech.com','$2b$10$HASH_PENDIENTE','3101000003',NULL,'operario','activo',NULL),(6,'Felipe','Mora','felipe.mora@hebratech.com','$2b$10$HASH_PENDIENTE','3101000004',NULL,'operario','activo',NULL),(7,'Valentina','Cruz','valentina.cruz@hebratech.com','$2b$10$HASH_PENDIENTE','3101000005',NULL,'operario','activo',NULL),(8,'Sergio','Leal','sergio.leal@hebratech.com','$2b$10$HASH_PENDIENTE','3101000006',NULL,'operario','activo',NULL),(9,'Natalia','Ossa','natalia.ossa@hebratech.com','$2b$10$HASH_PENDIENTE','3101000007',NULL,'operario','activo',NULL),(11,'Pedidos','Koaj','pedidos@koaj.com','$2b$10$HASH_PENDIENTE','6017002000','Calle 80 #50-30, Bogotá','cliente','activo',NULL),(12,'Compras','Eliot','compras@eliot.com','$2b$10$HASH_PENDIENTE','6017003000','Carrera 7 #12-40, Bogotá','cliente','activo',NULL),(13,'Pedidos','ArturoCalle','pedidos@arturocalle.com','$2b$10$HASH_PENDIENTE','6017004000','El Poblado, Medellín','cliente','activo',NULL),(14,'Compras','Tennis','compras@tennis.com','$2b$10$HASH_PENDIENTE','6017005000','Calle 97 #60-30, Bogotá','cliente','activo',NULL),(15,'Pedidos','PuntoBlanco','pedidos@puntoblanco.com','$2b$10$HASH_PENDIENTE','6017006000','Av. 6N #24-01, Cali','cliente','activo',NULL),(16,'Compras','StudioF','compras@studiof.com','$2b$10$HASH_PENDIENTE','6017007000','Calle 122 #15-80, Bogotá','cliente','activo',NULL),(23,'Laura','Gomez','lucia.vargas@hebratech.com','$2b$10$HASH_PENDIENTE','3101000001',NULL,'operario','activo',NULL),(36,'Jorge','Almanza','jorgeformulaone@gmail.com','pbkdf2_sha256$1200000$Sj9p5QSfQXgkcbdC4eurTI$uPrcDEo0PvEJ79kliE24zoshsMMV2wAZ2ONjYmBilAA=',NULL,NULL,'operario','activo',NULL),(37,'Almacenes','Exito','exitocompras@gmail.com','pbkdf2_sha256$1200000$Ohw1zC90mcUL4Lt7vgbIgz$fJGY0aoEkvMGHiV5VCPhIEGdFkfoT5cPAUoI6bxRAMw=',NULL,NULL,'cliente','activo',NULL),(38,'Prueba','Grupo','grupo@hebratech.com','pbkdf2_sha256$1200000$FOda1qlIHf11rTyIUaPw6Z$EFZei2tHQypXFno8aWTEJ7tciA+okhReNKv+rmnQ1YY=','3201000000','Calle 100 #15-20, Bogotá','administrador','activo',NULL),(39,'Juan','Castro','juan.castro@hebratech.com','pbkdf2_sha256$1200000$X4Wev2wH6nxPAFoqBhGEJG$ydUcLM/l4HvlccNlT9wsF0HfoDbMjvv3h5HMc12zrEg=','3129998877',NULL,'operario','activo',NULL),(40,'Jorginho','Soares','almanzajorgedaniel96@gmail.com','pbkdf2_sha256$600000$e9vOlzOqN08PwvbcKI9mhk$pL/RH9OWogVe4XjKJn/l1+JfSsIBNvPJfjwaqn/kNN8=',NULL,NULL,'cliente','activo',NULL),(42,'Rafa','Marquez','rafa@gmail.com','pbkdf2_sha256$600000$nzSmoWbZShVtGSMkfjQJ0c$L7EtVNzcvD6URxEic5BVcARoBWqNahrSYVBA06dvLy4=','3018956547',NULL,'operario','activo',NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `ver_un_producto_y_su_estado_en_la_produccion`
--

DROP TABLE IF EXISTS `ver_un_producto_y_su_estado_en_la_produccion`;
/*!50001 DROP VIEW IF EXISTS `ver_un_producto_y_su_estado_en_la_produccion`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `ver_un_producto_y_su_estado_en_la_produccion` AS SELECT 
 1 AS `nombre`,
 1 AS `descripcion`,
 1 AS `categoria`,
 1 AS `estado`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `ver_un_producto_y_su_estado_en_la_produccion`
--

/*!50001 DROP VIEW IF EXISTS `ver_un_producto_y_su_estado_en_la_produccion`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `ver_un_producto_y_su_estado_en_la_produccion` AS select `p`.`nombre` AS `nombre`,`p`.`descripcion` AS `descripcion`,`p`.`categoria` AS `categoria`,`pr`.`estado` AS `estado` from (`productos` `p` join `produccion` `pr` on((`p`.`idProducto` = `pr`.`idProducto`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-11  8:00:40
