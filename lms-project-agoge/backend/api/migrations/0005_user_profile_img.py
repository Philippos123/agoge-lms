# Generated by Django 5.1.7 on 2025-03-25 17:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_coursetobuy_img'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='profile_img',
            field=models.ImageField(blank=True, null=True, upload_to='profile_images/'),
        ),
    ]
