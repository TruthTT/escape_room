import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { drawCharacter, drawRoomBackground, ROOM_OBJECTS, CHARACTER_SPRITES } from "./GameAssets";

// Helper function for rounded rectangles (browser compatible)
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Room dimensions
const ROOM_WIDTH = 800;
const ROOM_HEIGHT = 600;
const PLAYER_SIZE = 32;
const PLAYER_SPEED = 3;

// Game objects with positions, sizes, and types
const GAME_OBJECTS = {
  // Furniture
  desk: { x: 480, y: 120, width: 160, height: 90, type: 'desk', label: "Desk", interactable: false },
  bookshelf: { x: 40, y: 85, width: 100, height: 160, type: 'bookshelf', label: "Bookshelf", interactable: false },
  
  // Interactable objects
  book: { x: 55, y: 130, width: 35, height: 25, type: 'book', label: "Old Book", interactable: true },
  painting: { x: 280, y: 25, width: 100, height: 70, type: 'painting', label: "Painting", interactable: true },
  safe: { x: 680, y: 180, width: 70, height: 80, type: 'safe', label: "Safe", interactable: true },
  drawer: { x: 520, y: 165, width: 50, height: 35, type: 'drawer', label: "Drawer", interactable: true },
  
  // Puzzles
  clock: { x: 680, y: 40, width: 50, height: 90, type: 'clock', label: "Clock", interactable: true },
  puzzleTable: { x: 80, y: 380, width: 120, height: 90, type: 'puzzleTable', label: "Puzzle Table", interactable: true },
  lamp_panel: { x: 40, y: 280, width: 45, height: 55, type: 'lever', label: "Light Panel", interactable: true },
  slider_box: { x: 680, y: 340, width: 60, height: 60, type: 'puzzleBox', label: "Puzzle Box", interactable: true },
  cipher_book: { x: 540, y: 135, width: 30, height: 22, type: 'cipherBook', label: "Cipher Book", interactable: true },
  
  // Pickable items
  uv_lamp: { x: 190, y: 270, width: 28, height: 28, type: 'uvLamp', label: "UV Lamp", interactable: true },
  note: { x: 380, y: 340, width: 35, height: 28, type: 'note', label: "Note", interactable: true },
  
  // Decorative
  fireplace: { x: 170, y: 25, width: 90, height: 80, type: 'fireplace', label: "Fireplace", interactable: true },
  rug: { x: 280, y: 260, width: 220, height: 160, type: 'rug', label: "" },
  
  // Cooperative elements
  pressurePlate1: { x: 250, y: 480, width: 50, height: 20, type: 'pressurePlate', label: "Plate 1", interactable: false, cooperative: true },
  pressurePlate2: { x: 500, y: 480, width: 50, height: 20, type: 'pressurePlate', label: "Plate 2", interactable: false, cooperative: true },
  
  // Exit door (needs both pressure plates OR master key)
  door: { x: 340, y: 530, width: 120, height: 55, type: 'door', label: "Exit Door", interactable: true, requiresCooperation: true },
};

const GameCanvas = ({ players, currentPlayerId, objectsState, onPlayerMove, onObjectClick, puzzleStates }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: ROOM_WIDTH, height: ROOM_HEIGHT });
  const [hoveredObject, setHoveredObject] = useState(null);
  const [nearbyObject, setNearbyObject] = useState(null);
  const [animationFrame, setAnimationFrame] = useState(0);
  const keysPressed = useRef({});
  const lastMoveTime = useRef(Date.now());

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const aspectRatio = ROOM_WIDTH / ROOM_HEIGHT;
        let width = container.clientWidth - 32;
        let height = container.clientHeight - 32;

        if (width / height > aspectRatio) {
          width = height * aspectRatio;
        } else {
          height = width / aspectRatio;
        }

        setCanvasSize({ width: Math.max(width, 400), height: Math.max(height, 300) });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scale = canvasSize.width / ROOM_WIDTH;

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D', ' ', 'e', 'E'].includes(e.key)) {
        e.preventDefault();
        keysPressed.current[e.key.toLowerCase()] = true;
        
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
        const length = Math.sqrt(dx * dx + dy * dy);
        dx = (dx / length) * PLAYER_SPEED;
        dy = (dy / length) * PLAYER_SPEED;

        const player = players[currentPlayerId];
        let newX = player.position.x + dx;
        let newY = player.position.y + dy;

        // Boundary
        newX = Math.max(PLAYER_SIZE, Math.min(ROOM_WIDTH - PLAYER_SIZE, newX));
        newY = Math.max(100, Math.min(ROOM_HEIGHT - PLAYER_SIZE - 20, newY)); // Keep above bottom

        // Collision with objects
        Object.entries(GAME_OBJECTS).forEach(([id, obj]) => {
          if (obj.type === 'rug' || obj.type === 'pressurePlate') return;
          
          const padding = 15;
          const objLeft = obj.x - padding;
          const objRight = obj.x + obj.width + padding;
          const objTop = obj.y - padding;
          const objBottom = obj.y + obj.height + padding;
          
          if (newX > objLeft && newX < objRight && newY > objTop && newY < objBottom) {
            // Push back
            if (player.position.x <= objLeft) newX = objLeft;
            else if (player.position.x >= objRight) newX = objRight;
            if (player.position.y <= objTop) newY = objTop;
            else if (player.position.y >= objBottom) newY = objBottom;
          }
        });

        if (newX !== player.position.x || newY !== player.position.y) {
          onPlayerMove({ x: newX, y: newY });
          lastMoveTime.current = Date.now();
        }
      }
    };

    const interval = setInterval(updateMovement, 1000 / 60);
    return () => clearInterval(interval);
  }, [currentPlayerId, players, onPlayerMove]);

  // Check nearby objects and pressure plates
  useEffect(() => {
    if (!currentPlayerId || !players[currentPlayerId]) return;

    const player = players[currentPlayerId];
    const interactionDistance = 50;
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

  // Check pressure plates for cooperative doors
  const checkPressurePlates = useCallback(() => {
    let plate1Pressed = false;
    let plate2Pressed = false;
    
    Object.values(players).forEach(player => {
      const pos = player.position;
      
      // Check plate 1
      const p1 = GAME_OBJECTS.pressurePlate1;
      if (pos.x > p1.x && pos.x < p1.x + p1.width && pos.y > p1.y - 20 && pos.y < p1.y + p1.height + 20) {
        plate1Pressed = true;
      }
      
      // Check plate 2
      const p2 = GAME_OBJECTS.pressurePlate2;
      if (pos.x > p2.x && pos.x < p2.x + p2.width && pos.y > p2.y - 20 && pos.y < p2.y + p2.height + 20) {
        plate2Pressed = true;
      }
    });
    
    return { plate1Pressed, plate2Pressed, bothPressed: plate1Pressed && plate2Pressed };
  }, [players]);

  // Count players near door
  const getPlayersNearDoor = useCallback(() => {
    let count = 0;
    const door = GAME_OBJECTS.door;
    
    Object.values(players).forEach(player => {
      const dist = Math.sqrt(
        Math.pow(player.position.x - (door.x + door.width / 2), 2) +
        Math.pow(player.position.y - (door.y + door.height / 2), 2)
      );
      if (dist < 80) count++;
    });
    
    return count;
  }, [players]);

  // Animation frame counter
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(f => f + 1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Get player direction based on movement
  const getPlayerDirection = (player) => {
    if (!player.lastPosition) return 'down';
    const dx = player.position.x - (player.lastPosition?.x || player.position.x);
    const dy = player.position.y - (player.lastPosition?.y || player.position.y);
    
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else if (dy !== 0) {
      return dy > 0 ? 'down' : 'up';
    }
    return player.direction || 'down';
  };

  // Draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    ctx.save();
    ctx.scale(scale, scale);

    // Draw room background
    drawRoomBackground(ctx, ROOM_WIDTH, ROOM_HEIGHT, 1);

    // Draw rug first (under everything)
    const rug = GAME_OBJECTS.rug;
    ROOM_OBJECTS.rug.draw(ctx, rug.x, rug.y, rug.width, rug.height, {}, 1);

    // Draw pressure plates
    const plateState = checkPressurePlates();
    const p1 = GAME_OBJECTS.pressurePlate1;
    const p2 = GAME_OBJECTS.pressurePlate2;
    ROOM_OBJECTS.pressurePlate.draw(ctx, p1.x, p1.y, p1.width, p1.height, { pressed: plateState.plate1Pressed }, 1);
    ROOM_OBJECTS.pressurePlate.draw(ctx, p2.x, p2.y, p2.width, p2.height, { pressed: plateState.plate2Pressed }, 1);

    // Draw objects by Y position (painter's algorithm)
    const sortedObjects = Object.entries(GAME_OBJECTS)
      .filter(([id]) => id !== 'rug' && id !== 'pressurePlate1' && id !== 'pressurePlate2')
      .sort((a, b) => (a[1].y + a[1].height) - (b[1].y + b[1].height));

    sortedObjects.forEach(([id, obj]) => {
      const state = objectsState?.[id] || {};
      const isHovered = hoveredObject === id;
      const isNearby = nearbyObject === id;
      
      // Skip picked up items
      if (id === 'uv_lamp' && state.picked_up) return;

      // Draw based on type
      switch (obj.type) {
        case 'desk':
          ROOM_OBJECTS.desk.draw(ctx, obj.x, obj.y, obj.width, obj.height, objectsState?.drawer, 1);
          break;
        case 'bookshelf':
          ROOM_OBJECTS.bookshelf.draw(ctx, obj.x, obj.y, obj.width, obj.height, state, 1);
          break;
        case 'safe':
          ROOM_OBJECTS.safe.draw(ctx, obj.x, obj.y, obj.width, obj.height, state, 1);
          break;
        case 'clock':
          ROOM_OBJECTS.clock.draw(ctx, obj.x, obj.y, obj.width, obj.height, state, 1);
          break;
        case 'fireplace':
          ROOM_OBJECTS.fireplace.draw(ctx, obj.x, obj.y, obj.width, obj.height, state, 1);
          break;
        case 'painting':
          ROOM_OBJECTS.painting.draw(ctx, obj.x, obj.y, obj.width, obj.height, state, 1);
          break;
        case 'puzzleTable':
          ROOM_OBJECTS.puzzleTable.draw(ctx, obj.x, obj.y, obj.width, obj.height, puzzleStates?.jigsaw || {}, 1);
          break;
        case 'door':
          const doorState = {
            unlocked: objectsState?.door?.unlocked || plateState.bothPressed,
            playersNearby: getPlayersNearDoor()
          };
          ROOM_OBJECTS.door.draw(ctx, obj.x, obj.y, obj.width, obj.height, doorState, 1);
          break;
        case 'lever':
          ROOM_OBJECTS.lever.draw(ctx, obj.x, obj.y, obj.width, obj.height, { on: puzzleStates?.color_mix?.solved }, 1);
          break;
        case 'book':
          // Old book
          ctx.fillStyle = '#8B0000';
          ctx.beginPath();
          roundRect(ctx, obj.x, obj.y, obj.width, obj.height, 3);
          ctx.fill();
          ctx.strokeStyle = '#5C0000';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = '#FFD700';
          ctx.font = '8px serif';
          ctx.fillText('DIARY', obj.x + 3, obj.y + 15);
          break;
        case 'cipherBook':
          ctx.fillStyle = '#2F4F4F';
          ctx.beginPath();
          roundRect(ctx, obj.x, obj.y, obj.width, obj.height, 2);
          ctx.fill();
          ctx.fillStyle = '#FFD700';
          ctx.font = '6px serif';
          ctx.fillText('CODE', obj.x + 3, obj.y + 13);
          break;
        case 'uvLamp':
          // UV lamp flashlight
          ctx.fillStyle = '#333';
          ctx.beginPath();
          roundRect(ctx, obj.x, obj.y, obj.width, obj.height * 0.6, 3);
          ctx.fill();
          ctx.fillStyle = '#9370DB';
          ctx.beginPath();
          ctx.arc(obj.x + obj.width / 2, obj.y + obj.height * 0.75, 10, 0, Math.PI * 2);
          ctx.fill();
          // Glow
          ctx.fillStyle = 'rgba(147, 112, 219, 0.3)';
          ctx.beginPath();
          ctx.arc(obj.x + obj.width / 2, obj.y + obj.height * 0.75, 15, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'note':
          ctx.fillStyle = '#FFFACD';
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
          ctx.strokeStyle = '#DEB887';
          ctx.lineWidth = 1;
          ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
          // Lines on note
          ctx.strokeStyle = '#CCC';
          ctx.lineWidth = 0.5;
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(obj.x + 3, obj.y + 6 + i * 6);
            ctx.lineTo(obj.x + obj.width - 3, obj.y + 6 + i * 6);
            ctx.stroke();
          }
          break;
        case 'drawer':
          // Part of desk, handled separately
          break;
        case 'puzzleBox':
          // Slider puzzle box
          ctx.fillStyle = '#5D3A1A';
          ctx.beginPath();
          roundRect(ctx, obj.x, obj.y, obj.width, obj.height, 5);
          ctx.fill();
          ctx.strokeStyle = '#8B4513';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Decorative pattern
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 1;
          ctx.strokeRect(obj.x + 5, obj.y + 5, obj.width - 10, obj.height - 10);
          // Lock if not solved
          if (!puzzleStates?.slider?.solved) {
            ctx.fillStyle = '#FFD700';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🧩', obj.x + obj.width / 2, obj.y + obj.height / 2 + 5);
          }
          break;
        default:
          // Default box for unknown types
          ctx.fillStyle = '#666';
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      }

      // Interaction highlight
      if (obj.interactable && (isHovered || isNearby)) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(obj.x - 3, obj.y - 3, obj.width + 6, obj.height + 6);
        ctx.setLineDash([]);

        // Label
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.beginPath();
        roundRect(ctx, obj.x + obj.width / 2 - 40, obj.y - 25, 80, 18, 4);
        ctx.fill();
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(obj.label + (isNearby ? ' [E]' : ''), obj.x + obj.width / 2, obj.y - 12);
      }
    });

    // Draw players sorted by Y
    const sortedPlayers = Object.entries(players)
      .sort((a, b) => a[1].position.y - b[1].position.y);

    sortedPlayers.forEach(([id, player], index) => {
      const isCurrentPlayer = id === currentPlayerId;
      const isMoving = Date.now() - lastMoveTime.current < 200;
      const direction = getPlayerDirection(player);
      const color = CHARACTER_SPRITES.colors[index % CHARACTER_SPRITES.colors.length];
      
      drawCharacter(
        ctx,
        player.position.x,
        player.position.y,
        player.color || color,
        direction,
        isMoving ? animationFrame : 0,
        player.name,
        isCurrentPlayer,
        1
      );
    });

    ctx.restore();
  }, [canvasSize, scale, players, currentPlayerId, objectsState, puzzleStates, hoveredObject, nearbyObject, animationFrame, checkPressurePlates, getPlayersNearDoor]);

  // Animation loop
  useEffect(() => {
    let frameId;
    const animate = () => {
      draw();
      frameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frameId);
  }, [draw]);

  // Mouse handlers
  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // Check objects
    for (const [id, obj] of Object.entries(GAME_OBJECTS)) {
      if (!obj.interactable) continue;
      if (id === "uv_lamp" && objectsState?.uv_lamp?.picked_up) continue;

      if (x >= obj.x && x <= obj.x + obj.width && y >= obj.y && y <= obj.y + obj.height) {
        onObjectClick(id);
        return;
      }
    }

    // Click to move
    if (y > 80 && y < ROOM_HEIGHT - 40) {
      onPlayerMove({ x, y });
    }
  }, [scale, onPlayerMove, onObjectClick, objectsState]);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    let found = null;
    for (const [id, obj] of Object.entries(GAME_OBJECTS)) {
      if (!obj.interactable) continue;
      if (id === "uv_lamp" && objectsState?.uv_lamp?.picked_up) continue;

      if (x >= obj.x && x <= obj.x + obj.width && y >= obj.y && y <= obj.y + obj.height) {
        found = id;
        break;
      }
    }
    setHoveredObject(found);
  }, [scale, objectsState]);

  const plateState = checkPressurePlates();

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
        className="rounded-xl shadow-2xl cursor-crosshair"
        style={{ maxWidth: "100%", maxHeight: "100%", imageRendering: "pixelated" }}
        data-testid="game-canvas"
      />

      {/* UI Overlays */}
      <div className="absolute top-4 left-4 glass rounded-xl px-4 py-3 max-w-xs">
        <h2 className="text-[#D4AF37] font-bold text-lg">The Locked Study</h2>
        <p className="text-[#a3a3a3] text-xs mt-1">WASD to move • E to interact</p>
        <div className="flex items-center gap-2 mt-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${plateState.plate1Pressed ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="text-[#a3a3a3]">Plate 1</span>
          <span className={`w-2 h-2 rounded-full ${plateState.plate2Pressed ? 'bg-green-500' : 'bg-gray-500'} ml-2`} />
          <span className="text-[#a3a3a3]">Plate 2</span>
        </div>
        {plateState.bothPressed && (
          <p className="text-green-400 text-xs mt-1 animate-pulse">🚪 Door unlocked by teamwork!</p>
        )}
      </div>

      {nearbyObject && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 glass rounded-lg px-4 py-2 pointer-events-none"
        >
          <p className="text-[#D4AF37] text-sm flex items-center gap-2">
            Press <kbd className="bg-[#D4AF37] text-black px-2 py-0.5 rounded font-mono text-xs">E</kbd> to interact with {GAME_OBJECTS[nearbyObject]?.label}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export { GAME_OBJECTS };
export default GameCanvas;
