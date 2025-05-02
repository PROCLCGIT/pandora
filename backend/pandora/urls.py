# backend/pandora/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/basic/', include('basic.urls')),
]
