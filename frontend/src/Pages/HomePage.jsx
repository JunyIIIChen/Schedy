// src/Pages/HomePage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { LinkGenerator } from '../Component/LinkGenerator/LinkGenerator.jsx';
import { AIChat } from '../Component/AIChat/AIChat.jsx';
import { Copy } from 'lucide-react';
import './CSS/HomePage.css';
import { QRCodeSVG } from 'qrcode.react';
import dl_icon from "../Component/Assets/download.png";
import alarm_icon from "../Component/Assets/alarm_icon.png";

export const HomePage = () => {
    const [generatedLink, setGeneratedLink] = useState('');
    const [generatedTime, setGeneratedTime] = useState('');
    const [availabilityCount, setAvailabilityCount] = useState(0);
    const [copySuccess, setCopySuccess] = useState(false);
    const qrRef = useRef(null);
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

    const handleDownload = () => {
        const svg = qrRef.current.querySelector('svg');
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');

            const downloadLink = document.createElement('a');
            downloadLink.href = pngFile;
            downloadLink.download = 'qrcode.png';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    useEffect(() => {
        const scheduleId = localStorage.getItem('schedule-id');
        if (scheduleId) {
            const link = `${window.location.origin}/availability?sid=${scheduleId}`;
            setGeneratedLink(link);

            fetchScheduleTime(scheduleId);
            fetchAvailabilityCount(scheduleId);
        }
    }, []);

    const fetchAvailabilityCount = async (scheduleId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/availability-count/${scheduleId}`);
            const data = await res.json();
            if (data.count !== undefined) {
                setAvailabilityCount(data.count);
            }
        } catch (err) {
            console.error('Error fetching availability count:', err);
        }
    };

    const fetchScheduleTime = async (scheduleId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/schedule/${scheduleId}`);
            const data = await res.json();

            let ms;
            if (data.created_at?.$numberLong) {
                ms = Number(data.created_at.$numberLong);
            } else if (data.created_at?.$date?.$numberLong) {
                ms = Number(data.created_at.$date.$numberLong);
            } else if (data.created_at?.$date) {
                ms = Date.parse(data.created_at.$date);
            }
            if (!ms) return;

            const utcDate = new Date(ms);
            const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const local = new Date(utcDate.toLocaleString('en-US', { timeZone: userTZ }));

            if (local.getHours() < 4) local.setDate(local.getDate() - 1);

            const nice = local.toLocaleString('en-AU', {
                timeZone: userTZ,
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });

            setGeneratedTime(nice);
        } catch (err) {
            console.error('schedule time fetch error', err);
        }
    };

    const handleScheduleGenerated = (id) => {
        const link = `${window.location.origin}/availability?sid=${id}`;
        setGeneratedLink(link);
        fetchScheduleTime(id);
        fetchAvailabilityCount(id);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(generatedLink).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    return (
        <div className="home-container">
            <div className="ai-chat-container">
                <div className="left-sidebar">
                    <div className="sidebar-section top-section">
                        <h5>Work availability form link</h5>
                        <div className="link-section link-top">
                            {generatedLink && (
                                <>
                                    <div className="link-content">
                                        <div>
                                            <p>Share link with your employees:</p>
                                            <a href={generatedLink} target="_blank" rel="noreferrer">
                                                {generatedLink}
                                            </a>
                                        </div>
                                        <button className="copy-button" onClick={handleCopyLink}>
                                            <Copy size={20} />
                                        </button>
                                    </div>
                                    {copySuccess && <p className="copy-success">Copied!</p>}
                                </>
                            )}
                        </div>

                        <div className="link-section link-button" ref={qrRef}>
                            {generatedLink && (
                                <>
                                    <QRCodeSVG
                                        value={generatedLink}
                                        size={300}
                                        level="H"
                                        includeMargin={true}
                                    />
                                    <button className="download-button" onClick={handleDownload}>
                                        <img src={dl_icon} alt="Download" className="dl-icon" />
                                        <span>Download</span>
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="generate-button-wrapper-home">
                            <div className='generate-button'>
                            <LinkGenerator onScheduleGenerated={handleScheduleGenerated} />
                            </div>
                            
                        </div>

                        {generatedTime && (
                            <p className="generated-time">Link last generated at {generatedTime}.</p>
                        )}
                    </div>

                    <div className="sidebar-section bottom-section">
                        
                    {availabilityCount >= 0 && (
                        <div className="availability-info">
                            <div className="availability-line">
                                <img src={alarm_icon} alt="Alarm Icon" className="alarm-icon" />
                                <strong className="availability-count">{availabilityCount}</strong>
                                <span className="availability-text">
                                    {availabilityCount === 1 ? 'employee has' : 'employees have'} submitted their availabilities.
                                </span>
                            </div>
                            <div className="availability-subtext">
                                Chat with our agent to start your scheduling.
                            </div>
                        </div>
                    )}
                    </div>
                </div>

                <AIChat />
            </div>
        </div>
    );
};

export default HomePage;
