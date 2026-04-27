import { useState, useRef, useEffect } from 'react';
import useAssistant, { QUICK_PROMPTS } from '../store/useAssistant';
import useExpenses from '../store/useExpenses';
import useProfile from '../store/useProfile';
import { isAIConfigured } from '../lib/openrouter';

function TypingIndicator() {
  return (
    <div className="chat-bubble assistant" style={{ display: 'flex', gap: 6, padding: '16px 20px' }}>
      <span className="typing-dots"><span>●</span><span>●</span><span>●</span></span>
    </div>
  );
}

export default function AIAssistant({ embedded = false }) {
  const { messages, isLoading, error, sendMessage, clearChat } = useAssistant();
  const profile = useProfile();
  const expenses = useExpenses();
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');
    const expenseData = expenses.getAssistantContext(profile.monthlyIncome);
    await sendMessage(text, profile, expenseData);
  };

  const handleQuickPrompt = (text) => {
    setInput('');
    const expenseData = expenses.getAssistantContext(profile.monthlyIncome);
    sendMessage(text, profile, expenseData);
  };

  const hasExpenses = expenses.expenses.length > 0;
  const modeLabel = profile.aiCoachMode === 'roast' ? 'Roast mode 🔥' : 'Kind mode 🤍';

  const containerHeight = embedded ? 'min(70vh, 600px)' : 'calc(100vh - 180px)';

  if (!isAIConfigured()) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🤖</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>AI Coach</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Configure your OpenRouter API key in .env to enable the AI finance coach
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', height: containerHeight }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingTop: embedded ? 8 : 0 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 900 }}>🤖 AI Finance Coach</h2>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, background: '#F3F4F6', padding: '2px 10px', borderRadius: 99 }}>
            Coach · {modeLabel}
          </span>
        </div>
        {messages.length > 0 && (
          <button className="btn-ghost" onClick={clearChat} style={{ fontSize: 12 }}>🗑️ Clear</button>
        )}
      </div>

      {/* Chat Area */}
      <div className="card" style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            <div style={{ fontSize: 48 }}>💬</div>
            <div style={{ textAlign: 'center' }}>
              {!hasExpenses ? (
                <>
                  <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Hey! I'm your money coach.</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 300 }}>
                    Log a few expenses first and I'll give you personalized advice. Until then, ask me anything general.
                  </p>
                </>
              ) : (
                <>
                  <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Ask me anything about your money</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>I analyze your real spending data for personalized advice</p>
                </>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 400 }}>
              {QUICK_PROMPTS.map((p) => (
                <button key={p.text} className="btn-secondary" onClick={() => handleQuickPrompt(p.text)} style={{ fontSize: 12, padding: '8px 14px' }}>
                  {p.icon} {p.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div className={`chat-bubble ${msg.role === 'user' ? 'user' : 'assistant'} fade-in`}>
                  {msg.role === 'assistant' ? <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div> : msg.content}
                </div>
              </div>
            ))}
            {isLoading && <div style={{ display: 'flex' }}><TypingIndicator /></div>}
            {error && <div className="insight-card danger" style={{ fontSize: 13 }}>⚠️ {error}</div>}
            <div ref={chatEndRef} />
          </>
        )}
      </div>

      {/* Quick prompts (when chat active) */}
      {messages.length > 0 && !isLoading && (
        <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 10, paddingBottom: 4 }}>
          {QUICK_PROMPTS.slice(0, 4).map((p) => (
            <button key={p.text} className="btn-secondary" onClick={() => handleQuickPrompt(p.text)} style={{ fontSize: 11, padding: '6px 12px', flexShrink: 0 }}>
              {p.icon} {p.text}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          ref={inputRef}
          className="input-field"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about your money..."
          disabled={isLoading}
          style={{ flex: 1 }}
        />
        <button className="btn-primary" onClick={handleSend} disabled={isLoading || !input.trim()} style={{ padding: '12px 20px', opacity: input.trim() ? 1 : 0.5 }}>↑</button>
      </div>
    </div>
  );
}
