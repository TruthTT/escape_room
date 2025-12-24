import { motion } from "framer-motion";
import { Trophy, PartyPopper, Home, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";

const WinModal = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#141414] border-[#D4AF37]/20 max-w-md win-modal" data-testid="win-modal">
        <div className="text-center py-8">
          {/* Celebration Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37] mb-6"
          >
            <Trophy className="w-12 h-12 text-[#D4AF37]" />
          </motion.div>

          {/* Confetti Icons */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  y: -50, 
                  x: Math.random() * 100 - 50,
                  opacity: 0,
                  rotate: Math.random() * 360
                }}
                animate={{ 
                  y: 400,
                  opacity: [0, 1, 1, 0],
                  rotate: Math.random() * 720
                }}
                transition={{ 
                  duration: 2 + Math.random(),
                  delay: Math.random() * 0.5,
                  ease: "easeOut"
                }}
                className="absolute"
                style={{ left: `${10 + i * 12}%` }}
              >
                <PartyPopper 
                  className="w-6 h-6" 
                  style={{ color: ['#D4AF37', '#10b981', '#3b82f6', '#ef4444'][i % 4] }}
                />
              </motion.div>
            ))}
          </div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-[#D4AF37] mb-4"
          >
            You Escaped!
          </motion.h2>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-[#a3a3a3] mb-2"
          >
            Congratulations! You and your team have successfully escaped
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-[#e5e5e5] mb-8"
          >
            The Locked Study
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-4 mb-8 p-4 bg-black/20 rounded-lg"
          >
            <div>
              <div className="text-[#D4AF37] text-2xl font-bold">4</div>
              <div className="text-[#525252] text-xs uppercase tracking-wider">Puzzles</div>
            </div>
            <div>
              <div className="text-[#D4AF37] text-2xl font-bold">3</div>
              <div className="text-[#525252] text-xs uppercase tracking-wider">Keys Found</div>
            </div>
            <div>
              <div className="text-[#D4AF37] text-2xl font-bold">1</div>
              <div className="text-[#525252] text-xs uppercase tracking-wider">Team Win</div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex gap-3"
          >
            <Button
              onClick={onClose}
              className="flex-1 btn-gold rounded-sm py-6"
              data-testid="win-home-btn"
            >
              <Home className="w-5 h-5 mr-2" />
              Return Home
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WinModal;
