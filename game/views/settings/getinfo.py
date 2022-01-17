from django.http import JsonResponse 
from game.models.player.player import Player


def get_user_info_acapp(request):
    
    # if not request.user.is_authenticated:
    #     return JsonResponse({
    #         'state': 'not login'
    #     })
    
    user = Player.objects.get(user=request.user)
    if not user:
        return JsonResponse({
            'result' : 'falied'
        })

    return JsonResponse({
        'result': 'success',
        'username': user.user.username,
        'photo': user.photo
    })


def get_user_info_web(request):
    
    if not request.user.is_authenticated:
        return JsonResponse({
            'result': 'not login'
        })
        
    user = Player.objects.get(user=request.user)

    if not user:
        return JsonResponse({
            'result' : 'falied'
        })

    return JsonResponse({
        'result': 'success',
        'username': user.user.username,
        'photo': user.photo
    })


def get_user_info(request):
    platform = request.GET.get('platform')
    if platform == 'ACAPP':
        return get_user_info_acapp(request)
    else:
        return get_user_info_web(request)