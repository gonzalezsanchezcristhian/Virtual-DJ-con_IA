
# Integrantes:
- Verónica Pin
- Cristhian Gonzalez
- Christopher Aguiño 
# Virtual DJ con IA 🎶🤖
Virtual DJ con IA es una plataforma web desarrollada en Django que utiliza inteligencia artificial para la detección automática de emociones a través de la cámara. El sistema analiza las expresiones faciales del usuario en tiempo real y determina su estado emocional (felicidad, tristeza, enojo, calma, entre otros). Con base en esta detección, la aplicación se conecta con la API de Spotify para recomendar música personalizada que se adapte al estado emocional del usuario. Además, ofrece un historial de emociones registradas, sugerencias musicales dinámicas y visualizaciones interactivas que enriquecen la experiencia de escucha.

<img width="1900" height="919" alt="image" src="https://github.com/user-attachments/assets/2bb995ee-8f09-4766-b5c2-c41a5e9e73c4" />
<img width="1884" height="890" alt="image" src="https://github.com/user-attachments/assets/0b162e2c-481f-44e4-b611-a9b359a49272" />
<img width="1881" height="910" alt="image" src="https://github.com/user-attachments/assets/af28d809-ffaf-429d-a6d8-ef59df877fc1" />


Características principales
- Mezcla automática de canciones mediante IA (detección de tempo, tono y género).
- Recomendaciones musicales personalizadas según historial y preferencias del usuario.
- Visualización interactiva de ondas de sonido y espectrogramas.
- Gestión de usuarios con autenticación, registro y perfiles personalizados (incluye foto de perfil almacenada en AWS S3).
- Modo DJ en vivo para mezclar canciones en tiempo real desde la web.
- Noticias y consejos sobre música, producción y tendencias en la industria.

Tecnologías utilizadas
- Backend: Django 5.2.1, PostgreSQL
- Frontend: Bootstrap 5, HTML5, CSS3, JavaScript
- IA: Modelos de Machine Learning para análisis de audio (Librosa, TensorFlow/PyTorch)
- Almacenamiento de archivos: AWS S3 (perfiles), almacenamiento local (canciones)
- Otros: Django Storages, python-decouple, dotenv

Estructura del proyecto
├── manage.py
├── requirements.txt
├── .env
├── mysite/                # Configuración principal de Django
├── djapp/                 # App principal (modelos, vistas, IA musical)
│   ├── modelos/           # Modelos entrenados para análisis de audio
│   └── views/             # Vistas especializadas (mezclas, autenticación, etc.)
├── media/                 # Archivos de usuarios y canciones
├── static/                # Archivos estáticos (CSS, JS, imágenes)
├── templates/             # Plantillas HTML
└── ...



Instalación y configuración
- Clona el repositorio y entra al directorio:
git clone <repo_url>
cd VirtualDJ_IA
- Crea y activa un entorno virtual:
python -m venv venv

# En Windows
venv\Scripts\activate 

# En Linux/Mac
source venv/bin/activate  
- Instala las dependencias:
pip install -r requirements.txt
- Configura las variables de entorno:
- Renombra .env.example a .env y completa los datos de la base de datos y AWS S3.
Variables de entorno (.env)- Ejemplo:
# Base de datos
DB_ENGINE=django.db.backends.postgresql
DB_DATABASE=nombre_db
DB_USERNAME=usuario
DB_PASSWORD=contraseña
DB_SOCKET=localhost
DB_PORT=5432

# Amazon S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=us-east-2
AWS_STORAGE_BUCKET_NAME=...

# API para noticias musicales
API_KEY_NEWSAPI=...

# Email settings
EMAIL_BACKEND=...
EMAIL_HOST=...
EMAIL_PORT=...
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=...
EMAIL_HOST_PASSWORD=...
DEFAULT_FROM_EMAIL=EMAIL_HOST_USER
- Realiza las migraciones y crea un superusuario:
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
- Ejecuta el servidor de desarrollo:
python manage.py runserver
- Accede a la aplicación:
- Ve a http://127.0.0.1:8000/ en tu navegador.

Uso
- Mezclar canciones:
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
