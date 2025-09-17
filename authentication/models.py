from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Modelo de usuario personalizado que extiende AbstractUser
    """
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    class Meta:
        db_table = 'auth_user'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'