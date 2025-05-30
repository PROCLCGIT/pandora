# backend/directorio/models.py
from django.db import models
from .validators import (
    validate_ruc_ecuatoriano,
    validate_telefono_ecuador,
    validate_email_corporativo,
)


class Tag(models.Model):
    """Etiquetas para clasificar clientes, proveedores y contactos"""

    name = models.CharField(max_length=50, unique=True)
    color_code = models.CharField(max_length=20, default="#4F46E5")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Etiqueta"
        verbose_name_plural = "Etiquetas"
        ordering = ["name"]

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return self.name

class Cliente(models.Model):
    """Modelo para representar los clientes en el directorio"""
    zona = models.ForeignKey('basic.Zona', on_delete=models.SET_NULL, null=True, related_name='clientes')
    ciudad = models.ForeignKey('basic.Ciudad', on_delete=models.SET_NULL, null=True, related_name='clientes')
    tipo_cliente = models.ForeignKey('basic.TipoCliente', on_delete=models.SET_NULL, null=True, related_name='clientes')
    nombre = models.CharField(max_length=255, unique=True)
    alias = models.CharField(max_length=100, unique=True)
    razon_social = models.CharField(max_length=255)
    ruc = models.CharField(max_length=13, validators=[validate_ruc_ecuatoriano])
    email = models.EmailField(validators=[validate_email_corporativo])
    telefono = models.CharField(max_length=20, validators=[validate_telefono_ecuador])
    direccion = models.CharField(max_length=255)
    nota = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    tags = models.ManyToManyField(
        Tag,
        through="ClienteTag",
        related_name="clientes",
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"

class Proveedor(models.Model):
    """Modelo para representar los proveedores en el directorio"""
    ciudad = models.ForeignKey('basic.Ciudad', on_delete=models.SET_NULL, null=True, related_name='proveedores')
    ruc = models.CharField(max_length=13, unique=True, validators=[validate_ruc_ecuatoriano])
    razon_social = models.CharField(max_length=255)
    nombre = models.CharField(max_length=255, unique=True)
    direccion1 = models.TextField()
    direccion2 = models.TextField(blank=True, null=True)
    correo = models.EmailField(validators=[validate_email_corporativo])
    telefono = models.CharField(max_length=20, validators=[validate_telefono_ecuador])
    tipo_primario = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)
    tags = models.ManyToManyField(
        Tag,
        through="ProveedorTag",
        related_name="proveedores",
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"

class Vendedor(models.Model):
    """Modelo para representar los vendedores asociados a proveedores"""
    proveedor = models.ForeignKey(Proveedor, on_delete=models.SET_NULL, null=True, related_name='vendedores')
    nombre = models.CharField(max_length=255)
    correo = models.EmailField(validators=[validate_email_corporativo])
    telefono = models.CharField(max_length=20, validators=[validate_telefono_ecuador])
    observacion = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nombre} - {self.proveedor.nombre if self.proveedor else 'Sin proveedor'}"

    class Meta:
        verbose_name = "Vendedor"
        verbose_name_plural = "Vendedores"

class Contacto(models.Model):
    """Modelo para representar los contactos en el directorio"""
    nombre = models.CharField(max_length=255)
    alias = models.CharField(max_length=100)
    telefono = models.CharField(max_length=20, validators=[validate_telefono_ecuador])
    telefono2 = models.CharField(max_length=20, blank=True, null=True, validators=[validate_telefono_ecuador])
    email = models.EmailField(validators=[validate_email_corporativo])
    direccion = models.TextField(blank=True, null=True)
    obserbacion = models.TextField(blank=True, null=True)
    ingerencia = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tags = models.ManyToManyField(
        Tag,
        through="ContactoTag",
        related_name="contactos",
        blank=True,
    )

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Contacto"
        verbose_name_plural = "Contactos"


class ClienteTag(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("cliente", "tag")
        verbose_name = "Etiqueta de cliente"
        verbose_name_plural = "Etiquetas de clientes"

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return f"{self.cliente} - {self.tag}"


class ProveedorTag(models.Model):
    proveedor = models.ForeignKey(Proveedor, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("proveedor", "tag")
        verbose_name = "Etiqueta de proveedor"
        verbose_name_plural = "Etiquetas de proveedores"

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return f"{self.proveedor} - {self.tag}"


class ContactoTag(models.Model):
    contacto = models.ForeignKey(Contacto, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("contacto", "tag")
        verbose_name = "Etiqueta de contacto"
        verbose_name_plural = "Etiquetas de contactos"

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return f"{self.contacto} - {self.tag}"

class RelacionBlue(models.Model):
    """Modelo para representar las relaciones entre clientes y contactos"""
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, related_name='relaciones')
    contacto = models.ForeignKey(Contacto, on_delete=models.PROTECT, related_name='relaciones')
    nivel = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Relación: {self.cliente.nombre} - {self.contacto.nombre} (Nivel: {self.nivel})"

    class Meta:
        verbose_name = "Relación Blue"
        verbose_name_plural = "Relaciones Blue"
