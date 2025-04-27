// src/Pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { LinkGenerator } from '../Component/LinkGenerator/LinkGenerator.jsx';
import { AIChat } from '../Component/AIChat/AIChat.jsx';
import { Copy } from 'lucide-react';
import './CSS/HomePage.css';

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

      {/* 生成按钮 */}
      <div className="generate-button-wrapper-home">
        <LinkGenerator onScheduleGenerated={handleScheduleGenerated} />
      </div>

      {/* 生成后的链接显示 */}
      {generatedLink && (
        <div className="glass-box generated-link-box">
          <div className="link-content">
            <div>
              <p>Share this link with your employees:</p>
              <a href={generatedLink} target="_blank" rel="noreferrer">
                {generatedLink}
              </a>
            </div>
            <button className="copy-button" onClick={handleCopyLink}>
              <Copy size={20} />
            </button>
          </div>
          {copySuccess && <p className="copy-success">Copied!</p>}
        </div>
      )}

      {/* 聊天界面 */}
      <AIChat />

    </div>
  );
};

export default HomePage;
