from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.cache import cache
from django.conf import settings

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from match_system.match.match_service import Match
from game.models.player.player import Player

from channels.db import database_sync_to_async

import json
import threading, multiprocessing


class MultiPlayer(AsyncWebsocketConsumer):

    async def connect(self):
        print('before', self.channel_name)
        await self.accept()
        print('after', self.channel_name)

    
    async def disconnect(self, close_code):
        print('disconnect')
        try:
            if self.room_name:
                await self.channel_layer.group_discard(self.room_name, self.channel_name)
        except Exception:
            print(f'disconnect self.room name is {self.room_name} , The channel_name: {self.channel_name}')


    async def match_success(self, data):
        # print(data)
        self.room_name = data['room_name']
        await self.group_send_event(data)


    async def create_player(self, data):
        self.room_name = None
        self.uuid = data['uuid']
        # Make socket
        transport = TSocket.TSocket('127.0.0.1', 9090)
        # Buffering is critical. Raw sockets are very slow
        transport = TTransport.TBufferedTransport(transport)
        # Wrap in a protocol
        protocol = TBinaryProtocol.TBinaryProtocol(transport)
        # Create a client to use the protocol encoder
        client = Match.Client(protocol)
        def db_get_player():
            return Player.objects.get(user__username=data['username'])

        player = await database_sync_to_async(db_get_player)()

        # Connect!
        transport.open()

        client.add_player(player.score, data['uuid'], data['username'], data['photo'], self.channel_name)

        # Close!
        transport.close()


    async def group_send_event(self, data):
        await self.send(text_data=json.dumps(data))

    async def move_to(self, data):
        await self.channel_layer.group_send(self.room_name, {
            'type' : 'group_send_event',
            'event' : 'move_to',
            'uuid' : data['uuid'],
            'tx' : data['tx'],
            'ty' : data['ty']
        })

    
    async def shoot_fireball(self, data):        
        await self.channel_layer.group_send(self.room_name, {
            'type' : 'group_send_event',
            'event' : 'shoot_fireball',
            'uuid' : data['uuid'],
            'tx' : data['tx'],
            'ty' : data['ty'],
            'ball_uuid' : data['ball_uuid']
        })

    # 广播攻击事件
    async def attack(self, data):
        if not self.room_name:
            return
        
        players = cache.get(self.room_name)
        for player in players:
            if player['uuid'] == data['attackee_uuid']:
                player['hp'] -= 20
                if player['hp'] <= 0: # 防止修改血量
                    data['damage'] = 9999999
        
        cache.set(self.room_name, players, 3600)

        # 更新积分
        remain_cnt = 0
        for player in players:
            if player['hp'] > 0:
                remain_cnt += 1
        if remain_cnt <= 1:
            def db_update_player_score(username, score):
                player = Player.objects.get(user__username=username)
                player.score += score
                player.save()
            for player in players:
                if player['hp'] <= 0:
                    await database_sync_to_async(db_update_player_score)(player['username'], -5)
                else:
                    await database_sync_to_async(db_update_player_score)(player['username'], 10)

        await self.channel_layer.group_send(self.room_name, {
            'type' : 'group_send_event',
            'event' : 'attack',
            'uuid' : data['uuid'],
            'attackee_uuid' : data['attackee_uuid'],
            'x' : data['x'],
            'y' : data['y'],
            'ball_uuid' : data['ball_uuid'],
            'angle' : data['angle'],
            'damage' : data['damage'],
        })


    async def blink(self, data):
        await self.channel_layer.group_send(self.room_name, {
            'type' : 'group_send_event',
            'event' : 'blink',
            'uuid' : data['uuid'],
            'x' : data['x'],
            'y' : data['y'],
            'vx' : data['vx'],
            'vy' : data['vy']
        })

    
    async def message(self, data):
        await self.channel_layer.group_send(self.room_name, {
            'type' : 'group_send_event',
            'event' : 'message',
            'uuid' : data['uuid'],
            'username' : data['username'],
            'text' : data['text']
        })

    
    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        # print(data)
        if data['event'] == 'create_player':
            await self.create_player(data)
        elif data['event'] == 'move_to':
            await self.move_to(data)
        elif data['event'] == 'shoot_fireball':
            await self.shoot_fireball(data)
        elif data['event'] == 'attack':
            await self.attack(data)
        elif data['event'] == 'blink':
            await self.blink(data)
        elif data['event'] == 'message':
            await self.message(data)