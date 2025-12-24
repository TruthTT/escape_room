import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Grid3X3, RotateCcw, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";

const SliderPuzzleModal = ({ isOpen, onClose, onSubmit, solved }) => {
  // 3x3 slider puzzle (8 tiles + 1 empty)
  const solvedState = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  const [tiles, setTiles] = useState([1, 2, 3, 4, 5, 6, 7, 0, 8]);
  const [moves, setMoves] = useState(0);

  // Shuffle on open
  useEffect(() => {
    if (isOpen && !solved) {
      shuffleTiles();
    }
  }, [isOpen, solved]);

  const shuffleTiles = () => {
    // Generate a solvable shuffle
    let newTiles = [...solvedState];
    for (let i = 0; i < 50; i++) {
      const emptyIndex = newTiles.indexOf(0);
      const possibleMoves = getValidMoves(emptyIndex);
      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      [newTiles[emptyIndex], newTiles[randomMove]] = [newTiles[randomMove], newTiles[emptyIndex]];
    }
    setTiles(newTiles);
    setMoves(0);
  };

  const getValidMoves = (emptyIndex) => {
    const moves = [];
    const row = Math.floor(emptyIndex / 3);
    const col = emptyIndex % 3;

    if (row > 0) moves.push(emptyIndex - 3); // Up
    if (row < 2) moves.push(emptyIndex + 3); // Down
    if (col > 0) moves.push(emptyIndex - 1); // Left
    if (col < 2) moves.push(emptyIndex + 1); // Right

    return moves;
  };

  const handleTileClick = (index) => {
    const emptyIndex = tiles.indexOf(0);
    const validMoves = getValidMoves(emptyIndex);

    if (validMoves.includes(index)) {
      const newTiles = [...tiles];
      [newTiles[emptyIndex], newTiles[index]] = [newTiles[index], newTiles[emptyIndex]];
      setTiles(newTiles);
      setMoves(prev => prev + 1);

      // Check if solved
      if (JSON.stringify(newTiles) === JSON.stringify(solvedState)) {
        setTimeout(() => onSubmit(true), 500);
      }
    }
  };

  const isSolved = JSON.stringify(tiles) === JSON.stringify(solvedState);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#141414] border-[#D4AF37]/20 max-w-sm" data-testid="slider-puzzle-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#e5e5e5] flex items-center gap-2">
            <Grid3X3 className="w-6 h-6 text-[#D4AF37]" />
            Sliding Puzzle
          </DialogTitle>
          <DialogDescription className="text-[#a3a3a3]">
            Arrange the tiles in order (1-8) to unlock the compartment.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Move counter */}
          <div className="flex justify-between items-center">
            <span className="text-[#a3a3a3] text-sm">Moves: <span className="text-[#D4AF37] font-mono">{moves}</span></span>
            {isSolved && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-[#10b981] text-sm font-semibold flex items-center gap-1"
              >
                <Check className="w-4 h-4" /> Solved!
              </motion.span>
            )}
          </div>

          {/* Puzzle grid */}
          <div className="grid grid-cols-3 gap-2 p-4 bg-black/30 rounded-lg">
            {tiles.map((tile, index) => (
              <motion.button
                key={index}
                whileHover={tile !== 0 ? { scale: 1.05 } : {}}
                whileTap={tile !== 0 ? { scale: 0.95 } : {}}
                onClick={() => handleTileClick(index)}
                disabled={tile === 0}
                className={`aspect-square rounded-lg text-2xl font-bold transition-all ${
                  tile === 0
                    ? "bg-transparent"
                    : isSolved
                    ? "bg-[#10b981] text-white border-2 border-[#10b981]"
                    : "bg-[#D4AF37] text-black border-2 border-[#D4AF37] hover:bg-[#F4CF57] cursor-pointer"
                }`}
                data-testid={`slider-tile-${tile}`}
              >
                {tile !== 0 && tile}
              </motion.button>
            ))}
          </div>

          {/* Target pattern reference */}
          <div className="text-center text-[#525252] text-xs">
            Goal: 1 2 3 / 4 5 6 / 7 8 _
          </div>

          {/* Reset button */}
          <Button
            variant="outline"
            onClick={shuffleTiles}
            className="w-full btn-outline"
            disabled={isSolved}
            data-testid="slider-reset-btn"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Shuffle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SliderPuzzleModal;
