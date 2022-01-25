from django.urls import path
from game.consumers.multiplayer.index import MultiPlayer
# from game.consumers.chat.index import ChatServer


websocket_urlpatterns = [
    path('wss/multiplayer/', MultiPlayer.as_asgi(), name='wss_multiplpayer'),
    # path('wss/chat/', ChatServer.as_asgi(), name='chat')
]