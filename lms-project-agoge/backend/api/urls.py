from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    UserViewSet,
    CompanyViewSet,
    dashboard_settings,
    CourseToBuyListView,
    CourseToBuyDetail,
    TeamListView,
    invite_member, 
    remove_member, # Se till att importen är korrekt
)

# Skapa en router och registrera viewsets
router = DefaultRouter()
router.register(r'user', UserViewSet)
router.register(r'company', CompanyViewSet)

# API URLs
urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('dashboard-settings/', dashboard_settings, name='dashboard-settings'),

    # Korrekt routing för CourseToBuy
    path('coursetobuy/', CourseToBuyListView.as_view(), name='coursetobuy-list'),
    path('coursetobuy/<int:pk>/', CourseToBuyDetail.as_view(), name='course-detail'),  # Ta bort "api/"
    
    # Team 
    path('team/', TeamListView.as_view(), name='team-list'),
    path("team/invite/", invite_member, name="invite-member"),
    path("team/remove/<int:user_id>/", remove_member, name="remove-member"),


    # Inkludera router-URLs
    path('', include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
