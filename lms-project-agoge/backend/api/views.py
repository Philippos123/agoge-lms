from rest_framework import viewsets, permissions, status
from django.core.mail import send_mail
from django.conf import settings

from rest_framework.generics import RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.utils import timezone
from .models import (
    User, Company, CompanySettings, 
    CourseToBuy, CompanyCourse,)
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
    permission_classes = []
    
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
    permission_classes = []
    
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
        serializer = CompanySettingsSerializer(settings, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        # Only admins can update settings
        if not user.is_admin and not user.is_superuser:
            return Response(
                {"error": "You don't have permission to update settings"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = CompanySettingsSerializer(settings, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            # Handle file upload manually if needed
            if 'logo' in request.FILES:
                settings.logo = request.FILES['logo']
                settings.save()
            
            serializer.save()
            return Response(serializer.data)
        
        # Print validation errors for debugging
        print("Validation errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        # Check if the user has a company
        user = request.user
        if not user.company:
            return Response({"error": "You do not belong to any company."}, status=400)

        # Check if the user is an admin
        if not user.is_admin:
            return Response({"error": "Only admins can view the team."}, status=403)

        # Get all members belonging to the company
        team_members = User.objects.filter(company=user.company)
        serializer = TeamMemberSerializer(team_members, many=True)
        return Response(serializer.data)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def invite_member(request):
    user = request.user
    
    if not user.company:
        return Response({"error": "You do not belong to any company"}, status=400)
    
    if not user.is_admin and not user.is_superuser:
        return Response({"error": "You do not have permission to invite members"}, status=403)
    
    # Get email from request.data
    email = request.data.get('email')
    if not email:
        return Response({"error": "Email is required"}, status=400)
    
    # Check if the user already exists
    if User.objects.filter(email=email).exists():
        return Response({"error": "User already exists"}, status=400)
    
    try:
        # Use console backend for email during development
        print(f"Would have sent invitation to {email} for company {user.company.name}")
        
        # Here you can add code to create an invitation code in the database
        # ...
        
        return Response({"message": f"Invitation sent to {email} (simulated)"})
    except Exception as e:
        print(f"Error sending invitation: {e}")
        return Response({"error": "Could not send invitation"}, status=500)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_member(request, user_id):
    """Allows a logged-in user to remove another user from the company"""
    
    try:
        user = User.objects.get(id=user_id)
        user.delete()
        return Response({"message": "User has been removed!"}, status=200)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)
    

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.auth = None  # This only works if you are using DRF's own token-auth
        return Response({"message": "Successfully logged out"}, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def team_members(request):
    users = User.objects.filter(company=request.user.company)
    # Important: Add context={'request': request} here
    serializer = UserSerializer(users, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_courses(request):
    """Fetch courses that the user's company has access to."""
    # Get the user's company
    company = request.user.company
    
    if not company:
        return Response({"error": "You do not belong to any company"}, status=400)
    
    # Get the company's courses
    company_courses = CompanyCourse.objects.filter(company=company)
    courses = [cc.course for cc in company_courses]
    
    # Serialize the courses
    serializer = CourseToBuySerializer(courses, many=True, context={'request': request})
    return Response(serializer.data)



