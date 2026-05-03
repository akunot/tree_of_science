"""
Management command para limpiar archivos temporales
Ejecutar: python manage.py cleanup_temp_files
"""
from django.core.management.base import BaseCommand
from trees.export_utils import cleanup_temp_files


class Command(BaseCommand):
    help = 'Limpiar archivos temporales más antiguos de 1 hora'

    def handle(self, *args, **options):
        cleanup_temp_files()
        self.stdout.write(self.style.SUCCESS('Archivos temporales limpiados exitosamente.'))
