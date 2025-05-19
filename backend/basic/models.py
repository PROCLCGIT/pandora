# backend/basic/models.py

from django.db import models
from django.core.validators import MinValueValidator, RegexValidator


class TimeStampedModel(models.Model):
    """Abstract model to add created and modified timestamps"""
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")

    class Meta:
        abstract = True


class Categoria(TimeStampedModel):
    """
    Modelo para gestionar categorías jerárquicas de productos o servicios
    con soporte para estructura de árbol multi-nivel
    """
    nombre = models.CharField(max_length=255, unique=True, verbose_name="Nombre")
    code = models.CharField(max_length=20, unique=True, verbose_name="Código")
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, 
                              related_name='children', verbose_name="Categoría padre")
    level = models.PositiveSmallIntegerField(default=0, verbose_name="Nivel")
    path = models.CharField(max_length=255, blank=True, verbose_name="Ruta")
    is_active = models.BooleanField(default=True, verbose_name="Activo")

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        ordering = ['path', 'nombre']
        indexes = [
            models.Index(fields=['path']),
        ]

    def __str__(self):
        return f"{self.path}: {self.nombre}" if self.path else self.nombre
    
    def save(self, *args, **kwargs):
        """Actualiza automáticamente el nivel y la ruta basado en el padre"""
        if self.parent:
            self.level = self.parent.level + 1
            self.path = f"{self.parent.path}/{self.code}"
        else:
            self.level = 0
            self.path = self.code
        super().save(*args, **kwargs)


class Ciudad(TimeStampedModel):
    """Modelo para gestionar las ciudades donde se ofrecen servicios"""
    nombre = models.CharField(max_length=50, verbose_name="Nombre")
    provincia = models.CharField(max_length=50, verbose_name="Provincia")
    code = models.CharField(max_length=50, unique=True, verbose_name="Código")
    # Relación con Zona se hará desde el otro lado para evitar ManyToMany

    class Meta:
        verbose_name = "Ciudad"
        verbose_name_plural = "Ciudades"
        ordering = ['provincia', 'nombre']
        unique_together = [['nombre', 'provincia']]

    def __str__(self):
        return f"{self.nombre}, {self.provincia}"


class EmpresaClc(TimeStampedModel):
    """
    Modelo para gestionar la información de las empresas del grupo CLC
    """
    nombre = models.CharField(max_length=150, unique=True, verbose_name="Nombre comercial")
    razon_social = models.CharField(max_length=150, unique=True, verbose_name="Razón social")
    code = models.CharField(max_length=50, unique=True, verbose_name="Código interno")
    ruc = models.CharField(
        max_length=13, 
        unique=True, 
        verbose_name="RUC",
        validators=[
            RegexValidator(
                regex=r'^\d{13}$',
                message='El RUC debe contener 13 dígitos numéricos',
            )
        ]
    )
    direccion = models.CharField(max_length=255, verbose_name="Dirección")
    telefono = models.CharField(max_length=20, blank=True, null=True, verbose_name="Teléfono")
    correo = models.EmailField(max_length=100, verbose_name="Correo electrónico")
    representante_legal = models.CharField(max_length=150, verbose_name="Representante legal")

    class Meta:
        verbose_name = "Empresa CLC"
        verbose_name_plural = "Empresas CLC"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Especialidad(TimeStampedModel):
    """
    Modelo para gestionar especialidades médicas relacionadas con 
    los productos o servicios ofrecidos
    """
    nombre = models.CharField(max_length=50, unique=True, verbose_name="Nombre")
    code = models.CharField(max_length=50, unique=True, verbose_name="Código")

    class Meta:
        verbose_name = "Especialidad"
        verbose_name_plural = "Especialidades"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Marca(TimeStampedModel):
    """
    Modelo para gestionar las marcas de los productos comercializados
    o equipos a los que se brinda mantenimiento
    """
    nombre = models.CharField(max_length=50, unique=True, verbose_name="Nombre")
    code = models.CharField(max_length=20, unique=True, verbose_name="Código")
    description = models.TextField(blank=True, verbose_name="Descripción")
    proveedores = models.CharField(max_length=100, blank=True, verbose_name="Proveedores")
    country_origin = models.CharField(max_length=50, blank=True, verbose_name="País de origen")
    website = models.URLField(blank=True, verbose_name="Sitio web")
    contact_info = models.TextField(blank=True, verbose_name="Información de contacto")
    is_active = models.BooleanField(default=True, verbose_name="Activo")

    class Meta:
        verbose_name = "Marca"
        verbose_name_plural = "Marcas"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Procedencia(TimeStampedModel):
    """
    Modelo para gestionar los lugares de procedencia de los productos
    """
    nombre = models.CharField(max_length=50, unique=True, verbose_name="Nombre")
    code = models.CharField(max_length=50, unique=True, verbose_name="Código")

    class Meta:
        verbose_name = "Procedencia"
        verbose_name_plural = "Procedencias"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class TipoCliente(TimeStampedModel):
    """
    Modelo para clasificar los diferentes tipos de clientes
    (hospitales, clínicas, laboratorios, etc.)
    """
    nombre = models.CharField(max_length=50, unique=True, verbose_name="Nombre")
    code = models.CharField(max_length=50, unique=True, verbose_name="Código")

    class Meta:
        verbose_name = "Tipo de Cliente"
        verbose_name_plural = "Tipos de Cliente"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class TipoContratacion(TimeStampedModel):
    """
    Modelo para gestionar los diferentes tipos de contratación
    de servicios o compra de productos
    """
    nombre = models.CharField(max_length=50, unique=True, verbose_name="Nombre")
    code = models.CharField(max_length=50, unique=True, verbose_name="Código")

    class Meta:
        verbose_name = "Tipo de Contratación"
        verbose_name_plural = "Tipos de Contratación"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Unidad(TimeStampedModel):
    """
    Modelo para gestionar las unidades de medida de los productos
    """
    nombre = models.CharField(max_length=50, unique=True, verbose_name="Nombre")
    code = models.CharField(max_length=50, unique=True, verbose_name="Código")

    class Meta:
        verbose_name = "Unidad"
        verbose_name_plural = "Unidades"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Zona(TimeStampedModel):
    """
    Modelo para gestionar las zonas geográficas de cobertura
    de servicios o distribución de productos
    """
    nombre = models.CharField(max_length=50, unique=True, verbose_name="Nombre")
    code = models.CharField(max_length=20, unique=True, verbose_name="Código")
    cobertura = models.TextField(blank=True, verbose_name="Descripción de cobertura")
    # Relación con Ciudad se puede hacer con ForeignKey desde otro modelo si es necesario

    class Meta:
        verbose_name = "Zona"
        verbose_name_plural = "Zonas"
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class ZonaCiudad(TimeStampedModel):
    """
    Modelo para relacionar Zonas con Ciudades sin usar ManyToMany
    """
    zona = models.ForeignKey(Zona, on_delete=models.CASCADE, related_name='ciudad_relaciones', verbose_name="Zona")
    ciudad = models.ForeignKey(Ciudad, on_delete=models.CASCADE, related_name='zona_relaciones', verbose_name="Ciudad")

    class Meta:
        verbose_name = "Relación Zona-Ciudad"
        verbose_name_plural = "Relaciones Zona-Ciudad"
        unique_together = [['zona', 'ciudad']]
        ordering = ['zona', 'ciudad']

    def __str__(self):
        return f"{self.zona.nombre} - {self.ciudad.nombre}"