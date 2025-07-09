import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Mic, MicOff, Volume2 } from 'lucide-react';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #000000, #1e3a8a, #581c87)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Arial, sans-serif'
  },
  star: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: '50%',
    animation: 'pulse 2s infinite'
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '128px',
    background: 'linear-gradient(to top, #166534, #16a34a)'
  },
  launchPad: {
    position: 'absolute',
    bottom: '160px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '80px',
    height: '32px',
    backgroundColor: '#9ca3af',
    borderRadius: '8px 8px 0 0'
  },
  rocket: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    transition: 'all 1s ease-in-out',
    cursor: 'pointer',
    fontSize: '80px',
    color: '#ef4444'
  },
  flame: {
    position: 'absolute',
    top: '64px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '32px',
    height: '64px',
    background: 'linear-gradient(to top, #f97316, #eab308, #ef4444)',
    animation: 'pulse 0.5s infinite'
  },
  controlPanel: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '24px',
    borderRadius: '8px',
    maxWidth: '384px'
  },
  voicePanel: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '24px',
    borderRadius: '8px',
    maxWidth: '384px'
  },
  button: {
    width: '100%',
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  buttonBlue: {
    backgroundColor: '#2563eb',
    color: 'white'
  },
  buttonGreen: {
    backgroundColor: '#16a34a',
    color: 'white'
  },
  buttonRed: {
    backgroundColor: '#dc2626',
    color: 'white'
  },
  countdown: {
    color: '#f87171',
    fontSize: '32px',
    fontFamily: 'monospace'
  },
  instructions: {
    position: 'absolute',
    bottom: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: 'white',
    textAlign: 'center'
  }
};

const SpaceLaunchSimulator = () => {
  const [isLaunched, setIsLaunched] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    // Check if speech recognition is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setVoiceSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript.toLowerCase();
        setTranscript(transcript);
        
        if (event.results[current].isFinal) {
          handleVoiceCommand(transcript);
        }
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speak = (text) => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      synthRef.current.speak(utterance);
    }
  };

  const handleVoiceCommand = (command) => {
    setLastCommand(command);
    
    if (command.includes('launch') || command.includes('blast off') || command.includes('take off')) {
      if (!isLaunched && countdown === 0) {
        speak('Initiating launch sequence');
        startCountdown();
      } else if (isLaunched) {
        speak('Rocket has already been launched');
      } else {
        speak('Launch sequence already in progress');
      }
    } else if (command.includes('reset') || command.includes('restart')) {
      handleReset();
      speak('Mission reset. Ready for launch');
    } else if (command.includes('status') || command.includes('report')) {
      if (isLaunched) {
        speak('Mission successful. Rocket is in orbit');
      } else if (countdown > 0) {
        speak(`Launch sequence in progress. T minus ${countdown} seconds`);
      } else {
        speak('Rocket is ready for launch. Say launch to begin countdown');
      }
    } else {
      speak('Command not recognized. Try saying launch, reset, or status');
    }
  };

  const toggleListening = () => {
    if (!voiceSupported) {
      alert('Voice recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const startCountdown = () => {
    setCountdown(10);
    speak('T minus 10');
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsLaunched(true);
          speak('Liftoff! We have liftoff!');
          return 0;
        }
        if (prev <= 5) {
          speak(prev - 1);
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRocketClick = () => {
    if (isLaunched || countdown > 0) return;
    
    speak('Launch sequence initiated');
    startCountdown();
  };

  const handleReset = () => {
    setIsLaunched(false);
    setCountdown(0);
    setTranscript('');
    setLastCommand('');
  };

  return (
    <div style={styles.container}>
      {/* Stars */}
      <div style={{position: 'absolute', inset: 0}}>
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.star,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Ground */}
      <div style={styles.ground} />

      {/* Launch Pad */}
      <div style={styles.launchPad} />

      {/* Rocket */}
      <div
        style={{
          ...styles.rocket,
          bottom: isLaunched ? '600px' : '192px',
          transform: isLaunched ? 'translateX(-50%) rotate(360deg)' : 'translateX(-50%)'
        }}
        onClick={handleRocketClick}
      >
        🚀
        {isLaunched && (
          <div style={styles.flame} />
        )}
      </div>

      {/* Mission Control Panel */}
      <div style={styles.controlPanel}>
        <h2 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Rocket size={20} />
          Mission Control
        </h2>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
          <div>
            <strong>Status:</strong> {
              isLaunched ? 'In Orbit' : 
              countdown > 0 ? `T-${countdown}` : 
              'Ready for Launch'
            }
          </div>
          
          {countdown > 0 && (
            <div style={styles.countdown}>
              T-{countdown}
            </div>
          )}
          
          <button
            onClick={handleReset}
            style={{...styles.button, ...styles.buttonBlue}}
            disabled={countdown > 0}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            Reset Mission
          </button>
        </div>
      </div>

      {/* Voice Control Panel */}
      <div style={styles.voicePanel}>
        <h2 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Volume2 size={20} />
          Voice Agent
        </h2>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
          <button
            onClick={toggleListening}
            style={{
              ...styles.button,
              ...(isListening ? styles.buttonRed : styles.buttonGreen)
            }}
            disabled={!voiceSupported}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = isListening ? '#b91c1c' : '#15803d';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = isListening ? '#dc2626' : '#16a34a';
            }}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            {isListening ? 'Stop Listening' : 'Start Voice Control'}
          </button>
          
          {!voiceSupported && (
            <p style={{color: '#facc15', fontSize: '14px'}}>Voice not supported</p>
          )}
          
          {transcript && (
            <div style={{fontSize: '14px'}}>
              <strong>Hearing:</strong> {transcript}
            </div>
          )}
          
          {lastCommand && (
            <div style={{fontSize: '14px', color: '#4ade80'}}>
              <strong>Last Command:</strong> {lastCommand}
            </div>
          )}
          
          <div style={{fontSize: '12px', color: '#9ca3af'}}>
            <p><strong>Voice Commands:</strong></p>
            <p>• "Launch" - Start countdown</p>
            <p>• "Reset" - Reset mission</p>
            <p>• "Status" - Mission report</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={styles.instructions}>
        <p style={{fontSize: '18px', marginBottom: '8px'}}>Click the rocket or use voice commands to launch!</p>
        <p style={{fontSize: '14px', opacity: 0.75}}>Voice Agent powered by Web Speech API</p>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default SpaceLaunchSimulator;