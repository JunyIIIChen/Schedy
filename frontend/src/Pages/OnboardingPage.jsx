import React, { useState, useEffect } from 'react';
import './CSS/OnboardingPage.css';
import Lottie from 'lottie-react';
import animationData from '../Component/Assets/Frame-2087326994.json';
import threeStars from '../Component/Assets/three_stars.svg';
import { LinkGenerator } from '../Component/LinkGenerator/LinkGenerator';
import { Copy } from 'lucide-react';
import onboardingAnimation from '../Component/Assets/onboarding_animation_1.json';
import onboardingAnimation2 from '../Component/Assets/onboarding_animation_2.json';
import { Color } from 'antd/es/color-picker';

const OnboardingPage = () => {
  const [scheduleId, setScheduleId] = useState('');
  const [step, setStep] = useState(1);
  const [industry, setIndustry] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const [workerConfig, setWorkerConfig] = useState({
    monday: { start: "08:00", end: "19:00", workers: 3, dayOff: false },
    tuesday: { start: "08:00", end: "19:00", workers: 3, dayOff: false },
    wednesday: { start: "08:00", end: "19:00", workers: 3, dayOff: false },
    thursday: { start: "08:00", end: "19:00", workers: 3, dayOff: false },
    friday: { start: "08:00", end: "19:00", workers: 3, dayOff: false },
    saturday: { start: "08:00", end: "19:00", workers: 3, dayOff: false },
    sunday: { start: "08:00", end: "19:00", workers: 3, dayOff: false },
  });

  const [animationStep, setAnimationStep] = useState(1);
  const [animationFinished, setAnimationFinished] = useState(false);

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  const handleConfigChange = (day, key, value) => {
    setWorkerConfig(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [key]: key === 'dayOff' ? !prev[day].dayOff : value
      }
    }));
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/availability?sid=${scheduleId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        alert('No token found, please login again.');
        setSaving(false);
        return;
      }

      const basicRes = await fetch('/api/basic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const basicData = await basicRes.json();
      if (!basicRes.ok || !basicData || !basicData._id || !basicData._id.$oid) {
        alert('Failed to fetch user information.');
        setSaving(false);
        return;
      }

      const userId = basicData._id.$oid;

      const updateRes = await fetch('/api/update_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          updates: {
            _id: { "$oid": userId },
            industry: industry,
            workerConfig: workerConfig,
          },
        }),
      });

      const updateData = await updateRes.json();
      if (updateRes.ok && updateData.success) {
        alert('Information saved successfully!');
        setTimeout(() => {
          window.location.href = '/homepage';
        }, 1000);
      } else {
        alert(updateData.message || 'Save failed');
        setSaving(false);
      }
    } catch (error) {
      console.error('Error during saving user info', error);
      alert('Something went wrong.');
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!animationFinished) {
      document.body.classList.add('hide-navbar');
    } else {
      document.body.classList.remove('hide-navbar');
    }
  }, [animationFinished]);

  return (
    <div className="onboarding-wrapper">
      {/* 🌀 Animation Section */}
      {!animationFinished && (
        <div className="animation-container fade-in">
          {animationStep === 1 && (
            <Lottie
              animationData={onboardingAnimation2}
              loop={false}
              className="onboarding-opening-animation"
              onComplete={() => setAnimationStep(2)}
            />
          )}
          {animationStep === 2 && (
            <Lottie
              animationData={onboardingAnimation}
              loop={false}
              className="onboarding-opening-animation"
              onComplete={() => {
                setTimeout(() => {
                  setAnimationFinished(true);
                }, 1000);
              }}
            />
          )}
        </div>
      )}

      {/* 🎯 Onboarding Steps */}
      {animationFinished && (
        <div className="onboarding-container fade-in">
          {/* 你的Step 1, 2, 3, 4原本代码放这里 */}
          {/* 🎯 Step 1 */}
          {step === 1 && (
            <>
              <div className="onboarding-svg-icon">
                <img src={threeStars} alt="" />
              </div>
              <h2 className="onboarding-title">Welcome onboard!</h2>
              <div className="lottie-row">
                <Lottie className="lottie-avatar" animationData={animationData} loop={true} />
                <div className="company-info">
                  <div className="glass-box">Tell me a bit about your company.</div>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="glass-box input-field"
                  >
                    <option value="" disabled>What industry best describes your business?</option>
                    <option value="Retail">Retail</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Technology">Technology</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Automotive">Automotive</option>
                  </select>
                </div>
              </div>
              <div className="button-row first-step">
                <button className="next-button" onClick={() => setStep(2)}>Next →</button>
              </div>
            </>
          )}

          {/* 🎯 Step 2 */}
          {step === 2 && (
            <>
              <div className="lottie-row">
                <Lottie className="lottie-avatar" animationData={animationData} loop={true} />
                <div className="fade-in">
                  <h3 className="glass-box form-title">How many workers do you need during the following hours</h3>
                  <div className="worker-table">
                    <div className="table-header">
                      <span>Day</span><span>Start</span><span>End</span><span>Workers</span><span>Day Off</span>
                    </div>
                    {days.map(day => (
                      <div className="table-row" key={day}>
                        <span className="day-name">{day.slice(0, 3)}</span>
                        <input
                          type="time"
                          value={workerConfig[day].start}
                          onChange={(e) => handleConfigChange(day, "start", e.target.value)}
                          disabled={workerConfig[day].dayOff}
                        />
                        <input
                          type="time"
                          value={workerConfig[day].end}
                          onChange={(e) => handleConfigChange(day, "end", e.target.value)}
                          disabled={workerConfig[day].dayOff}
                        />
                        <input
                          type="number"
                          min="0"
                          value={workerConfig[day].workers}
                          onChange={(e) => handleConfigChange(day, "workers", e.target.value)}
                          disabled={workerConfig[day].dayOff}
                        />
                        <input
                          type="checkbox"
                          checked={workerConfig[day].dayOff}
                          onChange={() => handleConfigChange(day, "dayOff")}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="button-row">
                    <button className="back-button" onClick={() => setStep(1)}>← Back</button>
                    <button className="next-button" onClick={() => setStep(3)}>Next →</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="onboarding-title">Welcome onboard!</h2>

              {/* 第1段：提示 + View Form */}
              <div className="lottie-row">
                <Lottie className="lottie-avatar" animationData={animationData} loop={true} />
                <div className="glass-box">
                  <div className="form-text-row">
                    We've created a form to gather employee availability from employees.
                    <div className="view-form-button-wrapper">
                      <button className="view-form-button">View Form</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 第2段：Generate 按钮与说明 */}
              <div className="lottie-row">
                <Lottie className="lottie-avatar" animationData={animationData} loop={true} />
                <div className="glass-box">
                  <span>
                    Click <span style={{ color: "#007AFF" }}>Generate</span> to create the form link and send it to your employees.
                  </span>
                  <div>
                    <LinkGenerator onScheduleGenerated={setScheduleId} />
                  </div>
                </div>
              </div>

              {/* 第3段：展示链接和复制按钮（整合） */}
              <div className="glass-box view-form-box">
                {!scheduleId ? (
                  <p className="generate-hint">Click Generate button to generate the form link.</p>
                ) : (
                  <>
                    <p className="generated-link"></p>
                    <div className="link-content">
                      <a
                        href={`${window.location.origin}/availability?sid=${scheduleId}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {`${window.location.origin}/availability?sid=${scheduleId}`}
                      </a>
                      <button className="copy-button" onClick={handleCopyLink}>
                        <Copy size={20} />
                      </button>
                    </div>
                    {copySuccess && <p className="copy-success">Copied!</p>}
                  </>
                )}
              </div>

              {/* 按钮区域 */}
              <div className="button-row">
                <button className="back-button" onClick={() => setStep(2)}>← Back</button>
                <button className="next-button" onClick={() => setStep(4)}>Next →</button>
              </div>
            </>
          )}


          {/* 🎯 Step 4 */}
          {step === 4 && (
            <div className="congrats-page fade-in">
              <div className="onboarding-svg-icon">
                <img src={threeStars} alt="" />
              </div>
              <h2 className="congrats-title">Congrats!</h2>
              <p className="congrats-text">
                We're excited to have you on board! Share this link with your team, and let our smart AI handle the rest. Your custom work schedule will be ready soon — exciting things are coming!
              </p>
              <button className="next-button" onClick={handleSubmit}>Got it</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
