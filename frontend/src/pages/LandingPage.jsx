import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Lock, Users, Key, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LandingPage = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/rooms/create`, {
        player_name: playerName.trim()
      });
      
      const { room_id, player_id } = response.data;
      localStorage.setItem("playerId", player_id);
      localStorage.setItem("playerName", playerName.trim());
      
      navigate(`/room/${room_id}`);
    } catch (error) {
      toast.error("Failed to create room");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!roomCode.trim()) {
      toast.error("Please enter room code");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/rooms/join`, {
        player_name: playerName.trim(),
        room_id: roomCode.trim().toLowerCase()
      });
      
      const { room_id, player_id } = response.data;
      localStorage.setItem("playerId", player_id);
      localStorage.setItem("playerName", playerName.trim());
      
      navigate(`/room/${room_id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to join room");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4AF37]/3 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center z-10 max-w-2xl mx-auto"
      >
        {/* Logo/Title */}
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 mb-6">
            <Lock className="w-10 h-10 text-[#D4AF37]" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-[#e5e5e5] tracking-tight mb-4">
            The Locked Study
          </h1>
          <p className="text-lg md:text-xl text-[#a3a3a3] max-w-lg mx-auto">
            A multiplayer escape room experience. Solve puzzles, find clues, and escape together.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 mb-12"
        >
          <div className="flex items-center gap-2 text-[#a3a3a3]">
            <Users className="w-5 h-5 text-[#D4AF37]" />
            <span>2-4 Players</span>
          </div>
          <div className="flex items-center gap-2 text-[#a3a3a3]">
            <Key className="w-5 h-5 text-[#D4AF37]" />
            <span>Multiple Puzzles</span>
          </div>
          <div className="flex items-center gap-2 text-[#a3a3a3]">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <span>Real-time Sync</span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button 
            data-testid="create-room-btn"
            onClick={() => setShowCreateModal(true)}
            className="btn-gold rounded-sm text-base px-8 py-6"
          >
            Create Room
          </Button>
          <Button 
            data-testid="join-room-btn"
            onClick={() => setShowJoinModal(true)}
            variant="outline"
            className="btn-outline rounded-sm text-base px-8 py-6"
          >
            Join Room
          </Button>
        </motion.div>

        {/* How to Play */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 glass rounded-xl p-6 md:p-8"
        >
          <h2 className="text-2xl font-bold text-[#e5e5e5] mb-4">How to Play</h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div>
              <div className="text-[#D4AF37] font-mono text-sm mb-2">01</div>
              <h3 className="text-[#e5e5e5] font-semibold mb-1">Create or Join</h3>
              <p className="text-[#a3a3a3] text-sm">Create a room and share the link with friends, or join with a room code.</p>
            </div>
            <div>
              <div className="text-[#D4AF37] font-mono text-sm mb-2">02</div>
              <h3 className="text-[#e5e5e5] font-semibold mb-1">Explore & Solve</h3>
              <p className="text-[#a3a3a3] text-sm">Click to move, examine objects, collect items, and solve puzzles together.</p>
            </div>
            <div>
              <div className="text-[#D4AF37] font-mono text-sm mb-2">03</div>
              <h3 className="text-[#e5e5e5] font-semibold mb-1">Escape!</h3>
              <p className="text-[#a3a3a3] text-sm">Find all key pieces, combine them, and unlock the door to escape!</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Create Room Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-[#141414] border-[#D4AF37]/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#e5e5e5]">Create New Room</DialogTitle>
            <DialogDescription className="text-[#a3a3a3]">
              Enter your name to create a new escape room session.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-[#a3a3a3] mb-2 block">Your Name</label>
              <Input
                data-testid="create-player-name-input"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="bg-black/20 border-white/10 focus:border-[#D4AF37] text-white placeholder:text-white/30"
                maxLength={20}
              />
            </div>
            <Button 
              data-testid="create-room-submit-btn"
              onClick={handleCreateRoom}
              disabled={isLoading}
              className="w-full btn-gold rounded-sm py-6"
            >
              {isLoading ? "Creating..." : "Create Room"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Room Modal */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent className="bg-[#141414] border-[#D4AF37]/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#e5e5e5]">Join Room</DialogTitle>
            <DialogDescription className="text-[#a3a3a3]">
              Enter your name and the room code to join.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-[#a3a3a3] mb-2 block">Your Name</label>
              <Input
                data-testid="join-player-name-input"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="bg-black/20 border-white/10 focus:border-[#D4AF37] text-white placeholder:text-white/30"
                maxLength={20}
              />
            </div>
            <div>
              <label className="text-sm text-[#a3a3a3] mb-2 block">Room Code</label>
              <Input
                data-testid="join-room-code-input"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toLowerCase())}
                placeholder="Enter 6-digit code"
                className="bg-black/20 border-white/10 focus:border-[#D4AF37] text-white placeholder:text-white/30 font-mono uppercase"
                maxLength={6}
              />
            </div>
            <Button 
              data-testid="join-room-submit-btn"
              onClick={handleJoinRoom}
              disabled={isLoading}
              className="w-full btn-gold rounded-sm py-6"
            >
              {isLoading ? "Joining..." : "Join Room"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;
