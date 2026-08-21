-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-08-2026 a las 23:45:45
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `hebratech`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `account_emailaddress`
--

CREATE TABLE `account_emailaddress` (
  `id` int(11) NOT NULL,
  `email` varchar(254) NOT NULL,
  `verified` tinyint(1) NOT NULL,
  `primary` tinyint(1) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `account_emailaddress`
--

INSERT INTO `account_emailaddress` (`id`, `email`, `verified`, `primary`, `user_id`) VALUES
(1, 'almanzajorgedaniel96@gmail.com', 1, 1, 2),
(2, 'sierrita3123@gmail.com', 1, 1, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `account_emailconfirmation`
--

CREATE TABLE `account_emailconfirmation` (
  `id` int(11) NOT NULL,
  `created` datetime(6) NOT NULL,
  `sent` datetime(6) DEFAULT NULL,
  `key` varchar(64) NOT NULL,
  `email_address_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asignacion_tareas`
--

CREATE TABLE `asignacion_tareas` (
  `idAsignacion` int(11) NOT NULL,
  `idTarea` int(11) NOT NULL,
  `idOperario` int(11) NOT NULL COMMENT 'FK a operarios',
  `descripcion` text NOT NULL,
  `fechaAsignacion` date NOT NULL,
  `fechaInicio` date NOT NULL,
  `fechaFinalizacion` date DEFAULT NULL,
  `estado` enum('Pendiente','En Progreso','Completada','Cancelada') NOT NULL DEFAULT 'Pendiente',
  `prioridad` enum('Baja','Media','Alta','Urgente') NOT NULL DEFAULT 'Media',
  `horasEstimadas` decimal(5,2) NOT NULL,
  `tipoPrenda` varchar(50) DEFAULT NULL,
  `cantidadPrendas` int(11) DEFAULT NULL,
  `horasReales` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `asignacion_tareas`
--

INSERT INTO `asignacion_tareas` (`idAsignacion`, `idTarea`, `idOperario`, `descripcion`, `fechaAsignacion`, `fechaInicio`, `fechaFinalizacion`, `estado`, `prioridad`, `horasEstimadas`, `tipoPrenda`, `cantidadPrendas`, `horasReales`) VALUES
(1, 1, 1, 'Cortar tela algodón lote 500 camisetas Éxito', '2026-01-10', '2026-01-11', '2026-01-12', 'Completada', 'Alta', 16.00, NULL, NULL, 15.50),
(2, 2, 2, 'Confeccionar 300 pantalones clásicos Koaj temporada verano', '2026-01-15', '2026-01-16', '2026-06-23', 'Completada', 'Alta', 24.00, NULL, NULL, NULL),
(3, 3, 2, 'Ensamblar 200 chaquetas denim colección Eliot', '2026-01-20', '2026-01-21', '2026-06-23', 'Completada', 'Urgente', 32.00, NULL, NULL, NULL),
(4, 4, 3, 'Bordar diseño exclusivo en 150 blusas Arturo Calle', '2026-02-01', '2026-02-02', NULL, 'En Progreso', 'Alta', 20.00, NULL, NULL, NULL),
(5, 5, 4, 'Aplicar estampado reflectivo en 400 bermudas Tennis', '2026-02-10', '2026-02-11', NULL, 'Pendiente', 'Media', 18.00, NULL, NULL, NULL),
(6, 6, 5, 'Planchar pliegues en 180 faldas midi Punto Blanco', '2026-02-20', '2026-02-21', NULL, 'Pendiente', 'Media', 12.00, NULL, NULL, NULL),
(7, 7, 6, 'Inspección final de calidad en 220 vestidos Studio F', '2026-03-01', '2026-03-02', NULL, 'Pendiente', 'Baja', 10.00, NULL, NULL, NULL),
(8, 2, 2, 'pantalon', '2026-07-29', '2026-07-29', '2026-07-31', 'Completada', 'Urgente', 50.00, 'Pantalones', 300, NULL),
(9, 8, 5, 'Rematar pantalones', '2026-07-30', '2026-07-30', NULL, 'Pendiente', 'Baja', 15.00, 'Pantalones', 100, NULL),
(10, 2, 9, 'Hacer el proceso de confeccion', '2026-07-31', '2026-07-31', '2026-07-31', 'Cancelada', 'Baja', 31.00, 'Pantalones', 150, NULL),
(11, 9, 4, 'Rematar chaquetas', '2026-07-31', '2026-07-31', NULL, 'Pendiente', 'Media', 14.00, 'Chaquetas', 70, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `audi_ordenes`
--

CREATE TABLE `audi_ordenes` (
  `idAuditoria` int(11) NOT NULL,
  `idOrden` int(11) DEFAULT NULL,
  `accion` varchar(20) DEFAULT NULL,
  `datos_antes` text DEFAULT NULL,
  `datos_despues` text DEFAULT NULL,
  `usuario_bd` varchar(100) DEFAULT NULL,
  `fecha` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `audi_tareas`
--

CREATE TABLE `audi_tareas` (
  `idAuditoria` int(11) NOT NULL,
  `idTarea` int(11) DEFAULT NULL,
  `accion` varchar(20) DEFAULT NULL,
  `datos_antes` text DEFAULT NULL,
  `datos_despues` text DEFAULT NULL,
  `usuario_bd` varchar(100) DEFAULT NULL,
  `fecha` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `audi_usuarios`
--

CREATE TABLE `audi_usuarios` (
  `id` int(11) NOT NULL,
  `idUsuario` int(11) DEFAULT NULL,
  `accion` varchar(50) DEFAULT NULL,
  `datos_antes` text DEFAULT NULL,
  `datos_despues` text DEFAULT NULL,
  `usuario_bd` varchar(100) DEFAULT NULL,
  `fecha` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `audi_usuarios`
--

INSERT INTO `audi_usuarios` (`id`, `idUsuario`, `accion`, `datos_antes`, `datos_despues`, `usuario_bd`, `fecha`) VALUES
(1, 3, 'UPDATE', 'Nombre: Lucía, Apellido: Vargas, Correo: lucia.vargas@hebratech.com', 'Nombre: Laura, Apellido: Gomez, Correo: lucia.vargas@hebratech.com', 'root@localhost', '2026-03-19 07:37:27'),
(2, 36, 'INSERT', NULL, 'Nombre: Jorge, Apellido: Almanza, Correo: jorgeformulaone@gmail.com', 'root@localhost', '2026-06-17 16:23:45'),
(3, 37, 'INSERT', NULL, 'Nombre: Almacenes, Apellido: Exito, Correo: exitocompras@gmail.com', 'root@localhost', '2026-06-21 11:52:54'),
(4, 36, 'UPDATE', 'Nombre: Jorge, Apellido: Almanza, Correo: jorgeformulaone@gmail.com', 'Nombre: Jorge, Apellido: Almanza, Correo: jorgeformulaone@gmail.com', 'root@localhost', '2026-06-21 11:59:03'),
(5, 38, 'INSERT', NULL, 'Nombre: Prueba, Apellido: Grupo, Correo: grupo@hebratech.com', 'root@localhost', '2026-06-22 21:57:09'),
(6, 38, 'UPDATE', 'Nombre: Prueba, Apellido: Grupo, Correo: grupo@hebratech.com', 'Nombre: Prueba, Apellido: Grupo, Correo: grupo@hebratech.com', 'root@localhost', '2026-06-22 21:58:26'),
(7, 4, 'UPDATE', 'Nombre: Carlos, Apellido: Méndez, Correo: carlos.mendez@hebratech.com', 'Nombre: Carlos, Apellido: Méndez, Correo: carlos.mendez@hebratech.com', 'root@localhost', '2026-06-23 16:10:00'),
(8, 39, 'INSERT', NULL, 'Nombre: Juan, Apellido: Castro, Correo: juan.castro@hebratech.com', 'root@localhost', '2026-06-23 17:19:17'),
(9, 39, 'UPDATE', 'Nombre: Juan, Apellido: Castro, Correo: juan.castro@hebratech.com', 'Nombre: Juan, Apellido: Castro, Correo: juan.castro@hebratech.com', 'root@localhost', '2026-06-23 17:25:46');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `authtoken_token`
--

CREATE TABLE `authtoken_token` (
  `key` varchar(40) NOT NULL,
  `created` datetime(6) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_group`
--

CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_group_permissions`
--

CREATE TABLE `auth_group_permissions` (
  `id` bigint(20) NOT NULL,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_permission`
--

CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `auth_permission`
--

INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES
(1, 'Can add log entry', 1, 'add_logentry'),
(2, 'Can change log entry', 1, 'change_logentry'),
(3, 'Can delete log entry', 1, 'delete_logentry'),
(4, 'Can view log entry', 1, 'view_logentry'),
(5, 'Can add permission', 3, 'add_permission'),
(6, 'Can change permission', 3, 'change_permission'),
(7, 'Can delete permission', 3, 'delete_permission'),
(8, 'Can view permission', 3, 'view_permission'),
(9, 'Can add group', 2, 'add_group'),
(10, 'Can change group', 2, 'change_group'),
(11, 'Can delete group', 2, 'delete_group'),
(12, 'Can view group', 2, 'view_group'),
(13, 'Can add user', 4, 'add_user'),
(14, 'Can change user', 4, 'change_user'),
(15, 'Can delete user', 4, 'delete_user'),
(16, 'Can view user', 4, 'view_user'),
(17, 'Can add content type', 5, 'add_contenttype'),
(18, 'Can change content type', 5, 'change_contenttype'),
(19, 'Can delete content type', 5, 'delete_contenttype'),
(20, 'Can view content type', 5, 'view_contenttype'),
(21, 'Can add session', 6, 'add_session'),
(22, 'Can change session', 6, 'change_session'),
(23, 'Can delete session', 6, 'delete_session'),
(24, 'Can view session', 6, 'view_session'),
(25, 'Can add cliente', 7, 'add_cliente'),
(26, 'Can change cliente', 7, 'change_cliente'),
(27, 'Can delete cliente', 7, 'delete_cliente'),
(28, 'Can view cliente', 7, 'view_cliente'),
(29, 'Can add orden', 8, 'add_orden'),
(30, 'Can change orden', 8, 'change_orden'),
(31, 'Can delete orden', 8, 'delete_orden'),
(32, 'Can view orden', 8, 'view_orden'),
(33, 'Can add producto', 9, 'add_producto'),
(34, 'Can change producto', 9, 'change_producto'),
(35, 'Can delete producto', 9, 'delete_producto'),
(36, 'Can view producto', 9, 'view_producto'),
(37, 'Can add usuario', 10, 'add_usuario'),
(38, 'Can change usuario', 10, 'change_usuario'),
(39, 'Can delete usuario', 10, 'delete_usuario'),
(40, 'Can view usuario', 10, 'view_usuario'),
(41, 'Can add prenda', 12, 'add_prenda'),
(42, 'Can change prenda', 12, 'change_prenda'),
(43, 'Can delete prenda', 12, 'delete_prenda'),
(44, 'Can view prenda', 12, 'view_prenda'),
(45, 'Can add orden produccion', 11, 'add_ordenproduccion'),
(46, 'Can change orden produccion', 11, 'change_ordenproduccion'),
(47, 'Can delete orden produccion', 11, 'delete_ordenproduccion'),
(48, 'Can view orden produccion', 11, 'view_ordenproduccion'),
(49, 'Can add usuario', 13, 'add_usuario'),
(50, 'Can change usuario', 13, 'change_usuario'),
(51, 'Can delete usuario', 13, 'delete_usuario'),
(52, 'Can view usuario', 13, 'view_usuario'),
(53, 'Can add produccion', 14, 'add_produccion'),
(54, 'Can change produccion', 14, 'change_produccion'),
(55, 'Can delete produccion', 14, 'delete_produccion'),
(56, 'Can view produccion', 14, 'view_produccion'),
(57, 'Can add producto', 15, 'add_producto'),
(58, 'Can change producto', 15, 'change_producto'),
(59, 'Can delete producto', 15, 'delete_producto'),
(60, 'Can view producto', 15, 'view_producto'),
(61, 'Can add asignacion tarea', 16, 'add_asignaciontarea'),
(62, 'Can change asignacion tarea', 16, 'change_asignaciontarea'),
(63, 'Can delete asignacion tarea', 16, 'delete_asignaciontarea'),
(64, 'Can view asignacion tarea', 16, 'view_asignaciontarea'),
(65, 'Can add cliente', 17, 'add_cliente'),
(66, 'Can change cliente', 17, 'change_cliente'),
(67, 'Can delete cliente', 17, 'delete_cliente'),
(68, 'Can view cliente', 17, 'view_cliente'),
(69, 'Can add operario', 18, 'add_operario'),
(70, 'Can change operario', 18, 'change_operario'),
(71, 'Can delete operario', 18, 'delete_operario'),
(72, 'Can view operario', 18, 'view_operario'),
(73, 'Can add orden', 19, 'add_orden'),
(74, 'Can change orden', 19, 'change_orden'),
(75, 'Can delete orden', 19, 'delete_orden'),
(76, 'Can view orden', 19, 'view_orden'),
(77, 'Can add tarea', 20, 'add_tarea'),
(78, 'Can change tarea', 20, 'change_tarea'),
(79, 'Can delete tarea', 20, 'delete_tarea'),
(80, 'Can view tarea', 20, 'view_tarea'),
(81, 'Can add usuario', 21, 'add_usuario'),
(82, 'Can change usuario', 21, 'change_usuario'),
(83, 'Can delete usuario', 21, 'delete_usuario'),
(84, 'Can view usuario', 21, 'view_usuario'),
(85, 'Can add password reset token', 22, 'add_passwordresettoken'),
(86, 'Can change password reset token', 22, 'change_passwordresettoken'),
(87, 'Can delete password reset token', 22, 'delete_passwordresettoken'),
(88, 'Can view password reset token', 22, 'view_passwordresettoken'),
(89, 'Can add incidencia', 23, 'add_incidencia'),
(90, 'Can change incidencia', 23, 'change_incidencia'),
(91, 'Can delete incidencia', 23, 'delete_incidencia'),
(92, 'Can view incidencia', 23, 'view_incidencia'),
(93, 'Can add proveedor', 24, 'add_proveedor'),
(94, 'Can change proveedor', 24, 'change_proveedor'),
(95, 'Can delete proveedor', 24, 'delete_proveedor'),
(96, 'Can view proveedor', 24, 'view_proveedor'),
(97, 'Can add asignacion tarea', 25, 'add_asignaciontarea'),
(98, 'Can change asignacion tarea', 25, 'change_asignaciontarea'),
(99, 'Can delete asignacion tarea', 25, 'delete_asignaciontarea'),
(100, 'Can view asignacion tarea', 25, 'view_asignaciontarea'),
(101, 'Can add incidencia', 26, 'add_incidencia'),
(102, 'Can change incidencia', 26, 'change_incidencia'),
(103, 'Can delete incidencia', 26, 'delete_incidencia'),
(104, 'Can view incidencia', 26, 'view_incidencia'),
(105, 'Can add operario', 27, 'add_operario'),
(106, 'Can change operario', 27, 'change_operario'),
(107, 'Can delete operario', 27, 'delete_operario'),
(108, 'Can view operario', 27, 'view_operario'),
(109, 'Can add tarea', 28, 'add_tarea'),
(110, 'Can change tarea', 28, 'change_tarea'),
(111, 'Can delete tarea', 28, 'delete_tarea'),
(112, 'Can view tarea', 28, 'view_tarea'),
(113, 'Can add usuario', 29, 'add_usuario'),
(114, 'Can change usuario', 29, 'change_usuario'),
(115, 'Can delete usuario', 29, 'delete_usuario'),
(116, 'Can view usuario', 29, 'view_usuario'),
(117, 'Can add site', 30, 'add_site'),
(118, 'Can change site', 30, 'change_site'),
(119, 'Can delete site', 30, 'delete_site'),
(120, 'Can view site', 30, 'view_site'),
(121, 'Can add Token', 31, 'add_token'),
(122, 'Can change Token', 31, 'change_token'),
(123, 'Can delete Token', 31, 'delete_token'),
(124, 'Can view Token', 31, 'view_token'),
(125, 'Can add Token', 32, 'add_tokenproxy'),
(126, 'Can change Token', 32, 'change_tokenproxy'),
(127, 'Can delete Token', 32, 'delete_tokenproxy'),
(128, 'Can view Token', 32, 'view_tokenproxy'),
(129, 'Can add email address', 33, 'add_emailaddress'),
(130, 'Can change email address', 33, 'change_emailaddress'),
(131, 'Can delete email address', 33, 'delete_emailaddress'),
(132, 'Can view email address', 33, 'view_emailaddress'),
(133, 'Can add email confirmation', 34, 'add_emailconfirmation'),
(134, 'Can change email confirmation', 34, 'change_emailconfirmation'),
(135, 'Can delete email confirmation', 34, 'delete_emailconfirmation'),
(136, 'Can view email confirmation', 34, 'view_emailconfirmation'),
(137, 'Can add social account', 35, 'add_socialaccount'),
(138, 'Can change social account', 35, 'change_socialaccount'),
(139, 'Can delete social account', 35, 'delete_socialaccount'),
(140, 'Can view social account', 35, 'view_socialaccount'),
(141, 'Can add social application', 36, 'add_socialapp'),
(142, 'Can change social application', 36, 'change_socialapp'),
(143, 'Can delete social application', 36, 'delete_socialapp'),
(144, 'Can view social application', 36, 'view_socialapp'),
(145, 'Can add social application token', 37, 'add_socialtoken'),
(146, 'Can change social application token', 37, 'change_socialtoken'),
(147, 'Can delete social application token', 37, 'delete_socialtoken'),
(148, 'Can view social application token', 37, 'view_socialtoken'),
(149, 'Can add factura', 38, 'add_factura'),
(150, 'Can change factura', 38, 'change_factura'),
(151, 'Can delete factura', 38, 'delete_factura'),
(152, 'Can view factura', 38, 'view_factura'),
(153, 'Can add inventario', 39, 'add_inventario'),
(154, 'Can change inventario', 39, 'change_inventario'),
(155, 'Can delete inventario', 39, 'delete_inventario'),
(156, 'Can view inventario', 39, 'view_inventario'),
(157, 'Can add producto', 41, 'add_producto'),
(158, 'Can change producto', 41, 'change_producto'),
(159, 'Can delete producto', 41, 'delete_producto'),
(160, 'Can view producto', 41, 'view_producto'),
(161, 'Can add Material', 40, 'add_material'),
(162, 'Can change Material', 40, 'change_material'),
(163, 'Can delete Material', 40, 'delete_material'),
(164, 'Can view Material', 40, 'view_material');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_user`
--

CREATE TABLE `auth_user` (
  `id` int(11) NOT NULL,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `auth_user`
--

INSERT INTO `auth_user` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`) VALUES
(1, 'pbkdf2_sha256$1500000$QpvLrUI7pxyFqHBu8mdCfR$GvrzPdi98YulFa/kB/1TJqux3/D/MK0r4OMDkQRuNPI=', '2026-08-11 22:41:57.834246', 1, 'alman', '', '', 'hebratechoficial@gmail.com', 1, 1, '2026-08-11 22:41:13.514676'),
(2, '!rO2HyHcZhqOOkxJEyOeydX9muo9m4jihTZsoRs9f', '2026-08-11 23:40:12.715404', 0, 'jorge_daniel', 'Jorge Daniel', 'Almanza', 'almanzajorgedaniel96@gmail.com', 0, 1, '2026-08-11 23:38:31.655789'),
(3, '!uIgoyafMi436whWby3OfsBfILIIEqBezzxqZMhrI', '2026-08-17 18:32:47.794765', 0, 'sierrita3123', 'David', 'Sierra', 'sierrita3123@gmail.com', 0, 1, '2026-08-17 18:32:23.580000');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_user_groups`
--

CREATE TABLE `auth_user_groups` (
  `id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auth_user_user_permissions`
--

CREATE TABLE `auth_user_user_permissions` (
  `id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `idCliente` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL COMMENT 'FK a usuarios',
  `tipoCliente` enum('Natural','Empresa') NOT NULL DEFAULT 'Natural',
  `empresa` varchar(150) DEFAULT NULL COMMENT 'Nombre empresa (si aplica)',
  `nombre` varchar(150) DEFAULT NULL COMMENT 'Nombre del contacto principal del cliente',
  `correoElectronico` varchar(200) DEFAULT NULL COMMENT 'Correo de contacto del cliente (puede diferir del usuario)',
  `telefono` varchar(30) DEFAULT NULL COMMENT 'Teléfono de contacto',
  `ciudad` varchar(100) DEFAULT NULL COMMENT 'Ciudad de ubicación del cliente',
  `direccion` varchar(255) DEFAULT NULL COMMENT 'Dirección de entrega',
  `nit` varchar(30) DEFAULT NULL COMMENT 'NIT o cédula tributaria',
  `estado` enum('activo','inactivo','bloqueado') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`idCliente`, `idUsuario`, `tipoCliente`, `empresa`, `nombre`, `correoElectronico`, `telefono`, `ciudad`, `direccion`, `nit`, `estado`) VALUES
(1, 37, 'Empresa', 'Almacenes Éxito S.A.', 'Tati Zuluaga', NULL, '301258945', 'Bogota', 'Calle 47B Sur #24B - 33', '860502316-1', 'activo'),
(2, 11, 'Empresa', 'Koaj Colombia', NULL, NULL, NULL, NULL, NULL, '830115498-2', 'activo'),
(3, 12, 'Empresa', 'Manufacturas Eliot', NULL, NULL, NULL, NULL, NULL, '900456789-0', 'activo'),
(4, 13, 'Natural', 'Arturo Calle', NULL, NULL, NULL, NULL, NULL, '800234567-1', 'activo'),
(5, 14, 'Empresa', 'Tennis S.A.', NULL, NULL, NULL, NULL, NULL, '890123456-3', 'activo'),
(6, 15, 'Natural', 'Punto Blanco', NULL, NULL, NULL, NULL, NULL, '701234567-2', 'activo'),
(7, 16, 'Empresa', 'Studio F', NULL, NULL, NULL, NULL, NULL, '901098765-4', 'activo'),
(11, 44, 'Natural', NULL, 'Jorge Daniel Almanza', 'almanzajorgedaniel96@gmail.com', NULL, NULL, NULL, NULL, 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `devoluciones`
--

CREATE TABLE `devoluciones` (
  `idDevolucion` int(11) NOT NULL,
  `idOrden` int(11) DEFAULT NULL COMMENT 'FK a la orden de origen de la devolución',
  `idCliente` int(11) DEFAULT NULL COMMENT 'Desnormalización para consultas rápidas por cliente',
  `fechaDevolucion` datetime NOT NULL DEFAULT current_timestamp(),
  `estadoDevolucion` enum('Recibida','Inspeccionada','Rechazada','Completada') NOT NULL DEFAULT 'Recibida'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `devoluciones`
--

INSERT INTO `devoluciones` (`idDevolucion`, `idOrden`, `idCliente`, `fechaDevolucion`, `estadoDevolucion`) VALUES
(1, 1, 1, '2026-01-26 09:00:00', 'Inspeccionada'),
(2, 2, 2, '2026-01-31 10:00:00', 'Completada'),
(3, 7, 7, '2026-02-16 11:00:00', 'Recibida'),
(4, 3, 3, '2026-02-11 08:30:00', 'Inspeccionada'),
(5, 5, 5, '2026-02-26 14:00:00', 'Recibida'),
(6, 4, 4, '2026-03-06 09:30:00', 'Recibida'),
(7, 6, 6, '2026-03-19 10:00:00', 'Recibida');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `devolucion_inventario`
--

CREATE TABLE `devolucion_inventario` (
  `idDevInv` int(11) NOT NULL,
  `idDevolucion` int(11) NOT NULL,
  `idInventario` int(11) NOT NULL,
  `cantidadDevuelta` int(11) NOT NULL COMMENT 'Unidades de este producto en esta devolución',
  `razon` enum('Talla incorrecta','Defecto de fabricacion','Daño en transporte','Error de pedido','Color incorrecto','Producto incompleto','Otro') NOT NULL DEFAULT 'Otro',
  `descripcionRazon` text DEFAULT NULL,
  `condicion` enum('Reutilizable','Requiere reparacion','No reutilizable') NOT NULL DEFAULT 'Reutilizable' COMMENT 'Determina si puede re-ingresar al inventario',
  `reingresoInventario` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = reingresada al stock, 0 = pendiente',
  `fechaRegistro` datetime NOT NULL DEFAULT current_timestamp(),
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla pivote M:M entre devoluciones e inventario.';

--
-- Volcado de datos para la tabla `devolucion_inventario`
--

INSERT INTO `devolucion_inventario` (`idDevInv`, `idDevolucion`, `idInventario`, `cantidadDevuelta`, `razon`, `descripcionRazon`, `condicion`, `reingresoInventario`, `fechaRegistro`, `observaciones`) VALUES
(1, 1, 1, 20, 'Defecto de fabricacion', 'Costuras abiertas en hombros. Requieren repaso en overlock.', 'Requiere reparacion', 0, '2026-03-26 22:50:30', 'Lote #1 Éxito — pendiente de reparación'),
(2, 2, 2, 10, 'Talla incorrecta', 'Cliente recibió talla 34 solicitando talla 32. Prendas en perfecto estado.', 'Reutilizable', 1, '2026-03-26 22:50:30', 'Reingresadas al stock. Ver salida_devolucion.'),
(3, 3, 3, 5, 'Defecto de fabricacion', 'Estampado corrido, pigmento fijado incorrectamente.', 'No reutilizable', 0, '2026-03-26 22:50:30', 'Pendiente decisión de descarte o donación'),
(4, 4, 4, 8, 'Defecto de fabricacion', 'Cremalleras YKK fallidas en bolsillos laterales.', 'Requiere reparacion', 0, '2026-03-26 22:50:30', 'Enviadas a taller para reemplazo de cremallera'),
(5, 5, 5, 15, 'Defecto de fabricacion', 'Elástico de cintura pierde tensión tras primer lavado.', 'Requiere reparacion', 0, '2026-03-26 22:50:30', 'Posible reclamación a proveedor de elásticos'),
(6, 6, 6, 6, 'Defecto de fabricacion', 'Bordado en pecho con hilo faltante en puntos del logo AC.', 'Requiere reparacion', 0, '2026-03-26 22:50:30', 'Operario de bordado asignado para corrección'),
(7, 7, 7, 12, 'Defecto de fabricacion', 'Pliegues deformados por exceso de temperatura en planchado.', 'Requiere reparacion', 0, '2026-03-26 22:50:30', 'Evaluando si el daño en poliéster es reversible');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_admin_log`
--

CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext DEFAULT NULL,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) UNSIGNED NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `django_admin_log`
--

INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES
(1, '2026-08-11 22:44:15.198238', '1', '127.0.0.1:8000', 2, '[{\"changed\": {\"fields\": [\"Domain name\", \"Display name\"]}}]', 30, 1),
(2, '2026-08-11 22:47:03.223828', '1', 'Google', 1, '[{\"added\": {}}]', 36, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_content_type`
--

CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `django_content_type`
--

INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES
(33, 'account', 'emailaddress'),
(34, 'account', 'emailconfirmation'),
(1, 'admin', 'logentry'),
(16, 'administrador', 'asignaciontarea'),
(17, 'administrador', 'cliente'),
(23, 'administrador', 'incidencia'),
(39, 'administrador', 'inventario'),
(40, 'administrador', 'material'),
(18, 'administrador', 'operario'),
(19, 'administrador', 'orden'),
(41, 'administrador', 'producto'),
(20, 'administrador', 'tarea'),
(21, 'administrador', 'usuario'),
(2, 'auth', 'group'),
(3, 'auth', 'permission'),
(4, 'auth', 'user'),
(31, 'authtoken', 'token'),
(32, 'authtoken', 'tokenproxy'),
(7, 'clientes', 'cliente'),
(38, 'clientes', 'factura'),
(8, 'clientes', 'orden'),
(9, 'clientes', 'producto'),
(10, 'clientes', 'usuario'),
(5, 'contenttypes', 'contenttype'),
(25, 'operarios', 'asignaciontarea'),
(26, 'operarios', 'incidencia'),
(27, 'operarios', 'operario'),
(28, 'operarios', 'tarea'),
(29, 'operarios', 'usuario'),
(11, 'produccion', 'ordenproduccion'),
(12, 'produccion', 'prenda'),
(14, 'produccion', 'produccion'),
(15, 'produccion', 'producto'),
(24, 'proveedores', 'proveedor'),
(6, 'sessions', 'session'),
(30, 'sites', 'site'),
(35, 'socialaccount', 'socialaccount'),
(36, 'socialaccount', 'socialapp'),
(37, 'socialaccount', 'socialtoken'),
(22, 'usuarios', 'passwordresettoken'),
(13, 'usuarios', 'usuario');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_migrations`
--

CREATE TABLE `django_migrations` (
  `id` bigint(20) NOT NULL,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `django_migrations`
--

INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES
(1, 'contenttypes', '0001_initial', '2026-06-21 16:57:47.689715'),
(2, 'auth', '0001_initial', '2026-06-21 16:57:48.584832'),
(3, 'admin', '0001_initial', '2026-06-21 16:57:48.790484'),
(4, 'admin', '0002_logentry_remove_auto_add', '2026-06-21 16:57:48.802748'),
(5, 'admin', '0003_logentry_add_action_flag_choices', '2026-06-21 16:57:48.816399'),
(6, 'contenttypes', '0002_remove_content_type_name', '2026-06-21 16:57:48.968288'),
(7, 'auth', '0002_alter_permission_name_max_length', '2026-06-21 16:57:49.066133'),
(8, 'auth', '0003_alter_user_email_max_length', '2026-06-21 16:57:49.114241'),
(9, 'auth', '0004_alter_user_username_opts', '2026-06-21 16:57:49.137122'),
(10, 'auth', '0005_alter_user_last_login_null', '2026-06-21 16:57:49.232453'),
(11, 'auth', '0006_require_contenttypes_0002', '2026-06-21 16:57:49.236827'),
(12, 'auth', '0007_alter_validators_add_error_messages', '2026-06-21 16:57:49.250125'),
(13, 'auth', '0008_alter_user_username_max_length', '2026-06-21 16:57:49.337726'),
(14, 'auth', '0009_alter_user_last_name_max_length', '2026-06-21 16:57:49.412392'),
(15, 'auth', '0010_alter_group_name_max_length', '2026-06-21 16:57:49.469000'),
(16, 'auth', '0011_update_proxy_permissions', '2026-06-21 16:57:49.483361'),
(17, 'auth', '0012_alter_user_first_name_max_length', '2026-06-21 16:57:49.598536'),
(18, 'clientes', '0001_initial', '2026-06-21 16:57:49.607402'),
(19, 'sessions', '0001_initial', '2026-06-21 16:57:49.659967'),
(20, 'produccion', '0001_initial', '2026-06-23 00:14:46.254635'),
(21, 'produccion', '0002_alter_ordenproduccion_options_alter_prenda_options', '2026-06-23 00:14:46.271448'),
(22, 'administrador', '0001_initial', '2026-06-23 00:38:32.476780'),
(23, 'produccion', '0003_produccion_producto_delete_ordenproduccion_and_more', '2026-06-23 00:38:32.486547'),
(24, 'usuarios', '0001_initial', '2026-06-23 00:38:32.494470'),
(25, 'administrador', '0002_incidencia', '2026-07-31 01:07:15.781160'),
(26, 'operarios', '0001_initial', '2026-07-31 01:07:15.812479'),
(27, 'proveedores', '0001_initial', '2026-07-31 01:07:15.829794'),
(28, 'usuarios', '0002_passwordresettoken', '2026-07-31 01:07:15.839091'),
(29, 'sites', '0001_initial', '2026-08-11 22:13:36.205778'),
(30, 'sites', '0002_alter_domain_unique', '2026-08-11 22:13:36.252685'),
(31, 'authtoken', '0001_initial', '2026-08-11 22:14:16.723602'),
(32, 'authtoken', '0002_auto_20160226_1747', '2026-08-11 22:14:16.774740'),
(33, 'authtoken', '0003_tokenproxy', '2026-08-11 22:14:16.783318'),
(34, 'authtoken', '0004_alter_tokenproxy_options', '2026-08-11 22:14:16.792873'),
(35, 'account', '0001_initial', '2026-08-11 22:14:29.996287'),
(36, 'account', '0002_email_max_length', '2026-08-11 22:14:30.042055'),
(37, 'account', '0003_alter_emailaddress_create_unique_verified_email', '2026-08-11 22:14:30.123276'),
(38, 'account', '0004_alter_emailaddress_drop_unique_email', '2026-08-11 22:19:00.843423'),
(39, 'socialaccount', '0001_initial', '2026-08-11 22:19:15.464789'),
(40, 'socialaccount', '0002_token_max_lengths', '2026-08-11 22:19:15.564325'),
(41, 'socialaccount', '0003_extra_data_default_dict', '2026-08-11 22:19:15.581384'),
(42, 'socialaccount', '0004_app_provider_id_settings', '2026-08-11 22:21:18.467902'),
(43, 'socialaccount', '0005_socialtoken_nullable_app', '2026-08-11 22:24:47.995041'),
(44, 'socialaccount', '0006_alter_socialaccount_extra_data', '2026-08-11 22:24:48.141584'),
(45, 'account', '0005_emailaddress_idx_upper_email', '2026-08-11 22:25:26.226423'),
(46, 'account', '0006_emailaddress_lower', '2026-08-11 22:25:26.270467'),
(47, 'account', '0007_emailaddress_idx_email', '2026-08-11 22:25:26.367973'),
(48, 'account', '0008_emailaddress_unique_primary_email_fixup', '2026-08-11 22:25:26.417863'),
(49, 'account', '0009_emailaddress_unique_primary_email', '2026-08-11 22:25:26.438262'),
(50, 'administrador', '0003_inventario_producto_material', '2026-08-11 22:28:03.263067'),
(51, 'clientes', '0002_factura', '2026-08-11 22:28:10.561879');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_session`
--

CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `django_session`
--

INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES
('7ver0ftqmguporf9v430yb2lt7g5zf3s', '.eJyrViotLk0sysyPz0xRsjLRgXPz8nOTilKVrJScE4ty8ouVEDJF-TlA4fyC1CIQFyiRmeIP41gZ1QIAwl0dCA:1wpIcl:rXBN5T5U_kOCr1pJJlGwfcU93vFeLFtJBI5kJKFqsMw', '2026-08-13 04:44:03.935971'),
('d162q34h9vnv2o5fswwzjkl21edxxmgc', '.eJyrViotLk0sysyPz0xRsjI214Hz8_Jzk4pSlayUHHNyE5NT81KLlRCSRfk5SlZKyTmZqXklqUq1AHa9GPw:1wpdCL:XqXh1iDPrePilQi4EZdFRSfDciZS-Z3XBQ0do6AI25g', '2026-08-14 02:42:09.559068'),
('pset62wfsxlket6aqitnixqi8jzzkvqk', '.eJytzc8KgjAcAOB3-Z2H6P45vHqIEAykIguRNZctzanTCMR379AreP4O3wLOKiNbqZSdu6l0k5y0g2gBkdNhfn5frkrmN04yiG4L9KNV2jmIoLW16QBBJScJUTe3LYK-UbpUttLlR4_mYfT4lxUFoeCMUIYDTxDGBCYFAkqGu58eVLyrVZMHdJOBYI_zkPkcFwh6vu_jLBX-5XS8nk2wxSAw9wQnNBTFuv4AXb1nbg:1wu7Jq:XgnTDSfbUcA7qgEKouKB1_3c5314mGc3swr_L8dQHUk', '2026-08-26 11:40:26.863758'),
('qg7t3nzbl2gaq9aacsmpjm5ck2qhbtqv', '.eJyrViotLk0sysyPz0xRsjI214Hz8_Jzk4pSlayUHHNyE5NT81KLlRCSRfk5SlZKyTmZqXklqUq1AHa9GPw:1wbPgn:aooMkZTLMN63__zrsXb97f8p_UgO_fx-wTC8js8UTkw', '2026-07-05 21:26:49.486515'),
('sodmxcm5kyes53sysmjsfnsx2jbpwiwr', '.eJyrViotLk0sysyPz0xRsjI214Hz8_Jzk4pSlayUHHNyE5NT81KLlRCSRfk5SlZKyTmZqXklqUq1AHa9GPw:1wpdCL:XqXh1iDPrePilQi4EZdFRSfDciZS-Z3XBQ0do6AI25g', '2026-08-14 02:42:09.762626'),
('sx8zkpunoohdpdlz7hofmz1s6ohlpvic', '.eJxVT8tuhDAM_BefEcoDyOPWfkHvVYUM8ZaoIamSsJfV_nsF3WrLzZ4Zj2duUNLsMeA8py3WsVSsVMDe7g38YVfK_uLJjbSiD2DjFsKTxa0uFKufsfoUx5XqklwB-36D3xns-Qc0gBUsV3owhveDalXHO6FEA985Xb2jDBY-U_oMBA1sfnfgnEkjNWe644NksuNCMLh_NHAEGLdCeTyUEk7YhPMXxZ3AEHa4fcRoD82DLu3Lqcbr4-pktWBZwIImRaKnrjPDbCRyZ3DQYlLThUnS3HFHJPpZ94iM8WFSSlDH9cCMuWhU_d6pbJh9OgJL_dxjWqdMYOEtbzThP2VOYa_gVh99qRldynD_AQrclNk:1ww4lf:eyNZG7dasz8d9NTZrFbqMJ9ooI9AU1ksOdmECe4xNxg', '2026-08-31 21:21:15.797895'),
('zw70hqehjlodr6bg6tktvikc3h0wkrol', '.eJxVT01PhDAQ_StmzoR0SmFabhpP_gVjyFDK0thtTSleNvvfDUiie5t5X3nvBmxt2mIZeCuLi8VbLj7F4erKkqYV-vcb_N7Qw5qs53A6oAIu0CPpThnsUNadQdGirOArp28_uQw9XFK6BAcVbH5PQGxJIJKSiozRRgtNCu4fFRwFhm11eTiUEh6wke2nizvBIexwfdaoD81Jr_Xzw4yX0_UQtfC6QA-2mRsh5o4FaWTdYKsmarUiFpMhqcd5Rm6dGo0Y27mxhEpLJagjSTjzsWndOPt0FFbq74_pOmYHPbylfHFPrxy9C__0OYW9QPAuFgf3H-19fpA:1wtw7e:XkuKuWIZ9w0b2Md7PfWInEPZu2bmcj3kGTNzEDaDIbc', '2026-08-25 23:43:06.324798');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `django_site`
--

CREATE TABLE `django_site` (
  `id` int(11) NOT NULL,
  `domain` varchar(100) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `django_site`
--

INSERT INTO `django_site` (`id`, `domain`, `name`) VALUES
(1, '127.0.0.1:8000', 'HebraTech local');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entrada_materiales`
--

CREATE TABLE `entrada_materiales` (
  `idEntrada` int(11) NOT NULL,
  `idProveedor` int(11) NOT NULL COMMENT 'FK a proveedores',
  `idMaterial` int(11) NOT NULL COMMENT 'FK a materiales',
  `fechaEntrada` date NOT NULL,
  `cantidad` decimal(10,2) NOT NULL DEFAULT 0.00,
  `precioUnitario` decimal(10,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(12,2) GENERATED ALWAYS AS (`cantidad` * `precioUnitario`) STORED COMMENT 'Calculado automáticamente',
  `unidad` varchar(20) NOT NULL DEFAULT 'unidad',
  `numeroRemision` varchar(50) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `estado` enum('Pendiente','Recibida','Cancelada') NOT NULL DEFAULT 'Pendiente',
  `fechaRegistro` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `entrada_materiales`
--

INSERT INTO `entrada_materiales` (`idEntrada`, `idProveedor`, `idMaterial`, `fechaEntrada`, `cantidad`, `precioUnitario`, `unidad`, `numeroRemision`, `observaciones`, `estado`, `fechaRegistro`) VALUES
(1, 1, 1, '2026-02-01', 1000.00, 4500.00, 'Metro', 'REM-2026-T001', 'Tela algodón peinado para temporada verano', 'Recibida', '2026-02-01 08:00:00'),
(2, 2, 2, '2026-02-03', 50.00, 8500.00, 'Cono', 'REM-2026-H002', 'Hilos poliéster 40/2 para producción confección', 'Recibida', '2026-02-03 09:00:00'),
(3, 3, 3, '2026-02-05', 2000.00, 150.00, 'Unidad', 'REM-2026-B003', 'Botones nácar colores surtidos colección formal', 'Recibida', '2026-02-05 08:30:00'),
(4, 4, 4, '2026-02-10', 500.00, 1200.00, 'Unidad', 'REM-2026-C004', 'Cremalleras YKK para chaquetas y faldas plisadas', 'Recibida', '2026-02-10 10:00:00'),
(5, 5, 5, '2026-02-15', 800.00, 800.00, 'Metro', 'REM-2026-E005', 'Elástico plano 2 cm para bermudas y faldas', 'Recibida', '2026-02-15 08:00:00'),
(6, 6, 6, '2026-02-20', 600.00, 2200.00, 'Metro', 'REM-2026-EN006', 'Entretela fusionable para blusas y chaquetas', 'Pendiente', '2026-02-20 09:30:00'),
(7, 7, 7, '2026-02-25', 3000.00, 350.00, 'Unidad', 'REM-2026-ET007', 'Etiquetas tejidas toda la colección 2026', 'Pendiente', '2026-02-25 11:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturas`
--

CREATE TABLE `facturas` (
  `idFactura` int(11) NOT NULL,
  `idOrden` int(11) NOT NULL,
  `idCliente` int(11) NOT NULL,
  `numeroFactura` varchar(30) NOT NULL,
  `fechaEmision` datetime NOT NULL DEFAULT current_timestamp(),
  `rutaPDF` varchar(255) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'Emitida'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `facturas`
--

INSERT INTO `facturas` (`idFactura`, `idOrden`, `idCliente`, `numeroFactura`, `fechaEmision`, `rutaPDF`, `total`, `estado`) VALUES
(3, 13, 1, 'F-20260730-0013', '2026-07-31 02:32:54', 'facturas/F-20260730-0013.pdf', 5500000.00, 'Emitida'),
(4, 14, 1, 'F-20260731-0014', '2026-07-31 14:26:00', 'facturas/F-20260731-0014.pdf', 14250000.00, 'Emitida');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `incidencias`
--

CREATE TABLE `incidencias` (
  `idIncidencia` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL COMMENT 'Operario que genera la incidencia',
  `tipoIncidencia` varchar(50) NOT NULL COMMENT 'Ej: desempeño, ventas, inventario',
  `descripcion` text NOT NULL,
  `estado` varchar(30) NOT NULL DEFAULT 'Generado',
  `fechaGeneracion` date NOT NULL,
  `fechaRevision` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `incidencias`
--

INSERT INTO `incidencias` (`idIncidencia`, `idUsuario`, `tipoIncidencia`, `descripcion`, `estado`, `fechaGeneracion`, `fechaRevision`) VALUES
(1, 1, 'Error de corte', 'Exceso de desperdicio de tela algodón en lote camisetas #1 (15% sobre lo estimado)', 'Revisado', '2026-01-12', '2026-01-13'),
(2, 2, 'Retraso', 'Entrega del lote de pantalones Koaj con 2 días de retraso por falla de maquinaria', 'Revisado', '2026-01-31', '2026-02-01'),
(3, 3, 'Calidad', 'Bordado fuera de especificación en 15 blusas del lote: hilo corrido en pecho', 'Pendiente', '2026-02-05', NULL),
(4, 4, 'Máquina', 'Falla en máquina de serigrafía que detuvo producción de bermudas durante 4 horas', 'Pendiente', '2026-02-12', NULL),
(5, 5, 'Procedimiento', 'Temperatura incorrecta en planchado de faldas: pliegues deformados en 12 unidades', 'Pendiente', '2026-02-22', NULL),
(6, 6, 'Calidad', 'Aprobó prendas con costuras flojas en la revisión de calidad del lote vestidos', 'Pendiente', '2026-03-02', NULL),
(7, 7, 'Retraso', 'Retraso en empaque lote Studio F por agotamiento de bolsas antihumedad', 'Pendiente', '2026-03-03', NULL),
(8, 2, 'Fallo de maquina', 'Se apago repentinamente', 'Generado', '2026-06-23', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE `inventario` (
  `idInventario` int(11) NOT NULL,
  `idProducto` int(11) NOT NULL,
  `cantidadDisponible` int(11) NOT NULL DEFAULT 0,
  `minimoDefinido` int(11) NOT NULL DEFAULT 0,
  `nivelStock` int(11) DEFAULT NULL,
  `unidades` varchar(30) DEFAULT 'unidades',
  `ubicacion` varchar(100) DEFAULT NULL,
  `fechaActualizacion` date DEFAULT NULL,
  `cantidadIngresada` int(11) NOT NULL DEFAULT 0 COMMENT 'Acumulado histórico de unidades ingresadas',
  `cantidadEgresada` int(11) NOT NULL DEFAULT 0 COMMENT 'Acumulado histórico de unidades egresadas',
  `fechaIngreso` date DEFAULT NULL COMMENT 'Fecha del último ingreso de unidades',
  `fechaSalida` date DEFAULT NULL COMMENT 'Fecha de la última salida de unidades'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inventario`
--

INSERT INTO `inventario` (`idInventario`, `idProducto`, `cantidadDisponible`, `minimoDefinido`, `nivelStock`, `unidades`, `ubicacion`, `fechaActualizacion`, `cantidadIngresada`, `cantidadEgresada`, `fechaIngreso`, `fechaSalida`) VALUES
(1, 1, 200, 50, 200, 'Unidades', 'Bodega Confección A', '2026-03-01', 200, 0, '2026-01-01', NULL),
(2, 2, 150, 30, 150, 'Unidades', 'Bodega Confección A', '2026-03-01', 150, 0, '2026-01-01', NULL),
(3, 3, 80, 20, 80, 'Unidades', 'Bodega Confección B', '2026-03-01', 80, 0, '2026-01-01', NULL),
(4, 4, 60, 15, 60, 'Unidades', 'Bodega Denim', '2026-03-01', 60, 0, '2026-01-01', NULL),
(5, 5, 120, 40, 120, 'Unidades', 'Bodega Deportiva', '2026-03-01', 120, 0, '2026-01-01', NULL),
(6, 6, 90, 25, 90, 'Unidades', 'Bodega Formal', '2026-03-01', 90, 0, '2026-01-01', NULL),
(7, 7, 70, 20, 70, 'Unidades', 'Bodega Formal', '2026-03-01', 70, 0, '2026-01-01', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `materiales`
--

CREATE TABLE `materiales` (
  `idMaterial` int(11) NOT NULL,
  `nombreMaterial` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `stockActual` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stockMinimo` decimal(10,2) NOT NULL DEFAULT 0.00,
  `unidadBase` varchar(20) NOT NULL DEFAULT 'unidad',
  `costoUnitario` decimal(10,2) NOT NULL DEFAULT 0.00,
  `fechaActualizacion` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `materiales`
--

INSERT INTO `materiales` (`idMaterial`, `nombreMaterial`, `descripcion`, `stockActual`, `stockMinimo`, `unidadBase`, `costoUnitario`, `fechaActualizacion`) VALUES
(1, 'Tela Algodón Peinado', 'Tela 100% algodón peinado 180 g/m², ancho 1.5 m', 2500.00, 500.00, 'Metro', 4500.00, '2026-03-01'),
(2, 'Hilo Poliéster 40/2', 'Hilo de coser poliéster resistente 40/2, cono 5000 m', 150.00, 30.00, 'Cono', 8500.00, '2026-03-01'),
(3, 'Botón Nácar 4 Huecos', 'Botón nácar sintético 4 huecos 15 mm, colores surtidos', 800.00, 200.00, 'Unidad', 150.00, '2026-03-01'),
(4, 'Cremallera Metálica YKK', 'Cremallera metálica YKK #5 de 25 cm, color negro', 300.00, 100.00, 'Unidad', 1200.00, '2026-03-01'),
(5, 'Elástico Plano 2 cm', 'Elástico tejido plano 2 cm de ancho, alta resistencia al lavado', 500.00, 100.00, 'Metro', 800.00, '2026-03-01'),
(6, 'Entretela Fusionable', 'Entretela no tejida fusionable media rigidez, ancho 90 cm', 400.00, 80.00, 'Metro', 2200.00, '2026-03-01'),
(7, 'Etiqueta Tejida Marca', 'Etiqueta jacquard tejida con marca, talla y país de origen', 1000.00, 200.00, 'Unidad', 350.00, '2026-03-01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `operarios`
--

CREATE TABLE `operarios` (
  `idOperario` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL COMMENT 'FK a usuarios',
  `especialidad` varchar(100) NOT NULL,
  `fechaIngreso` date NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `operarios`
--

INSERT INTO `operarios` (`idOperario`, `idUsuario`, `especialidad`, `fechaIngreso`, `estado`) VALUES
(1, 23, 'Corte', '2025-02-01', 'activo'),
(2, 4, 'Confección', '2025-02-01', 'activo'),
(3, 5, 'Bordado', '2025-02-15', 'activo'),
(4, 6, 'Estampado', '2025-03-01', 'activo'),
(5, 7, 'Planchado', '2025-03-01', 'activo'),
(6, 8, 'Control de Calidad', '2025-03-15', 'activo'),
(7, 9, 'Empaque', '2025-04-01', 'activo'),
(8, 42, 'Control de Calidad', '2026-07-25', 'activo'),
(9, 43, 'Confección', '2026-07-31', 'activo'),
(10, 45, 'Bordado', '2026-08-17', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes`
--

CREATE TABLE `ordenes` (
  `idOrden` int(11) NOT NULL,
  `idCliente` int(11) NOT NULL COMMENT 'FK a clientes',
  `idProducto` int(11) DEFAULT NULL,
  `fechaCreacion` date NOT NULL,
  `fechaEntregaEstimada` date DEFAULT NULL,
  `instrucciones` varchar(1000) NOT NULL,
  `cantidad` int(11) DEFAULT NULL COMMENT 'Unidades pedidas',
  `precioUnitario` decimal(10,2) DEFAULT NULL COMMENT 'Precio unitario al momento de la orden',
  `subtotal` decimal(10,2) GENERATED ALWAYS AS (`cantidad` * `precioUnitario`) STORED COMMENT 'Calculado automáticamente',
  `prioridad` enum('Normal','Urgente') NOT NULL DEFAULT 'Normal',
  `estado` enum('Pendiente','Procesando','Enviado','Entregado','Cancelado') NOT NULL DEFAULT 'Pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ordenes`
--

INSERT INTO `ordenes` (`idOrden`, `idCliente`, `idProducto`, `fechaCreacion`, `fechaEntregaEstimada`, `instrucciones`, `cantidad`, `precioUnitario`, `prioridad`, `estado`) VALUES
(1, 1, NULL, '2026-01-10', '2026-01-25', 'Camisetas con logo bordado en pecho izquierdo, bolsa individual', 500, 35000.00, 'Normal', 'Entregado'),
(2, 2, NULL, '2026-01-15', '2026-01-30', 'Pantalones slim tallas 30-38, etiqueta interna y swing tag', 300, 85000.00, 'Normal', 'Enviado'),
(3, 3, NULL, '2026-01-20', '2026-02-10', 'Chaquetas denim acabado vintage, instrucciones de lavado incluidas', 200, 130000.00, 'Urgente', 'Procesando'),
(4, 4, NULL, '2026-02-01', '2026-02-15', 'Blusas con bordado exclusivo logo AC, empacar en caja individual', 150, 75000.00, 'Normal', 'Procesando'),
(5, 5, NULL, '2026-02-10', '2026-02-25', 'Bermudas deportivas colección verano, etiqueta reflectiva lateral', 400, 55000.00, 'Normal', 'Pendiente'),
(6, 6, NULL, '2026-02-20', '2026-03-05', 'Faldas plisadas midi temporada, control de calidad exhaustivo', 180, 70000.00, 'Urgente', 'Pendiente'),
(7, 7, NULL, '2026-03-01', '2026-03-18', 'Vestidos casuales fondo negro, estampado floral, empacar con papel', 220, 95000.00, 'Normal', 'Pendiente'),
(13, 1, 5, '2026-07-30', '2026-08-08', 'Sin instrucciones', 100, 8000.00, 'Urgente', 'Entregado'),
(14, 1, 3, '2026-07-31', '2026-08-10', 'Sin instrucciones', 150, NULL, 'Urgente', 'Enviado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes_produccion`
--

CREATE TABLE `ordenes_produccion` (
  `idOrdenProduccion` int(11) NOT NULL,
  `numero` varchar(20) NOT NULL,
  `cliente` varchar(150) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `producidas` int(11) NOT NULL,
  `operario` varchar(150) NOT NULL,
  `lineaProduccion` varchar(50) DEFAULT NULL,
  `fechaEntrega` date NOT NULL,
  `prioridad` varchar(10) NOT NULL,
  `estado` varchar(20) NOT NULL,
  `observaciones` longtext DEFAULT NULL,
  `fechaCreacion` date NOT NULL,
  `idPrenda` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `idToken` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `token` varchar(64) NOT NULL,
  `fechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `expira` datetime NOT NULL,
  `usado` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`idToken`, `idUsuario`, `token`, `fechaCreacion`, `expira`, `usado`) VALUES
(3, 44, 'fgjKLbcDtWv8YfJnU2R2ZreHh3UIf-1dAniEOMXoGqo', '2026-08-11 23:41:42', '2026-08-11 23:56:42', 1),
(4, 36, 'kLAuOXxht8ZEyGQB3PtoVXua5H84gJ9dKxuuy3XtKkU', '2026-08-12 11:50:32', '2026-08-12 12:05:32', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prendas`
--

CREATE TABLE `prendas` (
  `idPrenda` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `codigo` varchar(30) NOT NULL,
  `categoria` varchar(20) NOT NULL,
  `tallas` varchar(100) NOT NULL,
  `tiempoMinutos` int(11) NOT NULL,
  `stockObjetivo` int(11) NOT NULL,
  `descripcion` longtext DEFAULT NULL,
  `estado` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `prendas`
--

INSERT INTO `prendas` (`idPrenda`, `nombre`, `codigo`, `categoria`, `tallas`, `tiempoMinutos`, `stockObjetivo`, `descripcion`, `estado`) VALUES
(1, 'Camiseta Algodon', '123', 'Camisa', 'M', 120, 10, 'Prenda a confeccionar', 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `produccion`
--

CREATE TABLE `produccion` (
  `idProduccion` int(11) NOT NULL,
  `idOrden` int(11) DEFAULT NULL COMMENT 'FK a ordenes (puede ser NULL)',
  `idProducto` int(11) NOT NULL COMMENT 'FK a productos',
  `descripcion` varchar(255) NOT NULL,
  `cantidadRequerida` int(11) NOT NULL,
  `fechaInicio` date NOT NULL,
  `fechaEstimadaFin` date NOT NULL,
  `estado` enum('Pendiente','En Progreso','Completado','Detenido') NOT NULL DEFAULT 'Pendiente',
  `fechaRealFin` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `produccion`
--

INSERT INTO `produccion` (`idProduccion`, `idOrden`, `idProducto`, `descripcion`, `cantidadRequerida`, `fechaInicio`, `fechaEstimadaFin`, `estado`, `fechaRealFin`) VALUES
(1, 1, 1, 'Lote camisetas básicas — orden Éxito', 500, '2026-01-10', '2026-01-24', 'Completado', NULL),
(2, 2, 2, 'Lote pantalones clásicos — orden Koaj', 300, '2026-01-15', '2026-01-29', 'En Progreso', NULL),
(3, 3, 4, 'Lote chaquetas denim — orden Eliot', 200, '2026-01-20', '2026-02-09', 'En Progreso', NULL),
(4, 4, 6, 'Lote blusas formales — orden Arturo Calle', 150, '2026-02-01', '2026-02-14', 'En Progreso', NULL),
(5, 5, 5, 'Lote bermudas deportivas — orden Tennis', 400, '2026-02-10', '2026-02-24', 'Pendiente', NULL),
(6, 6, 7, 'Lote faldas plisadas — orden Punto Blanco', 180, '2026-02-20', '2026-03-04', 'Pendiente', NULL),
(7, 7, 3, 'Lote vestidos casuales — orden Studio F', 220, '2026-03-01', '2026-03-17', 'Pendiente', NULL),
(8, NULL, 1, 'Lote de Camisetas Orden Exitosa', 50, '2026-06-22', '2026-06-27', 'En Progreso', NULL),
(9, NULL, 1, 'Camiseta Seleccion Colombia', 20, '2026-06-25', '2026-06-27', 'En Progreso', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `idProducto` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `categoria` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`idProducto`, `nombre`, `descripcion`, `precio`, `categoria`) VALUES
(1, 'Camiseta Básica', 'Camiseta 100% algodón peinado 180 g/m², corte recto unisex', 35000.00, 'Camisetas'),
(2, 'Pantalón Clásico', 'Pantalón gabardina stretch corte slim, tallas 28-38', 85000.00, 'Pantalones'),
(3, 'Vestido Casual', 'Vestido viscosa estampada manga corta, talla única ajustable', 95000.00, 'Vestidos'),
(4, 'Chaqueta Denim', 'Chaqueta denim 12 oz acabado desgastado, botones metálicos', 130000.00, 'Chaquetas'),
(5, 'Bermuda Deportiva', 'Bermuda tela sintética transpirable con bolsillos laterales', 55000.00, 'Bermudas'),
(6, 'Blusa Formal', 'Blusa popelina con bordado exclusivo en pecho, manga larga', 75000.00, 'Blusas'),
(7, 'Falda Plisada', 'Falda plisada poliéster largo midi, pretina elástica reforzada', 70000.00, 'Faldas'),
(8, 'Jeans azules', 'pantalones unisex baggy', 20000.00, '[value-5]');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `idProveedor` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL COMMENT 'FK a usuarios — administrador que gestiona el proveedor',
  `nombreEmpresa` varchar(150) NOT NULL,
  `nombreContacto` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(200) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `nit` varchar(30) DEFAULT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `fechaRegistro` date NOT NULL DEFAULT '2026-01-01'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedores`
--

INSERT INTO `proveedores` (`idProveedor`, `idUsuario`, `nombreEmpresa`, `nombreContacto`, `telefono`, `correo`, `direccion`, `nit`, `estado`, `fechaRegistro`) VALUES
(1, 1, 'Textiles Colombia S.A.', 'Jorge Bedoya', '3002000001', 'ventas@textilescol.com', 'Calle 13 #34-20, Bogotá', '830456789-1', 'activo', '2025-12-01'),
(2, 2, 'Hilos y Fibras Andinas', 'Carmen Ríos', '3152000002', 'pedidos@hilosandinos.com', 'Carrera 50 #12-30, Medellín', '900234567-2', 'activo', '2025-12-05'),
(3, 1, 'Botones y Avíos del Norte', 'Ricardo Peña', '3203000003', 'avios@btnorte.com', 'Av. 80 #65-10, Barranquilla', '901345678-3', 'activo', '2025-12-10'),
(4, 2, 'Cremalleras YKK Colombia', 'Sandra López', '3104000004', 'ventas@ykkco.com', 'Calle 100 #19-60, Bogotá', '830567890-4', 'activo', '2026-01-05'),
(5, 1, 'Elásticos y Cintas S.A.S.', 'Mauricio Silva', '3005000005', 'pedidos@elasticos.com', 'Carrera 7 #45-80, Bogotá', '900678901-5', 'activo', '2026-01-10'),
(6, 2, 'Entretelas del Pacífico', 'Gloria Muñoz', '3156000006', 'entretelas@pacifico.com', 'Calle 5 #10-20, Cali', '901789012-6', 'activo', '2026-01-15'),
(7, 1, 'Etiquetas y Marcas Print', 'Héctor Duarte', '3107000007', 'ventas@etiquetasprint.com', 'Carrera 15 #88-20, Bogotá', '830890123-7', 'activo', '2026-01-20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `salida_devolucion`
--

CREATE TABLE `salida_devolucion` (
  `idSalida` int(11) NOT NULL,
  `idInventario` int(11) NOT NULL COMMENT 'FK a inventario',
  `tipoSalida` enum('Venta','Donacion','Descarte','Reintegro al cliente','Transferencia interna') NOT NULL,
  `cantidadSalida` int(11) NOT NULL COMMENT 'Puede ser parcial',
  `precioUnitario` decimal(10,2) DEFAULT NULL COMMENT 'Solo aplica si tipoSalida = Venta',
  `subtotal` decimal(12,2) GENERATED ALWAYS AS (`cantidadSalida` * `precioUnitario`) STORED,
  `destinatario` varchar(200) DEFAULT NULL COMMENT 'Cliente, fundación u organización',
  `numeroDocumento` varchar(80) DEFAULT NULL COMMENT 'Factura, remisión o soporte',
  `fechaSalida` datetime NOT NULL DEFAULT current_timestamp(),
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Destino final de cada ítem devuelto: venta, donación, descarte, etc.';

--
-- Volcado de datos para la tabla `salida_devolucion`
--

INSERT INTO `salida_devolucion` (`idSalida`, `idInventario`, `tipoSalida`, `cantidadSalida`, `precioUnitario`, `destinatario`, `numeroDocumento`, `fechaSalida`, `observaciones`) VALUES
(1, 2, 'Venta', 7, 60000.00, 'Koaj Colombia', 'FAC-DEV-2026-001', '2026-03-26 22:50:30', 'Pantalones talla 32 revendidos con 29% de descuento'),
(2, 2, 'Donacion', 3, NULL, 'Fundación Tejiendo Sueños Bogotá', 'DON-2026-001', '2026-03-26 22:50:30', 'Unidades en buen estado donadas a fundación de Kennedy');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `socialaccount_socialaccount`
--

CREATE TABLE `socialaccount_socialaccount` (
  `id` int(11) NOT NULL,
  `provider` varchar(30) NOT NULL,
  `uid` varchar(191) NOT NULL,
  `last_login` datetime(6) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `extra_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`extra_data`)),
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `socialaccount_socialaccount`
--

INSERT INTO `socialaccount_socialaccount` (`id`, `provider`, `uid`, `last_login`, `date_joined`, `extra_data`, `user_id`) VALUES
(1, 'google', '115701174247998980874', '2026-08-11 23:40:12.656834', '2026-08-11 23:38:31.688218', '{\"aud\": \"YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com\", \"azp\": \"YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com\", \"exp\": 1786495210, \"iat\": 1786491610, \"iss\": \"https://accounts.google.com\", \"sub\": \"115701174247998980874\", \"name\": \"Jorge Daniel Almanza\", \"email\": \"almanzajorgedaniel96@gmail.com\", \"at_hash\": \"w0_JxVhwN34CKYZzHQv75w\", \"picture\": \"https://lh3.googleusercontent.com/a/ACg8ocIxWruPpNsj-uFskhaO1XTIWj-s8d53ejw5lzz9rkN81ngu9cGEjA=s96-c\", \"given_name\": \"Jorge Daniel\", \"family_name\": \"Almanza\", \"email_verified\": true}', 2),
(2, 'google', '110393810841630341220', '2026-08-17 18:32:46.666215', '2026-08-17 18:32:46.666229', '{\"iss\": \"https://accounts.google.com\", \"azp\": \"YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com\", \"aud\": \"YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com\", \"sub\": \"110393810841630341220\", \"email\": \"sierrita3123@gmail.com\", \"email_verified\": true, \"at_hash\": \"RRou_kSOu920LRhJnY_hGQ\", \"name\": \"David Sierra\", \"picture\": \"https://lh3.googleusercontent.com/a/ACg8ocLfM1G_4au0TlhDKvg4SDHAXv9hUUsGRNDe3XTNI7nj4m4THQ=s96-c\", \"given_name\": \"David\", \"family_name\": \"Sierra\", \"iat\": 1786991543, \"exp\": 1786995143}', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `socialaccount_socialapp`
--

CREATE TABLE `socialaccount_socialapp` (
  `id` int(11) NOT NULL,
  `provider` varchar(30) NOT NULL,
  `name` varchar(40) NOT NULL,
  `client_id` varchar(191) NOT NULL,
  `secret` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `provider_id` varchar(200) NOT NULL,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`settings`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `socialaccount_socialapp`
--

INSERT INTO `socialaccount_socialapp` (`id`, `provider`, `name`, `client_id`, `secret`, `key`, `provider_id`, `settings`) VALUES
(1, 'google', 'Google', 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', 'YOUR_GOOGLE_CLIENT_SECRET', '', '', '{}');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `socialaccount_socialapp_sites`
--

CREATE TABLE `socialaccount_socialapp_sites` (
  `id` bigint(20) NOT NULL,
  `socialapp_id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `socialaccount_socialapp_sites`
--

INSERT INTO `socialaccount_socialapp_sites` (`id`, `socialapp_id`, `site_id`) VALUES
(1, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `socialaccount_socialtoken`
--

CREATE TABLE `socialaccount_socialtoken` (
  `id` int(11) NOT NULL,
  `token` longtext NOT NULL,
  `token_secret` longtext NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  `account_id` int(11) NOT NULL,
  `app_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tareas`
--

CREATE TABLE `tareas` (
  `idTarea` int(11) NOT NULL,
  `idProduccion` int(11) DEFAULT NULL COMMENT 'Tarea vinculada a un proceso de producción',
  `nombreTarea` varchar(150) NOT NULL,
  `descripcionTarea` text NOT NULL,
  `fechaCreacion` date NOT NULL,
  `proceso` varchar(100) NOT NULL,
  `complejidad` enum('baja','media','alta') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tareas`
--

INSERT INTO `tareas` (`idTarea`, `idProduccion`, `nombreTarea`, `descripcionTarea`, `fechaCreacion`, `proceso`, `complejidad`) VALUES
(1, 1, 'Corte de tela — camisetas', 'Cortar tela algodón según moldes de camiseta básica tallas S-XL', '2026-01-10', 'Corte', 'media'),
(2, 2, 'Confección de pantalones', 'Unir piezas, coser costuras principales y colocar cremallera', '2026-01-15', 'Confección', 'alta'),
(3, 3, 'Ensamble chaquetas denim', 'Unir delantero, espalda y mangas; remache de botones metálicos', '2026-01-20', 'Confección', 'alta'),
(4, 4, 'Bordado blusas formales', 'Aplicar bordado exclusivo logo AC en pecho izquierdo de la blusa', '2026-02-01', 'Bordado', 'alta'),
(5, 5, 'Estampado bermudas', 'Aplicar estampado reflectivo lateral con serigrafía en 2 colores', '2026-02-10', 'Estampado', 'media'),
(6, 6, 'Planchado faldas plisadas', 'Planchar pliegues con vapor industrial 160°C; controlar temperatura', '2026-02-20', 'Planchado', 'media'),
(7, 7, 'Control de calidad vestidos', 'Inspeccionar costuras, estampado y acabados del lote Studio F', '2026-03-01', 'Control de Calidad', 'baja'),
(8, NULL, 'Remate', 'Rematar pantalones', '2026-07-30', 'Ultimo proceso', 'media'),
(9, NULL, 'Remate', 'Rematar chaquetas', '2026-07-31', 'Remate', 'media');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tarea_materiales`
--

CREATE TABLE `tarea_materiales` (
  `idTareaMaterial` int(11) NOT NULL,
  `idTarea` int(11) NOT NULL,
  `idMaterial` int(11) NOT NULL,
  `cantidadUsada` decimal(10,2) NOT NULL COMMENT 'Cantidad consumida del material',
  `unidad` varchar(20) NOT NULL DEFAULT 'unidad',
  `observaciones` text DEFAULT NULL,
  `fechaRegistro` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tarea_materiales`
--

INSERT INTO `tarea_materiales` (`idTareaMaterial`, `idTarea`, `idMaterial`, `cantidadUsada`, `unidad`, `observaciones`, `fechaRegistro`) VALUES
(1, 1, 1, 3.50, 'Metro', 'Tela algodón cortada según moldes camiseta tallas S-XL', '2026-01-11 08:00:00'),
(2, 2, 2, 2.00, 'Cono', 'Hilo para costuras principales y dobladillo del pantalón', '2026-01-16 08:00:00'),
(3, 3, 4, 1.00, 'Unidad', 'Cremallera YKK en bolsillo lateral de la chaqueta denim', '2026-01-21 08:00:00'),
(4, 4, 3, 6.00, 'Unidad', 'Botones nácar para decoración en cuello de blusa formal', '2026-02-02 08:00:00'),
(5, 5, 5, 0.30, 'Metro', 'Elástico para cintura interior de bermuda deportiva', '2026-02-11 08:00:00'),
(6, 6, 6, 0.50, 'Metro', 'Entretela fusionable en pretina de falda plisada', '2026-02-21 08:00:00'),
(7, 7, 7, 1.00, 'Unidad', 'Etiqueta de marca y talla aplicada en costado del vestido', '2026-03-02 08:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `idUsuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `correoElectronico` varchar(200) NOT NULL,
  `contrasena` varchar(255) NOT NULL COMMENT 'Almacenar siempre hasheada (bcrypt/argon2)',
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `rol` enum('administrador','operario','cliente','sin_asignar') NOT NULL DEFAULT 'cliente',
  `estado` enum('activo','inactivo','pendiente','reportado') NOT NULL DEFAULT 'activo',
  `fotoPerfil` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`idUsuario`, `nombre`, `apellido`, `correoElectronico`, `contrasena`, `telefono`, `direccion`, `rol`, `estado`, `fotoPerfil`) VALUES
(1, 'Andrea', 'Rios', 'andrea.rios@hebratech.com', '$2b$10$HASH_PENDIENTE', '3001000001', 'Bogotá', 'administrador', 'activo', NULL),
(2, 'Miguel', 'Torres', 'miguel.torres@hebratech.com', '$2b$10$HASH_PENDIENTE', '3001000002', 'Bogotá', 'administrador', 'activo', NULL),
(4, 'Carlos', 'Méndez', 'carlos.mendez@hebratech.com', 'pbkdf2_sha256$1200000$FMiUMeNZrDzKIn85CbdM5L$gj6DfxCrf4NH+e5gXsqV3WGM3einBMuSz7zIqdjnKJo=', '3101000002', NULL, 'operario', 'activo', NULL),
(5, 'Diana', 'Puentes', 'diana.puentes@hebratech.com', '$2b$10$HASH_PENDIENTE', '3101000003', NULL, 'operario', 'activo', NULL),
(6, 'Felipe', 'Mora', 'felipe.mora@hebratech.com', '$2b$10$HASH_PENDIENTE', '3101000004', NULL, 'operario', 'activo', NULL),
(7, 'Valentina', 'Cruz', 'valentina.cruz@hebratech.com', '$2b$10$HASH_PENDIENTE', '3101000005', NULL, 'operario', 'activo', NULL),
(8, 'Sergio', 'Leal', 'sergio.leal@hebratech.com', '$2b$10$HASH_PENDIENTE', '3101000006', NULL, 'operario', 'activo', NULL),
(9, 'Natalia', 'Ossa', 'natalia.ossa@hebratech.com', '$2b$10$HASH_PENDIENTE', '3101000007', NULL, 'operario', 'activo', NULL),
(11, 'Pedidos', 'Koaj', 'pedidos@koaj.com', '$2b$10$HASH_PENDIENTE', '6017002000', 'Calle 80 #50-30, Bogotá', 'cliente', 'activo', NULL),
(12, 'Compras', 'Eliot', 'compras@eliot.com', '$2b$10$HASH_PENDIENTE', '6017003000', 'Carrera 7 #12-40, Bogotá', 'cliente', 'activo', NULL),
(13, 'Pedidos', 'ArturoCalle', 'pedidos@arturocalle.com', '$2b$10$HASH_PENDIENTE', '6017004000', 'El Poblado, Medellín', 'cliente', 'activo', NULL),
(14, 'Compras', 'Tennis', 'compras@tennis.com', '$2b$10$HASH_PENDIENTE', '6017005000', 'Calle 97 #60-30, Bogotá', 'cliente', 'activo', NULL),
(15, 'Pedidos', 'PuntoBlanco', 'pedidos@puntoblanco.com', '$2b$10$HASH_PENDIENTE', '6017006000', 'Av. 6N #24-01, Cali', 'cliente', 'activo', NULL),
(16, 'Compras', 'StudioF', 'compras@studiof.com', '$2b$10$HASH_PENDIENTE', '6017007000', 'Calle 122 #15-80, Bogotá', 'cliente', 'activo', NULL),
(23, 'Laura', 'Gomez', 'lucia.vargas@hebratech.com', '$2b$10$HASH_PENDIENTE', '3101000001', NULL, 'operario', 'activo', NULL),
(36, 'Jorge', 'Almanza', 'jorgeformulaone@gmail.com', 'pbkdf2_sha256$1500000$FbrpmVWjRWl6x6Qr8BuKgs$PB6y8oeZUmdSJ8AwsZK/p8VXjc8ody4yc0lWzRjJV4Q=', NULL, NULL, 'operario', 'activo', NULL),
(37, 'Almacenes', 'Exito', 'exitocompras@gmail.com', 'pbkdf2_sha256$1200000$Ohw1zC90mcUL4Lt7vgbIgz$fJGY0aoEkvMGHiV5VCPhIEGdFkfoT5cPAUoI6bxRAMw=', NULL, NULL, 'cliente', 'activo', NULL),
(38, 'Prueba', 'Grupo', 'grupo@hebratech.com', 'pbkdf2_sha256$1200000$FOda1qlIHf11rTyIUaPw6Z$EFZei2tHQypXFno8aWTEJ7tciA+okhReNKv+rmnQ1YY=', '3201000000', 'Calle 100 #15-20, Bogotá', 'administrador', 'activo', NULL),
(39, 'Juan', 'Castro', 'juan.castro@hebratech.com', 'pbkdf2_sha256$1200000$X4Wev2wH6nxPAFoqBhGEJG$ydUcLM/l4HvlccNlT9wsF0HfoDbMjvv3h5HMc12zrEg=', '3129998877', NULL, 'operario', 'activo', NULL),
(42, 'Rafa', 'Marquez', 'rafa@gmail.com', 'pbkdf2_sha256$600000$nzSmoWbZShVtGSMkfjQJ0c$L7EtVNzcvD6URxEic5BVcARoBWqNahrSYVBA06dvLy4=', '3018956547', NULL, 'operario', 'activo', NULL),
(43, 'Jorge', 'Suarez', 'jorge12@gmail.com', 'pbkdf2_sha256$600000$4KHV8i3xeGEq5f6goTWXpU$3An9sYrW2VaHA9ShO4v6AeJKPGgCF3CoKOIRn1ZuO3Y=', NULL, NULL, 'operario', 'activo', NULL),
(44, 'Jorge Daniel', 'Almanza', 'almanzajorgedaniel96@gmail.com', 'pbkdf2_sha256$1500000$cWeQIg3qYxuBLNdoG54O3S$WYhkJppHGDax7fzNglwiCJz45qh2wnOmwxPv6nLaZTc=', '3012587896', NULL, 'cliente', 'activo', NULL),
(45, 'David', 'Sierra', 'sierrita3123@gmail.com', 'pbkdf2_sha256$1500000$kis1C3CSQBykCXrQ7aDNca$hKR96ONLB2LNMLhibZRyZTDw6WzC2J/gKknHkp5mzkg=', '3213996835', NULL, 'operario', 'activo', NULL);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `ver_un_producto_y_su_estado_en_la_produccion`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `ver_un_producto_y_su_estado_en_la_produccion` (
`nombre` varchar(150)
,`descripcion` text
,`categoria` varchar(100)
,`estado` enum('Pendiente','En Progreso','Completado','Detenido')
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `_migracion_log`
--

CREATE TABLE `_migracion_log` (
  `id` int(11) NOT NULL,
  `bloque` varchar(80) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `ejecutado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `estado` enum('OK','ERROR') NOT NULL DEFAULT 'OK'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Registro de ejecución de migraciones HebraTech';

--
-- Volcado de datos para la tabla `_migracion_log`
--

INSERT INTO `_migracion_log` (`id`, `bloque`, `descripcion`, `ejecutado_en`, `estado`) VALUES
(1, 'INICIO', 'Inicio de migración completa HebraTech v1.0', '2026-06-08 13:10:06', 'OK'),
(2, 'BLOQUE 1', 'Eliminada productos.cantidad; agregado UNIQUE en inventario.idProducto', '2026-06-08 13:10:06', 'OK'),
(3, 'BLOQUE 2', 'devoluciones: FK a ordenes/clientes agregada; columnas redundantes eliminadas', '2026-06-08 13:10:06', 'OK'),
(4, 'INICIO', 'Inicio de migración completa HebraTech v1.0', '2026-06-08 13:10:15', 'OK'),
(5, 'INICIO', 'Inicio de migración completa HebraTech v1.0', '2026-06-08 13:10:19', 'OK');

-- --------------------------------------------------------

--
-- Estructura para la vista `ver_un_producto_y_su_estado_en_la_produccion`
--
DROP TABLE IF EXISTS `ver_un_producto_y_su_estado_en_la_produccion`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `ver_un_producto_y_su_estado_en_la_produccion`  AS SELECT `p`.`nombre` AS `nombre`, `p`.`descripcion` AS `descripcion`, `p`.`categoria` AS `categoria`, `pr`.`estado` AS `estado` FROM (`productos` `p` join `produccion` `pr` on(`p`.`idProducto` = `pr`.`idProducto`)) ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `account_emailaddress`
--
ALTER TABLE `account_emailaddress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_emailaddress_user_id_email_987c8728_uniq` (`user_id`,`email`),
  ADD KEY `account_emailaddress_email_03be32b2` (`email`);

--
-- Indices de la tabla `account_emailconfirmation`
--
ALTER TABLE `account_emailconfirmation`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `key` (`key`),
  ADD KEY `account_emailconfirm_email_address_id_5b7f8c58_fk_account_e` (`email_address_id`);

--
-- Indices de la tabla `asignacion_tareas`
--
ALTER TABLE `asignacion_tareas`
  ADD PRIMARY KEY (`idAsignacion`),
  ADD KEY `fk_asig_tarea` (`idTarea`),
  ADD KEY `fk_asig_operario` (`idOperario`);

--
-- Indices de la tabla `audi_ordenes`
--
ALTER TABLE `audi_ordenes`
  ADD PRIMARY KEY (`idAuditoria`);

--
-- Indices de la tabla `audi_tareas`
--
ALTER TABLE `audi_tareas`
  ADD PRIMARY KEY (`idAuditoria`);

--
-- Indices de la tabla `audi_usuarios`
--
ALTER TABLE `audi_usuarios`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `authtoken_token`
--
ALTER TABLE `authtoken_token`
  ADD PRIMARY KEY (`key`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indices de la tabla `auth_group`
--
ALTER TABLE `auth_group`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  ADD KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`);

--
-- Indices de la tabla `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`);

--
-- Indices de la tabla `auth_user`
--
ALTER TABLE `auth_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indices de la tabla `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  ADD KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`);

--
-- Indices de la tabla `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  ADD KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`idCliente`),
  ADD UNIQUE KEY `uq_cliente_usuario` (`idUsuario`),
  ADD KEY `idx_cliente_nit` (`nit`);

--
-- Indices de la tabla `devoluciones`
--
ALTER TABLE `devoluciones`
  ADD PRIMARY KEY (`idDevolucion`),
  ADD KEY `fk_dev_orden` (`idOrden`),
  ADD KEY `fk_dev_cliente` (`idCliente`);

--
-- Indices de la tabla `devolucion_inventario`
--
ALTER TABLE `devolucion_inventario`
  ADD PRIMARY KEY (`idDevInv`),
  ADD UNIQUE KEY `uq_devolucion_inventario` (`idDevolucion`,`idInventario`),
  ADD KEY `fk_dinv_devolucion` (`idDevolucion`),
  ADD KEY `fk_dinv_inventario` (`idInventario`);

--
-- Indices de la tabla `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  ADD KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`);

--
-- Indices de la tabla `django_content_type`
--
ALTER TABLE `django_content_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`);

--
-- Indices de la tabla `django_migrations`
--
ALTER TABLE `django_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `django_session`
--
ALTER TABLE `django_session`
  ADD PRIMARY KEY (`session_key`),
  ADD KEY `django_session_expire_date_a5c62663` (`expire_date`);

--
-- Indices de la tabla `django_site`
--
ALTER TABLE `django_site`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `django_site_domain_a2e37b91_uniq` (`domain`);

--
-- Indices de la tabla `entrada_materiales`
--
ALTER TABLE `entrada_materiales`
  ADD PRIMARY KEY (`idEntrada`),
  ADD KEY `fk_em_proveedor` (`idProveedor`),
  ADD KEY `fk_em_material` (`idMaterial`),
  ADD KEY `idx_em_proveedor` (`idProveedor`),
  ADD KEY `idx_em_material` (`idMaterial`);

--
-- Indices de la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD PRIMARY KEY (`idFactura`),
  ADD UNIQUE KEY `numeroFactura` (`numeroFactura`),
  ADD KEY `fk_factura_orden` (`idOrden`),
  ADD KEY `fk_factura_cliente` (`idCliente`);

--
-- Indices de la tabla `incidencias`
--
ALTER TABLE `incidencias`
  ADD PRIMARY KEY (`idIncidencia`),
  ADD KEY `fk_inc_operario` (`idUsuario`);

--
-- Indices de la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`idInventario`),
  ADD UNIQUE KEY `uq_inv_producto` (`idProducto`),
  ADD KEY `fk_inv_producto` (`idProducto`);

--
-- Indices de la tabla `materiales`
--
ALTER TABLE `materiales`
  ADD PRIMARY KEY (`idMaterial`),
  ADD UNIQUE KEY `uq_nombre_material` (`nombreMaterial`);

--
-- Indices de la tabla `operarios`
--
ALTER TABLE `operarios`
  ADD PRIMARY KEY (`idOperario`),
  ADD KEY `fk_op_usuario` (`idUsuario`);

--
-- Indices de la tabla `ordenes`
--
ALTER TABLE `ordenes`
  ADD PRIMARY KEY (`idOrden`),
  ADD KEY `fk_ord_cliente` (`idCliente`),
  ADD KEY `idx_orden_estado` (`estado`),
  ADD KEY `fk_orden_producto` (`idProducto`);

--
-- Indices de la tabla `ordenes_produccion`
--
ALTER TABLE `ordenes_produccion`
  ADD PRIMARY KEY (`idOrdenProduccion`),
  ADD UNIQUE KEY `numero` (`numero`),
  ADD KEY `ordenes_produccion_idPrenda_e87d8fd6_fk_prendas_idPrenda` (`idPrenda`);

--
-- Indices de la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`idToken`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `fk_reset_usuario` (`idUsuario`);

--
-- Indices de la tabla `prendas`
--
ALTER TABLE `prendas`
  ADD PRIMARY KEY (`idPrenda`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `produccion`
--
ALTER TABLE `produccion`
  ADD PRIMARY KEY (`idProduccion`),
  ADD KEY `fk_prod_orden` (`idOrden`),
  ADD KEY `fk_prod_producto` (`idProducto`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`idProducto`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`idProveedor`),
  ADD KEY `fk_prov_usuario` (`idUsuario`),
  ADD KEY `idx_prov_usuario` (`idUsuario`);

--
-- Indices de la tabla `salida_devolucion`
--
ALTER TABLE `salida_devolucion`
  ADD PRIMARY KEY (`idSalida`),
  ADD KEY `fk_sal_inventario` (`idInventario`);

--
-- Indices de la tabla `socialaccount_socialaccount`
--
ALTER TABLE `socialaccount_socialaccount`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `socialaccount_socialaccount_provider_uid_fc810c6e_uniq` (`provider`,`uid`),
  ADD KEY `socialaccount_socialaccount_user_id_8146e70c_fk_auth_user_id` (`user_id`);

--
-- Indices de la tabla `socialaccount_socialapp`
--
ALTER TABLE `socialaccount_socialapp`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `socialaccount_socialapp_sites`
--
ALTER TABLE `socialaccount_socialapp_sites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `socialaccount_socialapp_sites_socialapp_id_site_id_71a9a768_uniq` (`socialapp_id`,`site_id`),
  ADD KEY `socialaccount_socialapp_sites_site_id_2579dee5_fk_django_site_id` (`site_id`);

--
-- Indices de la tabla `socialaccount_socialtoken`
--
ALTER TABLE `socialaccount_socialtoken`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `socialaccount_socialtoken_app_id_account_id_fca4e0ac_uniq` (`app_id`,`account_id`),
  ADD KEY `socialaccount_social_account_id_951f210e_fk_socialacc` (`account_id`);

--
-- Indices de la tabla `tareas`
--
ALTER TABLE `tareas`
  ADD PRIMARY KEY (`idTarea`),
  ADD KEY `fk_tarea_produccion` (`idProduccion`);

--
-- Indices de la tabla `tarea_materiales`
--
ALTER TABLE `tarea_materiales`
  ADD PRIMARY KEY (`idTareaMaterial`),
  ADD UNIQUE KEY `uq_tarea_material` (`idTarea`,`idMaterial`) COMMENT 'Un material no se repite en la misma tarea',
  ADD KEY `fk_tm_tarea` (`idTarea`),
  ADD KEY `fk_tm_material` (`idMaterial`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`idUsuario`),
  ADD UNIQUE KEY `uq_correo` (`correoElectronico`);

--
-- Indices de la tabla `_migracion_log`
--
ALTER TABLE `_migracion_log`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `account_emailaddress`
--
ALTER TABLE `account_emailaddress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `account_emailconfirmation`
--
ALTER TABLE `account_emailconfirmation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `asignacion_tareas`
--
ALTER TABLE `asignacion_tareas`
  MODIFY `idAsignacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `audi_ordenes`
--
ALTER TABLE `audi_ordenes`
  MODIFY `idAuditoria` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `audi_tareas`
--
ALTER TABLE `audi_tareas`
  MODIFY `idAuditoria` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `audi_usuarios`
--
ALTER TABLE `audi_usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `auth_group`
--
ALTER TABLE `auth_group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `auth_permission`
--
ALTER TABLE `auth_permission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=165;

--
-- AUTO_INCREMENT de la tabla `auth_user`
--
ALTER TABLE `auth_user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `idCliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `devoluciones`
--
ALTER TABLE `devoluciones`
  MODIFY `idDevolucion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `devolucion_inventario`
--
ALTER TABLE `devolucion_inventario`
  MODIFY `idDevInv` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `django_admin_log`
--
ALTER TABLE `django_admin_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `django_content_type`
--
ALTER TABLE `django_content_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT de la tabla `django_migrations`
--
ALTER TABLE `django_migrations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT de la tabla `django_site`
--
ALTER TABLE `django_site`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `entrada_materiales`
--
ALTER TABLE `entrada_materiales`
  MODIFY `idEntrada` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `facturas`
--
ALTER TABLE `facturas`
  MODIFY `idFactura` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `incidencias`
--
ALTER TABLE `incidencias`
  MODIFY `idIncidencia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `idInventario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `materiales`
--
ALTER TABLE `materiales`
  MODIFY `idMaterial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `operarios`
--
ALTER TABLE `operarios`
  MODIFY `idOperario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `ordenes`
--
ALTER TABLE `ordenes`
  MODIFY `idOrden` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `ordenes_produccion`
--
ALTER TABLE `ordenes_produccion`
  MODIFY `idOrdenProduccion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `idToken` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `prendas`
--
ALTER TABLE `prendas`
  MODIFY `idPrenda` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `produccion`
--
ALTER TABLE `produccion`
  MODIFY `idProduccion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `idProducto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `idProveedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `salida_devolucion`
--
ALTER TABLE `salida_devolucion`
  MODIFY `idSalida` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `socialaccount_socialaccount`
--
ALTER TABLE `socialaccount_socialaccount`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `socialaccount_socialapp`
--
ALTER TABLE `socialaccount_socialapp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `socialaccount_socialapp_sites`
--
ALTER TABLE `socialaccount_socialapp_sites`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `socialaccount_socialtoken`
--
ALTER TABLE `socialaccount_socialtoken`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tareas`
--
ALTER TABLE `tareas`
  MODIFY `idTarea` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `tarea_materiales`
--
ALTER TABLE `tarea_materiales`
  MODIFY `idTareaMaterial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `idUsuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT de la tabla `_migracion_log`
--
ALTER TABLE `_migracion_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `account_emailaddress`
--
ALTER TABLE `account_emailaddress`
  ADD CONSTRAINT `account_emailaddress_user_id_2c513194_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `account_emailconfirmation`
--
ALTER TABLE `account_emailconfirmation`
  ADD CONSTRAINT `account_emailconfirm_email_address_id_5b7f8c58_fk_account_e` FOREIGN KEY (`email_address_id`) REFERENCES `account_emailaddress` (`id`);

--
-- Filtros para la tabla `asignacion_tareas`
--
ALTER TABLE `asignacion_tareas`
  ADD CONSTRAINT `fk_asig_operario` FOREIGN KEY (`idOperario`) REFERENCES `operarios` (`idOperario`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_asig_tarea` FOREIGN KEY (`idTarea`) REFERENCES `tareas` (`idTarea`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `authtoken_token`
--
ALTER TABLE `authtoken_token`
  ADD CONSTRAINT `authtoken_token_user_id_35299eff_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);

--
-- Filtros para la tabla `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`);

--
-- Filtros para la tabla `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  ADD CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  ADD CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  ADD CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD CONSTRAINT `fk_cli_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `devoluciones`
--
ALTER TABLE `devoluciones`
  ADD CONSTRAINT `fk_dev_cliente` FOREIGN KEY (`idCliente`) REFERENCES `clientes` (`idCliente`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_dev_orden` FOREIGN KEY (`idOrden`) REFERENCES `ordenes` (`idOrden`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `devolucion_inventario`
--
ALTER TABLE `devolucion_inventario`
  ADD CONSTRAINT `fk_dinv_devolucion` FOREIGN KEY (`idDevolucion`) REFERENCES `devoluciones` (`idDevolucion`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_dinv_inventario` FOREIGN KEY (`idInventario`) REFERENCES `inventario` (`idInventario`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  ADD CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `entrada_materiales`
--
ALTER TABLE `entrada_materiales`
  ADD CONSTRAINT `fk_em_material` FOREIGN KEY (`idMaterial`) REFERENCES `materiales` (`idMaterial`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_em_proveedor` FOREIGN KEY (`idProveedor`) REFERENCES `proveedores` (`idProveedor`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD CONSTRAINT `fk_factura_cliente` FOREIGN KEY (`idCliente`) REFERENCES `clientes` (`idCliente`),
  ADD CONSTRAINT `fk_factura_orden` FOREIGN KEY (`idOrden`) REFERENCES `ordenes` (`idOrden`);

--
-- Filtros para la tabla `incidencias`
--
ALTER TABLE `incidencias`
  ADD CONSTRAINT `fk_inc_operario` FOREIGN KEY (`idUsuario`) REFERENCES `operarios` (`idOperario`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD CONSTRAINT `fk_inv_producto` FOREIGN KEY (`idProducto`) REFERENCES `productos` (`idProducto`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `operarios`
--
ALTER TABLE `operarios`
  ADD CONSTRAINT `fk_op_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `ordenes`
--
ALTER TABLE `ordenes`
  ADD CONSTRAINT `fk_ord_cliente` FOREIGN KEY (`idCliente`) REFERENCES `clientes` (`idCliente`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orden_producto` FOREIGN KEY (`idProducto`) REFERENCES `productos` (`idProducto`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `ordenes_produccion`
--
ALTER TABLE `ordenes_produccion`
  ADD CONSTRAINT `ordenes_produccion_idPrenda_e87d8fd6_fk_prendas_idPrenda` FOREIGN KEY (`idPrenda`) REFERENCES `prendas` (`idPrenda`);

--
-- Filtros para la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `fk_reset_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `produccion`
--
ALTER TABLE `produccion`
  ADD CONSTRAINT `fk_prod_orden` FOREIGN KEY (`idOrden`) REFERENCES `ordenes` (`idOrden`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_prod_producto` FOREIGN KEY (`idProducto`) REFERENCES `productos` (`idProducto`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD CONSTRAINT `fk_prov_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `salida_devolucion`
--
ALTER TABLE `salida_devolucion`
  ADD CONSTRAINT `fk_sal_inventario` FOREIGN KEY (`idInventario`) REFERENCES `inventario` (`idInventario`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `socialaccount_socialaccount`
--
ALTER TABLE `socialaccount_socialaccount`
  ADD CONSTRAINT `socialaccount_socialaccount_user_id_8146e70c_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Filtros para la tabla `socialaccount_socialapp_sites`
--
ALTER TABLE `socialaccount_socialapp_sites`
  ADD CONSTRAINT `socialaccount_social_socialapp_id_97fb6e7d_fk_socialacc` FOREIGN KEY (`socialapp_id`) REFERENCES `socialaccount_socialapp` (`id`),
  ADD CONSTRAINT `socialaccount_socialapp_sites_site_id_2579dee5_fk_django_site_id` FOREIGN KEY (`site_id`) REFERENCES `django_site` (`id`);

--
-- Filtros para la tabla `socialaccount_socialtoken`
--
ALTER TABLE `socialaccount_socialtoken`
  ADD CONSTRAINT `socialaccount_social_account_id_951f210e_fk_socialacc` FOREIGN KEY (`account_id`) REFERENCES `socialaccount_socialaccount` (`id`),
  ADD CONSTRAINT `socialaccount_social_app_id_636a42d7_fk_socialacc` FOREIGN KEY (`app_id`) REFERENCES `socialaccount_socialapp` (`id`);

--
-- Filtros para la tabla `tareas`
--
ALTER TABLE `tareas`
  ADD CONSTRAINT `fk_tarea_produccion` FOREIGN KEY (`idProduccion`) REFERENCES `produccion` (`idProduccion`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `tarea_materiales`
--
ALTER TABLE `tarea_materiales`
  ADD CONSTRAINT `fk_tm_material` FOREIGN KEY (`idMaterial`) REFERENCES `materiales` (`idMaterial`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tm_tarea` FOREIGN KEY (`idTarea`) REFERENCES `tareas` (`idTarea`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
