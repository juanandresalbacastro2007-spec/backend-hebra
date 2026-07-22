from pathlib import Path
import os

# --- RUTAS PRINCIPALES ---
# Raíz del proyecto: backend-hebra/
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# --- CONFIGURACIÓN DE SEGURIDAD ---
SECRET_KEY = 'b3nr3w#uf=1ue=4dwct^m9_6=%5mft+ei7&_+w+egjw%jv!zdg'
DEBUG = True

ALLOWED_HOSTS = []

# --- APLICACIONES ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Tus aplicaciones
    'apps.usuarios',
    'apps.clientes',
    'apps.produccion', 
    'apps.administrador',
    'apps.proveedores',
    'apps.operarios',
    'apps.core', 
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'hebratech.config.urls'

# --- PLANTILLAS ---
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'hebratech' / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'hebratech.config.wsgi.application'

# --- BASE DE DATOS ---
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'hebratech',
        'USER': 'root',
        'PASSWORD': '',
        'HOST': '127.0.0.1',
        'PORT': '3306',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# --- LOCALIZACIÓN ---
LANGUAGE_CODE = 'es-co'
TIME_ZONE = 'America/Bogota'
USE_I18N = True
USE_TZ = True

# --- ARCHIVOS ESTÁTICOS Y MEDIA ---
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'hebratech' / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- PARCHE DE COMPATIBILIDAD MARIADB/MYSQL ---
import django.db.backends.mysql.base
from django.db.backends.mysql.base import DatabaseFeatures

DatabaseFeatures.can_return_rows_from_bulk_insert = False
DatabaseFeatures.has_select_for_update_returning = False

# --- CONFIGURACIÓN DE CORREO ELECTRÓNICO ---
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True

EMAIL_HOST_USER = 'ssantiagocubides@gmail.com'
EMAIL_HOST_PASSWORD = 'liip odei lkdy higw'
DEFAULT_FROM_EMAIL = 'HebraTech <ssantiagocubides@gmail.com>'
