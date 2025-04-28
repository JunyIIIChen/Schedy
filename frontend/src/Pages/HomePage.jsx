// src/Pages/HomePage.jsx
import React, {useEffect, useState} from 'react';
import {LinkGenerator} from '../Component/LinkGenerator/LinkGenerator.jsx';
import {AIChat} from '../Component/AIChat/AIChat.jsx';
import {Copy} from 'lucide-react';
import './CSS/HomePage.css';
import { QRCodeSVG } from 'qrcode.react';

export const HomePage = () => {
    const [generatedLink, setGeneratedLink] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

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
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%'
                                }}>
                                    <QRCodeSVG
                                        value={generatedLink}
                                        size={1024}
                                        level="H"
                                        includeMargin={true}
                                    />
                                    <p style={{marginTop: '10px', fontSize: '14px'}}>Scan to share</p>
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
