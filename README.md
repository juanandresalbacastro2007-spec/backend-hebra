# 🧵 HebraTech — Backend

Sistema de gestión de producción textil multi-rol (administrador, operario, cliente, proveedor), desarrollado con Django y MySQL. Proyecto académico y funcional para la Especialización en Gerencia de la Calidad.

<p align="center">
  <img src="https://img.shields.io/badge/Django-6.1-092E20?style=for-the-badge&logo=django&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-8.0.44-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/License-Academic-lightgrey?style=for-the-badge" />
</p>

---

## 📌 Descripción

**HebraTech** es un sistema de gestión empresarial orientado al sector textil que permite administrar producción, operarios, clientes y proveedores desde distintos roles con permisos diferenciados. Utiliza autenticación manual por sesión (no el sistema de auth nativo de Django), modelos `managed=False` sobre una base de datos MySQL existente, e incluye integración con **Google OAuth** vía `django-allauth`.

## 🚀 Características principales

- 🔐 Autenticación manual por sesión + login social con Google (OAuth2)
- 👥 Gestión de roles: administrador, operario, cliente, proveedor
- 📦 Módulos de producción, operarios, clientes y proveedores
- 🧾 Generación de facturas en PDF (`xhtml2pdf`)
- 📊 Tablero Kanban para operarios con drag & drop y reporte de incidencias
- 🔄 Sistema de pedidos en tiempo real (polling)
- 🛡️ Seguridad reforzada: decoradores personalizados, protección IDOR, fijación de sesión (`cycle_key()`)
- 🔑 Recuperación de contraseña vía token + Gmail SMTP
- ✅ Flujo de aprobación de usuarios nuevos

## 🛠️ Stack tecnológico

| Categoría | Tecnología |
|---|---|
| Backend | Django 6.1 |
| Base de datos | MySQL 8.0.44 (compatible con MariaDB/XAMPP) |
| Autenticación social | django-allauth (Google OAuth) |
| PDFs | xhtml2pdf |
| Variables de entorno | python-decouple |
| Frontend | HTML, CSS (sistema de diseño propio), JS |

## 🎨 Sistema de diseño

Paleta de colores unificada en todos los módulos:

`#2C3333` `#395B64` `#A5C9CA` `#E7F6F2`

Tipografías: **Fredoka** (encabezados) y **Roboto** (texto general).

## 📂 Estructura del proyecto

```
hebratech/
├── apps/
│   ├── core/         # Decoradores, utilidades y seguridad transversal
│   ├── usuarios/      # Autenticación, roles, OAuth
│   ├── clientes/       # Portal de clientes
│   ├── produccion/    # Gestión de producción
│   ├── operarios/      # Kanban, incidencias, perfil
│   └── proveedores/     # Gestión de proveedores
├── .env                # Variables de entorno (no versionado)
└── manage.py
```

## ⚙️ Instalación local

```bash
# 1. Clonar el repositorio
git clone https://github.com/jorgeformulauno/hebratech.git
cd hebratech

# 2. Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar variables de entorno
cp .env.example .env
# completar credenciales de MySQL, Google OAuth y Gmail SMTP

# 5. Ejecutar migraciones
python manage.py migrate

# 6. Levantar el servidor
python manage.py runserver
```

## 🔑 Variables de entorno necesarias

```env
SECRET_KEY=
DEBUG=True
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
```

## 📋 Gestión del proyecto

| Recurso | Enlace |
|---|---|
| 📌 Tablero Scrum (Trello) | [Ver tablero](https://trello.com/invite/b/689f62d2858160184aa70561/ATTIbf128c1aaca7ccb2036e0abc8d037bf7762A8D73/hebratech) |
| 📄 Documentación funcional | [Ver documento](https://1drv.ms/w/c/79ed40f1be334284/IQD3UudmTnMKQ7at6iZM_n9jAdiUx77Mm4oDD52Lsl0VrW8?e=wiPUn2) |

## 👤 Autores

**Jorge Almanza** — Backend
[GitHub](https://github.com/jorgeformulauno)
**Juan Alba** — Backend 
[GitHub](https://github.com/juanandresalbacastro2007-spec)
**David Sierra** — Backend 
[GitHub](https://github.com/David-sierra4444)
**Santiago Cano** — Backend 
[GitHub](https://github.com/ssantiagocubides-bit)
**Yeferson Idarraga** — Backend
[GitHub](https://github.com/yeferson11-11)

---

<p align="center">Proyecto académico — Especialización en Gerencia de la Calidad</p>
