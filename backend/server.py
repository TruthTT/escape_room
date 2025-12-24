from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import socketio
import os
import logging
import json
import random
import string
from pathlib import Path
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Set
from datetime import datetime, timezone
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=False,
    engineio_logger=False
)

# FastAPI app
app = FastAPI(title="The Locked Study - Multiplayer Escape Room")
api_router = APIRouter(prefix="/api")

# Wrap with Socket.IO
socket_app = socketio.ASGIApp(sio, app)

# Game State Management
class GameRoom:
    def __init__(self, room_id: str, host_id: str):
        self.room_id = room_id
        self.host_id = host_id
        self.players: Dict[str, dict] = {}
        self.status = "lobby"  # lobby, playing, won
        self.created_at = datetime.now(timezone.utc)
        self.inventory: List[str] = []  # Shared inventory
        self.puzzle_states = {
            "code_lock": {"solved": False, "code": self._generate_code(4)},
            "safe": {"solved": False, "combination": self._generate_code(3)},
            "jigsaw": {"solved": False, "pieces": [False] * 9},
            "uv_light": {"solved": False, "revealed": False},
            "door": {"unlocked": False}
        }
        self.objects_state = {
            "book": {"examined": False, "clue": None},
            "painting": {"examined": False, "clue": None},
            "note": {"examined": False, "uv_revealed": False},
            "drawer": {"open": False, "contains": "key_piece_1"},
            "safe": {"open": False, "contains": "key_piece_2"},
            "jigsaw_table": {"complete": False, "contains": "key_piece_3"},
            "uv_lamp": {"picked_up": False},
            "door": {"unlocked": False}
        }
        self._generate_clues()
        self.messages: List[dict] = []
        
    def _generate_code(self, length: int) -> str:
        return ''.join(random.choices('0123456789', k=length))
    
    def _generate_clues(self):
        # Book reveals code lock hint
        self.objects_state["book"]["clue"] = f"The old diary mentions: 'My lucky number is {self.puzzle_states['code_lock']['code']}'"
        # Painting reveals safe combination
        self.objects_state["painting"]["clue"] = f"Behind the frame: {'-'.join(self.puzzle_states['safe']['combination'])}"
        # Note has hidden message revealed by UV
        self.objects_state["note"]["hidden_message"] = "The key lies in unity - combine the three pieces"
    
    def to_dict(self) -> dict:
        # Handle puzzle states with different key names
        puzzle_states_dict = {}
        for k, v in self.puzzle_states.items():
            if k == "door":
                puzzle_states_dict[k] = {"solved": v.get("unlocked", False)}
            else:
                puzzle_states_dict[k] = {"solved": v.get("solved", False)}
        
        return {
            "room_id": self.room_id,
            "host_id": self.host_id,
            "players": self.players,
            "status": self.status,
            "inventory": self.inventory,
            "puzzle_states": puzzle_states_dict,
            "objects_state": self.objects_state
        }

# Store active rooms
game_rooms: Dict[str, GameRoom] = {}
player_sessions: Dict[str, str] = {}  # sid -> room_id

# Pydantic Models
class CreateRoomRequest(BaseModel):
    player_name: str

class JoinRoomRequest(BaseModel):
    player_name: str
    room_id: str

class RoomResponse(BaseModel):
    room_id: str
    player_id: str
    share_link: str

# Helper functions
def generate_room_id() -> str:
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))

def generate_player_id() -> str:
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))

# REST API Endpoints
@api_router.get("/")
async def root():
    return {"message": "The Locked Study - Multiplayer Escape Room API"}

@api_router.post("/rooms/create", response_model=RoomResponse)
async def create_room(request: CreateRoomRequest):
    room_id = generate_room_id()
    player_id = generate_player_id()
    
    room = GameRoom(room_id, player_id)
    room.players[player_id] = {
        "id": player_id,
        "name": request.player_name,
        "position": {"x": 400, "y": 300},
        "color": "#D4AF37",
        "is_host": True
    }
    game_rooms[room_id] = room
    
    # Store in MongoDB
    await db.rooms.insert_one({
        "room_id": room_id,
        "host_id": player_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return RoomResponse(
        room_id=room_id,
        player_id=player_id,
        share_link=f"/room/{room_id}"
    )

@api_router.post("/rooms/join", response_model=RoomResponse)
async def join_room(request: JoinRoomRequest):
    room_id = request.room_id.lower()
    
    if room_id not in game_rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    
    room = game_rooms[room_id]
    
    if len(room.players) >= 4:
        raise HTTPException(status_code=400, detail="Room is full")
    
    if room.status == "playing":
        raise HTTPException(status_code=400, detail="Game already in progress")
    
    player_id = generate_player_id()
    colors = ["#ffffff", "#10b981", "#ef4444", "#3b82f6"]
    player_color = colors[len(room.players) % len(colors)]
    
    room.players[player_id] = {
        "id": player_id,
        "name": request.player_name,
        "position": {"x": 400 + len(room.players) * 50, "y": 300},
        "color": player_color,
        "is_host": False
    }
    
    return RoomResponse(
        room_id=room_id,
        player_id=player_id,
        share_link=f"/room/{room_id}"
    )

@api_router.get("/rooms/{room_id}")
async def get_room(room_id: str):
    if room_id not in game_rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    return game_rooms[room_id].to_dict()

# Socket.IO Events
@sio.event
async def connect(sid, environ):
    logging.info(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    logging.info(f"Client disconnected: {sid}")
    if sid in player_sessions:
        room_id = player_sessions[sid]
        if room_id in game_rooms:
            room = game_rooms[room_id]
            # Find and remove player by sid
            player_to_remove = None
            for pid, player in room.players.items():
                if player.get("sid") == sid:
                    player_to_remove = pid
                    break
            if player_to_remove:
                del room.players[player_to_remove]
                await sio.emit('player_left', {
                    "player_id": player_to_remove,
                    "players": room.players
                }, room=room_id)
        del player_sessions[sid]

@sio.event
async def join_room(sid, data):
    room_id = data.get("room_id")
    player_id = data.get("player_id")
    
    if room_id not in game_rooms:
        await sio.emit('error', {"message": "Room not found"}, to=sid)
        return
    
    room = game_rooms[room_id]
    
    if player_id not in room.players:
        await sio.emit('error', {"message": "Player not in room"}, to=sid)
        return
    
    # Store session info
    player_sessions[sid] = room_id
    room.players[player_id]["sid"] = sid
    
    # Join socket room
    await sio.enter_room(sid, room_id)
    
    # Send current state to joining player
    await sio.emit('room_state', room.to_dict(), to=sid)
    
    # Notify others
    await sio.emit('player_joined', {
        "player": room.players[player_id],
        "players": room.players
    }, room=room_id, skip_sid=sid)

@sio.event
async def start_game(sid, data):
    room_id = data.get("room_id")
    player_id = data.get("player_id")
    
    if room_id not in game_rooms:
        return
    
    room = game_rooms[room_id]
    
    if room.host_id != player_id:
        await sio.emit('error', {"message": "Only host can start the game"}, to=sid)
        return
    
    room.status = "playing"
    await sio.emit('game_started', {"status": "playing"}, room=room_id)

@sio.event
async def player_move(sid, data):
    room_id = data.get("room_id")
    player_id = data.get("player_id")
    position = data.get("position")
    
    if room_id not in game_rooms:
        return
    
    room = game_rooms[room_id]
    
    if player_id in room.players:
        room.players[player_id]["position"] = position
        await sio.emit('player_moved', {
            "player_id": player_id,
            "position": position
        }, room=room_id, skip_sid=sid)

@sio.event
async def examine_object(sid, data):
    room_id = data.get("room_id")
    player_id = data.get("player_id")
    object_id = data.get("object_id")
    
    if room_id not in game_rooms:
        return
    
    room = game_rooms[room_id]
    
    if object_id in room.objects_state:
        obj = room.objects_state[object_id]
        obj["examined"] = True
        
        response = {"object_id": object_id, "examined": True}
        
        if "clue" in obj and obj["clue"]:
            response["clue"] = obj["clue"]
        
        await sio.emit('object_examined', response, room=room_id)

@sio.event
async def pickup_item(sid, data):
    room_id = data.get("room_id")
    player_id = data.get("player_id")
    item_id = data.get("item_id")
    
    if room_id not in game_rooms:
        return
    
    room = game_rooms[room_id]
    
    # Check if item can be picked up
    if item_id == "uv_lamp" and not room.objects_state["uv_lamp"]["picked_up"]:
        room.objects_state["uv_lamp"]["picked_up"] = True
        room.inventory.append("uv_lamp")
        await sio.emit('item_picked', {
            "item_id": item_id,
            "inventory": room.inventory,
            "player_id": player_id
        }, room=room_id)

@sio.event
async def use_item(sid, data):
    room_id = data.get("room_id")
    player_id = data.get("player_id")
    item_id = data.get("item_id")
    target_id = data.get("target_id")
    
    if room_id not in game_rooms:
        return
    
    room = game_rooms[room_id]
    
    # UV lamp on note
    if item_id == "uv_lamp" and target_id == "note":
        room.objects_state["note"]["uv_revealed"] = True
        room.puzzle_states["uv_light"]["revealed"] = True
        room.puzzle_states["uv_light"]["solved"] = True
        await sio.emit('uv_revealed', {
            "message": room.objects_state["note"]["hidden_message"]
        }, room=room_id)
    
    # Combine key pieces
    if item_id == "combine_keys":
        required = ["key_piece_1", "key_piece_2", "key_piece_3"]
        if all(k in room.inventory for k in required):
            for k in required:
                room.inventory.remove(k)
            room.inventory.append("master_key")
            await sio.emit('items_combined', {
                "result": "master_key",
                "inventory": room.inventory
            }, room=room_id)
    
    # Use master key on door
    if item_id == "master_key" and target_id == "door":
        if "master_key" in room.inventory:
            room.objects_state["door"]["unlocked"] = True
            room.puzzle_states["door"]["unlocked"] = True
            room.status = "won"
            await sio.emit('game_won', {
                "message": "You've escaped The Locked Study!"
            }, room=room_id)

@sio.event
async def solve_puzzle(sid, data):
    room_id = data.get("room_id")
    player_id = data.get("player_id")
    puzzle_id = data.get("puzzle_id")
    answer = data.get("answer")
    
    if room_id not in game_rooms:
        return
    
    room = game_rooms[room_id]
    
    if puzzle_id == "code_lock":
        if answer == room.puzzle_states["code_lock"]["code"]:
            room.puzzle_states["code_lock"]["solved"] = True
            room.objects_state["drawer"]["open"] = True
            item = room.objects_state["drawer"]["contains"]
            room.inventory.append(item)
            await sio.emit('puzzle_solved', {
                "puzzle_id": puzzle_id,
                "item_found": item,
                "inventory": room.inventory
            }, room=room_id)
        else:
            await sio.emit('puzzle_failed', {
                "puzzle_id": puzzle_id,
                "message": "Wrong code!"
            }, to=sid)
    
    elif puzzle_id == "safe":
        if answer == room.puzzle_states["safe"]["combination"]:
            room.puzzle_states["safe"]["solved"] = True
            room.objects_state["safe"]["open"] = True
            item = room.objects_state["safe"]["contains"]
            room.inventory.append(item)
            await sio.emit('puzzle_solved', {
                "puzzle_id": puzzle_id,
                "item_found": item,
                "inventory": room.inventory
            }, room=room_id)
        else:
            await sio.emit('puzzle_failed', {
                "puzzle_id": puzzle_id,
                "message": "Wrong combination!"
            }, to=sid)
    
    elif puzzle_id == "jigsaw":
        piece_index = data.get("piece_index")
        if piece_index is not None and 0 <= piece_index < 9:
            room.puzzle_states["jigsaw"]["pieces"][piece_index] = True
            
            if all(room.puzzle_states["jigsaw"]["pieces"]):
                room.puzzle_states["jigsaw"]["solved"] = True
                room.objects_state["jigsaw_table"]["complete"] = True
                item = room.objects_state["jigsaw_table"]["contains"]
                room.inventory.append(item)
                await sio.emit('puzzle_solved', {
                    "puzzle_id": puzzle_id,
                    "item_found": item,
                    "inventory": room.inventory
                }, room=room_id)
            else:
                await sio.emit('jigsaw_progress', {
                    "pieces": room.puzzle_states["jigsaw"]["pieces"]
                }, room=room_id)

@sio.event
async def send_message(sid, data):
    room_id = data.get("room_id")
    player_id = data.get("player_id")
    message = data.get("message")
    
    if room_id not in game_rooms:
        return
    
    room = game_rooms[room_id]
    player_name = room.players.get(player_id, {}).get("name", "Unknown")
    
    chat_message = {
        "player_id": player_id,
        "player_name": player_name,
        "message": message,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    room.messages.append(chat_message)
    await sio.emit('new_message', chat_message, room=room_id)

@sio.event
async def quick_chat(sid, data):
    room_id = data.get("room_id")
    player_id = data.get("player_id")
    quick_message = data.get("quick_message")
    
    if room_id not in game_rooms:
        return
    
    room = game_rooms[room_id]
    player_name = room.players.get(player_id, {}).get("name", "Unknown")
    
    quick_messages = {
        "look": "Look here!",
        "found": "I found something!",
        "help": "I need help!",
        "idea": "I have an idea!",
        "yes": "Yes!",
        "no": "No!"
    }
    
    message_text = quick_messages.get(quick_message, quick_message)
    
    chat_message = {
        "player_id": player_id,
        "player_name": player_name,
        "message": message_text,
        "is_quick": True,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    room.messages.append(chat_message)
    await sio.emit('new_message', chat_message, room=room_id)

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Export socket_app for uvicorn
app = socket_app
