import React, { useState } from 'react'
import { LinkGenerator } from './../Component/LinkGenerator/LinkGenerator.jsx'
import { AIChat } from '../Component/AIChat/AIChat.jsx'

export const HomePage = () => {
  const [scheduleId, setScheduleId] = useState('')

  return (
    <div>
{/* 
      <LinkGenerator onScheduleGenerated={setScheduleId} />
      
      {scheduleId && (
        <div>
          <h2>New Schedule ID:</h2>
          <p>{scheduleId}</p>
        </div>
      )} */}

      {/* pass scheduleId to AIChat */}
      <AIChat scheduleId={scheduleId} />
      
    </div>
  )
}
