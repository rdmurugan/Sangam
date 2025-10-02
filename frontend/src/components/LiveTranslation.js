import React, { useState, useEffect, useRef } from 'react';
import '../styles/LiveTranslation.css';

// SVG Icons
const TranslateIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const LiveTranslation = ({ socket, roomId, userName }) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [subtitles, setSubtitles] = useState([]);
  const [recognition, setRecognition] = useState(null);
  const subtitlesEndRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
    { code: 'pl', name: 'Polish', flag: '🇵🇱' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷' }
  ];

  useEffect(() => {
    if (!socket) return;

    // Listen for translated subtitles from other participants
    socket.on('subtitle-received', ({ userName, text, language, timestamp }) => {
      setSubtitles(prev => {
        const updated = [...prev, { userName, text, language, timestamp, id: Date.now() }];
        // Keep only last 50 subtitles
        return updated.slice(-50);
      });
    });

    return () => {
      socket.off('subtitle-received');
    };
  }, [socket]);

  useEffect(() => {
    // Auto-scroll to bottom when new subtitles arrive
    subtitlesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [subtitles]);

  // Initialize speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = selectedLanguage || 'en-US';

    recognitionInstance.onresult = async (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');

      if (event.results[0].isFinal) {
        // Send transcript to be translated and broadcasted
        translateAndBroadcast(transcript, selectedLanguage);
      }
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Restart recognition
        if (isTranslating) {
          recognitionInstance.start();
        }
      }
    };

    recognitionInstance.onend = () => {
      if (isTranslating) {
        // Restart if still translating
        recognitionInstance.start();
      }
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [selectedLanguage]);

  const translateAndBroadcast = async (text, sourceLang) => {
    if (!text.trim()) return;

    // For now, broadcast the original text
    // In production, integrate with Google Translate API or similar
    socket?.emit('send-subtitle', {
      roomId,
      userName,
      text,
      language: sourceLang,
      timestamp: Date.now()
    });

    // Add to local subtitles
    setSubtitles(prev => {
      const updated = [...prev, {
        userName,
        text,
        language: sourceLang,
        timestamp: Date.now(),
        id: Date.now(),
        isLocal: true
      }];
      return updated.slice(-50);
    });
  };

  const toggleTranslation = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isTranslating) {
      recognition.stop();
      setIsTranslating(false);
    } else {
      recognition.lang = getLangCode(selectedLanguage);
      recognition.start();
      setIsTranslating(true);
    }
  };

  const getLangCode = (code) => {
    const langMap = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-PT',
      'zh': 'zh-CN',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'ar': 'ar-SA',
      'hi': 'hi-IN',
      'ru': 'ru-RU',
      'nl': 'nl-NL',
      'pl': 'pl-PL',
      'tr': 'tr-TR'
    };
    return langMap[code] || 'en-US';
  };

  const clearSubtitles = () => {
    setSubtitles([]);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="translation-container">
      <div className="translation-header">
        <h3>
          <TranslateIcon />
          <span>Live Translation</span>
        </h3>
        <button
          className={`translation-toggle ${isTranslating ? 'active' : ''}`}
          onClick={toggleTranslation}
          title={isTranslating ? 'Stop Translation' : 'Start Translation'}
        >
          {isTranslating ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="translation-controls">
        <div className="language-selector">
          <label>Your Language</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="language-select"
            disabled={isTranslating}
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        {isTranslating && (
          <div className="recording-indicator">
            <span className="recording-dot"></span>
            <span className="recording-text">Listening...</span>
          </div>
        )}
      </div>

      <div className="subtitles-container">
        <div className="subtitles-header">
          <span>Live Captions</span>
          {subtitles.length > 0 && (
            <button className="clear-subtitles-btn" onClick={clearSubtitles}>
              <CloseIcon />
            </button>
          )}
        </div>

        <div className="subtitles-list">
          {subtitles.length === 0 ? (
            <div className="subtitles-empty">
              <TranslateIcon />
              <p>No captions yet</p>
              <p className="subtitles-hint">Start translation to see live captions</p>
            </div>
          ) : (
            subtitles.map((subtitle) => (
              <div
                key={subtitle.id}
                className={`subtitle-item ${subtitle.isLocal ? 'local' : ''}`}
              >
                <div className="subtitle-meta">
                  <span className="subtitle-user">{subtitle.userName}</span>
                  <span className="subtitle-time">{formatTime(subtitle.timestamp)}</span>
                </div>
                <div className="subtitle-text">{subtitle.text}</div>
              </div>
            ))
          )}
          <div ref={subtitlesEndRef} />
        </div>
      </div>

      <div className="translation-note">
        <p>💡 Using Web Speech API for real-time captioning</p>
        <p className="note-hint">Translation requires Chrome, Edge, or Safari browser</p>
      </div>
    </div>
  );
};

export default LiveTranslation;
