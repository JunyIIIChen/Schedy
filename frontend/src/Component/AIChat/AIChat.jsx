import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './AIChat.css';

export const AIChat = ({ scheduleId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scheduleTable, setScheduleTable] = useState(null);

  const messagesEndRef = useRef(null);
  const typingIntervalRef = useRef(null);

  const triggerWords = ["start scheduling", "run schedule", "generate schedule", "开始排班"];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5001/api/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // schedule_id: scheduleId,
          schedule_id:"8c8580f7-856e-4343-9025-3ba7946224fc",
          message: input,
        }),
      });

      const data = await res.json();
      const fullText = data.response || '🤖 没有返回内容。';

      // 添加一个空的 AI 消息，准备逐字更新
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

      console.log('🧠 Agent Response:', data.response);

      // 🚀 如果返回了完整聊天记录，自动发起 /ask 请求
      const lowerInput = input.toLowerCase();
      const isTrigger = triggerWords.some(word => lowerInput.includes(word));

      if (isTrigger && data.chat_history) {
        const askRes = await fetch('http://localhost:5001/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schedule_id: scheduleId,
            chat_history: data.chat_history,
          }),
        });

        const askData = await askRes.json();
        console.log('📋 Schedule Result from /ask:', askData);

        if (askData.schedule_data) {
          try {
            const parsed = JSON.parse(askData.schedule_data);
            setScheduleTable(parsed);
          } catch (e) {
            console.warn('❗ 排班返回不是 JSON:', askData.schedule_data);
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: '❌ 出错了，请稍后再试。' }]);
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-header">💬 AI Scheduling Assistant</div>

      <div className="ai-chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`ai-message ${msg.sender}`}>
            <div className="ai-message-content">
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && <div className="ai-loading">AI is typing...</div>}
        <div ref={messagesEndRef}></div>
      </div>

      <textarea
        className="ai-chat-textarea"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask me about the schedule..."
        rows={3}
      />

      <button className="ai-chat-send-button" onClick={sendMessage} disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </button>

      {scheduleTable && (
        <div className="ai-schedule-table">
          <h4>📅 Final Schedule (Raw Format)</h4>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Email</th>
                <th>Start</th>
                <th>End</th>
              </tr>
            </thead>
            <tbody>
              {scheduleTable.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.start}</td>
                  <td>{row.end}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
