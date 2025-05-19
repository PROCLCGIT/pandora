from django.contrib import admin
from .models import (
    Proforma,
    ProformaItem,
    ProformaHistorial,
    SecuenciaProforma,
    ConfiguracionProforma
)

admin.site.register(Proforma)
admin.site.register(ProformaItem)
admin.site.register(ProformaHistorial)
admin.site.register(SecuenciaProforma)
admin.site.register(ConfiguracionProforma)
