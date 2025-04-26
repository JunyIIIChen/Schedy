import React, { useState } from 'react';
import './CSS/OnboardingPage.css';
import Lottie from 'lottie-react';
import animationData from '../Component/Assets/Frame-2087326994.json';
import threeStars from '../Component/Assets/three_stars.svg';
import { LinkGenerator } from '../Component/LinkGenerator/LinkGenerator';
import { Copy } from 'lucide-react';

const OnboardingPage = () => {
  const [scheduleId, setScheduleId] = useState('');
  const [step, setStep] = useState(1);
  const [industry, setIndustry] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const [workerConfig, setWorkerConfig] = useState({
    monday: { start: "08:00", end: "19:00", workers: 3, dayOff: false },
    tuesday: { start: "08:00", end: "19:00", workers: 3, dayOff: false },
    wednesday: { start: "08:00", end: "19:00", workers: 3, dayOff: false },
    thursday: { start: "08:00", end: "19:00", workers: 3, dayOff: false },
    friday: { start: "08:00", end: "19:00", workers: 3, dayOff: false },
    saturday: { start: "08:00", end: "19:00", workers: 3, dayOff: false },
    sunday: { start: "08:00", end: "19:00", workers: 3, dayOff: false },
  });

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

  return (
    <div className="onboarding-container">

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
                <option value="Restaurant">Restaurant</option>
              </select>
            </div>
          </div>

          <div className="button-row  first-step">
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

      {/* 🎯 Step 3 */}
      {step === 3 && (
        <>
          <h2 className="onboarding-title">Welcome onboard!</h2>
          <div className="lottie-row">
            <Lottie className="lottie-avatar" animationData={animationData} loop={true} />
            <div className="glass-box">We have generated a form collecting availability information from employees.</div>
          </div>

          <div className="glass-box view-form-box">
            <span>Work Availability Form</span>
            <button className="view-form-button">View Form ⌄</button>
          </div>

          <div className="lottie-row">
            <Lottie className="lottie-avatar" animationData={animationData} loop={true} />
            <div className="glass-box">
              Click Generate Button to generate the form link, and send it to your employees.
              <div className="generate-button-wrapper">
                <LinkGenerator onScheduleGenerated={setScheduleId} />
              </div>
            </div>
          </div>

          {scheduleId && (
            <div className="glass-box generated-link-box">
              <div className="link-content">
                <div>
                  <p>Share this link with your employees:</p>
                  <a
                    href={`${window.location.origin}/availability?sid=${scheduleId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {`${window.location.origin}/availability?sid=${scheduleId}`}
                  </a>
                </div>
                <button className="copy-button" onClick={handleCopyLink}>
                  <Copy size={20} />
                </button>
              </div>
              {copySuccess && <p className="copy-success">Copied!</p>}
            </div>
          )}

          <div className="button-row">
            <button className="back-button" onClick={() => setStep(2)}>← Back</button>
            <button className="next-button" onClick={() => setStep(4)}>Next →</button> {/* 👈 新增跳转 Step 4 */}
          </div>
        </>
      )}

      {/* 🎯 Step 4 - Congrats Page */}
      {step === 4 && (
        <div className="congrats-page fade-in">
          <div className="onboarding-svg-icon">
            <img src={threeStars} alt="" />
          </div>
          <h2 className="congrats-title">Congrats!</h2>
          <p className="congrats-text">
            We're excited to have you on board! Share this link with your team, and let our smart AI handle the rest. Your custom work schedule will be ready soon — exciting things are coming!
          </p>
          <button className="next-button">Got it</button>
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
