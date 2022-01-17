from django.contrib.auth import logout
from django.http import JsonResponse

def signout(request):
    '''
        登出函数
    '''
    user = request.user
    print(user)
    if not user.is_authenticated:
        return JsonResponse({
            'result' : 'not login'
        })
    
    logout(request)
    return JsonResponse({
        'result'  : 'success'
    })
