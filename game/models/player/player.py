from django.contrib.auth.models import User
from django.db import models

class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    photo = models.URLField(max_length=256, default='static/default_avatar.png')
    openid = models.CharField(max_length=256, default='')
    score = models.IntegerField(default=1500)
    
    def __str__(self) -> str:
        return str(self.user)
