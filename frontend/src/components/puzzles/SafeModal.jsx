import { useState } from "react";
import { motion } from "framer-motion";
import { X, ShieldCheck, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";

const SafeModal = ({ isOpen, onClose, onSubmit, solved }) => {
  const [combination, setCombination] = useState(["0", "0", "0"]);

  const handleDialChange = (index, direction) => {
    setCombination(prev => {
      const newComb = [...prev];
      let num = parseInt(newComb[index]);
      if (direction === "up") {
        num = (num + 1) % 10;
      } else {
        num = (num - 1 + 10) % 10;
      }
      newComb[index] = num.toString();
      return newComb;
    });
  };

  const handleSubmit = () => {
    onSubmit(combination.join(""));
  };

  const handleReset = () => {
    setCombination(["0", "0", "0"]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#141414] border-[#D4AF37]/20 max-w-sm" data-testid="safe-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#e5e5e5] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
            Wall Safe
          </DialogTitle>
          <DialogDescription className="text-[#a3a3a3]">
            Enter the 3-digit combination to open the safe.
            <br />
            <span className="text-[#D4AF37] text-xs">Hint: Look behind the painting</span>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Safe Dial Display */}
          <div className="flex justify-center gap-4">
            {combination.map((digit, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDialChange(index, "up")}
                  className="text-[#a3a3a3] hover:text-[#D4AF37]"
                  data-testid={`dial-up-${index}`}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </Button>
                
                <motion.div
                  key={digit}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="w-16 h-20 rounded-lg bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#D4AF37]/30 flex items-center justify-center shadow-lg"
                >
                  <span className="text-4xl font-mono font-bold text-[#D4AF37]">
                    {digit}
                  </span>
                </motion.div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDialChange(index, "down")}
                  className="text-[#a3a3a3] hover:text-[#D4AF37]"
                  data-testid={`dial-down-${index}`}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
              </div>
            ))}
          </div>

          {/* Decorative Safe Frame */}
          <div className="flex justify-center">
            <div className="w-48 h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1 btn-outline"
              data-testid="safe-reset-btn"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 btn-gold rounded-sm"
              data-testid="safe-submit-btn"
            >
              Open Safe
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SafeModal;
