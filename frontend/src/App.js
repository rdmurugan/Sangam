import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Room from './components/Room';
import Privacy from './pages/Privacy';
import InstallPWA from './components/InstallPWA';
import './styles/App.css';
import './styles/MeetingConfig.css';
import './styles/Polls.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<Room />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
        <InstallPWA />
      </div>
    </Router>
  );
}

export default App;