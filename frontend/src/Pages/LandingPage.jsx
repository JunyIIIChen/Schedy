import React from 'react'
import './CSS/LandingPage.css'
import { Link } from 'react-router-dom'
import { LinkGenerator } from '../Component/LinkGenerator/LinkGenerator'

import arrow_icon from '../Component/Assets/arrow.png'
import frame8 from '../Component/Assets/Frame8.png'
import frame23 from '../Component/Assets/Frame23.png'
import frame24 from '../Component/Assets/Frame24.png'
import frame25 from '../Component/Assets/Frame25.png'
import frame26 from '../Component/Assets/Frame26.png'
import frame10 from '../Component/Assets/Frame10.png'




export const LandingPage = () => {
  return (
      <div className='LandingPage'>
          <h2>Smarter Scheduling, Powered by AI</h2>
          <p>An intelligent assistant designed for small business owners takes the stress out of shift scheduling.</p>
          <Link to="/login" className="LandingPage-latest-btn" style={{ textDecoration: 'none' }}>
              <div className="btn-content">
                <span>Try for free    </span>
                <img src={arrow_icon} alt="" className="arrow-icon"/>
              </div>
      </Link>
      
      
          <img className="bg-image frame8" src={frame8} alt=""/>
          <img className="bg-image frame23" src={frame23} alt=""/>
          <img className="bg-image frame24" src={frame24} alt=""/>
          <img className="bg-image frame25" src={frame25} alt=""/>
          <img className="bg-image frame26" src={frame26} alt=""/>
          <img className="bg-image frame10" src={frame10} alt=""/>

      </div>
  )
}
