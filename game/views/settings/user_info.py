from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from game.models.player.player import Player
from random import randint
import base64
import os


def save_image(username, body, url):    
    try:
        player = Player.objects.get(user__username=username)
        if player.photo != url and os.path.exists(player.photo):
            os.remove(player.photo)

        pic_data = base64.b64decode(body)
        with open(url, "wb+") as pic:
            pic.write(pic_data)
        player.photo = url
        player.save()
    except Exception as e:
        print(e)
        raise Exception


@csrf_exempt
def change_avatar(request):
    data = request.POST
    header, body = data['img'].split(',')
    type, form = header.split('/')

    if type != 'data:image':
        return JsonResponse({
            'result' : 'faild',
            'msg' : 'type invalid'
        })
    
    url = 'static/avatar/' + request.user.username + '_' + str(randint(0, 100)) + '.' + form.split(';')[0]

    try:
        save_image(username=request.user.username, body=body, url=url)
    except Exception:
        return JsonResponse({
            'result' : 'faild'
        })

    return JsonResponse({
        'result': 'success',
        'url' : url
    })


def change_username(request):
    if not request.user.is_authenticated:
        return JsonResponse({
            'result' : 'failed',
            'msg' : 'not login'
        })

    data = request.POST
    print(data)

    if data['username'] == '':
        return JsonResponse({
            'result' : 'failed',
            'msg' : 'invalid username'
        })
    
    player = User.objects.get(username=request.user.username)
    player.username = data['username']
    player.save()

    return JsonResponse({
        'result' : 'faild',
        'msg' : 'success'
    })


@csrf_exempt
def change_pwd(request):
    if not request.user.is_authenticated:
        return JsonResponse({
            'result' : 'failed',
            'msg' : 'not login'
        })
    
    data = request.POST
    print(data)

    if len(data['new_pwd']) > 18 or len(data['new_pwd']) < 8:
        return JsonResponse({
            'result' : 'failed',
            'msg' : 'new password invalid'
        })

    try:
        player = User.objects.get(username=request.user.username)
        
        if player.password != '' and not authenticate(request=request, username=request.user.username, password=data['old_pwd']):
            return JsonResponse({
                'result' : 'failed',
                'msg' : 'old password invaild'
            })
        
        player.set_password(data['new_pwd'])
        player.save()

        return JsonResponse({
            'result' : 'success',
            'msg' : 'update success'
        })
    except Exception as e:
        print(e)
        return JsonResponse({
            'result' : 'failed',
            'msg' : 'user does not exists'
        })