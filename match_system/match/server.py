#! /usr/bin/env python3


import glob
import queue
import sys
from typing import List
sys.path.insert(0, glob.glob('../../')[0])

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer

from acapp.asgi import channel_layer
from asgiref.sync import async_to_sync
from django.core.cache import cache
from match_system.match.match_service import Match
from queue import Queue
from time import sleep
from threading import Thread
import heapq

queue = Queue()

class Player:
    def __init__(self, score: int, uuid: str, username: str, photo: str, channel_name:str) -> None:
        self.score = score
        self.uuid = uuid
        self.username = username
        self.photo = photo
        self.channel_name = channel_name
        self.waiting_time = 0

    def __lt__(self, other):
        return self.score < other.score


class Pool:
    def __init__(self) -> None:
        self.__players = []
    

    def add_player(self, player: Player) -> None:
        heapq.heappush(self.__players, player)


    def check_result(self, a: Player, b: Player) -> bool:
        dt = abs(a.score - b.score)
        a_max_dif = a.waiting_time * 50
        b_max_dif = b.waiting_time * 50
        return dt <= a_max_dif and dt <= b_max_dif

    
    def match_success(self, players: List) -> None:
        print("Match Success: %s %s %s" % (players[0].username, players[1].username, players[2].username))
        room_name = "room-%s-%s-%s" % (players[0].uuid, players[1].uuid, players[2].uuid)
        _players = []
        for p in players:
            async_to_sync(channel_layer.group_add) (room_name, p.channel_name)
            _players.append({
                'uuid' : p.uuid,
                'username' : p.username,
                'photo' : p.photo,
                'hp' : 100
            })
        cache.set(room_name, _players, 3600)
        for p in players:
            async_to_sync(channel_layer.group_send) (room_name, {
                'type' : 'match_success',
                'event' : 'create_player',
                'room_name' : room_name,
                'uuid' : p.uuid,
                'username' : p.username,
                'photo' : p.photo
            })

    def increase_waitting_time(self) -> None:
        for player in self.__players:
            player.waiting_time += 1


    def match(self) -> None:
        while len(self.__players) >= 3:
            flag = False
            for i in range(len(self.__players) - 2):
                a, b, c = self.__players[i], self.__players[i + 1], self.__players[i + 2]
                if self.check_result(a, b) and self.check_result(b, c) and self.check_result(a, c):
                    self.match_success([a, b, c])
                    self.__players = self.__players[:i] + self.__players[i + 3:]
                    flag = True
                    break
            if not flag:
                break
        
        self.increase_waitting_time()


class CalculatorHandler:

    def add_player(self, score: int, uuid: str, username: str, photo: str, channel_name: str) -> int:
        player = Player(score, uuid, username, photo, channel_name)
        queue.put(player)
        return 0


def get_player_from_queue():
    try:
        return queue.get_nowait()
    except:
        return None


def worker() -> None:
    pool = Pool()
    while True:
        player = get_player_from_queue()
        if player:
            pool.add_player(player=player)
            print("Add Player: %s %d" % (player.username, player.score))
        else:
            pool.match()
            sleep(1)


if __name__ == '__main__':
    handler = CalculatorHandler()
    processor = Match.Processor(handler)
    transport = TSocket.TServerSocket(host='127.0.0.1', port=9090)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()

    # You could do one of these for a multithreaded server
    server = TServer.TThreadPoolServer(
        processor, transport, tfactory, pfactory)

    print('Starting the server...')
    Thread(target=worker, daemon=True).start()
    server.serve()
    print('done.')