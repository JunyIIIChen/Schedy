// src/Component/AIChat/AIChat.jsx
import React, { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import animationData from '../Assets/Frame-2087326994.json';
import { Send } from 'lucide-react';
import './AIChat.css';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

export const AIChat = () => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Tell me your requirement on scheduling' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const scheduleId = localStorage.getItem('schedule-id');
    if (!scheduleId) {
      alert('No schedule ID found. Please generate a link first.');
      return;
    }
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5001/api/schedule-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule_id: scheduleId,
          message: input,
        }),
      });

      const data = await res.json();
      const fullText = data.response || '🤖 No response.';
      const aiMsg = { sender: 'ai', text: '' };
      setMessages((prev) => [...prev, aiMsg]);

      let i = 0;
      typingIntervalRef.current = setInterval(() => {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last.sender === 'ai') {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...last,
              text: fullText.slice(0, i + 1),
            };
            return updated;
          }
          return prev;
        });
        i++;
        if (i >= fullText.length) {
          clearInterval(typingIntervalRef.current);
          setLoading(false);
        }
      }, 20);

    } catch (err) {
      console.error('Request error:', err);
      setMessages((prev) => [...prev, { sender: 'ai', text: '❌ Error, please try again.' }]);
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleViewCalendar = () => {
    navigate('/calendar?action=new_schedule');
  };

  return (
    <div className="ai-chat-wrapper">
      <div className="ai-chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className="ai-message-box">
            {msg.sender === 'ai' && (
              <div className="avatar-wrapper">
                <Lottie animationData={animationData} loop={true} className="avatar" />
              </div>
            )}
            <div className="message-content">
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="ai-message-box">
            <div className="avatar-wrapper">
              <Lottie animationData={animationData} loop={true} className="avatar" />
            </div>
            <div className="message-content">AI is typing...</div>
          </div>
        )}
        <div ref={messagesEndRef}></div>
      </div>

      <div className="ai-chat-input-area">
        <input
          type="text"
          className="ai-chat-input"
          placeholder="✨ Please Input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className={`send-button ${loading ? 'sending' : ''}`} 
          onClick={sendMessage}
          disabled={loading}
        >
          <Send size={20} />
        </button>
      </div>

      <button onClick={handleViewCalendar} className="view-calendar-button">
        📅 View Your Calendar
      </button>
    </div>
  );
};

export default AIChat;
