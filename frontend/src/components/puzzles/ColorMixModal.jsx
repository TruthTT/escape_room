import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";

const ColorMixModal = ({ isOpen, onClose, onSubmit, solved }) => {
  const [selectedColors, setSelectedColors] = useState([]);
  const maxColors = 3;
  
  const availableColors = [
    { id: "red", color: "#ef4444", name: "Red" },
    { id: "blue", color: "#3b82f6", name: "Blue" },
    { id: "yellow", color: "#eab308", name: "Yellow" },
    { id: "green", color: "#22c55e", name: "Green" },
    { id: "purple", color: "#a855f7", name: "Purple" },
    { id: "orange", color: "#f97316", name: "Orange" },
  ];

  // Target: Mix to create specific color
  // Red + Blue + Yellow = Brown/Dark (represents "darkness/shadow")
  const targetMix = ["red", "blue", "yellow"];

  const toggleColor = (colorId) => {
    setSelectedColors(prev => {
      if (prev.includes(colorId)) {
        return prev.filter(c => c !== colorId);
      }
      if (prev.length < maxColors) {
        return [...prev, colorId];
      }
      return prev;
    });
  };

  const getMixedColor = () => {
    if (selectedColors.length === 0) return "transparent";
    if (selectedColors.length === 1) {
      return availableColors.find(c => c.id === selectedColors[0])?.color || "transparent";
    }
    
    // Simple color mixing simulation
    const colorMixes = {
      "red,blue": "#9333ea",
      "red,yellow": "#f97316",
      "blue,yellow": "#22c55e",
      "red,green": "#854d0e",
      "blue,green": "#0891b2",
      "red,blue,yellow": "#78350f", // Brown - the answer!
      "red,blue,green": "#374151",
      "red,yellow,green": "#a16207",
      "blue,yellow,green": "#365314",
    };
    
    const sortedColors = [...selectedColors].sort().join(",");
    return colorMixes[sortedColors] || "#6b7280";
  };

  const handleSubmit = () => {
    const sortedSelected = [...selectedColors].sort().join(",");
    const sortedTarget = [...targetMix].sort().join(",");
    onSubmit(sortedSelected === sortedTarget);
  };

  const handleReset = () => {
    setSelectedColors([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#141414] border-[#D4AF37]/20 max-w-sm" data-testid="color-mix-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#e5e5e5] flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-[#D4AF37]" />
            Light Mixing Puzzle
          </DialogTitle>
          <DialogDescription className="text-[#a3a3a3]">
            Mix the colored lights to create the color of shadow.
            <br />
            <span className="text-[#D4AF37] text-xs">Hint: "All primary colors combined create darkness"</span>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Light bulb display */}
          <div className="flex justify-center">
            <motion.div
              animate={{
                boxShadow: selectedColors.length > 0 
                  ? `0 0 60px 20px ${getMixedColor()}`
                  : "none"
              }}
              className="w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center"
              style={{ backgroundColor: getMixedColor() || "#1a1a1a" }}
            >
              {selectedColors.length === 0 && (
                <span className="text-white/30 text-sm">No lights</span>
              )}
            </motion.div>
          </div>

          {/* Selected colors indicator */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full border-2 ${
                  selectedColors[i]
                    ? "border-[#D4AF37]"
                    : "border-white/20"
                }`}
                style={{
                  backgroundColor: selectedColors[i]
                    ? availableColors.find(c => c.id === selectedColors[i])?.color
                    : "transparent"
                }}
              />
            ))}
          </div>

          {/* Color selection */}
          <div className="grid grid-cols-3 gap-3">
            {availableColors.map(({ id, color, name }) => (
              <motion.button
                key={id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleColor(id)}
                className={`aspect-square rounded-lg border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                  selectedColors.includes(id)
                    ? "border-white ring-2 ring-white/50"
                    : "border-white/20 hover:border-white/40"
                }`}
                style={{ backgroundColor: color }}
                data-testid={`color-${id}`}
              >
                <span className="text-white text-xs font-semibold drop-shadow-lg">
                  {name}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1 btn-outline"
              data-testid="color-reset-btn"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedColors.length === 0}
              className="flex-1 btn-gold rounded-sm"
              data-testid="color-submit-btn"
            >
              Mix Lights
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColorMixModal;
