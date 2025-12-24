import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";

const ClockModal = ({ isOpen, onClose, onSubmit, solved, targetTime = "3:15" }) => {
  const [hours, setHours] = useState(12);
  const [minutes, setMinutes] = useState(0);

  const handleHourChange = (delta) => {
    setHours(prev => {
      let newHour = prev + delta;
      if (newHour > 12) newHour = 1;
      if (newHour < 1) newHour = 12;
      return newHour;
    });
  };

  const handleMinuteChange = (delta) => {
    setMinutes(prev => {
      let newMin = prev + delta * 5;
      if (newMin >= 60) newMin = 0;
      if (newMin < 0) newMin = 55;
      return newMin;
    });
  };

  const handleSubmit = () => {
    const timeStr = `${hours}:${minutes.toString().padStart(2, '0')}`;
    onSubmit(timeStr);
  };

  const handleReset = () => {
    setHours(12);
    setMinutes(0);
  };

  // Calculate clock hand angles
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;
  const minuteAngle = minutes * 6;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#141414] border-[#D4AF37]/20 max-w-sm" data-testid="clock-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#e5e5e5] flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#D4AF37]" />
            Grandfather Clock
          </DialogTitle>
          <DialogDescription className="text-[#a3a3a3]">
            Set the clock to the correct time to reveal a secret.
            <br />
            <span className="text-[#D4AF37] text-xs">Hint: "When shadows meet at quarter past three"</span>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Clock Face */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48 rounded-full bg-[#F0E6D2] border-4 border-[#3d2e1f] shadow-xl">
              {/* Clock numbers */}
              {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => {
                const angle = (i - 3) * 30 * (Math.PI / 180);
                const x = 50 + 38 * Math.cos(angle);
                const y = 50 + 38 * Math.sin(angle);
                return (
                  <span
                    key={num}
                    className="absolute text-[#3d2e1f] font-bold text-sm"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {num}
                  </span>
                );
              })}
              
              {/* Hour hand */}
              <motion.div
                animate={{ rotate: hourAngle }}
                transition={{ type: "spring", stiffness: 100 }}
                className="absolute left-1/2 bottom-1/2 w-1.5 h-14 bg-[#3d2e1f] rounded-full origin-bottom"
                style={{ marginLeft: '-3px' }}
              />
              
              {/* Minute hand */}
              <motion.div
                animate={{ rotate: minuteAngle }}
                transition={{ type: "spring", stiffness: 100 }}
                className="absolute left-1/2 bottom-1/2 w-1 h-20 bg-[#D4AF37] rounded-full origin-bottom"
                style={{ marginLeft: '-2px' }}
              />
              
              {/* Center dot */}
              <div className="absolute left-1/2 top-1/2 w-3 h-3 bg-[#D4AF37] rounded-full -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Time Display */}
          <div className="text-center">
            <span className="text-3xl font-mono text-[#D4AF37]">
              {hours}:{minutes.toString().padStart(2, '0')}
            </span>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-4">
            {/* Hours control */}
            <div className="space-y-2">
              <p className="text-center text-[#a3a3a3] text-sm">Hours</p>
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleHourChange(-1)}
                  className="bg-black/20 border-white/10 hover:border-[#D4AF37] text-white"
                  data-testid="hour-down"
                >
                  −
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleHourChange(1)}
                  className="bg-black/20 border-white/10 hover:border-[#D4AF37] text-white"
                  data-testid="hour-up"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Minutes control */}
            <div className="space-y-2">
              <p className="text-center text-[#a3a3a3] text-sm">Minutes</p>
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMinuteChange(-1)}
                  className="bg-black/20 border-white/10 hover:border-[#D4AF37] text-white"
                  data-testid="minute-down"
                >
                  −
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMinuteChange(1)}
                  className="bg-black/20 border-white/10 hover:border-[#D4AF37] text-white"
                  data-testid="minute-up"
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1 btn-outline"
              data-testid="clock-reset-btn"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 btn-gold rounded-sm"
              data-testid="clock-submit-btn"
            >
              Set Time
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClockModal;
