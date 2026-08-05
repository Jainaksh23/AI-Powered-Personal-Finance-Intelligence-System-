import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Send, Sparkles, Bot, UserCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { voiceAPI } from '../api';

export const VoiceCopilotModal = ({ isOpen, onClose, onRefreshData }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'assistant', text: "Hello! I am your AI Voice Copilot. Speak or type any command to log transactions, check budgets, or query analytics!" }
  ]);
  const [processing, setProcessing] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);
      };

      rec.onend = () => {
        setListening(false);
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  const speakText = (text) => {
    if (speechEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleListen = () => {
    if (!recognition) {
      alert("Browser Speech Recognition is not supported on this browser. You can type commands below!");
      return;
    }

    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      setTranscript('');
      recognition.start();
      setListening(true);
    }
  };

  const handleProcessCommand = async (cmdText) => {
    const textToSend = cmdText || transcript;
    if (!textToSend.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    setTranscript('');
    setProcessing(true);

    try {
      const res = await voiceAPI.processCommand(textToSend);
      const data = res.data;
      const spokenText = data.spoken_response;

      setMessages(prev => [...prev, { sender: 'assistant', text: spokenText, details: data }]);
      speakText(spokenText);

      if (onRefreshData && (data.action_taken === 'EXPENSE_LOGGED' || data.action_taken === 'INCOME_LOGGED')) {
        onRefreshData();
      }
    } catch (err) {
      const errTxt = "Sorry, I encountered an error processing your voice command. Please try again.";
      setMessages(prev => [...prev, { sender: 'assistant', text: errTxt }]);
      speakText(errTxt);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '580px', height: '620px', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        
        {/* Modal Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6, 182, 212, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #06b6d4, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: '#f3f4f6' }}>AI Voice Copilot</h3>
              <div style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: '600' }}>Conversational Financial Assistant</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setSpeechEnabled(!speechEnabled)}
              style={{ background: 'none', border: 'none', color: speechEnabled ? '#06b6d4' : '#6b7280', cursor: 'pointer', padding: '6px' }}
              title={speechEnabled ? "Mute Spoken Feedback" : "Enable Spoken Feedback"}
            >
              {speechEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '6px' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Chat History Box */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '82%',
                padding: '12px 16px',
                borderRadius: m.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                background: m.sender === 'user' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'rgba(255,255,255,0.06)',
                border: m.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                color: '#fff',
                fontSize: '0.88rem',
                lineHeight: '1.5'
              }}>
                {m.text}
              </div>
            </div>
          ))}
          {processing && (
            <div style={{ color: '#06b6d4', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} className="animate-spin" /> Processing AI Copilot command...
            </div>
          )}
        </div>

        {/* Quick Voice Preset Chips */}
        <div style={{ padding: '8px 16px', display: 'flex', gap: '8px', overflowX: 'auto', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
            onClick={() => handleProcessCommand("I spent 450 rupees at Starbucks on Coffee via UPI")}
          >
            ☕ Starbucks ₹450
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
            onClick={() => handleProcessCommand("What is my remaining food budget?")}
          >
            🍔 Food Budget?
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
            onClick={() => handleProcessCommand("How much did I spend this month?")}
          >
            📊 Monthly Spend?
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
            onClick={() => handleProcessCommand("Show fraud alerts")}
          >
            🛡 Check Fraud
          </button>
        </div>

        {/* Input Bar with Mic Control */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* Listening Pulsing Mic Button */}
          <button
            type="button"
            onClick={handleToggleListen}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              border: 'none',
              background: listening ? 'linear-gradient(135deg, #f43f5e, #fb7185)' : 'linear-gradient(135deg, #06b6d4, #6366f1)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: listening ? '0 0 18px rgba(244, 63, 94, 0.8)' : '0 4px 14px rgba(6, 182, 212, 0.4)',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            title={listening ? "Listening... Click to stop" : "Click to Speak Voice Command"}
          >
            {listening ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          <input
            type="text"
            className="input-field"
            placeholder={listening ? "Listening to your voice..." : "Type or speak command (e.g. Spent 350 at Domino's)..."}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleProcessCommand(); }}
            style={{ flex: 1, padding: '10px 14px', fontSize: '0.88rem' }}
          />

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleProcessCommand()}
            disabled={!transcript.trim() || processing}
            style={{ padding: '10px 14px' }}
          >
            <Send size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};
