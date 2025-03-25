from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Company, CompanySettings, CourseToBuy

class CompanySettingsInline(admin.StackedInline):
    model = CompanySettings
    can_delete = False
    verbose_name_plural = 'Company Settings'

class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at', 'updated_at')
    search_fields = ('name',)
    inlines = [CompanySettingsInline]

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'company', 'is_admin', 'is_staff')
    list_filter = ('company', 'is_admin', 'is_staff')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Company info', {'fields': ('company', 'is_admin')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'company', 'is_admin', 'is_staff', 'is_superuser'),
        }),
    )
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    
class CourseToBuyAdmin(admin.ModelAdmin):
    list_display = ('title', 'price', 'language', 'language_icon')  # Visa språk och ikon
    list_filter = ('language',)

    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'img', 'price', 'time_to_complete', 'language')
        }),
    )

# Registrera modellen och dess admin-konfiguration
admin.site.register(CourseToBuy, CourseToBuyAdmin)
admin.site.register(User, CustomUserAdmin)
admin.site.register(Company, CompanyAdmin)
