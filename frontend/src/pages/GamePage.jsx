import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { io } from "socket.io-client";
import GameCanvas from "../components/game/GameCanvas";
import VirtualJoystick from "../components/game/VirtualJoystick";
import Inventory from "../components/game/Inventory";
import ChatPanel from "../components/game/ChatPanel";
import CodeLockModal from "../components/puzzles/CodeLockModal";
import SafeModal from "../components/puzzles/SafeModal";
import JigsawModal from "../components/puzzles/JigsawModal";
import UVLightModal from "../components/puzzles/UVLightModal";
import ClockModal from "../components/puzzles/ClockModal";
import BookCipherModal from "../components/puzzles/BookCipherModal";
import ColorMixModal from "../components/puzzles/ColorMixModal";
import SliderPuzzleModal from "../components/puzzles/SliderPuzzleModal";
import WinModal from "../components/WinModal";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const SOCKET_URL = process.env.REACT_APP_BACKEND_URL;

const GamePage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [playerId] = useState(localStorage.getItem("playerId"));
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Puzzle modals
  const [showCodeLock, setShowCodeLock] = useState(false);
  const [showSafe, setShowSafe] = useState(false);
  const [showJigsaw, setShowJigsaw] = useState(false);
  const [showUVLight, setShowUVLight] = useState(false);
  const [showClock, setShowClock] = useState(false);
  const [showCipher, setShowCipher] = useState(false);
  const [showColorMix, setShowColorMix] = useState(false);
  const [showSlider, setShowSlider] = useState(false);
  const [showWin, setShowWin] = useState(false);
  
  // Current clue/message
  const [currentClue, setCurrentClue] = useState(null);
  const [uvMessage, setUVMessage] = useState(null);
  const [jigsawPieces, setJigsawPieces] = useState([false, false, false, false, false, false, false, false, false]);
  
  const socketRef = useRef(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch initial room data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await axios.get(`${API}/rooms/${roomId}`);
        if (response.data.status === "lobby") {
          navigate(`/room/${roomId}`);
          return;
        }
        setRoom(response.data);
        setIsLoading(false);
      } catch (error) {
        toast.error("Room not found");
        navigate("/");
      }
    };
    fetchRoom();
  }, [roomId, navigate]);

  // Socket connection
  useEffect(() => {
    if (!playerId || !roomId || isLoading) return;

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      path: "/api/socket.io"
    });

    newSocket.on("connect", () => {
      console.log("Game socket connected");
      newSocket.emit("join_room", { room_id: roomId, player_id: playerId });
    });

    newSocket.on("room_state", (data) => {
      setRoom(data);
    });

    newSocket.on("player_joined", (data) => {
      setRoom(prev => ({ ...prev, players: data.players }));
    });

    newSocket.on("player_left", (data) => {
      setRoom(prev => ({ ...prev, players: data.players }));
    });

    newSocket.on("player_moved", (data) => {
      setRoom(prev => ({
        ...prev,
        players: {
          ...prev.players,
          [data.player_id]: {
            ...prev.players[data.player_id],
            position: data.position
          }
        }
      }));
    });

    newSocket.on("object_examined", (data) => {
      if (data.clue) {
        setCurrentClue(data.clue);
        toast.info(data.clue, { duration: 5000 });
      }
      setRoom(prev => ({
        ...prev,
        objects_state: {
          ...prev.objects_state,
          [data.object_id]: {
            ...prev.objects_state?.[data.object_id],
            examined: true
          }
        }
      }));
    });

    newSocket.on("item_picked", (data) => {
      setRoom(prev => ({ ...prev, inventory: data.inventory }));
      toast.success(`Picked up ${data.item_id.replace(/_/g, " ")}`);
    });

    newSocket.on("puzzle_solved", (data) => {
      setRoom(prev => ({
        ...prev,
        inventory: data.inventory,
        puzzle_states: {
          ...prev.puzzle_states,
          [data.puzzle_id]: { solved: true }
        }
      }));
      if (data.item_found) {
        toast.success(`Found ${data.item_found?.replace(/_/g, " ")}!`);
      } else {
        toast.success("Puzzle solved!");
      }
      // Close all puzzle modals
      setShowCodeLock(false);
      setShowSafe(false);
      setShowJigsaw(false);
      setShowClock(false);
      setShowCipher(false);
      setShowColorMix(false);
      setShowSlider(false);
    });

    newSocket.on("puzzle_failed", (data) => {
      toast.error(data.message);
    });

    newSocket.on("jigsaw_progress", (data) => {
      setJigsawPieces(data.pieces);
    });

    newSocket.on("uv_revealed", (data) => {
      setUVMessage(data.message);
      toast.info(data.message, { duration: 5000 });
    });

    newSocket.on("items_combined", (data) => {
      setRoom(prev => ({ ...prev, inventory: data.inventory }));
      toast.success("Created the Master Key!");
    });

    newSocket.on("game_won", (data) => {
      setShowWin(true);
    });

    newSocket.on("new_message", (data) => {
      setRoom(prev => ({
        ...prev,
        messages: [...(prev.messages || []), data]
      }));
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [playerId, roomId, isLoading]);

  // Game actions
  const handlePlayerMove = useCallback((position) => {
    if (socketRef.current && playerId) {
      socketRef.current.emit("player_move", {
        room_id: roomId,
        player_id: playerId,
        position
      });
      
      // Update local state immediately
      setRoom(prev => ({
        ...prev,
        players: {
          ...prev.players,
          [playerId]: {
            ...prev.players[playerId],
            position
          }
        }
      }));
    }
  }, [playerId, roomId]);

  const handleJoystickMove = useCallback((dx, dy) => {
    if (!room?.players?.[playerId]) return;
    const player = room.players[playerId];
    const speed = 4;
    const newX = Math.max(24, Math.min(776, player.position.x + dx * speed));
    const newY = Math.max(24, Math.min(576, player.position.y + dy * speed));
    handlePlayerMove({ x: newX, y: newY });
  }, [room, playerId, handlePlayerMove]);

  const handleJoystickStop = useCallback(() => {
    // Player stops
  }, []);

  const handleObjectClick = useCallback((objectId) => {
    if (!socketRef.current || !playerId) return;

    // Handle different objects
    switch (objectId) {
      case "drawer":
        if (room?.puzzle_states?.code_lock?.solved) {
          toast.info("The drawer is already open");
        } else {
          setShowCodeLock(true);
        }
        break;
      case "safe":
        if (room?.puzzle_states?.safe?.solved) {
          toast.info("The safe is already open");
        } else {
          setShowSafe(true);
        }
        break;
      case "jigsaw_table":
        if (room?.puzzle_states?.jigsaw?.solved) {
          toast.info("Puzzle already complete");
        } else {
          setShowJigsaw(true);
        }
        break;
      case "clock":
        if (room?.puzzle_states?.clock?.solved) {
          toast.info("The clock is already set correctly");
        } else {
          setShowClock(true);
        }
        break;
      case "cipher_book":
        if (room?.puzzle_states?.cipher?.solved) {
          toast.info("You already decoded the message");
        } else {
          setShowCipher(true);
        }
        break;
      case "lamp_panel":
        if (room?.puzzle_states?.color_mix?.solved) {
          toast.info("The lights are already mixed correctly");
        } else {
          setShowColorMix(true);
        }
        break;
      case "slider_box":
        if (room?.puzzle_states?.slider?.solved) {
          toast.info("The puzzle box is already open");
        } else {
          setShowSlider(true);
        }
        break;
      case "uv_lamp":
        if (!room?.inventory?.includes("uv_lamp")) {
          socketRef.current.emit("pickup_item", {
            room_id: roomId,
            player_id: playerId,
            item_id: "uv_lamp"
          });
        }
        break;
      case "note":
        if (room?.inventory?.includes("uv_lamp") && !room?.puzzle_states?.uv_light?.revealed) {
          setShowUVLight(true);
        } else {
          socketRef.current.emit("examine_object", {
            room_id: roomId,
            player_id: playerId,
            object_id: objectId
          });
        }
        break;
      case "door":
        if (room?.inventory?.includes("master_key")) {
          socketRef.current.emit("use_item", {
            room_id: roomId,
            player_id: playerId,
            item_id: "master_key",
            target_id: "door"
          });
        } else {
          toast.info("The door is locked. You need a key.");
        }
        break;
      default:
        socketRef.current.emit("examine_object", {
          room_id: roomId,
          player_id: playerId,
          object_id: objectId
        });
    }
  }, [playerId, roomId, room]);

  const handleSolvePuzzle = useCallback((puzzleId, answer, pieceIndex = null) => {
    if (socketRef.current && playerId) {
      socketRef.current.emit("solve_puzzle", {
        room_id: roomId,
        player_id: playerId,
        puzzle_id: puzzleId,
        answer,
        piece_index: pieceIndex
      });
    }
  }, [playerId, roomId]);

  const handleUseUVLamp = useCallback(() => {
    if (socketRef.current && playerId) {
      socketRef.current.emit("use_item", {
        room_id: roomId,
        player_id: playerId,
        item_id: "uv_lamp",
        target_id: "note"
      });
      setShowUVLight(false);
    }
  }, [playerId, roomId]);

  const handleCombineKeys = useCallback(() => {
    if (socketRef.current && playerId) {
      socketRef.current.emit("use_item", {
        room_id: roomId,
        player_id: playerId,
        item_id: "combine_keys",
        target_id: null
      });
    }
  }, [playerId, roomId]);

  const handleSendMessage = useCallback((message) => {
    if (socketRef.current && playerId) {
      socketRef.current.emit("send_message", {
        room_id: roomId,
        player_id: playerId,
        message
      });
    }
  }, [playerId, roomId]);

  const handleQuickChat = useCallback((quickMessage) => {
    if (socketRef.current && playerId) {
      socketRef.current.emit("quick_chat", {
        room_id: roomId,
        player_id: playerId,
        quick_message: quickMessage
      });
    }
  }, [playerId, roomId]);

  if (isLoading || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-[#D4AF37] text-xl">Loading game...</div>
      </div>
    );
  }

  const inventory = room.inventory || [];
  const canCombineKeys = inventory.includes("key_piece_1") && 
                         inventory.includes("key_piece_2") && 
                         inventory.includes("key_piece_3");

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0a0a0a] relative" data-testid="game-page">
      {/* Game Canvas */}
      <GameCanvas
        players={room.players || {}}
        currentPlayerId={playerId}
        objectsState={room.objects_state || {}}
        puzzleStates={room.puzzle_states || {}}
        onPlayerMove={handlePlayerMove}
        onObjectClick={handleObjectClick}
      />

      {/* Virtual Joystick (Mobile Only) */}
      {isMobile && (
        <VirtualJoystick
          onMove={handleJoystickMove}
          onStop={handleJoystickStop}
        />
      )}

      {/* Inventory */}
      <Inventory 
        items={inventory}
        canCombineKeys={canCombineKeys}
        onCombineKeys={handleCombineKeys}
      />

      {/* Chat Panel */}
      <ChatPanel
        messages={room.messages || []}
        currentPlayerId={playerId}
        onSendMessage={handleSendMessage}
        onQuickChat={handleQuickChat}
      />

      {/* Original Puzzle Modals */}
      <CodeLockModal
        isOpen={showCodeLock}
        onClose={() => setShowCodeLock(false)}
        onSubmit={(code) => handleSolvePuzzle("code_lock", code)}
        solved={room.puzzle_states?.code_lock?.solved}
      />

      <SafeModal
        isOpen={showSafe}
        onClose={() => setShowSafe(false)}
        onSubmit={(combination) => handleSolvePuzzle("safe", combination)}
        solved={room.puzzle_states?.safe?.solved}
      />

      <JigsawModal
        isOpen={showJigsaw}
        onClose={() => setShowJigsaw(false)}
        onPiecePlaced={(index) => handleSolvePuzzle("jigsaw", null, index)}
        pieces={jigsawPieces}
        solved={room.puzzle_states?.jigsaw?.solved}
      />

      <UVLightModal
        isOpen={showUVLight}
        onClose={() => setShowUVLight(false)}
        onUse={handleUseUVLamp}
        revealed={room.puzzle_states?.uv_light?.revealed}
        message={uvMessage}
      />

      {/* New Puzzle Modals */}
      <ClockModal
        isOpen={showClock}
        onClose={() => setShowClock(false)}
        onSubmit={(time) => handleSolvePuzzle("clock", time)}
        solved={room.puzzle_states?.clock?.solved}
      />

      <BookCipherModal
        isOpen={showCipher}
        onClose={() => setShowCipher(false)}
        onSubmit={(answer) => handleSolvePuzzle("cipher", answer)}
        solved={room.puzzle_states?.cipher?.solved}
      />

      <ColorMixModal
        isOpen={showColorMix}
        onClose={() => setShowColorMix(false)}
        onSubmit={(correct) => handleSolvePuzzle("color_mix", correct)}
        solved={room.puzzle_states?.color_mix?.solved}
      />

      <SliderPuzzleModal
        isOpen={showSlider}
        onClose={() => setShowSlider(false)}
        onSubmit={(solved) => handleSolvePuzzle("slider", solved)}
        solved={room.puzzle_states?.slider?.solved}
      />

      {/* Win Modal */}
      <WinModal
        isOpen={showWin}
        onClose={() => navigate("/")}
      />
    </div>
  );
};

export default GamePage;
