import React, { useState } from 'react'
import './LinkGenerator.css'

export const LinkGenerator = ({ onScheduleGenerated }) => {
  const [link, setLink] = useState('')
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
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to generate link")
        return
      }

      const scheduleId = data.schedule_id
      // tell your parent about it
      onScheduleGenerated(scheduleId)

      const generatedLink = `${window.location.origin}/availability?sid=${scheduleId}`
      setLink(generatedLink)
      setError('')
    } catch (err) {
      setError("Something went wrong")
      console.error(err)
    }
  }

  return (
    <div>
      <button className= "gradient-button" onClick={handleGenerateLink}>Generate</button>

      {/* {link && (
        <div style={{ marginTop: "10px" }}>
          <p>Share this link with employees:</p>
          <a href={link} target="_blank" rel="noreferrer">{link}</a>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>} */}
    </div>
  )
}
