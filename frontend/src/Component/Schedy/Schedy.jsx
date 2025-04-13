import React from 'react'
import './Schedy.css'
import { Link } from 'react-router-dom'
import arrow_icon from '../Assets/arrow.png'
import frame8 from '../Assets/Frame8.png'
import frame23 from '../Assets/Frame23.png'
import frame24 from '../Assets/Frame24.png'
import frame25 from '../Assets/Frame25.png'
import frame26 from '../Assets/Frame26.png'
import frame10 from '../Assets/Frame10.png'



export const Schedy = () => {
  return (
      <div className='schedy'>
          <h2>Smarter Shifts, Happier Teams</h2>
          <p>A intelligent scheduling assistant designed for small business owners.</p>
          <Link to="/login" className="schedy-latest-btn" style={{ textDecoration: 'none' }}>
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
