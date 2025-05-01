import React, { useState } from "react";
import "./CSS/Availability.css";
import { useSearchParams } from "react-router-dom";
import Lottie from "lottie-react";
import checkAnimation from "../Component/Assets/Check.json";


function Availability() {
  const [searchParams] = useSearchParams();
  const scheduleId = searchParams.get("sid");
  console.log("Schedule ID:", scheduleId);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [preference, setPreference] = useState("");

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
  const [unavailableDays, setUnavailableDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });

  const [submitMessage, setSubmitMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleTimeChange = (dayKey, which, value) => {
    setAvailability((prev) => ({
      ...prev,
      [dayKey.toLowerCase()]: {
        ...prev[dayKey.toLowerCase()],
        [which]: value,
      },
    }));
  };

  const toggleUnavailable = (dayKey) => {
    setUnavailableDays((prev) => ({
      ...prev,
      [dayKey]: !prev[dayKey],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitMessage(null);

    const filteredAvailability = Object.fromEntries(
      Object.entries(availability).filter(([day]) => !unavailableDays[day])
    );

    const payload = {
      name,
      email,
      availability: filteredAvailability,
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
          setSubmitted(true);
        } else {
          setSubmitMessage(data.error || "Error occurred!");
        }
      })
      .catch(() => {
        setSubmitMessage("Network error!");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="form-container">
      {submitted ? (
        <div className="success-card">
          <Lottie
            animationData={checkAnimation}
            loop={true}
            className="success-animation"
          />
          <h2>Submit Successfully!</h2>
          <p>Thanks for sharing your availability!</p>
          <p>Your manager will review it and assign shifts soon.</p>
          <p>You’ll be notified once the roster is ready.</p>

          {/* <p className="resubmit-note">
            Plan changed? <a href="/availability">Resubmit your availability</a>
            <span className="tooltip">ℹ️
              <span className="tooltip-text">
                If you resubmit your availability, only your most recent response will be shared with manager.
              </span>
            </span>
          </p> */}

          <footer className="byline">@By Schedy</footer>
        </div>
      ) : (
        <form className="availability-form" onSubmit={handleSubmit}>
          <h1 className="form-title">Work Availability Form</h1>

          <label className="form-label" htmlFor="name">Name</label>
          <input
            className="form-input"
            id="name"
            type="text"
            placeholder="eg. Amelia Yang"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label className="form-label" htmlFor="email">Email</label>
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
            {days.map((day) => {
              const key = day.toLowerCase();
              const isUnavailable = unavailableDays[key];
              return (
                <div key={day} className={`day-row ${isUnavailable ? "disabled-row" : ""}`}>
                  <span className="day-label">{day}</span>
                  <div className="time-selectors">
                    <input
                      type="time"
                      className="time-selector"
                      value={availability[key].start}
                      onChange={(e) => handleTimeChange(day, "start", e.target.value)}
                      disabled={isUnavailable}
                      required
                    />
                    <span className="time-dash"> - </span>
                    <input
                      type="time"
                      className="time-selector"
                      value={availability[key].end}
                      onChange={(e) => handleTimeChange(day, "end", e.target.value)}
                      disabled={isUnavailable}
                      required
                    />
                    <label className="unavailable-label">
                      <input
                        type="checkbox"
                        checked={isUnavailable}
                        onChange={() => toggleUnavailable(key)}
                      />
                      Unavailable
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          <label className="form-label" htmlFor="preference">Shift Preference</label>
          <select
            id="preference"
            className="form-input"
            value={preference}
            onChange={(e) => setPreference(e.target.value)}
            required
          >
            <option value="">Select one</option>
            <option value="morning">Morning (before 12pm)</option>
            <option value="afternoon">Afternoon (12pm-5pm)</option>
            <option value="evening">Evening (after 5pm)</option>
            <option value="flexible">Flexible</option>
          </select>

          <button className="submit-button" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      )}
      {submitMessage && !submitted && <div className="submit-message">{submitMessage}</div>}
    </div>
  );
}

export default Availability;
