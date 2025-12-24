import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import LandingPage from "./pages/LandingPage";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";
import "./App.css";

function App() {
  return (
    <div className="App min-h-screen bg-[#0a0a0a]">
      <div className="grain-overlay" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/room/:roomId" element={<LobbyPage />} />
          <Route path="/game/:roomId" element={<GamePage />} />
        </Routes>
      </BrowserRouter>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#141414',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            color: '#e5e5e5',
          },
        }}
      />
    </div>
  );
}

export default App;
