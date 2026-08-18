-- Schema para CI (GitHub Actions) - adaptado de hebratech__david_.sql
-- Generado automáticamente por adapt_dump.sh el 2026-08-18 21:51:43
-- NOTA: filas de datos (INSERT INTO) removidas a propósito.
--       Solo se conserva estructura (CREATE TABLE + constraints).

DROP DATABASE IF EXISTS `hebratech_test`;
CREATE DATABASE `hebratech_test` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `hebratech_test`;

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


-- --------------------------------------------------------

--
-- Estructura para la vista `ver_un_producto_y_su_estado_en_la_produccion`
--
DROP TABLE IF EXISTS `ver_un_producto_y_su_estado_en_la_produccion`;

CREATE VIEW `ver_un_producto_y_su_estado_en_la_produccion`  AS SELECT `p`.`nombre` AS `nombre`, `p`.`descripcion` AS `descripcion`, `p`.`categoria` AS `categoria`, `pr`.`estado` AS `estado` FROM (`productos` `p` join `produccion` `pr` on(`p`.`idProducto` = `pr`.`idProducto`)) ;

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