# 🔐 The Locked Study - Multiplayer Escape Room Game

A lightweight, web-based multiplayer escape room game that runs in the browser. Play with 2-4 friends by sharing a simple link!

![Game Preview](https://img.shields.io/badge/Players-2--4-gold) ![Platform](https://img.shields.io/badge/Platform-Web-blue) ![Mobile](https://img.shields.io/badge/Mobile-Friendly-green)

## 🎮 Features

- **Real-time Multiplayer**: 2-4 players in the same room via WebSocket
- **8 Unique Puzzles**: Code locks, safes, jigsaw, UV light, clock, cipher, color mixing, slider
- **Cross-Platform**: Works on desktop, mobile (Android/iOS), and tablets
- **Touch & Keyboard Controls**: WASD/arrows + virtual joystick for mobile
- **Team Chat**: Text chat with quick-chat buttons
- **Shareable Links**: Create a room and share the link with friends

## 🚀 Quick Start

### Option 1: Docker (Recommended)

The easiest way to run the game locally:

```bash
# Clone the repository
git clone <your-repo-url>
cd the-locked-study

# Start with Docker Compose
docker-compose up --build

# Open in browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:8001/api
```

To stop:
```bash
docker-compose down
```

### Option 2: Manual Installation

#### Prerequisites

- **Node.js** 18+ (https://nodejs.org/)
- **Python** 3.9+ (https://python.org/)
- **MongoDB** 4.4+ (https://mongodb.com/) or use MongoDB Atlas (free tier)
- **Yarn** package manager (`npm install -g yarn`)

#### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and set your MONGO_URL

# Start the server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

#### Frontend Setup

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
yarn install

# Create .env file
cp .env.example .env
# Edit .env if needed (default: http://localhost:8001)

# Start the development server
yarn start
```

#### Access the Game

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001/api

## 🎯 How to Play

1. **Create a Room**: Click "Create Room" and enter your name
2. **Share the Link**: Copy the room link and send it to friends
3. **Start the Game**: Once all players joined, host clicks "Start Game"
4. **Explore**: Move around using WASD/arrows (or joystick on mobile)
5. **Interact**: Press E or click on objects to examine/use them
6. **Solve Puzzles**: Find clues and solve 8 puzzles to collect key pieces
7. **Escape**: Combine 3 key pieces into a master key and unlock the door!

### Controls

| Platform | Movement | Interact |
|----------|----------|----------|
| Desktop | WASD or Arrow Keys | E or Space or Click |
| Mobile | Virtual Joystick | Tap on objects |

## 🧩 Puzzles

| Puzzle | Location | Hint |
|--------|----------|------|
| Code Lock | Drawer | Check the old book |
| Safe | Wall | Look behind the painting |
| Jigsaw | Puzzle Table | Complete the 9-piece puzzle |
| UV Light | Note | Pick up UV lamp first |
| Clock | Grandfather Clock | "Shadows meet at quarter past three" |
| Cipher | Desk Book | Page-Line-Word format |
| Color Mix | Light Panel | "All primary colors create darkness" |
| Slider | Puzzle Box | Arrange tiles 1-8 in order |

## 🏗️ Project Structure

```
the-locked-study/
├── backend/
│   ├── server.py          # FastAPI + Socket.IO server
│   ├── requirements.txt   # Python dependencies
│   ├── Dockerfile         # Backend Docker config
│   └── .env.example       # Environment template
├── frontend/
│   ├── src/
│   │   ├── pages/         # React pages
│   │   ├── components/    # UI components
│   │   └── App.js         # Main app
│   ├── package.json       # Node dependencies
│   ├── Dockerfile         # Frontend Docker config
│   └── .env.example       # Environment template
├── docker-compose.yml     # Docker orchestration
└── README.md              # This file
```

## 🛠️ Tech Stack

- **Frontend**: React 19, HTML5 Canvas, Tailwind CSS, Socket.IO Client
- **Backend**: FastAPI, Python-SocketIO, Motor (MongoDB async)
- **Database**: MongoDB
- **Real-time**: WebSocket via Socket.IO

## 🌐 Deployment

### Deploy to Cloud (Production)

1. **Backend**: Deploy to any platform supporting Python (Railway, Render, Fly.io, AWS)
2. **Frontend**: Deploy to Vercel, Netlify, or any static host
3. **Database**: Use MongoDB Atlas (free tier available)

### Environment Variables

**Backend (.env)**:
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=escape_room
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

**Frontend (.env)**:
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-puzzle`)
3. Commit your changes (`git commit -m 'Add amazing puzzle'`)
4. Push to the branch (`git push origin feature/amazing-puzzle`)
5. Open a Pull Request

## 📝 License

MIT License - feel free to use this for your own projects!

## 🎉 Credits

Built with ❤️ for escape room enthusiasts everywhere.
