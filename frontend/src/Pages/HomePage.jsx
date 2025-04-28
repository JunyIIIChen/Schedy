// src/Pages/HomePage.jsx
import React, {useEffect, useState} from 'react';
import {LinkGenerator} from '../Component/LinkGenerator/LinkGenerator.jsx';
import {AIChat} from '../Component/AIChat/AIChat.jsx';
import {Copy} from 'lucide-react';
import './CSS/HomePage.css';
import {QRCodeSVG} from 'qrcode.react';
import {useRef} from "react";
import dl_icon from "../Component/Assets/download.png";

export const HomePage = () => {
    const [generatedLink, setGeneratedLink] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    const qrRef = useRef(null);

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

            // 创建一个a标签进行下载
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
        }
    }, []);

    const handleScheduleGenerated = (id) => {
        const link = `${window.location.origin}/availability?sid=${id}`;
        setGeneratedLink(link);
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
                                            <Copy size={20}/>
                                        </button>
                                    </div>
                                    {copySuccess && <p className="copy-success">Copied!</p>}
                                </>
                            )}
                        </div>
                        <div className="link-section link-button">
                            {generatedLink && (
                                <div
                                    ref={qrRef}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                    }}
                                >
                                    <QRCodeSVG
                                        value={generatedLink}
                                        size={300}
                                        level="H"
                                        includeMargin={true}
                                    />
                                    <button
                                        onClick={handleDownload}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            padding: 0,
                                            margin: 0,
                                            font: 'inherit',
                                            color: 'inherit',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <img src={dl_icon} alt="AI" className="dl_icon"/ >
                                        <span>Download</span>
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="generate-button-wrapper-home">
                            <LinkGenerator onScheduleGenerated={handleScheduleGenerated}/>
                        </div>
                    </div>
                    <div className="sidebar-section bottom-section">
                        {/* Content for the bottom left section */}
                    </div>
                </div>

                <AIChat/>
            </div>
        </div>
    );
};

export default HomePage;
