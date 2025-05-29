from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BriefViewSet, BriefItemViewSet

router = DefaultRouter()
router.register(r'briefs', BriefViewSet)
router.register(r'brief-items', BriefItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]