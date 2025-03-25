from rest_framework import viewsets, permissions, status
from django.core.mail import send_mail
from django.conf import settings

from rest_framework.generics import RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Company, CompanySettings, CourseToBuy
from .serializers import (
    UserSerializer, 
    CompanySerializer, 
    CompanySettingsSerializer,
    TokenObtainPairSerializer, 
    CourseToBuySerializer,
    TeamMemberSerializer,
)



class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token view that uses our enhanced serializer."""
    serializer_class = TokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    """API endpoint for users."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter users based on the requesting user's company and admin status."""
        user = self.request.user
        if user.is_superuser:
            return User.objects.all()
        elif user.is_admin and user.company:
            return User.objects.filter(company=user.company)
        return User.objects.filter(id=user.id)


class CompanyViewSet(viewsets.ModelViewSet):
    """API endpoint for companies."""
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter companies based on the requesting user's admin status."""
        user = self.request.user
        if user.is_superuser:
            return Company.objects.all()
        elif user.company:
            return Company.objects.filter(id=user.company.id)
        return Company.objects.none()


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def dashboard_settings(request):
    """API endpoint for dashboard settings."""
    user = request.user
    
    if not user.company:
        return Response(
            {"error": "User is not associated with any company"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        settings = CompanySettings.objects.get(company=user.company)
    except CompanySettings.DoesNotExist:
        # Create default settings if they don't exist
        settings = CompanySettings.objects.create(company=user.company)
    
    if request.method == 'GET':
        serializer = CompanySettingsSerializer(settings)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        # Only admins can update settings
        if not user.is_admin and not user.is_superuser:
            return Response(
                {"error": "You don't have permission to update settings"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = CompanySettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DashboardSettingsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        if not user.company:
            return Response({"error": "User is not associated with any company"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            settings = user.company.settings
            return Response({
                "primaryColor": settings.primary_color,
                "textColor": settings.text_color,
                "secondaryColor": settings.secondary_color,
                "logo": request.build_absolute_uri(settings.logo.url) if settings.logo else None
            })
        except CompanySettings.DoesNotExist:
            return Response({"error": "Company settings not found"}, status=status.HTTP_404_NOT_FOUND)
        
class CourseToBuyListView(APIView):
    def get(self, request, *args, **kwargs):
        courses = CourseToBuy.objects.all()
        serializer = CourseToBuySerializer(courses, many=True)
        return Response(serializer.data)
    
class CourseToBuyDetail(RetrieveAPIView):
    queryset = CourseToBuy.objects.all()
    serializer_class = CourseToBuySerializer
    
class TeamListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Kolla om användaren har ett företag
        user = request.user
        if not user.company:
            return Response({"error": "Du tillhör inget företag."}, status=400)

        # Kolla om användaren är VD (is_admin)
        if not user.is_admin:
            return Response({"error": "Endast VD:n kan se teamet."}, status=403)

        # Hämta alla medlemmar som tillhör företaget
        team_members = User.objects.filter(company=user.company)
        serializer = TeamMemberSerializer(team_members, many=True)
        return Response(serializer.data)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def invite_member(request):
    """Låter en inloggad användare bjuda in en ny medlem till företaget"""
    
    email = request.data.get("email")
    if not email:
        return Response({"error": "Ingen e-postadress angiven."}, status=400)

    # Skapa en inbjudningslänk
    invite_link = f"{settings.FRONTEND_URL}/register?email={email}"

    # Skicka e-post
    send_mail(
        subject="Du har blivit inbjuden!",
        message=f"Registrera dig här: {invite_link}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
    )

    return Response({"message": f"Inbjudan skickad till {email}!"}, status=200)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_member(request, user_id):
    """Låter en inloggad användare ta bort en annan användare från företaget"""
    
    try:
        user = User.objects.get(id=user_id)
        user.delete()
        return Response({"message": "Användaren har tagits bort!"}, status=200)
    except User.DoesNotExist:
        return Response({"error": "Användaren hittades inte."}, status=404)


