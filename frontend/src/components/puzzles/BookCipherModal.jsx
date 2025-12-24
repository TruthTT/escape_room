import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, RotateCcw, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";

const BookCipherModal = ({ isOpen, onClose, onSubmit, solved }) => {
  const [answer, setAnswer] = useState("");
  
  // The cipher: Each number represents Page-Line-Word
  // Message: "BENEATH RUG" 
  // Encoded as positions from a fictional book
  const cipherText = "2-3-1 • 5-1-4 • 1-7-2";
  const cipherHint = "Page - Line - Word";
  
  // The "book" content for decoding
  const bookPages = {
    1: [
      "The study was dark and mysterious.",
      "Old books lined every wall.",
      "A single candle flickered.",
      "Shadows danced on the ceiling.",
      "The clock struck midnight.",
      "Outside, rain pattered softly.",
      "Hidden secrets RUG beneath await discovery."
    ],
    2: [
      "Chapter Two begins here.",
      "The detective entered slowly.",
      "BENEATH the surface lies truth.",
      "Every clue has meaning.",
      "Nothing is coincidental."
    ],
    5: [
      "The final chapter revealed all mysteries solved."
    ]
  };

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer.trim().toUpperCase());
      setAnswer("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#141414] border-[#D4AF37]/20 max-w-md" data-testid="book-cipher-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#e5e5e5] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#D4AF37]" />
            Book Cipher
          </DialogTitle>
          <DialogDescription className="text-[#a3a3a3]">
            Decode the message using the open book on the desk.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Cipher display */}
          <div className="bg-black/30 rounded-lg p-4 border border-white/10">
            <p className="text-[#525252] text-xs uppercase tracking-wider mb-2">Encoded Message</p>
            <p className="text-[#D4AF37] font-mono text-xl text-center tracking-widest">
              {cipherText}
            </p>
            <p className="text-[#525252] text-xs text-center mt-2">
              Format: {cipherHint}
            </p>
          </div>

          {/* Book preview */}
          <div className="bg-[#F0E6D2] rounded-lg p-4 max-h-48 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4 text-xs text-[#3d2e1f]">
              {Object.entries(bookPages).map(([pageNum, lines]) => (
                <div key={pageNum} className="space-y-1">
                  <p className="font-bold text-[#D4AF37]">Page {pageNum}</p>
                  {lines.map((line, idx) => (
                    <p key={idx} className="text-[10px] leading-tight">
                      <span className="text-[#8a7018] mr-1">{idx + 1}.</span>
                      {line}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Answer input */}
          <div className="space-y-2">
            <label className="text-sm text-[#a3a3a3]">Decoded Message</label>
            <Input
              value={answer}
              onChange={(e) => setAnswer(e.target.value.toUpperCase())}
              placeholder="Enter the decoded words..."
              className="bg-black/20 border-white/10 focus:border-[#D4AF37] text-white placeholder:text-white/30 font-mono uppercase"
              maxLength={20}
              data-testid="cipher-answer-input"
            />
          </div>

          {/* Hint */}
          <p className="text-[#525252] text-xs text-center">
            Tip: Find the word at each position. Example: 2-3-1 = Page 2, Line 3, Word 1
          </p>

          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            disabled={!answer.trim()}
            className="w-full btn-gold rounded-sm py-6"
            data-testid="cipher-submit-btn"
          >
            <Check className="w-5 h-5 mr-2" />
            Decode
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookCipherModal;
