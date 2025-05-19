from django.db import models
from django.conf import settings

class ImportTask(models.Model):
    """Modelo para realizar seguimiento de las tareas de importación"""
    ESTADO_CHOICES = (
        ('pendiente', 'Pendiente'),
        ('procesando', 'Procesando'),
        ('completado', 'Completado'),
        ('error', 'Error'),
    )
    TIPO_CHOICES = (
        ('producto_ofertado', 'Productos Ofertados'),
        ('producto_disponible', 'Productos Disponibles'),
    )
    
    archivo = models.FileField(upload_to='imports/')
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    mensaje = models.TextField(blank=True)
    registros_procesados = models.IntegerField(default=0)
    registros_exitosos = models.IntegerField(default=0)
    registros_fallidos = models.IntegerField(default=0)
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tareas_importacion'
    )
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Tarea de Importación'
        verbose_name_plural = 'Tareas de Importación'
        ordering = ['-creado_en']
    
    def __str__(self):
        return f"{self.get_tipo_display()} - {self.creado_en.strftime('%Y-%m-%d %H:%M')}"
