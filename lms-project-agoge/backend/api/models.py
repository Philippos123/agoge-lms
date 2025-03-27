from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _

class UserManager(BaseUserManager):
    """Custom user manager that uses email as the unique identifier instead of username."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)
class User(AbstractUser):
    """Custom User model with email as the unique identifier instead of username."""
    
    username = None
    email = models.EmailField(_('email address'), unique=True)
    company = models.ForeignKey('Company', on_delete=models.CASCADE, related_name='users', null=True, blank=True)
    is_admin = models.BooleanField(default=False)
    id = models.AutoField(primary_key=True)
    profile_img = models.ImageField(upload_to='profile_images/', null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()  # Koppla den anpassade UserManager


    def __str__(self):
        return self.email


class Company(models.Model):
    """Company model to group users and store company-specific settings."""
    
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    id = models.AutoField(primary_key=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Companies"
        


class CompanySettings(models.Model):
    """Company settings model to store company-specific settings like colors and logo."""
    
    company = models.OneToOneField(Company, on_delete=models.CASCADE, related_name='settings')
    primary_color = models.CharField(max_length=20, default="#007bff")
    text_color = models.CharField(max_length=20, default="#000000")
    secondary_color = models.CharField(max_length=20, default="#6c757d")
    background_color = models.CharField(max_length=20, default="#f5f5f5")  # Lägg till denna rad
    logo = models.ImageField(upload_to='company_logos/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company.name} Settings"

    class Meta:
        verbose_name_plural = "Company Settings"
        
class CourseToBuy(models.Model):
    class LanguageChoices(models.TextChoices):
        EN = 'EN', 'English'
        RU = 'RU', 'Russian'
        UA = 'UA', 'Ukrainian'
        SE = 'SE', 'Swedish'
        DE = 'DE', 'German'
        FR = 'FR', 'French'
        IT = 'IT', 'Italian'
        ES = 'ES', 'Spanish'

    price = models.FloatField()  # Kursens pris
    title = models.CharField(max_length=255)  # Kursens titel
    description = models.TextField()  # Kursens beskrivning
    img = models.ImageField(upload_to='course_images/', null=True, blank=True)  # Bild för kursen
    time_to_complete = models.IntegerField()  # Tidsåtgång för att genomföra kursen (i minuter)
    language = models.CharField(
        max_length=2,  # Eftersom vi har två tecken för varje språk
        choices=LanguageChoices.choices,  # Använd våra val
    )
    id = models.AutoField(primary_key=True)  # Automatisk ID

    def __str__(self):
        return self.title

    @property
    def language_icon(self):
        # Här definierar vi en enkel metod för att hämta en ikon baserat på språkvalet
        icon_map = {
            'EN': '🇬🇧',  # Engelsk flagga
            'RU': '🇷🇺',  # Rysk flagga
            'UA': '🇺🇦',  # Ukrainsk flagga
            'SE': '🇸🇪',  # Svensk flagga
            'DE': '🇩🇪',  # Tysk flagga
            'FR': '🇫🇷',  # Fransk flagga
            'IT': '🇮🇹',  # Italiensk flagga
            'ES': '🇪🇸',  # Spansk flagga
        }
        return icon_map.get(self.language, '🏳️')  # Standardflagg om inget språk finns
    


    
class CompanyCourse(models.Model):
    """Relation mellan företag och kurser de har köpt/har tillgång till."""
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='company_courses')
    course = models.ForeignKey(CourseToBuy, on_delete=models.CASCADE, related_name='company_courses')
    purchased_at = models.DateTimeField(auto_now_add=True)
    is_ordered = models.BooleanField(default=False)  # Markera om kursen är beställd eller köpt

    
    class Meta:
        unique_together = ['company', 'course']  # Ett företag kan bara köpa en kurs en gång
        
    def __str__(self):
        return f"{self.company.name} - {self.course.title}"

# Modeller för kursmoduler och innehåll

