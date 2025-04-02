from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from rest_framework.authtoken.models import Token


class User(AbstractUser):
    ROLE_CHOICES = (
        ('administrator', 'Administrator'),
        ('user', 'User'),
        ('mentor', 'Mentor'),
    )

    role = models.CharField(max_length=15, choices=ROLE_CHOICES)
