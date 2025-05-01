// src/Component/LinkGenerator/LinkGenerator.jsx
import React, { useState } from 'react';
import './LinkGenerator.css'; // 记得引入对应样式

export const LinkGenerator = ({ onScheduleGenerated }) => {
  const [error, setError] = useState('');

  const handleGenerateLink = async () => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
      setError("No token found. Please login first.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5001/api/schedule`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate link");
        return;
      }

      const scheduleId = data.schedule_id;
      localStorage.setItem('schedule-id', scheduleId); // ✅ 保存到 localStorage
      onScheduleGenerated(scheduleId);
      setError('');
    } catch (err) {
      setError("Something went wrong");
      console.error(err);
    }
  };

  return (
    <div>
      <button className="gradient-button" onClick={handleGenerateLink}>
      Generate
      </button>
    </div>
  );
};

export default LinkGenerator;
