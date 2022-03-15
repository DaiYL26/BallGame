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
    appid = '455860f7d44df945e738'
    secret = '55ab8b64c9c20db24ddf782295145f9fdfb12b6f'
    
    url = 'https://github.com/login/oauth/access_token'
    params = {
        'client_id' : appid,
        'client_secret' : secret,
        'code' : code
    }

    headers = {
        'Accept' : 'application/json',
    }

    access_token_res = requests.post(url=url, params=params, headers=headers).json()
    print(access_token_res)
    access_token = access_token_res['access_token']
    # openid = access_token_res['openid']
    # if not access_token or not openid:
    #     return redirect('index')
    if not access_token:
        return redirect('index')

    # players = Player.objects.filter(openid=openid)
    # if players.exists():
    #     login(request=request, user=players[0].user)
    #     return redirect('index')
    
    get_userinfo_url = "https://api.github.com/user"
    u_headers = {
        'Authorization' : f'token {access_token}'
    }

    userinfo_res = requests.get(url=get_userinfo_url, headers=u_headers).json()
    print(userinfo_res)

    username = userinfo_res['login']
    photo = userinfo_res['avatar_url']
    openid = userinfo_res['id']

    if not openid:
        return redirect('index')

    players = Player.objects.filter(openid=openid)
    if players.exists():
        login(request=request, user=players[0].user)
        return redirect('index')

    while User.objects.filter(username=username).exists():
        username += str(randint(0, 9))
    
    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)

    login(request=request, user=user)

    return redirect("index")