from django.http import JsonResponse
from django.core.cache import cache
from urllib.parse import quote
from random import randint


def get_state_code():
    res = ''
    for _ in range(8):
        res += str(randint(0, 9))

    return res


def apply_code(request):
    appid = "122"

    redirect_uri = quote('https://app122.acapp.acwing.com.cn/settings/acwing/acapp/receive_code/')
    scope = 'userinfo'
    state = get_state_code()

    cache.set(state, True, 7200)

    return JsonResponse({
        'result' : 'success',
        'appid': appid,
        'redirect_uri': redirect_uri,
        'scope': scope,
        'state': state,
    })