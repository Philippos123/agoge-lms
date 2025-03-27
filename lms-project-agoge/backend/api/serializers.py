from rest_framework import serializers
from .models import ( 
    User, Company, CompanySettings, CourseToBuy,

    )
from django.contrib.auth import authenticate
from django.conf import settings
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserSerializer(serializers.ModelSerializer):
    profile_img_url = serializers.SerializerMethodField()

    def get_profile_img_url(self, obj):
        request = self.context.get('request')
        if obj.profile_img:
            return request.build_absolute_uri(obj.profile_img.url) if request else f"{settings.MEDIA_URL}{obj.profile_img.name}"
        return None  # Om ingen bild finns

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'is_admin', 'profile_img_url']


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CompanySettingsSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CompanySettings
        fields = ['primary_color', 'text_color', 'secondary_color', 'background_color', 'logo', 'logo_url']
        extra_kwargs = {
            'logo': {'required': False}
        }
    
    def get_logo_url(self, obj):
        request = self.context.get('request')
        if obj.logo and request:
            return request.build_absolute_uri(obj.logo.url)
        return None


class CourseToBuySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    def get_image_url(self, obj):
        if obj.img:  # Se till att fältet matchar ditt model-fält
            return f"{settings.MEDIA_URL}{obj.img}"
        return None
    
    class Meta:
        model = CourseToBuy
        fields = ['id', 'title', 'description', 'price', 'language_icon', 'image_url']
        
class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'is_admin']

