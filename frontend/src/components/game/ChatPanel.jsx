import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, ChevronRight, ChevronLeft, Eye, Lightbulb, HelpCircle, Check, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";

const QUICK_MESSAGES = [
  { id: "look", label: "Look!", icon: Eye },
  { id: "found", label: "Found!", icon: Lightbulb },
  { id: "help", label: "Help!", icon: HelpCircle },
  { id: "yes", label: "Yes", icon: Check },
  { id: "no", label: "No", icon: X },
];

const ChatPanel = ({ messages = [], currentPlayerId, onSendMessage, onQuickChat }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        initial={{ x: 100 }}
        animate={{ x: 0 }}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-30 glass rounded-l-lg p-3 ${isOpen ? "hidden" : "block"}`}
        onClick={() => setIsOpen(true)}
        data-testid="chat-toggle-btn"
      >
        <MessageCircle className="w-6 h-6 text-[#D4AF37]" />
        {messages.length > 0 && (
          <span className="absolute -top-1 -left-1 w-4 h-4 bg-[#D4AF37] rounded-full text-[10px] text-black font-bold flex items-center justify-center">
            {messages.length > 9 ? "9+" : messages.length}
          </span>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 glass border-l border-white/10 z-30 flex flex-col"
            data-testid="chat-panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-[#e5e5e5] font-semibold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#D4AF37]" />
                Team Chat
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-[#a3a3a3] hover:text-white"
                data-testid="chat-close-btn"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <p className="text-[#525252] text-center text-sm py-8">
                    No messages yet. Say hello!
                  </p>
                ) : (
                  messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`chat-message ${
                        msg.player_id === currentPlayerId ? "ml-auto" : ""
                      }`}
                    >
                      <div
                        className={`max-w-[80%] ${
                          msg.player_id === currentPlayerId
                            ? "ml-auto bg-[#D4AF37]/20 rounded-l-lg rounded-br-lg"
                            : "bg-white/5 rounded-r-lg rounded-bl-lg"
                        } p-3`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-[#D4AF37]">
                            {msg.player_name}
                          </span>
                          {msg.is_quick && (
                            <span className="text-[8px] uppercase tracking-wider text-[#525252] bg-white/5 px-1 rounded">
                              Quick
                            </span>
                          )}
                        </div>
                        <p className="text-[#e5e5e5] text-sm">{msg.message}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Quick Chat */}
            <div className="p-2 border-t border-white/10">
              <div className="flex gap-1 overflow-x-auto pb-2">
                {QUICK_MESSAGES.map(({ id, label, icon: Icon }) => (
                  <Button
                    key={id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onQuickChat(id)}
                    className="flex-shrink-0 text-[#a3a3a3] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 text-xs"
                    data-testid={`quick-chat-${id}`}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="bg-black/20 border-white/10 focus:border-[#D4AF37] text-white placeholder:text-white/30"
                  maxLength={200}
                  data-testid="chat-input"
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-black"
                  data-testid="chat-send-btn"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatPanel;
