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
    appid = "455860f7d44df945e738"

    redirect_uri = quote('http://120.77.222.189/settings/acwing/web/receive_code/')
    scope = ''
    state = get_state_code()

    cache.set(state, True, 7200)

    apply_code_url = 'https://github.com/login/oauth/authorize'
    return JsonResponse({
        'result' : 'success',
        'apply_code_url' : apply_code_url +\
             "?client_id=%s&redirect_uri=%s&scope=%s&state=%s" % (appid, redirect_uri, scope, state)
    })