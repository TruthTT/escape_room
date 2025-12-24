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
5. ✅ **Keyboard controls (WASD/Arrow keys) for player movement**
6. ✅ **Virtual joystick for mobile/tablet devices**
7. ✅ Click-to-move fallback navigation
8. ✅ Object interaction (examine, pickup, use)
9. ✅ **Proximity-based interaction hints ("Press E to interact")**
10. ✅ Shared inventory system with 6 slots
11. ✅ Text chat with quick-chat buttons

### Puzzles (8 Total)
**Original Puzzles:**
1. ✅ 4-digit Code Lock (clue in book) → Key Piece 1
2. ✅ 3-digit Safe combination (clue in painting) → Key Piece 2
3. ✅ 9-piece Jigsaw puzzle → Key Piece 3
4. ✅ UV Light reveal (hidden note message)

**New Escape Room Puzzles:**
5. ✅ **Grandfather Clock** - Set time to 3:15 (hint: "shadows meet at quarter past three")
6. ✅ **Book Cipher** - Decode "BENEATH RUG" using Page-Line-Word format
7. ✅ **Color Mix/Light Puzzle** - Combine Red+Blue+Yellow to create darkness
8. ✅ **Sliding Puzzle** - Arrange tiles 1-8 in order to open puzzle box

### Game Objects (17 Total)
- Bookshelf with Old Book (code lock clue)
- Painting (safe combination clue)
- Desk with locked Drawer (code lock puzzle)
- Wall Safe (combination puzzle)
- Puzzle Table (jigsaw puzzle)
- UV Lamp (pickable item)
- Note (hidden UV message)
- Exit Door (final escape)
- Chair
- Rug (decorative)
- **Grandfather Clock** (clock puzzle)
- **Cipher Book** (book cipher puzzle)
- **Light Panel** (color mix puzzle)
- **Puzzle Box/Slider** (sliding puzzle)
- **Fireplace** (with animated fire, provides clock hint)

### UI/UX
- Dark Academia Noir theme (gold accents on dark background)
- Playfair Display headings, Manrope body text
- Glassmorphism effects for panels
- Responsive design for mobile/tablet
- Touch-friendly controls with virtual joystick
- Keyboard shortcuts displayed in UI

## Player Controls

### Desktop
- **W/↑** - Move up
- **S/↓** - Move down
- **A/←** - Move left
- **D/→** - Move right
- **E/Space** - Interact with nearby object
- **Click** - Move to location or interact with object

### Mobile/Tablet
- **Virtual Joystick** - Touch and drag to move
- **Tap** - Interact with objects

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
│   │   ├── GameCanvas.jsx     # Canvas rendering + keyboard controls
│   │   ├── VirtualJoystick.jsx # Mobile touch joystick
│   │   ├── Inventory.jsx      # Item slots
│   │   └── ChatPanel.jsx      # Team chat
│   ├── puzzles/
│   │   ├── CodeLockModal.jsx  # 4-digit code
│   │   ├── SafeModal.jsx      # 3-dial combination
│   │   ├── JigsawModal.jsx    # 9-piece puzzle
│   │   ├── UVLightModal.jsx   # UV reveal
│   │   ├── ClockModal.jsx     # Time-setting puzzle
│   │   ├── BookCipherModal.jsx # Decode message
│   │   ├── ColorMixModal.jsx  # Light mixing
│   │   └── SliderPuzzleModal.jsx # Sliding tiles
│   └── WinModal.jsx       # Victory screen
└── components/ui/         # Shadcn components
```

## Next Action Items

### Enhancements
1. Add player sprite animations (walking, idle)
2. Add sound effects (footsteps, puzzle clicks, door creak)
3. Add background ambient music
4. Add time-based scoring/leaderboard
5. Add room persistence (save/resume game)
6. Add spectator mode for finished players

### Additional Puzzles (Ideas)
1. Mirror reflection puzzle
2. Musical notes sequence (piano keys)
3. Bookshelf book order puzzle
4. Weight/balance scale puzzle

## How to Play

1. **Create or Join**: Host creates a room and shares the link with friends
2. **Wait in Lobby**: See connected players, host clicks "Start Game"
3. **Move Around**: Use WASD/Arrows on desktop, joystick on mobile
4. **Explore**: Walk near objects, press E (or tap) to interact
5. **Find Clues**: 
   - Read the old book for the drawer code
   - Look behind the painting for the safe combination
   - Check fireplace for clock hint ("quarter past three")
   - Pick up the UV lamp and use it on the note
6. **Solve Puzzles**: Complete all puzzles to collect 3 key pieces
7. **Combine Keys**: Click "Combine Keys" when you have all 3 pieces
8. **Escape**: Use the master key on the exit door to win!

## Deployment Notes

- Backend runs on port 8001 (via supervisor)
- Frontend runs on port 3000 (via supervisor)
- Socket.IO uses path `/api/socket.io` for Kubernetes ingress compatibility
- All API routes prefixed with `/api`
- Environment variables in .env files (not hardcoded)
