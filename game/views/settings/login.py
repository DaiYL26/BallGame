from django.contrib.auth import login, authenticate
from django.http import JsonResponse


def signin(request):
    '''
        登入函数
    '''
    username = request.GET.get('username')
    password = request.GET.get('password')
    user = authenticate(request=request, username=username, password=password)
    # print(user)
    if not user:
        return JsonResponse({
            'result' : 'not login'
        })
    
    login(request=request, user=user)
    
    return JsonResponse({
        'result' : 'success'
    })