# Generated by Django 5.1.7 on 2025-03-26 17:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_companycourse'),
    ]

    operations = [
        migrations.AddField(
            model_name='companysettings',
            name='background_color',
            field=models.CharField(default='#f5f5f5', max_length=20),
        ),
    ]
