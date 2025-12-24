# The Locked Study - Multiplayer Escape Room Game

## Original Problem Statement
Build a lightweight, web-based multiplayer escape-style puzzle game called "The Locked Study" that:
- Runs entirely in the browser (no app install needed)
- Works well on mobile (Android, iOS) and tablets (iPad)
- Has one map/room with fixed puzzles and objects
- Supports 2-4 players playing together in real time
- Is hosted on a simple web server and played by sharing a single link
- Feels like a classic escape room (click to interact, inventory, combine items, solve puzzles)

## Architecture & Tech Stack

### Backend (FastAPI + Python)
- **Framework**: FastAPI with python-socketio for WebSocket support
- **Database**: MongoDB for room persistence
- **Real-time Communication**: Socket.IO for multiplayer sync
- **Endpoints**:
  - `POST /api/rooms/create` - Create a new game room
  - `POST /api/rooms/join` - Join an existing room
  - `GET /api/rooms/{room_id}` - Get room state
- **WebSocket Events**: join_room, start_game, player_move, examine_object, pickup_item, use_item, solve_puzzle, send_message, quick_chat

### Frontend (React + HTML5 Canvas)
- **Framework**: React 19 with vanilla JS Canvas rendering
- **Styling**: Tailwind CSS with custom Dark Academia Noir theme
- **Real-time**: socket.io-client for WebSocket communication
- **UI Components**: Shadcn/UI components for modals, buttons, inputs
- **Game Rendering**: HTML5 Canvas with top-down view

## Features Completed

### Core Features
1. ✅ Room creation & joining via shareable link
2. ✅ 2-4 players per room with real-time sync
3. ✅ Player avatars with color-coding
4. ✅ Top-down canvas game rendering
5. ✅ Click-to-move navigation
6. ✅ Object interaction (examine, pickup, use)
7. ✅ Shared inventory system with 6 slots
8. ✅ Text chat with quick-chat buttons

### Puzzles
1. ✅ 4-digit Code Lock (clue in book)
2. ✅ 3-digit Safe combination (clue in painting)
3. ✅ 9-piece Jigsaw puzzle
4. ✅ UV Light reveal (hidden note message)
5. ✅ Master Key combination (3 key pieces → master key)
6. ✅ Exit Door unlock (win condition)

### Game Objects
- Bookshelf with Old Book (code lock clue)
- Painting (safe combination clue)
- Desk with locked Drawer (code lock puzzle)
- Wall Safe (combination puzzle)
- Puzzle Table (jigsaw puzzle)
- UV Lamp (pickable item)
- Note (hidden UV message)
- Exit Door (final escape)

### UI/UX
- Dark Academia Noir theme (gold accents on dark background)
- Playfair Display headings, Manrope body text
- Glassmorphism effects for panels
- Responsive design for mobile/tablet
- Touch-friendly controls

## File Structure

```
/app/backend/
├── server.py              # FastAPI + Socket.IO server
├── requirements.txt       # Python dependencies
└── .env                   # Environment variables

/app/frontend/src/
├── App.js                 # Router setup
├── index.css              # Global styles + Tailwind
├── pages/
│   ├── LandingPage.jsx    # Home with create/join
│   ├── LobbyPage.jsx      # Room lobby
│   └── GamePage.jsx       # Main game
├── components/
│   ├── game/
│   │   ├── GameCanvas.jsx # Canvas rendering
│   │   ├── Inventory.jsx  # Item slots
│   │   └── ChatPanel.jsx  # Team chat
│   ├── puzzles/
│   │   ├── CodeLockModal.jsx
│   │   ├── SafeModal.jsx
│   │   ├── JigsawModal.jsx
│   │   └── UVLightModal.jsx
│   └── WinModal.jsx       # Victory screen
└── components/ui/         # Shadcn components
```

## Next Action Items

### Phase 2 Enhancements
1. Add player sprite animations (walking, idle)
2. Add sound effects (door creak, key pickup, puzzle solve)
3. Add more interactive objects (clock, lamp, fireplace)
4. Add time-based scoring system
5. Add room persistence (save/resume)

### Polish & Quality
1. Add loading states for network operations
2. Add connection status indicator in game
3. Add error boundary for React errors
4. Add player cursor indicators (show what others are pointing at)

### Additional Puzzles (Future)
1. Mirror reflection puzzle
2. Musical notes sequence
3. Bookshelf book order puzzle
4. Hidden compartment with weight sensor

## How to Play

1. **Create or Join**: Host creates a room and shares the link with friends
2. **Wait in Lobby**: See connected players, host clicks "Start Game"
3. **Explore**: Click anywhere to move, click objects to interact
4. **Find Clues**: 
   - Read the old book for the drawer code
   - Look behind the painting for the safe combination
   - Pick up the UV lamp and use it on the note
5. **Solve Puzzles**: Complete all puzzles to collect 3 key pieces
6. **Combine Keys**: Click "Combine Keys" when you have all 3 pieces
7. **Escape**: Use the master key on the exit door to win!

## Deployment Notes

- Backend runs on port 8001 (via supervisor)
- Frontend runs on port 3000 (via supervisor)
- Socket.IO uses path `/api/socket.io` for Kubernetes ingress compatibility
- All API routes prefixed with `/api`
- Environment variables in .env files (not hardcoded)
