import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Copy, Users, Crown, Play, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { io } from "socket.io-client";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const SOCKET_URL = process.env.REACT_APP_BACKEND_URL;

const LobbyPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [playerId, setPlayerId] = useState(localStorage.getItem("playerId"));
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial room data
    const fetchRoom = async () => {
      try {
        const response = await axios.get(`${API}/rooms/${roomId}`);
        setRoom(response.data);
        setIsHost(response.data.host_id === playerId);
        setIsLoading(false);
      } catch (error) {
        toast.error("Room not found");
        navigate("/");
      }
    };

    fetchRoom();
  }, [roomId, playerId, navigate]);

  useEffect(() => {
    if (!playerId || !roomId || isLoading) return;

    // Connect to Socket.IO
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      path: "/socket.io"
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
      newSocket.emit("join_room", { room_id: roomId, player_id: playerId });
    });

    newSocket.on("room_state", (data) => {
      setRoom(data);
      setIsHost(data.host_id === playerId);
    });

    newSocket.on("player_joined", (data) => {
      setRoom(prev => ({ ...prev, players: data.players }));
      toast.success(`${data.player.name} joined the room!`);
    });

    newSocket.on("player_left", (data) => {
      setRoom(prev => ({ ...prev, players: data.players }));
    });

    newSocket.on("game_started", () => {
      navigate(`/game/${roomId}`);
    });

    newSocket.on("error", (data) => {
      toast.error(data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [playerId, roomId, isLoading, navigate]);

  const copyRoomLink = () => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
    toast.success("Room link copied to clipboard!");
  };

  const handleStartGame = () => {
    if (socket && isHost) {
      socket.emit("start_game", { room_id: roomId, player_id: playerId });
    }
  };

  const handleLeave = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#D4AF37] text-xl">Loading...</div>
      </div>
    );
  }

  const players = room?.players ? Object.values(room.players) : [];
  const playerCount = players.length;

  return (
    <div className="min-h-screen p-6 flex flex-col">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <Button 
          variant="ghost" 
          onClick={handleLeave}
          className="text-[#a3a3a3] hover:text-white"
          data-testid="leave-lobby-btn"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Leave
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-[#a3a3a3] text-sm">Room Code:</span>
          <code className="text-[#D4AF37] font-mono text-lg uppercase">{roomId}</code>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={copyRoomLink}
            className="text-[#a3a3a3] hover:text-[#D4AF37]"
            data-testid="copy-room-link-btn"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full"
        >
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#e5e5e5] mb-2">
              The Locked Study
            </h1>
            <p className="text-[#a3a3a3]">Waiting for players...</p>
          </div>

          {/* Player List */}
          <div className="glass rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-[#e5e5e5] font-semibold">Players</span>
              </div>
              <span className="text-[#a3a3a3] text-sm">{playerCount}/4</span>
            </div>

            <div className="space-y-3">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-black/20"
                  data-testid={`player-${player.id}`}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[#e5e5e5] font-medium">{player.name}</span>
                      {player.is_host && (
                        <Crown className="w-4 h-4 text-[#D4AF37]" />
                      )}
                    </div>
                    {player.id === playerId && (
                      <span className="text-xs text-[#a3a3a3]">(You)</span>
                    )}
                  </div>
                  <div 
                    className="w-3 h-3 rounded-full bg-[#10b981]"
                    title="Online"
                  />
                </motion.div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: 4 - playerCount }).map((_, i) => (
                <div 
                  key={`empty-${i}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-white/10"
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white/20" />
                  </div>
                  <span className="text-[#525252]">Waiting for player...</span>
                </div>
              ))}
            </div>
          </div>

          {/* Share Link */}
          <div className="glass rounded-xl p-4 mb-6">
            <p className="text-[#a3a3a3] text-sm mb-2">Share this link with friends:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-black/30 rounded px-3 py-2 text-[#D4AF37] text-sm font-mono truncate">
                {`${window.location.origin}/room/${roomId}`}
              </code>
              <Button 
                onClick={copyRoomLink}
                variant="outline"
                size="sm"
                className="btn-outline"
                data-testid="copy-link-btn"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Start Game Button */}
          {isHost ? (
            <Button 
              onClick={handleStartGame}
              disabled={playerCount < 1}
              className="w-full btn-gold rounded-sm py-6 text-lg"
              data-testid="start-game-btn"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Game
            </Button>
          ) : (
            <div className="text-center">
              <p className="text-[#a3a3a3]">
                Waiting for host to start the game...
              </p>
            </div>
          )}

          {playerCount < 2 && isHost && (
            <p className="text-center text-[#a3a3a3] text-sm mt-4">
              You can start with 1 player for testing, but 2-4 players recommended.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LobbyPage;
