from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import ( User, Company, CompanySettings, CourseToBuy, CompanyCourse,
)

# Inline för att hantera företagets inställningar i CompanyAdmin
class CompanySettingsInline(admin.StackedInline):
    model = CompanySettings
    can_delete = False
    verbose_name_plural = 'Company Settings'

# Inline för att hantera kurser tilldelade företag (både beställda och köpta)
class CompanyCourseInline(admin.TabularInline):
    model = CompanyCourse
    extra = 1
    verbose_name = 'Kurs'
    verbose_name_plural = 'Kurser'

# Admin för Company-modellen
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'course_count', 'created_at', 'updated_at')
    search_fields = ('name',)
    inlines = [CompanySettingsInline, CompanyCourseInline]

    def course_count(self, obj):
        return obj.company_courses.count()
    course_count.short_description = 'Antal kurser'

# Anpassad admin för User-modellen
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'company', 'is_admin', 'is_staff', 'profile_img',)
    list_filter = ('company', 'is_admin', 'is_staff')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'profile_img')}),
        ('Company info', {'fields': ('company', 'is_admin')}),  # Hanterar företagets koppling
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),  # Användarbehörigheter
        ('Important dates', {'fields': ('last_login', 'date_joined')}),  # Inloggning och registrering
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name', 'profile_img', 'company', 'is_admin', 'is_staff', 'is_superuser'),
        }),
    )
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

# Admin för CourseToBuy-modellen (kurser som kan köpas)
class CourseToBuyAdmin(admin.ModelAdmin):
    list_display = ('title', 'price', 'language', 'language_icon', 'company_count')
    list_filter = ('language',)

    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'img', 'price', 'time_to_complete', 'language')
        }),
    )

    def company_count(self, obj):
        return obj.company_courses.count()  # Antal företag som har köpt denna kurs
    company_count.short_description = 'Antal företag'

# Admin för Course-modellen (kurser som tilldelas företag)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'creator', 'course_to_buy')
    search_fields = ('title', 'creator__name')
    list_filter = ('creator',)

    fieldsets = (
        (None, {
            'fields': ('title', 'creator', 'course_to_buy')  # Koppling till företag och köpta kurser
        }),
    )

# Admin för CompanyCourse-modellen (koppling mellan företag och deras kurser)
class CompanyCourseAdmin(admin.ModelAdmin):
    list_display = ('company', 'course', 'purchased_at', 'is_ordered')
    list_filter = ('is_ordered',)
    search_fields = ('company__name', 'course__title')

    fieldsets = (
        (None, {
            'fields': ('company', 'course', 'is_ordered', 'purchased_at')
        }),
    )

# Inline för att hantera svarsalternativ i QuizQuestion



# Registrera modellerna och deras admin-konfigurationer

# Registrera modellerna och deras admin-konfigurationer
admin.site.register(CourseToBuy, CourseToBuyAdmin)
admin.site.register(User, CustomUserAdmin)
admin.site.register(Company, CompanyAdmin)
admin.site.register(CompanyCourse, CompanyCourseAdmin)  # Registrera CompanyCourse för att hantera kopplingar mellan företag och kurser
