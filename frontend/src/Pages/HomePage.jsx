import React, { useState } from 'react';
import { LinkGenerator } from './../Component/LinkGenerator/LinkGenerator.jsx';
import { AIChat } from '../Component/AIChat/AIChat.jsx';
import { Copy } from 'lucide-react'; // 加复制icon
import './CSS/HomePage.css'; // 新建一个HomePage.css 来放样式

export const HomePage = () => {
  const [scheduleId, setScheduleId] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleScheduleGenerated = (id) => {
    setScheduleId(id);
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
      <div className="generate-button-wrapper">
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
      <AIChat scheduleId={scheduleId} />

    </div>
  );
};

export default HomePage;
