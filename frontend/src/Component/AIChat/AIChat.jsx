import React, {useEffect, useRef, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import './AIChat.css';
import {useNavigate} from 'react-router-dom';

export const AIChat = ({scheduleId}) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [scheduleTable, setScheduleTable] = useState(null);
    const [calendarData, setCalendarData] = useState(null); // 📅 查看日历数据

    const messagesEndRef = useRef(null);
    const typingIntervalRef = useRef(null);

    const navigate = useNavigate();

    const handleViewCalendar = () => {
        navigate('/calendar?action=new_schedule'); // 跳转并传参
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = {sender: 'user', text: input};
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5001/api/schedule-agent', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    // schedule_id: scheduleId,
                    schedule_id: "8c8580f7-856e-4343-9025-3ba7946224fc",
                    message: input,
                }),
            });

            const data = await res.json();
            console.log('🧠 Agent 返回：', data);

            const fullText = data.response || '🤖 没有返回内容。';
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
                    setLoading(false);
                    if (data.schedule_data && Array.isArray(data.schedule_data)) {
                        setScheduleTable(data.schedule_data);
                    }
                }
            }, 20);
        } catch (err) {
            console.error('❌ 请求失败:', err);
            setMessages((prev) => [...prev, {sender: 'ai', text: '❌ 出错了，请稍后再试。'}]);
            setLoading(false);
        }
    };

    const viewCalendar = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/view-calendar', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({schedule_id: "8c8580f7-856e-4343-9025-3ba7946224fc"}),
            });

            const data = await res.json();
            console.log('📅 View Calendar 返回：', data);
            console.log('data.availabilities_count:', data.availabilities_count);

            if (data.calendar_json && Array.isArray(data.calendar_json)) {
                setCalendarData(data.calendar_json);
            } else {
                setCalendarData(null);
            }
        } catch (err) {
            console.error('查看排班失败:', err);
            setCalendarData(null);
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
            <div className="ai-chat-header">💬 AI 排班助手</div>

            <div className="ai-chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`ai-message ${msg.sender}`}>
                        <div className="ai-message-content">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                    </div>
                ))}
                {loading && <div className="ai-loading">AI 正在输入...</div>}
                <div ref={messagesEndRef}></div>
            </div>

            <textarea
                className="ai-chat-textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="告诉我排班需求或说‘开始排班’..."
                rows={3}
            />

            <button className="ai-chat-send-button" onClick={sendMessage} disabled={loading}>
                {loading ? '发送中...' : '发送'}
            </button>

            <button
                onClick={handleViewCalendar}
                className="ai-chat-send-button"
                style={{marginTop: '12px'}}
            >
                📅 View Your Calendar
            </button>

            {scheduleTable && (
                <div className="ai-schedule-table">
                    <h4>📅 当前对话生成的排班表</h4>
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>员工</th>
                            <th>邮箱</th>
                            <th>开始时间</th>
                            <th>结束时间</th>
                        </tr>
                        </thead>
                        <tbody>
                        {scheduleTable.map((row, idx) => (
                            <tr key={idx}>
                                <td>{row.id}</td>
                                <td>{row.name || row.employee}</td>
                                <td>{row.email}</td>
                                <td>{row.start}</td>
                                <td>{row.end}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {calendarData && (
                <div className="ai-schedule-table" style={{marginTop: '24px'}}>
                    <h4>📆 View Calendar（完整聊天分析后的最终表）</h4>
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>员工</th>
                            <th>邮箱</th>
                            <th>开始时间</th>
                            <th>结束时间</th>
                        </tr>
                        </thead>
                        <tbody>
                        {calendarData.map((row, idx) => (
                            <tr key={idx}>
                                <td>{row.id}</td>
                                <td>{row.name || row.employee}</td>
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
