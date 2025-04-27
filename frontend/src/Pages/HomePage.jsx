import React, { useEffect, useState } from 'react';
import { LinkGenerator } from './../Component/LinkGenerator/LinkGenerator.jsx';
import { AIChat } from '../Component/AIChat/AIChat.jsx';
import { Copy } from 'lucide-react';
import './CSS/HomePage.css';

export const HomePage = () => {
  const [scheduleId, setScheduleId] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    // 👇 页面打开时读 localStorage
    const savedScheduleId = localStorage.getItem('schedule-id');
    if (savedScheduleId) {
      setScheduleId(savedScheduleId);
      setGeneratedLink(`${window.location.origin}/availability?sid=${savedScheduleId}`);
    }
  }, []);

  const handleScheduleGenerated = (id) => {
    setScheduleId(id);
    const link = `${window.location.origin}/availability?sid=${id}`;
    setGeneratedLink(link);
    localStorage.setItem('schedule-id', id); // ✅ 保存新的
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <div className="home-container">
      <div className="generate-button-wrapper-home">
        <LinkGenerator onScheduleGenerated={handleScheduleGenerated} />
      </div>

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

      <AIChat key={scheduleId} scheduleId={scheduleId} />
    </div>
  );
};

export default HomePage;
