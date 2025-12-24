import { useState } from "react";
import { motion } from "framer-motion";
import { Flashlight, FileText } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";

const UVLightModal = ({ isOpen, onClose, onUse, revealed, message }) => {
  const [isShining, setIsShining] = useState(false);

  const handleUseUVLight = () => {
    setIsShining(true);
    setTimeout(() => {
      onUse();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#141414] border-[#D4AF37]/20 max-w-sm" data-testid="uv-light-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#e5e5e5] flex items-center gap-2">
            <Flashlight className="w-6 h-6 text-[#a855f7]" />
            UV Light on Note
          </DialogTitle>
          <DialogDescription className="text-[#a3a3a3]">
            {revealed 
              ? "The hidden message has been revealed!"
              : "Use the UV lamp to reveal hidden writing on the note."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Note Display */}
          <motion.div
            animate={isShining ? {
              boxShadow: ["0 0 0 rgba(168, 85, 247, 0)", "0 0 50px rgba(168, 85, 247, 0.5)", "0 0 100px rgba(168, 85, 247, 0.3)"]
            } : {}}
            transition={{ duration: 1.5 }}
            className="relative bg-[#F0E6D2] rounded-lg p-6 min-h-[200px]"
          >
            {/* Visible Text */}
            <p className="text-[#3a3a3a] font-serif text-sm mb-4">
              Dear Friend,
            </p>
            <p className="text-[#3a3a3a] font-serif text-sm mb-4">
              The study holds many secrets. Look carefully at everything around you.
            </p>
            <p className="text-[#3a3a3a] font-serif text-sm text-right">
              - J.M.
            </p>

            {/* Hidden Message (UV Revealed) */}
            {(revealed || isShining) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: isShining ? 0.5 : 0 }}
                className="absolute inset-0 flex items-center justify-center p-6"
              >
                <div className="bg-[#a855f7]/20 rounded-lg p-4 border-2 border-[#a855f7]/50">
                  <p className="text-[#a855f7] font-mono text-center font-bold text-lg">
                    {message || "The key lies in unity - combine the three pieces"}
                  </p>
                </div>
              </motion.div>
            )}

            {/* UV Light Effect */}
            {isShining && !revealed && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 3, 3],
                  opacity: [0, 0.5, 0]
                }}
                transition={{ duration: 1.5 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-[#a855f7]"
              />
            )}
          </motion.div>

          {/* Action Button */}
          {!revealed && (
            <Button
              onClick={handleUseUVLight}
              disabled={isShining}
              className="w-full bg-[#a855f7] hover:bg-[#a855f7]/80 text-white rounded-sm py-6"
              data-testid="use-uv-btn"
            >
              <Flashlight className="w-5 h-5 mr-2" />
              {isShining ? "Revealing..." : "Shine UV Light"}
            </Button>
          )}

          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-4 bg-[#a855f7]/20 rounded-lg border border-[#a855f7]/30"
            >
              <p className="text-[#a855f7] font-semibold">Secret Message Revealed!</p>
              <p className="text-[#a3a3a3] text-sm mt-1">
                Combine the three key pieces to create the master key.
              </p>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UVLightModal;
