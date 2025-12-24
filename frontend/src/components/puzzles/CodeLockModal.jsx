import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Delete } from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";

const CodeLockModal = ({ isOpen, onClose, onSubmit, solved }) => {
  const [code, setCode] = useState("");

  const handleNumberClick = (num) => {
    if (code.length < 4) {
      setCode(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setCode(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setCode("");
  };

  const handleSubmit = () => {
    if (code.length === 4) {
      onSubmit(code);
      setCode("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#141414] border-[#D4AF37]/20 max-w-sm" data-testid="code-lock-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#e5e5e5] flex items-center gap-2">
            <Lock className="w-6 h-6 text-[#D4AF37]" />
            Locked Drawer
          </DialogTitle>
          <DialogDescription className="text-[#a3a3a3]">
            Enter the 4-digit code to unlock the drawer.
            <br />
            <span className="text-[#D4AF37] text-xs">Hint: Check the old book on the bookshelf</span>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Code Display */}
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8 }}
                animate={{ scale: code[i] ? 1.1 : 1 }}
                className={`w-14 h-16 rounded-lg border-2 flex items-center justify-center text-3xl font-mono font-bold ${
                  code[i]
                    ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                    : "border-white/20 bg-black/20 text-white/30"
                }`}
              >
                {code[i] || "•"}
              </motion.div>
            ))}
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Button
                key={num}
                variant="outline"
                onClick={() => handleNumberClick(num.toString())}
                className="h-14 text-xl font-mono bg-black/20 border-white/10 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 text-[#e5e5e5]"
                data-testid={`keypad-${num}`}
              >
                {num}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={handleClear}
              className="h-14 text-sm bg-black/20 border-white/10 hover:border-red-500 hover:bg-red-500/10 text-[#a3a3a3]"
              data-testid="keypad-clear"
            >
              Clear
            </Button>
            <Button
              variant="outline"
              onClick={() => handleNumberClick("0")}
              className="h-14 text-xl font-mono bg-black/20 border-white/10 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 text-[#e5e5e5]"
              data-testid="keypad-0"
            >
              0
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="h-14 bg-black/20 border-white/10 hover:border-red-500 hover:bg-red-500/10 text-[#a3a3a3]"
              data-testid="keypad-delete"
            >
              <Delete className="w-5 h-5" />
            </Button>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={code.length !== 4}
            className="w-full btn-gold rounded-sm py-6"
            data-testid="code-submit-btn"
          >
            Unlock
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CodeLockModal;
