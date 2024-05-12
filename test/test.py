import asyncio
import websockets
import json
import time


class TestStreamer():
    def __init__(self, stream_metadata={}):
        self.ws_address = "ws://localhost:3344/broadcast"
        self.stream_metadata = stream_metadata
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)
        self.websocket = None
        self.loop.run_until_complete(
            self.establish_wc_connection()
        )


    async def broadcast_ws_message(self, message):
        if self.websocket is None:
            await self.establish_wc_connection()
        if self.websocket is not None:
            try:
                await self.websocket.send(message)
            except websockets.exceptions.WebSocketException as e:
                self.websocket = None

    async def establish_wc_connection(self):
        print("Establishing connection")
        try:
            self.websocket = await websockets.connect(self.ws_address)
        except:
            self.websocket = None

if __name__ == "__main__":
    import random
    t = TestStreamer()
    #t.establish_wc_connection()
    while True:

        rand_pos_x = random.randint(0, 16*10)
        rand_pos_y = random.randint(0, 16*8)

        rand_map_x = rand_pos_x // 10
        rand_map_y = rand_pos_y // 8


        t.loop.run_until_complete(
                t.broadcast_ws_message(
                    json.dumps(
                        {
                          "mapCoords": [(rand_map_x,rand_map_y,0)],
                          "posCoords": [(rand_pos_x, rand_pos_y, 0)]
                        }
                    )
                )
            )
        time.sleep(3)