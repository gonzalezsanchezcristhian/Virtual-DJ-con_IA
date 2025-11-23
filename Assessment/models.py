from django.conf import settings
from django.db import models

# Assessment/models.py
from django.db import models
from django.conf import settings

class EmocionDetectada(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    emocion = models.CharField(max_length=50)
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario.username} - {self.emocion} ({self.fecha:%Y-%m-%d %H:%M})"
