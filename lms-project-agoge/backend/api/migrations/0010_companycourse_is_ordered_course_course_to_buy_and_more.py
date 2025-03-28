# Generated by Django 5.1.7 on 2025-03-27 16:28

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_course_modules'),
    ]

    operations = [
        migrations.AddField(
            model_name='companycourse',
            name='is_ordered',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='course',
            name='course_to_buy',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='courses', to='api.coursetobuy'),
        ),
        migrations.AlterField(
            model_name='course',
            name='creator',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='courses', to='api.company'),
        ),
        migrations.DeleteModel(
            name='Modules',
        ),
    ]
