// Game Assets - Sprites and Room Design
// Using Canvas-drawn cartoonish sprites for characters and objects

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

// Character sprite configurations
export const CHARACTER_SPRITES = {
  colors: ['#FFB347', '#87CEEB', '#98D8AA', '#DDA0DD'], // Orange, Blue, Green, Purple
  size: 32,
  
  // Walking animation frames (4 directions, 4 frames each)
  animations: {
    idle: { frames: 1, speed: 0 },
    walkDown: { frames: 4, speed: 150 },
    walkUp: { frames: 4, speed: 150 },
    walkLeft: { frames: 4, speed: 150 },
    walkRight: { frames: 4, speed: 150 },
  }
};

// Draw a cartoonish character sprite
export function drawCharacter(ctx, x, y, color, direction, frame, name, isCurrentPlayer, scale = 1) {
  const size = 32 * scale;
  const bobOffset = Math.sin(frame * 0.5) * 2 * scale; // Bobbing animation
  
  ctx.save();
  ctx.translate(x, y + bobOffset);
  
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(0, size * 0.4, size * 0.4, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Body (rounded rectangle - manual for compatibility)
  ctx.fillStyle = color;
  const bodyX = -size * 0.35;
  const bodyY = -size * 0.2;
  const bodyW = size * 0.7;
  const bodyH = size * 0.6;
  const bodyR = size * 0.15;
  ctx.beginPath();
  ctx.moveTo(bodyX + bodyR, bodyY);
  ctx.lineTo(bodyX + bodyW - bodyR, bodyY);
  ctx.quadraticCurveTo(bodyX + bodyW, bodyY, bodyX + bodyW, bodyY + bodyR);
  ctx.lineTo(bodyX + bodyW, bodyY + bodyH - bodyR);
  ctx.quadraticCurveTo(bodyX + bodyW, bodyY + bodyH, bodyX + bodyW - bodyR, bodyY + bodyH);
  ctx.lineTo(bodyX + bodyR, bodyY + bodyH);
  ctx.quadraticCurveTo(bodyX, bodyY + bodyH, bodyX, bodyY + bodyH - bodyR);
  ctx.lineTo(bodyX, bodyY + bodyR);
  ctx.quadraticCurveTo(bodyX, bodyY, bodyX + bodyR, bodyY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = darkenColor(color, 30);
  ctx.lineWidth = 2 * scale;
  ctx.stroke();
  
  // Head (circle)
  ctx.fillStyle = '#FFDAB9'; // Skin color
  ctx.beginPath();
  ctx.arc(0, -size * 0.35, size * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#DEB887';
  ctx.lineWidth = 2 * scale;
  ctx.stroke();
  
  // Hair
  ctx.fillStyle = getHairColor(color);
  ctx.beginPath();
  ctx.arc(0, -size * 0.45, size * 0.22, Math.PI, 0, false);
  ctx.fill();
  
  // Eyes (direction-based)
  const eyeOffsetX = direction === 'left' ? -3 : direction === 'right' ? 3 : 0;
  const eyeOffsetY = direction === 'up' ? -2 : direction === 'down' ? 2 : 0;
  
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(-5 * scale + eyeOffsetX * scale, -size * 0.35 + eyeOffsetY * scale, 2.5 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(5 * scale + eyeOffsetX * scale, -size * 0.35 + eyeOffsetY * scale, 2.5 * scale, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye shine
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(-4 * scale + eyeOffsetX * scale, -size * 0.37 + eyeOffsetY * scale, 1 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(6 * scale + eyeOffsetX * scale, -size * 0.37 + eyeOffsetY * scale, 1 * scale, 0, Math.PI * 2);
  ctx.fill();
  
  // Smile
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.arc(0, -size * 0.28, 4 * scale, 0.2, Math.PI - 0.2);
  ctx.stroke();
  
  // Legs (animated)
  const legOffset = Math.sin(frame * 0.8) * 4 * scale;
  ctx.fillStyle = '#4A4A4A';
  
  // Left leg
  roundRect(ctx, -size * 0.2 + legOffset, size * 0.25, size * 0.15, size * 0.2, 3 * scale);
  ctx.fill();
  
  // Right leg
  roundRect(ctx, size * 0.05 - legOffset, size * 0.25, size * 0.15, size * 0.2, 3 * scale);
  ctx.fill();
  
  // Current player indicator (arrow)
  if (isCurrentPlayer) {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.75);
    ctx.lineTo(-6 * scale, -size * 0.9);
    ctx.lineTo(6 * scale, -size * 0.9);
    ctx.closePath();
    ctx.fill();
  }
  
  // Name tag
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.beginPath();
  roundRect(ctx, -30 * scale, -size * 0.95, 60 * scale, 14 * scale, 4 * scale);
  ctx.fill();
  
  ctx.fillStyle = '#FFF';
  ctx.font = `bold ${10 * scale}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name || 'Player', 0, -size * 0.88);
  
  ctx.restore();
}

// Room furniture and objects
export const ROOM_OBJECTS = {
  // Desk - wooden with drawers
  desk: {
    draw: (ctx, x, y, w, h, state, scale) => {
      // Desk top
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      roundRect(ctx, x, y, w, h * 0.3, 4);
      ctx.fill();
      
      // Desk front
      ctx.fillStyle = '#A0522D';
      ctx.fillRect(x + 5, y + h * 0.3, w - 10, h * 0.65);
      
      // Drawer
      const drawerOpen = state?.open;
      ctx.fillStyle = drawerOpen ? '#228B22' : '#8B4513';
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 2;
      ctx.beginPath();
      roundRect(ctx, x + w * 0.3, y + h * 0.4, w * 0.4, h * 0.4, 3);
      ctx.fill();
      ctx.stroke();
      
      // Drawer handle
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(x + w * 0.5, y + h * 0.6, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Desk legs
      ctx.fillStyle = '#654321';
      ctx.fillRect(x + 5, y + h * 0.9, 8, h * 0.1);
      ctx.fillRect(x + w - 13, y + h * 0.9, 8, h * 0.1);
    }
  },
  
  // Bookshelf with books
  bookshelf: {
    draw: (ctx, x, y, w, h, state, scale) => {
      // Shelf frame
      ctx.fillStyle = '#5D3A1A';
      ctx.fillRect(x, y, w, h);
      
      // Inner shelves
      ctx.fillStyle = '#8B5A2B';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + 5, y + 5 + i * (h / 4), w - 10, h / 4 - 5);
      }
      
      // Books (colorful)
      const bookColors = ['#DC143C', '#4169E1', '#228B22', '#FFD700', '#8B008B', '#FF6347'];
      for (let shelf = 0; shelf < 4; shelf++) {
        for (let book = 0; book < 6; book++) {
          ctx.fillStyle = bookColors[(shelf + book) % bookColors.length];
          const bookX = x + 8 + book * 15;
          const bookY = y + 8 + shelf * (h / 4);
          const bookH = h / 4 - 12;
          ctx.fillRect(bookX, bookY, 12, bookH);
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(bookX, bookY, 12, bookH);
        }
      }
    }
  },
  
  // Safe with dial
  safe: {
    draw: (ctx, x, y, w, h, state, scale) => {
      // Safe body
      const isOpen = state?.open;
      ctx.fillStyle = isOpen ? '#2E8B57' : '#4A4A4A';
      ctx.beginPath();
      roundRect(ctx, x, y, w, h, 5);
      ctx.fill();
      
      // Border
      ctx.strokeStyle = '#2F2F2F';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      if (!isOpen) {
        // Dial
        ctx.fillStyle = '#C0C0C0';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, w * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#808080';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Dial numbers
        ctx.fillStyle = '#333';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const numX = x + w / 2 + Math.cos(angle) * w * 0.18;
          const numY = y + h / 2 + Math.sin(angle) * w * 0.18;
          ctx.fillText(i.toString(), numX, numY + 3);
        }
        
        // Handle
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + w * 0.7, y + h * 0.4, w * 0.15, h * 0.2);
      } else {
        // Open safe interior
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(x + 5, y + 5, w - 10, h - 10);
        
        // Sparkle for key
        ctx.fillStyle = '#FFD700';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🔑', x + w / 2, y + h / 2 + 5);
      }
    }
  },
  
  // Grandfather clock
  clock: {
    draw: (ctx, x, y, w, h, state, scale) => {
      // Clock body
      ctx.fillStyle = '#5D3A1A';
      ctx.beginPath();
      roundRect(ctx, x, y, w, h, 5);
      ctx.fill();
      
      // Clock face
      ctx.fillStyle = '#FFFFF0';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h * 0.3, w * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Clock numbers
      ctx.fillStyle = '#333';
      ctx.font = 'bold 8px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      [12, 3, 6, 9].forEach((num, i) => {
        const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
        const numX = x + w / 2 + Math.cos(angle) * w * 0.25;
        const numY = y + h * 0.3 + Math.sin(angle) * w * 0.25;
        ctx.fillText(num.toString(), numX, numY);
      });
      
      // Clock hands
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + h * 0.3);
      ctx.lineTo(x + w / 2 + 10, y + h * 0.3 - 5);
      ctx.stroke();
      
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + h * 0.3);
      ctx.lineTo(x + w / 2, y + h * 0.3 - 12);
      ctx.stroke();
      
      // Pendulum area
      ctx.fillStyle = '#3D2A1A';
      ctx.fillRect(x + w * 0.2, y + h * 0.5, w * 0.6, h * 0.45);
      
      // Pendulum
      const pendulumAngle = Math.sin(Date.now() / 500) * 0.3;
      ctx.save();
      ctx.translate(x + w / 2, y + h * 0.55);
      ctx.rotate(pendulumAngle);
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(0, h * 0.3, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, h * 0.3);
      ctx.stroke();
      ctx.restore();
    }
  },
  
  // Exit door (needs 2 players nearby to open)
  door: {
    draw: (ctx, x, y, w, h, state, scale) => {
      const isUnlocked = state?.unlocked;
      const playersNearby = state?.playersNearby || 0;
      
      // Door frame
      ctx.fillStyle = '#3D2A1A';
      ctx.fillRect(x - 5, y - 5, w + 10, h + 10);
      
      // Door
      ctx.fillStyle = isUnlocked ? '#228B22' : '#8B4513';
      ctx.beginPath();
      roundRect(ctx, x, y, w, h, 3);
      ctx.fill();
      
      // Door panels
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 10, y + 10, w - 20, h * 0.35);
      ctx.strokeRect(x + 10, y + h * 0.5, w - 20, h * 0.35);
      
      // Door handle
      ctx.fillStyle = isUnlocked ? '#90EE90' : '#FFD700';
      ctx.beginPath();
      ctx.arc(x + w - 15, y + h / 2, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Lock indicator
      if (!isUnlocked) {
        ctx.fillStyle = '#FF4444';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🔒', x + w / 2, y + h / 2);
        
        // Player requirement indicator
        ctx.fillStyle = playersNearby >= 2 ? '#90EE90' : '#FFA500';
        ctx.font = '10px Arial';
        ctx.fillText(`${playersNearby}/2 players`, x + w / 2, y + h - 10);
      } else {
        ctx.fillStyle = '#90EE90';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🚪', x + w / 2, y + h / 2);
      }
    }
  },
  
  // Pressure plate (cooperative element)
  pressurePlate: {
    draw: (ctx, x, y, w, h, state, scale) => {
      const isPressed = state?.pressed;
      
      ctx.fillStyle = isPressed ? '#32CD32' : '#808080';
      ctx.beginPath();
      roundRect(ctx, x, y + (isPressed ? 3 : 0), w, h - (isPressed ? 3 : 0), 3);
      ctx.fill();
      
      ctx.strokeStyle = '#505050';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Weight indicator
      ctx.fillStyle = isPressed ? '#FFF' : '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(isPressed ? '✓' : '⬇', x + w / 2, y + h / 2 + 4);
    }
  },
  
  // Lever switch (cooperative)
  lever: {
    draw: (ctx, x, y, w, h, state, scale) => {
      const isOn = state?.on;
      
      // Base
      ctx.fillStyle = '#4A4A4A';
      ctx.fillRect(x, y + h * 0.6, w, h * 0.4);
      
      // Lever arm
      ctx.save();
      ctx.translate(x + w / 2, y + h * 0.6);
      ctx.rotate(isOn ? -0.5 : 0.5);
      ctx.fillStyle = isOn ? '#32CD32' : '#FF4444';
      ctx.fillRect(-4, -h * 0.5, 8, h * 0.5);
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(0, -h * 0.5, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  },
  
  // Painting with hidden clue
  painting: {
    draw: (ctx, x, y, w, h, state, scale) => {
      // Frame
      ctx.fillStyle = '#8B7355';
      ctx.fillRect(x, y, w, h);
      
      // Inner frame
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
      
      // Canvas
      ctx.fillStyle = '#2F4F4F';
      ctx.fillRect(x + 6, y + 6, w - 12, h - 12);
      
      // Abstract art
      ctx.fillStyle = '#8B0000';
      ctx.beginPath();
      ctx.arc(x + w * 0.3, y + h * 0.4, 15, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(x + w * 0.6, y + h * 0.5, 12, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#4169E1';
      ctx.beginPath();
      ctx.arc(x + w * 0.5, y + h * 0.7, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  
  // Rug with pattern
  rug: {
    draw: (ctx, x, y, w, h, state, scale) => {
      // Rug base
      ctx.fillStyle = '#8B0000';
      ctx.beginPath();
      roundRect(ctx, x, y, w, h, 10);
      ctx.fill();
      
      // Border pattern
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 4;
      ctx.beginPath();
      roundRect(ctx, x + 10, y + 10, w - 20, h - 20, 5);
      ctx.stroke();
      
      // Inner pattern
      ctx.strokeStyle = '#DAA520';
      ctx.lineWidth = 2;
      ctx.beginPath();
      roundRect(ctx, x + 20, y + 20, w - 40, h - 40, 3);
      ctx.stroke();
      
      // Center medallion
      ctx.fillStyle = '#DAA520';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8B0000';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, 15, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  
  // Fireplace with animated flames
  fireplace: {
    draw: (ctx, x, y, w, h, state, scale) => {
      // Stone frame
      ctx.fillStyle = '#696969';
      ctx.fillRect(x, y, w, h);
      
      // Mantle
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x - 10, y - 10, w + 20, 15);
      
      // Fire opening
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.moveTo(x + 10, y + h);
      ctx.lineTo(x + 10, y + 20);
      ctx.quadraticCurveTo(x + w / 2, y + 10, x + w - 10, y + 20);
      ctx.lineTo(x + w - 10, y + h);
      ctx.closePath();
      ctx.fill();
      
      // Animated flames
      const time = Date.now() / 100;
      for (let i = 0; i < 5; i++) {
        const flameX = x + 20 + i * 15;
        const flameHeight = 20 + Math.sin(time + i) * 10;
        
        // Outer flame (orange)
        ctx.fillStyle = '#FF6600';
        ctx.beginPath();
        ctx.moveTo(flameX, y + h - 10);
        ctx.quadraticCurveTo(flameX - 8, y + h - flameHeight / 2, flameX, y + h - flameHeight);
        ctx.quadraticCurveTo(flameX + 8, y + h - flameHeight / 2, flameX, y + h - 10);
        ctx.fill();
        
        // Inner flame (yellow)
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(flameX, y + h - 10);
        ctx.quadraticCurveTo(flameX - 4, y + h - flameHeight / 3, flameX, y + h - flameHeight * 0.6);
        ctx.quadraticCurveTo(flameX + 4, y + h - flameHeight / 3, flameX, y + h - 10);
        ctx.fill();
      }
      
      // Logs
      ctx.fillStyle = '#4A3728';
      ctx.beginPath();
      ctx.ellipse(x + w / 2 - 15, y + h - 8, 20, 6, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + w / 2 + 10, y + h - 5, 18, 5, -0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  
  // Jigsaw puzzle table
  puzzleTable: {
    draw: (ctx, x, y, w, h, state, scale) => {
      // Table
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      roundRect(ctx, x, y, w, h, 5);
      ctx.fill();
      
      // Puzzle area
      ctx.fillStyle = '#DEB887';
      ctx.fillRect(x + 10, y + 10, w - 20, h - 20);
      
      // Puzzle pieces
      const pieces = state?.pieces || [false, false, false, false, false, false, false, false, false];
      const pieceSize = (w - 24) / 3;
      
      for (let i = 0; i < 9; i++) {
        const px = x + 12 + (i % 3) * pieceSize;
        const py = y + 12 + Math.floor(i / 3) * pieceSize;
        
        if (pieces[i]) {
          ctx.fillStyle = '#4169E1';
          ctx.fillRect(px, py, pieceSize - 2, pieceSize - 2);
          ctx.fillStyle = '#FFF';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('✓', px + pieceSize / 2, py + pieceSize / 2 + 3);
        } else {
          ctx.strokeStyle = '#999';
          ctx.setLineDash([2, 2]);
          ctx.strokeRect(px, py, pieceSize - 2, pieceSize - 2);
          ctx.setLineDash([]);
        }
      }
    }
  }
};

// Draw the complete room background
export function drawRoomBackground(ctx, width, height, scale) {
  // Floor - wooden planks
  ctx.fillStyle = '#3D2A1A';
  ctx.fillRect(0, 0, width, height);
  
  // Wood plank pattern
  ctx.strokeStyle = '#2A1A0A';
  ctx.lineWidth = 1;
  const plankWidth = 60 * scale;
  for (let x = 0; x < width; x += plankWidth) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // Walls (top and sides)
  const wallHeight = 80 * scale;
  
  // Wall gradient
  const wallGradient = ctx.createLinearGradient(0, 0, 0, wallHeight);
  wallGradient.addColorStop(0, '#4A3728');
  wallGradient.addColorStop(1, '#3D2A1A');
  
  ctx.fillStyle = wallGradient;
  ctx.fillRect(0, 0, width, wallHeight);
  
  // Wainscoting
  ctx.fillStyle = '#2F1F0F';
  ctx.fillRect(0, wallHeight - 20 * scale, width, 20 * scale);
  
  // Wall decorative line
  ctx.strokeStyle = '#5D4A3A';
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.moveTo(0, wallHeight);
  ctx.lineTo(width, wallHeight);
  ctx.stroke();
  
  // Corner shadows for depth
  const cornerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 200 * scale);
  cornerGradient.addColorStop(0, 'rgba(0,0,0,0.3)');
  cornerGradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = cornerGradient;
  ctx.fillRect(0, 0, 200 * scale, 200 * scale);
}

// Helper functions
function darkenColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max((num >> 16) - amt, 0);
  const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
  const B = Math.max((num & 0x0000FF) - amt, 0);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function getHairColor(shirtColor) {
  const hairColors = {
    '#FFB347': '#4A3728', // Brown
    '#87CEEB': '#FFD700', // Blonde
    '#98D8AA': '#2F1F0F', // Dark brown
    '#DDA0DD': '#8B0000', // Auburn
  };
  return hairColors[shirtColor] || '#4A3728';
}

export default { CHARACTER_SPRITES, ROOM_OBJECTS, drawCharacter, drawRoomBackground };
