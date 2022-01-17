from django.urls import path, include
from game.views.settings.getinfo import get_user_info
from game.views.settings.login import signin
from game.views.settings.logout import signout
from game.views.settings.register import register


urlpatterns = [
    path('getUserInfo/', get_user_info, name='settings_get_user_info'),
    path('login/', signin, name='settings_user_login'),
    path('logout/', signout, name='settings_user_logout'),
    path('register/', register, name='settings_user_register'),
    path('acwing/', include('game.urls.settings.acwing.index'))
]
