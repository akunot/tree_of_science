from django.db import models
from django.conf import settings

class Bibliography(models.Model):
    """
    Modelo para almacenar archivos de bibliografía
    """
    nombre_archivo = models.CharField(max_length=255)
    archivo = models.FileField(upload_to='bibliography/')
    fecha_subida = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bibliographies')
    
    def __str__(self):
        return f"{self.nombre_archivo} - {self.user.email}"
    
    class Meta:
        db_table = 'bibliography'
        verbose_name = 'Bibliografía'
        verbose_name_plural = 'Bibliografías'
        ordering = ['-fecha_subida']