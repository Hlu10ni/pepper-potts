from django.db import models

# Create your models here.
'''class Feature:
    id: int
    name: str
    details: str
    is_true: bool
'''

class Feature(models.Model):
    name = models.CharField(max_length=120, default="No name provided")
    details = models.CharField(max_length=500, default="No details provided")

    def __str__(self):
        return self.name # ✅ Helps display the object name in the admin panel