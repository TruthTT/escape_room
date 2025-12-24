import { motion, AnimatePresence } from "framer-motion";
import { Key, Flashlight, FileText, Puzzle, Combine } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

const ITEM_ICONS = {
  key_piece_1: Key,
  key_piece_2: Key,
  key_piece_3: Key,
  master_key: Key,
  uv_lamp: Flashlight,
  note: FileText,
};

const ITEM_NAMES = {
  key_piece_1: "Key Piece 1",
  key_piece_2: "Key Piece 2",
  key_piece_3: "Key Piece 3",
  master_key: "Master Key",
  uv_lamp: "UV Lamp",
};

const ITEM_COLORS = {
  key_piece_1: "#D4AF37",
  key_piece_2: "#10b981",
  key_piece_3: "#3b82f6",
  master_key: "#D4AF37",
  uv_lamp: "#a855f7",
};

const Inventory = ({ items = [], canCombineKeys, onCombineKeys }) => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="fixed bottom-0 left-0 right-0 p-4 flex justify-center z-20"
      data-testid="inventory-panel"
    >
      <div className="glass rounded-xl p-3 flex items-center gap-3">
        {/* Inventory Label */}
        <div className="text-[#a3a3a3] text-xs uppercase tracking-widest px-2 hidden sm:block">
          Inventory
        </div>

        {/* Inventory Slots */}
        <div className="flex gap-2">
          <TooltipProvider>
            {/* Filled slots */}
            <AnimatePresence mode="popLayout">
              {items.map((itemId, index) => {
                const Icon = ITEM_ICONS[itemId] || Key;
                const name = ITEM_NAMES[itemId] || itemId.replace(/_/g, " ");
                const color = ITEM_COLORS[itemId] || "#D4AF37";

                return (
                  <motion.div
                    key={itemId}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="inventory-slot w-12 h-12 rounded-lg bg-black/30 border border-white/10 flex items-center justify-center cursor-pointer hover:border-[#D4AF37]/50 transition-all"
                          data-testid={`inventory-item-${itemId}`}
                        >
                          <Icon 
                            className="w-6 h-6" 
                            style={{ color }} 
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="capitalize">{name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 6 - items.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="w-12 h-12 rounded-lg bg-black/20 border border-white/5 flex items-center justify-center"
              >
                <div className="w-2 h-2 rounded-full bg-white/10" />
              </div>
            ))}
          </TooltipProvider>
        </div>

        {/* Combine Button */}
        <AnimatePresence>
          {canCombineKeys && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <Button
                onClick={onCombineKeys}
                className="btn-gold rounded-lg px-4 py-2 flex items-center gap-2"
                data-testid="combine-keys-btn"
              >
                <Combine className="w-4 h-4" />
                <span className="hidden sm:inline">Combine Keys</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Inventory;
