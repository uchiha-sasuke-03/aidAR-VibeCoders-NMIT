import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User } from 'lucide-react';
import { chatWithTwin } from '../services/api';

export default function ChatPanel({ patient }) {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: patient
        ? `Hello! I'm your AI health assistant. I have access to ${patient.name}'s digital twin data. Ask me anything about their health, vitals, risk factors, or treatment options.`
        : `Hello! I'm your AI health assistant. Register a patient first so I can access their digital twin data — or ask me any general health question!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const pid = patient?.patient_id || patient?.id || 'unknown';
      const res = await chatWithTwin(pid, userMsg);
      setMessages(prev => [...prev, { role: 'ai', content: res.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: `Sorry, I encountered an error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>AI Health Assistant</h2>
        <p>
          Chat with GPT about {patient ? <strong>{patient.name}'s</strong> : 'your'} health data, risk factors, and treatment options.
        </p>
      </div>

      <div className="card chat-container">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.role}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>
                {msg.role === 'ai' ? <Bot size={14} /> : <User size={14} />}
                {msg.role === 'ai' ? 'HealthTwin AI' : 'You'}
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
            </div>
          ))}

          {loading && (
            <div className="chat-msg ai">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>
                <Bot size={14} /> HealthTwin AI
              </div>
              <div style={{ display: 'flex', gap: 4, padding: '8px 0' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-blue)', animation: 'pulse 1s infinite' }}></span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-cyan)', animation: 'pulse 1s infinite 0.2s' }}></span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-teal)', animation: 'pulse 1s infinite 0.4s' }}></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-bar">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={patient ? `Ask about ${patient.name}'s health...` : 'Ask a health question...'}
            disabled={loading}
          />
          <button className="btn btn-primary" onClick={handleSend} disabled={loading || !input.trim()}>
            <Send size={16} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
