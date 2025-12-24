import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

// Room dimensions and object positions
const ROOM_WIDTH = 800;
const ROOM_HEIGHT = 600;
const PLAYER_SIZE = 24;

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
};

const GameCanvas = ({ players, currentPlayerId, objectsState, onPlayerMove, onObjectClick }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: ROOM_WIDTH, height: ROOM_HEIGHT });
  const [hoveredObject, setHoveredObject] = useState(null);
  const animationFrameRef = useRef(null);

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
      if (id === "uv_lamp" && state.picked_up) return; // Don't draw if picked up
      if (id === "note") fillColor = "#F0E6D2";

      ctx.fillStyle = fillColor;
      ctx.fillRect(
        obj.x * scale,
        obj.y * scale,
        obj.width * scale,
        obj.height * scale
      );

      // Border
      ctx.strokeStyle = isHovered && isInteractable ? "#D4AF37" : "#4a4a4a";
      ctx.lineWidth = isHovered && isInteractable ? 3 * scale : 1 * scale;
      ctx.strokeRect(
        obj.x * scale,
        obj.y * scale,
        obj.width * scale,
        obj.height * scale
      );

      // Highlight for interactable objects
      if (isInteractable && !isHovered) {
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
      if (obj.label && (isHovered || id === "door")) {
        ctx.fillStyle = "#e5e5e5";
        ctx.font = `${12 * scale}px Manrope`;
        ctx.textAlign = "center";
        ctx.fillText(
          obj.label,
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

      // Player body
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

      // Player initial
      ctx.fillStyle = isCurrentPlayer ? "#000" : "#000";
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
        (pos.y - PLAYER_SIZE / 2 - 8) * scale
      );
    });

  }, [canvasSize, players, currentPlayerId, objectsState, hoveredObject, scale]);

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

    // Otherwise, move player
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
          cursor: hoveredObject ? "pointer" : "crosshair",
          maxWidth: "100%",
          maxHeight: "100%"
        }}
        data-testid="game-canvas"
      />

      {/* Room info overlay */}
      <div className="absolute top-4 left-4 glass rounded-lg px-4 py-2">
        <h2 className="text-[#D4AF37] font-bold">The Locked Study</h2>
        <p className="text-[#a3a3a3] text-sm">Click objects to interact</p>
      </div>
    </motion.div>
  );
};

export default GameCanvas;
