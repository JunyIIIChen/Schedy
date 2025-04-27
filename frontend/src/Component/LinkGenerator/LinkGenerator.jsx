import React, { useState } from 'react'
import './LinkGenerator.css'
export const LinkGenerator = ({ onScheduleGenerated }) => {
  const [error, setError] = useState('')

  const handleGenerateLink = async () => {
    const token = localStorage.getItem("auth-token")
    if (!token) {
      setError("No token found. Please login first.")
      return
    }

    try {
      const res = await fetch("http://localhost:5001/api/schedule", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate link");
        return;
      }

      const scheduleId = data.schedule_id;
      onScheduleGenerated(scheduleId);

      localStorage.setItem('schedule-id', scheduleId); // ✅ 加这一行保存

      setError('');
    } catch (err) {
      setError("Something went wrong");
      console.error(err);
    }
  };

  return (
    <div>
      <button className="gradient-button" onClick={handleGenerateLink}>Generate</button>
    </div>
  );
};