import React from 'react'
import './CSS/Availability.css'
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

function Availability() {
  // 你也可以从 URL 上获取 schedule_id，例如:

  const [searchParams] = useSearchParams();
  const scheduleId = searchParams.get("sid");
  // 这里用 props.scheduleId 演示
  console.log("Schedule ID:", scheduleId);
  // 定义一周七天
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // 表单字段
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [preference, setPreference] = useState("");


  // availability 存储每一天的 start/end，例如：
  // availability.monday = { start: "09:00", end: "18:00" }
  const initialAvailability = {
    monday: { start: "09:00", end: "18:00" },
    tuesday: { start: "09:00", end: "18:00" },
    wednesday: { start: "09:00", end: "18:00" },
    thursday: { start: "09:00", end: "18:00" },
    friday: { start: "09:00", end: "18:00" },
    saturday: { start: "09:00", end: "18:00" },
    sunday: { start: "09:00", end: "18:00" },
  };

  const [availability, setAvailability] = useState(initialAvailability);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // 处理单个日期的时间变更
  const handleTimeChange = (dayKey, which, value) => {
    setAvailability((prev) => ({
      ...prev,
      [dayKey.toLowerCase()]: {
        ...prev[dayKey.toLowerCase()],
        [which]: value,
      },
    }));
  };

  // 提交表单
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitMessage(null);

    // 组装数据
    const payload = {
      name,
      email,
      availability,
      preference,
    };

    fetch(`http://localhost:5001/api/availability/${scheduleId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setSubmitMessage(data.message || "Submitted successfully!");
        } else {
          setSubmitMessage(data.error || "Error occurred!");
        }
      })
      .catch((err) => {
        setSubmitMessage("Network error!");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Work Availability Form</h1>
      <form className="availability-form" onSubmit={handleSubmit}>
        <label className="form-label" htmlFor="name">
          Name
        </label>
        <input
          className="form-input"
          id="name"
          type="text"
          placeholder="eg. Amelia Yang"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label className="form-label" htmlFor="email">
          Email
        </label>
        <input
          className="form-input"
          id="email"
          type="email"
          placeholder="eg. amelia.test@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="availability-time-section">
          <h3>Available Time</h3>
          {days.map((day) => (
            <div key={day} className="day-row">
              <span className="day-label">{day}</span>
              <div className="time-selectors">
                <input
                  type="time"
                  className="time-selector"
                  value={availability[day.toLowerCase()].start}
                  onChange={(e) =>
                    handleTimeChange(day, "start", e.target.value)
                  }
                  required
                />
                <span className="time-dash"> - </span>
                <input
                  type="time"
                  className="time-selector"
                  value={availability[day.toLowerCase()].end}
                  onChange={(e) => handleTimeChange(day, "end", e.target.value)}
                  required
                />
              </div>
            </div>
          ))}
        </div>

        <label className="form-label" htmlFor="preference">
          Shift Preference
        </label>
        <select
          id="preference"
          className="form-input"
          value={preference}
          onChange={(e) => setPreference(e.target.value)}
          required
        >
          <option value="">Select one</option>
          <option value="morning">Morning (before 12pm)</option>
          <option value="afternoon">Afternoon (12pm–5pm)</option>
          <option value="evening">Evening (after 5pm)</option>
          <option value="flexible">Flexible</option>
        </select>

        <button className="submit-button" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
      {submitMessage && <div className="submit-message">{submitMessage}</div>}
    </div>
  );
}

export default Availability;

