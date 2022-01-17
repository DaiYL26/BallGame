from django.contrib.auth import login
from django.contrib.auth.models import User
from game.models.player.player import Player
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse


@csrf_exempt
def register(request):
    '''
        注册函数
    '''
    data = request.POST
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    password_confirm = data.get('password_confirm', '').strip()

    if username == '' or password == '' or len(password) < 8 or len(password) > 18:
        return JsonResponse({
            'result' : 'failed',
            'msg' : '用户名和密码不能为空，且密码为8位以上18位以下'
        })
    
    if password != password_confirm:
        return JsonResponse({
            'result' : 'failed',
            'msg' : '密码不一致'
        })
    
    if User.objects.filter(username=username).exists():
        return JsonResponse({
            'result' : 'failed',
            'msg' : '用户名已存在'
        })
    
    user = User(username=username, password=password)
    user.save()

    Player.objects.create(user=user, photo='https://tse3-mm.cn.bing.net/th/id/OIP-C.fDfa0taE3umHSH6_dXP_0QAAAA?pid=ImgDet&rs=1')
    login(request=request, user=user)

    return JsonResponse({
        'result' : 'success',
        'msg' : ''
    })