from django.urls import path
from game.views.settings.getinfo import get_user_info

urlpatterns = [
    path('getUserInfo', get_user_info, name='get_info_user')
]
