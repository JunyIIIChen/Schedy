// src/Component/AIChat/AIChat.jsx
import React, {useEffect, useRef, useState} from 'react';
import Lottie from 'lottie-react';
import animationData from '../Assets/Frame-2087326994.json';
import {Send} from 'lucide-react';
import './AIChat.css';
import {useNavigate} from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import ai_icon_yellow from "../Assets/yellowai.png";
import './AIChat.responsive.css';

export const AIChat = () => {
    const [messages, setMessages] = useState([
        {sender: 'ai', text: 'Tell me your requirement on scheduling'}
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const typingIntervalRef = useRef(null);
    const navigate = useNavigate();
    const [showSentMessage, setShowSentMessage] = useState(false);

    const sendMessage = async () => {
        if (loading || !input.trim()) return;  // 防止发送中重复触发

        const scheduleId = localStorage.getItem('schedule-id');
        if (!scheduleId) {
            alert('No schedule ID found. Please generate a link first.');
            return;
        }

        const userMsg = {sender: 'user', text: input};
        setMessages((prev) => [...prev, userMsg]);

        setLoading(true);  // 🔥 一进入就锁定loading，禁止后续发送
        const userInput = input; // 🔥 提前保存用户输入
        setInput('');  // 清空input框，防止误发送空白
        setShowSentMessage(true);
        console.log(setShowSentMessage)


        try {
            const res = await fetch('http://localhost:5001/api/schedule-agent', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    // schedule_id: "aa3c8d13-0ef8-4460-96c7-0e13d8bc2a88",
                    schedule_id: scheduleId,
                    message: userInput,  // 🔥 保证发送的是保存的输入，而不是被清空后的input
                }),
            });

            const data = await res.json();
            const fullText = data.response || '🤖 No response.';
            const aiMsg = {sender: 'ai', text: ''};
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
                    setLoading(false); // 🔥 回复打完了，才解锁发送
                }
            }, 20);


        } catch (err) {
            console.error('Request error:', err);
            setMessages((prev) => [...prev, {sender: 'ai', text: '❌ Error, please try again.'}]);
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
                                <Lottie animationData={animationData} loop={true} className="avatar"/>
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
                            <Lottie animationData={animationData} loop={true} className="avatar"/>
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
                    placeholder="✨ Please tell AI your additional requirement scheduling"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    className={`send-button ${loading ? 'sending' : ''}`}
                    onClick={sendMessage}
                    disabled={loading}
                >
                    <Send size={20}/>
                </button>
            </div>

            {showSentMessage && (
                <div className="instruction-message" style={{color: '#007BFF'}}>
                  Once finished filling your additional requirements, you
                   <br/>may input <strong>‘start scheduling’</strong> to check current schedule
                </div>
            )}


          <button
              className={`ai-finish-button ${messages.length > 1 ? 'finish' : 'generate'}`}
              onClick={handleViewCalendar}
          >
            <img src={ai_icon_yellow} alt="AI" className="ai_icon_yellow"/>
                <span>{messages.length <= 1 ? 'AI Generate' : 'Finish'}</span>
            </button>


        </div>
    );
};

export default AIChat;
