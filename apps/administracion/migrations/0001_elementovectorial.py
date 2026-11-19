from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name="ElementoVectorial",
            fields=[
                ("solicitud", models.UUIDField(editable=False, primary_key=True, serialize=False)),
                ("nombre", models.CharField(max_length=120)),
                ("descripcion", models.TextField(blank=True, max_length=1000)),
                ("geometria", models.JSONField()),
            ],
        ),
    ]
