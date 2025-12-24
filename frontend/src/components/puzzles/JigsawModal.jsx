import { useState } from "react";
import { motion } from "framer-motion";
import { Puzzle, RotateCcw } from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";

const JigsawModal = ({ isOpen, onClose, onPiecePlaced, pieces = [], solved }) => {
  const handlePieceClick = (index) => {
    if (!pieces[index]) {
      onPiecePlaced(index);
    }
  };

  const completedCount = pieces.filter(Boolean).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#141414] border-[#D4AF37]/20 max-w-md" data-testid="jigsaw-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#e5e5e5] flex items-center gap-2">
            <Puzzle className="w-6 h-6 text-[#D4AF37]" />
            Jigsaw Puzzle
          </DialogTitle>
          <DialogDescription className="text-[#a3a3a3]">
            Complete the puzzle to reveal a hidden item.
            <br />
            <span className="text-[#D4AF37] text-xs">Progress: {completedCount}/9 pieces</span>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Progress Bar */}
          <div className="h-2 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / 9) * 100}%` }}
              className="h-full bg-[#D4AF37]"
            />
          </div>

          {/* Puzzle Grid */}
          <div className="grid grid-cols-3 gap-2 p-4 bg-black/20 rounded-lg">
            {pieces.map((isPlaced, index) => (
              <motion.button
                key={index}
                whileHover={!isPlaced ? { scale: 1.05 } : {}}
                whileTap={!isPlaced ? { scale: 0.95 } : {}}
                onClick={() => handlePieceClick(index)}
                disabled={isPlaced}
                className={`aspect-square rounded-lg border-2 transition-all ${
                  isPlaced
                    ? "bg-[#D4AF37]/20 border-[#D4AF37] cursor-default"
                    : "bg-black/30 border-white/10 hover:border-[#D4AF37] cursor-pointer"
                }`}
                data-testid={`jigsaw-piece-${index}`}
              >
                {isPlaced ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <Puzzle className="w-8 h-8 text-[#D4AF37]" />
                  </motion.div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white/20 text-2xl font-mono">{index + 1}</span>
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Instructions */}
          <p className="text-[#525252] text-sm text-center">
            Click empty squares to place puzzle pieces
          </p>

          {/* Solved Message */}
          {solved && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-4 bg-[#10b981]/20 rounded-lg border border-[#10b981]/30"
            >
              <p className="text-[#10b981] font-semibold">Puzzle Complete!</p>
              <p className="text-[#a3a3a3] text-sm">You found a key piece underneath!</p>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JigsawModal;
