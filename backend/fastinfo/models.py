from django.db import models
from django.core.validators import RegexValidator, EmailValidator
from django.contrib.auth.hashers import make_password, check_password
from basic.models import TimeStampedModel  # Importamos el modelo base con timestamps

class NombreEntidad(TimeStampedModel):
    """
    Catálogo de nombres de entidades (SRI, IESS, etc.)
    """
    codigo = models.CharField(
        max_length=10, 
        unique=True,
        help_text="Código único de la entidad"
    )
    nombre = models.CharField(
        max_length=100,
        help_text="Nombre de la entidad"
    )
    descripcion = models.TextField(
        blank=True, 
        null=True,
        help_text="Descripción detallada de la entidad"
    )
    activo = models.BooleanField(
        default=True,
        help_text="Indica si la entidad está activa"
    )
    
    class Meta:
        db_table = 'fastinfo_nombre_entidad'
        verbose_name = 'Nombre de Entidad'
        verbose_name_plural = 'Nombres de Entidad'
        ordering = ['nombre']

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"


class DatosInstitucionales(TimeStampedModel):
    """
    Modelo para almacenar información de entidades institucionales
    como SRI, IESS, municipios, etc.
    """
    
    # Validadores personalizados
    ruc_validator = RegexValidator(
        regex=r'^\d{13}$',
        message='El RUC debe tener exactamente 13 dígitos'
    )
    
    telefono_validator = RegexValidator(
        regex=r'^[0-9]{9,10}$',
        message='El teléfono debe tener entre 9 y 10 dígitos'
    )

    # Campos principales
    nombre_entidad = models.ForeignKey(
        NombreEntidad,
        on_delete=models.PROTECT,
        related_name='datos_institucionales',
        help_text="Nombre de la entidad"
    )
    
    ruc = models.CharField(
        max_length=13,
        unique=True,
        validators=[ruc_validator],
        help_text="RUC de la entidad (13 dígitos)"
    )
    
    # Credenciales de acceso
    usuario = models.CharField(
        max_length=100,
        help_text="Usuario para acceso al sistema de la entidad"
    )
    
    contrasena = models.CharField(
        max_length=255,
        help_text="Contraseña para acceso (se almacena encriptada)"
    )
    
    # Información de contacto
    correo = models.EmailField(
        validators=[EmailValidator()],
        help_text="Correo electrónico de contacto"
    )
    
    telefono = models.CharField(
        max_length=10,
        validators=[telefono_validator],
        help_text="Teléfono de contacto"
    )
    
    representante = models.CharField(
        max_length=200,
        help_text="Nombre del representante de la entidad"
    )
    
    # Campos adicionales
    direccion = models.TextField(
        blank=True, 
        null=True,
        help_text="Dirección física de la entidad"
    )
    
    sitio_web = models.URLField(
        blank=True, 
        null=True,
        help_text="Sitio web oficial de la entidad"
    )
    
    observaciones = models.TextField(
        blank=True, 
        null=True,
        help_text="Observaciones adicionales"
    )
    
    activo = models.BooleanField(
        default=True,
        help_text="Indica si la entidad está activa"
    )
    
    fecha_ultima_actualizacion = models.DateTimeField(
        auto_now=True,
        help_text="Fecha de la última actualización de datos"
    )

    class Meta:
        db_table = 'fastinfo_datos_institucionales'
        verbose_name = 'Datos Institucionales'
        verbose_name_plural = 'Datos Institucionales'
        ordering = ['nombre_entidad__nombre', 'ruc']
        indexes = [
            models.Index(fields=['ruc']),
            models.Index(fields=['nombre_entidad', 'activo']),
            models.Index(fields=['usuario']),
        ]

    def __str__(self):
        return f"{self.nombre_entidad.nombre} ({self.ruc})"

    def save(self, *args, **kwargs):
        """
        Sobrescribir save para encriptar la contraseña
        """
        if self.contrasena and not self.contrasena.startswith('pbkdf2_'):
            self.contrasena = make_password(self.contrasena)
        super().save(*args, **kwargs)

    def verificar_contrasena(self, contrasena_plana):
        """
        Método para verificar la contraseña
        """
        return check_password(contrasena_plana, self.contrasena)

    def get_contrasena_visible(self):
        """
        Método para mostrar asteriscos en lugar de la contraseña real
        Solo para propósitos de display en el frontend
        """
        return '*' * 8

    @property
    def nombre_entidad_texto(self):
        """
        Property para acceder fácilmente al nombre de la entidad
        """
        return self.nombre_entidad.nombre if self.nombre_entidad else ''

    @property
    def codigo_entidad(self):
        """
        Property para acceder fácilmente al código de la entidad
        """
        return self.nombre_entidad.codigo if self.nombre_entidad else ''

    def clean(self):
        """
        Validaciones personalizadas
        """
        from django.core.exceptions import ValidationError
        
        # Validar que el RUC sea válido según algoritmo ecuatoriano
        if self.ruc and not self._validar_ruc_ecuatoriano(self.ruc):
            raise ValidationError({'ruc': 'El RUC no tiene un formato válido según las reglas ecuatorianas'})

    def _validar_ruc_ecuatoriano(self, ruc):
        """
        Validación específica del RUC ecuatoriano
        """
        if len(ruc) != 13:
            return False
        
        # Los primeros dos dígitos deben corresponder a una provincia válida (01-24)
        provincia = int(ruc[:2])
        if provincia < 1 or provincia > 24:
            return False
        
        # El tercer dígito define el tipo de RUC
        tercer_digito = int(ruc[2])
        if tercer_digito < 0 or tercer_digito > 9:
            return False
        
        return True