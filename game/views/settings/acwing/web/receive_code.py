from random import randint
from django.shortcuts import redirect
from django.core.cache import cache
from game.models.player.player import Player
from django.contrib.auth.models import User
from django.contrib.auth import login
import requests


def receive_code(request):
    data = request.GET
    code = data.get('code')
    state = data.get('state')

    if not cache.has_key(state):
        return redirect('index')

    cache.delete(state)
    appid = '122'
    secret = '0e278a90e2234c9a843b36b8f487020f'
    
    url = 'https://www.acwing.com/third_party/api/oauth2/access_token/'
    params = {
        'appid' : appid,
        'secret' : secret,
        'code' : code
    }

    access_token_res = requests.get(url=url, params=params).json()
    access_token = access_token_res['access_token']
    openid = access_token_res['openid']

    if not access_token or not openid:
        return redirect('index')

    players = Player.objects.filter(openid=openid)
    if players.exists():
        login(request=request, user=players[0].user)
        return redirect('index')
    
    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
        'access_token' : access_token,
        'openid' : openid
    }

    userinfo_res = requests.get(url=get_userinfo_url, params=params).json()
    username = userinfo_res['username']
    photo = userinfo_res['photo']

    while User.objects.filter(username=username).exists():
        username += str(randint(0, 9))
    
    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)

    login(request=request, user=user)

    return redirect("index")