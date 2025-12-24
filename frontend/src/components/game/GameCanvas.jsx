import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

// Room dimensions and object positions
const ROOM_WIDTH = 800;
const ROOM_HEIGHT = 600;
const PLAYER_SIZE = 24;
const PLAYER_SPEED = 4;

// Game objects with their positions and sizes
const GAME_OBJECTS = {
  desk: { x: 500, y: 150, width: 150, height: 80, label: "Desk" },
  bookshelf: { x: 50, y: 50, width: 120, height: 180, label: "Bookshelf" },
  book: { x: 70, y: 80, width: 40, height: 30, label: "Old Book", interactable: true },
  painting: { x: 300, y: 30, width: 100, height: 80, label: "Painting", interactable: true },
  safe: { x: 680, y: 200, width: 80, height: 80, label: "Safe", interactable: true },
  drawer: { x: 510, y: 180, width: 60, height: 40, label: "Drawer", interactable: true },
  jigsaw_table: { x: 100, y: 400, width: 120, height: 80, label: "Puzzle Table", interactable: true },
  uv_lamp: { x: 200, y: 280, width: 30, height: 30, label: "UV Lamp", interactable: true },
  note: { x: 400, y: 350, width: 40, height: 30, label: "Note", interactable: true },
  door: { x: 350, y: 520, width: 100, height: 60, label: "Exit Door", interactable: true },
  rug: { x: 300, y: 280, width: 200, height: 150, label: "" },
  chair: { x: 450, y: 200, width: 50, height: 50, label: "Chair" },
  // New puzzle objects
  clock: { x: 680, y: 50, width: 60, height: 80, label: "Clock", interactable: true },
  cipher_book: { x: 550, y: 130, width: 35, height: 25, label: "Cipher Book", interactable: true },
  lamp_panel: { x: 50, y: 280, width: 50, height: 60, label: "Light Panel", interactable: true },
  slider_box: { x: 680, y: 350, width: 70, height: 70, label: "Puzzle Box", interactable: true },
  fireplace: { x: 180, y: 30, width: 100, height: 90, label: "Fireplace" },
};

const GameCanvas = ({ players, currentPlayerId, objectsState, onPlayerMove, onObjectClick, onKeyboardMove }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: ROOM_WIDTH, height: ROOM_HEIGHT });
  const [hoveredObject, setHoveredObject] = useState(null);
  const [nearbyObject, setNearbyObject] = useState(null);
  const animationFrameRef = useRef(null);
  const keysPressed = useRef({});

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const aspectRatio = ROOM_WIDTH / ROOM_HEIGHT;
        let width = container.clientWidth;
        let height = container.clientHeight;

        if (width / height > aspectRatio) {
          width = height * aspectRatio;
        } else {
          height = width / aspectRatio;
        }

        setCanvasSize({ width, height });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scale helper
  const scale = canvasSize.width / ROOM_WIDTH;

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D', ' ', 'e', 'E'].includes(e.key)) {
        e.preventDefault();
        keysPressed.current[e.key.toLowerCase()] = true;
        
        // Interact with nearby object on Space or E
        if ((e.key === ' ' || e.key.toLowerCase() === 'e') && nearbyObject) {
          onObjectClick(nearbyObject);
        }
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nearbyObject, onObjectClick]);

  // Movement update loop
  useEffect(() => {
    if (!currentPlayerId || !players[currentPlayerId]) return;

    const updateMovement = () => {
      let dx = 0;
      let dy = 0;

      if (keysPressed.current['w'] || keysPressed.current['arrowup']) dy -= 1;
      if (keysPressed.current['s'] || keysPressed.current['arrowdown']) dy += 1;
      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) dx -= 1;
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) dx += 1;

      if (dx !== 0 || dy !== 0) {
        // Normalize diagonal movement
        const length = Math.sqrt(dx * dx + dy * dy);
        dx = (dx / length) * PLAYER_SPEED;
        dy = (dy / length) * PLAYER_SPEED;

        const player = players[currentPlayerId];
        let newX = player.position.x + dx;
        let newY = player.position.y + dy;

        // Boundary collision
        newX = Math.max(PLAYER_SIZE, Math.min(ROOM_WIDTH - PLAYER_SIZE, newX));
        newY = Math.max(PLAYER_SIZE, Math.min(ROOM_HEIGHT - PLAYER_SIZE, newY));

        // Simple object collision
        Object.entries(GAME_OBJECTS).forEach(([id, obj]) => {
          if (id === 'rug') return;
          const padding = 10;
          if (newX + PLAYER_SIZE/2 > obj.x - padding && 
              newX - PLAYER_SIZE/2 < obj.x + obj.width + padding &&
              newY + PLAYER_SIZE/2 > obj.y - padding && 
              newY - PLAYER_SIZE/2 < obj.y + obj.height + padding) {
            // Push back
            const centerX = obj.x + obj.width / 2;
            const centerY = obj.y + obj.height / 2;
            if (Math.abs(player.position.x - centerX) > Math.abs(player.position.y - centerY)) {
              newX = player.position.x;
            } else {
              newY = player.position.y;
            }
          }
        });

        if (newX !== player.position.x || newY !== player.position.y) {
          onPlayerMove({ x: newX, y: newY });
        }
      }
    };

    const movementInterval = setInterval(updateMovement, 1000 / 60);
    return () => clearInterval(movementInterval);
  }, [currentPlayerId, players, onPlayerMove]);

  // Check for nearby interactable objects
  useEffect(() => {
    if (!currentPlayerId || !players[currentPlayerId]) return;

    const player = players[currentPlayerId];
    const interactionDistance = 60;
    let nearest = null;
    let nearestDist = Infinity;

    Object.entries(GAME_OBJECTS).forEach(([id, obj]) => {
      if (!obj.interactable) return;
      if (id === 'uv_lamp' && objectsState?.uv_lamp?.picked_up) return;

      const objCenterX = obj.x + obj.width / 2;
      const objCenterY = obj.y + obj.height / 2;
      const dist = Math.sqrt(
        Math.pow(player.position.x - objCenterX, 2) +
        Math.pow(player.position.y - objCenterY, 2)
      );

      if (dist < interactionDistance && dist < nearestDist) {
        nearest = id;
        nearestDist = dist;
      }
    });

    setNearbyObject(nearest);
  }, [players, currentPlayerId, objectsState]);

  // Draw the game
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // Draw room background
    ctx.fillStyle = "#1a1818";
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Draw floor pattern
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    const gridSize = 40 * scale;
    for (let x = 0; x < canvasSize.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasSize.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvasSize.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasSize.width, y);
      ctx.stroke();
    }

    // Draw walls
    ctx.strokeStyle = "#3a3a3a";
    ctx.lineWidth = 4 * scale;
    ctx.strokeRect(2 * scale, 2 * scale, canvasSize.width - 4 * scale, canvasSize.height - 4 * scale);

    // Draw rug
    ctx.fillStyle = "#2C241B";
    ctx.fillRect(
      GAME_OBJECTS.rug.x * scale,
      GAME_OBJECTS.rug.y * scale,
      GAME_OBJECTS.rug.width * scale,
      GAME_OBJECTS.rug.height * scale
    );
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 2 * scale;
    ctx.strokeRect(
      GAME_OBJECTS.rug.x * scale,
      GAME_OBJECTS.rug.y * scale,
      GAME_OBJECTS.rug.width * scale,
      GAME_OBJECTS.rug.height * scale
    );

    // Draw objects
    Object.entries(GAME_OBJECTS).forEach(([id, obj]) => {
      if (id === "rug") return;

      const isHovered = hoveredObject === id;
      const isNearby = nearbyObject === id;
      const isInteractable = obj.interactable;
      const state = objectsState?.[id] || {};

      // Object fill
      let fillColor = "#2a2a2a";
      if (id === "desk") fillColor = "#3d2e1f";
      if (id === "bookshelf") fillColor = "#2d1f15";
      if (id === "safe") fillColor = state.open ? "#1a3a1a" : "#3a3a3a";
      if (id === "drawer") fillColor = state.open ? "#1a3a1a" : "#3d2e1f";
      if (id === "painting") fillColor = "#4a3a2a";
      if (id === "jigsaw_table") fillColor = state.complete ? "#1a3a1a" : "#3d2e1f";
      if (id === "door") fillColor = state.unlocked ? "#1a3a1a" : "#5a3a2a";
      if (id === "uv_lamp" && state.picked_up) return;
      if (id === "note") fillColor = "#F0E6D2";
      if (id === "clock") fillColor = "#4a3a2a";
      if (id === "cipher_book") fillColor = "#8B4513";
      if (id === "lamp_panel") fillColor = "#2a2a2a";
      if (id === "slider_box") fillColor = "#3d2e1f";
      if (id === "fireplace") fillColor = "#4a2a1a";
      if (id === "chair") fillColor = "#3d2e1f";
      if (id === "book") fillColor = "#8B0000";

      ctx.fillStyle = fillColor;
      ctx.fillRect(
        obj.x * scale,
        obj.y * scale,
        obj.width * scale,
        obj.height * scale
      );

      // Fireplace glow effect
      if (id === "fireplace") {
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(
          (obj.x + 20) * scale,
          (obj.y + 50) * scale,
          (obj.width - 40) * scale,
          (obj.height - 55) * scale
        );
      }

      // Border
      ctx.strokeStyle = (isHovered || isNearby) && isInteractable ? "#D4AF37" : "#4a4a4a";
      ctx.lineWidth = (isHovered || isNearby) && isInteractable ? 3 * scale : 1 * scale;
      ctx.strokeRect(
        obj.x * scale,
        obj.y * scale,
        obj.width * scale,
        obj.height * scale
      );

      // Highlight for interactable objects
      if (isInteractable && !isHovered && !isNearby) {
        ctx.strokeStyle = "rgba(212, 175, 55, 0.3)";
        ctx.lineWidth = 1 * scale;
        ctx.setLineDash([5 * scale, 5 * scale]);
        ctx.strokeRect(
          obj.x * scale - 2 * scale,
          obj.y * scale - 2 * scale,
          obj.width * scale + 4 * scale,
          obj.height * scale + 4 * scale
        );
        ctx.setLineDash([]);
      }

      // Label
      if (obj.label && (isHovered || isNearby || id === "door")) {
        ctx.fillStyle = "#e5e5e5";
        ctx.font = `${12 * scale}px Manrope`;
        ctx.textAlign = "center";
        ctx.fillText(
          obj.label + (isNearby ? " [E]" : ""),
          (obj.x + obj.width / 2) * scale,
          (obj.y - 8) * scale
        );
      }
    });

    // Draw players
    Object.entries(players).forEach(([id, player]) => {
      const pos = player.position;
      const isCurrentPlayer = id === currentPlayerId;

      // Player shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.ellipse(
        pos.x * scale,
        (pos.y + PLAYER_SIZE / 2) * scale,
        PLAYER_SIZE * 0.4 * scale,
        PLAYER_SIZE * 0.2 * scale,
        0, 0, Math.PI * 2
      );
      ctx.fill();

      // Player body (simple sprite representation)
      ctx.fillStyle = player.color || "#D4AF37";
      ctx.beginPath();
      ctx.arc(
        pos.x * scale,
        pos.y * scale,
        PLAYER_SIZE / 2 * scale,
        0, Math.PI * 2
      );
      ctx.fill();

      // Player outline
      ctx.strokeStyle = isCurrentPlayer ? "#ffffff" : "rgba(0,0,0,0.5)";
      ctx.lineWidth = 2 * scale;
      ctx.stroke();

      // Direction indicator for current player
      if (isCurrentPlayer) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(
          pos.x * scale,
          (pos.y - PLAYER_SIZE / 3) * scale,
          3 * scale,
          0, Math.PI * 2
        );
        ctx.fill();
      }

      // Player initial
      ctx.fillStyle = "#000";
      ctx.font = `bold ${14 * scale}px Manrope`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        player.name?.[0]?.toUpperCase() || "?",
        pos.x * scale,
        pos.y * scale
      );

      // Player name
      ctx.fillStyle = "#e5e5e5";
      ctx.font = `${10 * scale}px Manrope`;
      ctx.textAlign = "center";
      ctx.fillText(
        player.name || "Player",
        pos.x * scale,
        (pos.y - PLAYER_SIZE / 2 - 10) * scale
      );
    });

  }, [canvasSize, players, currentPlayerId, objectsState, hoveredObject, nearbyObject, scale]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      draw();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [draw]);

  // Handle click
  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // Check if clicked on an interactable object
    for (const [id, obj] of Object.entries(GAME_OBJECTS)) {
      if (!obj.interactable) continue;
      if (id === "uv_lamp" && objectsState?.uv_lamp?.picked_up) continue;

      if (
        x >= obj.x && x <= obj.x + obj.width &&
        y >= obj.y && y <= obj.y + obj.height
      ) {
        onObjectClick(id);
        return;
      }
    }

    // Otherwise, move player (click-to-move fallback)
    onPlayerMove({ x, y });
  }, [scale, onPlayerMove, onObjectClick, objectsState]);

  // Handle mouse move for hover
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    let foundObject = null;
    for (const [id, obj] of Object.entries(GAME_OBJECTS)) {
      if (!obj.interactable) continue;
      if (id === "uv_lamp" && objectsState?.uv_lamp?.picked_up) continue;

      if (
        x >= obj.x && x <= obj.x + obj.width &&
        y >= obj.y && y <= obj.y + obj.height
      ) {
        foundObject = id;
        break;
      }
    }
    setHoveredObject(foundObject);
  }, [scale, objectsState]);

  // Handle joystick input
  const handleJoystickMove = useCallback((dx, dy) => {
    if (!currentPlayerId || !players[currentPlayerId]) return;

    const player = players[currentPlayerId];
    let newX = player.position.x + dx * PLAYER_SPEED;
    let newY = player.position.y + dy * PLAYER_SPEED;

    // Boundary collision
    newX = Math.max(PLAYER_SIZE, Math.min(ROOM_WIDTH - PLAYER_SIZE, newX));
    newY = Math.max(PLAYER_SIZE, Math.min(ROOM_HEIGHT - PLAYER_SIZE, newY));

    onPlayerMove({ x: newX, y: newY });
  }, [currentPlayerId, players, onPlayerMove]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex items-center justify-center p-4"
      data-testid="game-canvas-container"
    >
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredObject(null)}
        className="game-canvas rounded-lg shadow-2xl"
        style={{ 
          cursor: hoveredObject ? "pointer" : "default",
          maxWidth: "100%",
          maxHeight: "100%"
        }}
        data-testid="game-canvas"
      />

      {/* Room info overlay */}
      <div className="absolute top-4 left-4 glass rounded-lg px-4 py-2">
        <h2 className="text-[#D4AF37] font-bold">The Locked Study</h2>
        <p className="text-[#a3a3a3] text-xs">WASD/Arrows to move • E to interact</p>
      </div>

      {/* Nearby object indicator */}
      {nearbyObject && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 glass rounded-lg px-4 py-2"
        >
          <p className="text-[#D4AF37] text-sm">
            Press <kbd className="bg-[#D4AF37] text-black px-1 rounded mx-1">E</kbd> to interact with {GAME_OBJECTS[nearbyObject]?.label}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export { GAME_OBJECTS };
export default GameCanvas;
