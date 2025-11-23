from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.conf import settings
# Authentication/storages.py
from storages.backends.s3boto3 import S3Boto3Storage
class CustomUser(AbstractUser):
    GENERO_OPCIONES = [
        ('Masculino', 'Masculino'),
        ('Femenino', 'Femenino'),
        ('Otro', 'Otro'),
    ]

    email = models.EmailField(unique=True)
    genero = models.CharField(max_length=20, choices=GENERO_OPCIONES)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)  
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
User = get_user_model()

class PasswordResetCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(default=timezone.now)

    def is_valid(self):
        return timezone.now() - self.created_at < timezone.timedelta(minutes=10)

    def __str__(self):
        return f"Código {self.code} para {self.user.email}"

def ruta_foto_perfil(instance, filename):
    return f'perfiles/{instance.user.username}/{filename}'



# 🔹 Storage personalizado para las imágenes del estacionamiento
class PerfilStorage(S3Boto3Storage):
    location = 'results'            # Carpeta dentro del bucket
    default_acl = 'public-read'     # Hace que las imágenes sean accesibles públicamente
    file_overwrite = False          # Evita sobrescribir imágenes con el mismo nombre


class Perfil(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    foto_perfil = models.ImageField(storage=PerfilStorage(), upload_to='', null=True, blank=True)

    def __str__(self):
        return self.user.username

    @property
    def foto_url(self):
        if self.foto_perfil and hasattr(self.foto_perfil, 'url'):
            return self.foto_perfil.url
        return '/static/Authentication/image/icono_dj.png'

