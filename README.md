
# Integrantes:
- Verónica Pin
- Cristhian Gonzalez
- Christopher Aguiño 
# Virtual DJ con IA 🎶🤖
Virtual DJ con IA es una plataforma web desarrollada en Django que utiliza inteligencia artificial para la detección automática de emociones a través de la cámara. El sistema analiza las expresiones faciales del usuario en tiempo real y determina su estado emocional (felicidad, tristeza, enojo,neutral ,disgustado ). Con base en esta detección, la aplicación se conecta con la API de Spotify para recomendar música personalizada que se adapte al estado emocional del usuario. Además, ofrece un historial de emociones registradas, sugerencias musicales dinámicas y visualizaciones interactivas.

<img width="1900" height="919" alt="image" src="https://github.com/user-attachments/assets/2bb995ee-8f09-4766-b5c2-c41a5e9e73c4" />
<img width="1884" height="890" alt="image" src="https://github.com/user-attachments/assets/0b162e2c-481f-44e4-b611-a9b359a49272" />
<img width="1881" height="910" alt="image" src="https://github.com/user-attachments/assets/af28d809-ffaf-429d-a6d8-ef59df877fc1" />


# Características principales
- Detección automática de emociones mediante la cámara usando inteligencia artificial (análisis de expresiones faciales en tiempo real).
- Recomendaciones musicales personalizadas con la API de Spotify según el estado emocional detectado.
- Visualización interactiva de emociones y música sugerida (gráficas, indicadores de estado, playlists dinámicas).
- Gestión de usuarios con autenticación, registro y perfiles personalizados (incluye foto de perfil almacenada en AWS S3).
- Historial emocional y musical que permite consultar las emociones detectadas y las canciones recomendadas en cada sesión.

# Tecnologías utilizadas
- **Backend:** Django 5.2.1, sqlitebrowser
- **Frontend:** Bootstrap 5, HTML5, CSS3, JavaScript
- **IA:** Modelos de Machine Learning para análisis de audio (Librosa, TensorFlow/PyTorch)
- **Almacenamiento de archivos:** AWS S3 (perfiles), almacenamiento local (canciones)
- **Otros:** Django Storages, python-decouple, dotenv

# Estructura del proyecto
```
├── manage.py                  # Script principal para ejecutar comandos Django
├── requirements.txt           # Lista de dependencias del proyecto
├── .env                       # Variables de entorno (credenciales, configuración)
├── .gitignore                 # Archivos y carpetas ignoradas por Git
├── db.sqlite3                 # Base de datos local (puede cambiarse por PostgreSQL)
├── DjVirtual/                 # Configuración principal del proyecto Django
├── Authentication/           # App encargada del registro, login y perfiles de usuario
├── Assessment/               # App encargada de la detección de emociones (IA)
├── ent/                      # Módulo auxiliar (puede incluir lógica de entidades o utilidades)
├── media/                    # Archivos multimedia (fotos de perfil, capturas faciales)
├── static/                   # Archivos estáticos (CSS, JS, imágenes)
├── templates/                # Plantillas HTML para renderizar vistas

```

# Instalación y configuración
**- Clona el repositorio y entra al directorio:**
 ```bash
git clone <repo_url>

cd VirtualDJ_IA
 ```
**- Crea y activa un entorno virtual:**
```bash
python -m venv venv

# En Windows
venv\Scripts\activate 

# En Linux/Mac
source venv/bin/activate

``` 
**- Instala las dependencias:**
   ```bash
   pip install -r requirements.txt
   ```
**- Configura las variables de entorno:**
- Renombra .env.example a .env y completa los datos de la base de datos y AWS S3.
## Variables de entorno (`.env`)
- Ejemplo:
# Base de datos
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'es'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATICFILES_DIRS = [
    BASE_DIR / "static"  
]

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'Authentication.CustomUser'
BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(os.path.join(BASE_DIR, '.env'))

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS') == 'True'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Amazon S3
AWS_ACCESS_KEY_ID = config("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = config("AWS_SECRET_ACCESS_KEY")
AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME")
AWS_S3_REGION_NAME = config("AWS_S3_REGION_NAME", default="us-east-2")
AWS_S3_SIGNATURE_VERSION = "s3v4"
AWS_S3_OBJECT_PARAMETERS = {
    "CacheControl": "max-age=86400",
    # 👇 👇 Esta línea evita que boto3 intente aplicar ACLs
    "ACL": "private"
}
# URL base del bucket
AWS_S3_CUSTOM_DOMAIN = f"{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com"

# Activar Django-Storages
DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"

# MEDIA_URL apuntando a tu bucket
MEDIA_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/"


# API para Spotify
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIFY_REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")

# Email settings
EMAIL_BACKEND=...
EMAIL_HOST=...
EMAIL_PORT=...
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=...
EMAIL_HOST_PASSWORD=...
DEFAULT_FROM_EMAIL=EMAIL_HOST_USER  
**- Realiza las migraciones:**
```bash
python manage.py makemigrations
python manage.py migrate
```
**- Ejecuta el servidor de desarrollo:**
```bash
python manage.py runserver
```
**- Accede a la aplicación:**
- Ve a http://127.0.0.1:8000/ en tu navegador.

## Uso
**- Mezclar canciones:**
- Sube tus pistas y deja que la IA genere mezclas automáticas.
- Visualiza espectrogramas y ondas de sonido en tiempo real.
- Historial:
- Consulta tu historial de mezclas y recomendaciones.
- Modo DJ:
- Activa el modo en vivo para mezclar canciones directamente desde la plataforma.
- Noticias y consejos:
- Accede a información actualizada sobre música, producción y tendencias.

Créditos
- Proyecto desarrollado por estudiantes de la UNEMI 2025.
- Modelos de IA entrenados para análisis musical con librerías de audio.

Licencia
Este proyecto es de uso académico y educativo. Consulta la licencia específica en el repositorio.
