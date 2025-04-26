import React, { useState } from 'react';
import './CSS/OnboardingPage.css';
import Lottie from 'lottie-react';
import animationData from '../Component/Assets/Frame-2087326994.json';

const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [industry, setIndustry] = useState('');
  const [workerConfig, setWorkerConfig] = useState({
    monday: { start: "08:00", end: "19:00", workers: 7, dayOff: false },
    tuesday: { start: "08:00", end: "19:00", workers: 7, dayOff: false },
    wednesday: { start: "08:00", end: "19:00", workers: 7, dayOff: false },
    thursday: { start: "08:00", end: "19:00", workers: 7, dayOff: false },
    friday: { start: "08:00", end: "19:00", workers: 7, dayOff: false },
    saturday: { start: "08:00", end: "19:00", workers: 7, dayOff: false },
    sunday: { start: "08:00", end: "19:00", workers: 7, dayOff: false },
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

  return (
    <div className="onboarding-container">
      {step === 1 && (
        <>
          <h2 className="onboarding-title">Welcome onboard!</h2>
          <div className="lottie-row">
            <Lottie className="lottie-avatar" animationData={animationData} loop={true} />
            <div className="company-info">
              <div className="glass-box">Tell me a bit about your company.</div>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="glass-box"
              >
                <option value="" disabled>
                  What industry best describes your business?
                </option>
                <option value="Retail">Retail</option>
                <option value="Hotel">Hotel</option>
                <option value="Restaurant">Restaurant</option>
              </select>
            </div>
          </div>
          <div className="button-row">
            <button className="next-button" onClick={() => setStep(2)}>Next</button>
          </div>
        </>
      )}

      {step === 2 && (
        <div className="fade-in">
          <h3 className="form-title">How many workers do you need during the following hours</h3>
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
      )}

      {step === 3 && (
        <div className="fade-in step-3-box">
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
              Click <strong>Generate</strong> Button to generate the form link, and send it to your employees.
            </div>
          </div>

          <div className="form-link-box">
            <input
              className="glass-box"
              disabled
              placeholder="Click Generate Button to generate the form link"
            />
            <button className="next-button">Generate →</button>
          </div>

          <div className="button-row">
            <button className="back-button" onClick={() => setStep(2)}>← Back</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
