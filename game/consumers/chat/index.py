from channels.generic.websocket import WebsocketConsumer
import threading, multiprocessing

class ChatServer(WebsocketConsumer):

    def connect(self):
        print('chat', threading.get_ident(), multiprocessing.current_process().pid)
        self.accept()
        

    def receive(self, text_data=None, bytes_data=None):
        # Called with either text_data or bytes_data for each frame
        # You can call:
        print('chat', threading.get_ident(), multiprocessing.current_process().pid)
        self.send(text_data="Hello world!")
        self.send(bytes_data="Hello world!")

    def disconnect(self, close_code):
        pass