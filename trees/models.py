from django.db import models
from django.conf import settings
from bibliography.models import Bibliography

class Tree(models.Model):
    """
    Modelo para almacenar árboles de la ciencia generados
    """
    arbol_json = models.JSONField()
    fecha_generado = models.DateTimeField(auto_now_add=True)
    bibliography = models.ForeignKey(Bibliography, on_delete=models.SET_NULL, null=True, blank=True, related_name='trees')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='trees')
    seed = models.TextField(help_text="Semilla utilizada para generar el árbol")
    title = models.CharField(max_length=255, blank=True, help_text="Título del árbol generado")
    
    def __str__(self):
        return f"Árbol {self.id} - {self.user.email} - {self.fecha_generado.strftime('%Y-%m-%d')}"
    
    class Meta:
        db_table = 'tree'
        verbose_name = 'Árbol de la Ciencia'
        verbose_name_plural = 'Árboles de la Ciencia'
        ordering = ['-fecha_generado']