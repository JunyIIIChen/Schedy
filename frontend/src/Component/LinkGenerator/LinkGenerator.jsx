import React, { useState } from 'react'

export const LinkGenerator = () => {
  const [link, setLink] = useState('');
  const [error, setError] = useState('');

  const handleGenerateLink = async () => {
    const token = localStorage.getItem("auth-token"); // Get the stored JWT

    if (!token) {
      setError("No token found. Please login first.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/schedule", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,  // Send token to backend
          "Content-Type": "application/json"
        }
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate link");
        return;
      }

      // Construct frontend link for employees to access the form
      const scheduleId = data.schedule_id;
      const generatedLink = `${window.location.origin}/availability?sid=${scheduleId}`;
      setLink(generatedLink);
      setError('');
    } catch (err) {
      setError("Something went wrong");
      console.error(err);
    }
  };

  return (
    <div>
      <button onClick={handleGenerateLink}>Generate Schedule Link</button>

      {link && (
        <div style={{ marginTop: "10px" }}>
          <p>Share this link with employees:</p>
          <a href={link} target="_blank" rel="noreferrer">{link}</a>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
