from django.db import models
from django.conf import settings

# Create your models here.
class Bibliografia(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    nombre_archivo = models.CharField(max_length=255)
    archivo = models.FileField(upload_to="uploads/")
    fecha_subida = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre_archivo} ({self.usuario.email})"


class ArbolCiencia(models.Model):
    bibliografia = models.OneToOneField(Bibliografia, on_delete=models.CASCADE)
    arbol_json = models.JSONField()
    fecha_generado = models.DateTimeField(auto_now_add=True)
    processed_ok = models.BooleanField(default=True)

    def __str__(self):
        return f"Árbol para {self.bibliografia.nombre_archivo}"