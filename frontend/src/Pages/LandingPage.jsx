import React from 'react'
import './CSS/LandingPage.css'
import {Link} from 'react-router-dom'


import arrow_icon from '../Component/Assets/arrow.png'
import frame8 from '../Component/Assets/Frame8.png'
import frame23 from '../Component/Assets/Frame23.png'
import frame24 from '../Component/Assets/Frame24.png'
import frame25 from '../Component/Assets/Frame25.png'
import frame26 from '../Component/Assets/Frame26.png'
import frame10 from '../Component/Assets/Frame10.png'
import comment from '../Component/Assets/Frame2087327011.png'
import hero_image from '../Component/Assets/hero_image.png'
import sideimage from '../Component/Assets/sideimage.png'


export const LandingPage = () => {
    return (
        <div className='LandingPage'>
            <div className='LandingPage1'>
                <h2>Smarter Shifts, Happier Teams</h2>
                <p>A intelligent scheduling assistant designed for small business owners.</p>
                <Link to="/login" className="LandingPage-latest-btn" style={{textDecoration: 'none'}}>
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
            <div>
                <img className={"hero-image"} src={hero_image} alt=''/>

            </div>
            <div className="content-wrapper">
                <div className="left-section">
                    <h1 className="title">Collect availability via link — no back-and-forth.</h1>
                    <p className="text-content">
                        No more endless chats or spreadsheets — send one smart link,
                        get all your team's availability instantly.
                    </p>
                    <div className="left-image-container">
                        <img
                            src={comment}
                            alt=""
                            className="left-image"
                        />
                    </div>
                </div>
                <div className="right-section">
                    <img
                        src={sideimage}
                        alt=""
                        className="right-image"
                    />
                </div>
            </div>
            <div className="content-wrapper">
                <div className="right-section">
                    <img
                        src={sideimage}
                        alt=""
                        className="right-image"
                    />
                </div>
                <div className="left-section">
                    <h1 className="title">Auto-generate shift plans in seconds</h1>
                    <p className="text-content">
                        AI-powered shift generation that adapts to your team’s availability and business needs — done in
                        seconds.
                    </p>
                    <div className="left-image-container">
                        <img
                            src={comment}
                            alt=""
                            className="left-image"
                        />
                    </div>
                </div>

            </div>
            <div className="content-wrapper">
                <div className="left-section">
                    <h1 className="title">Drag, edit, and customize with ease</h1>
                    <p className="text-content">
                        Plans changed? No problem. Easily drag and adjust shifts in real time — no stress, no mess.
                    </p>
                    <div className="left-image-container">
                        <img
                            src={comment}
                            alt=""
                            className="left-image"
                        />
                    </div>
                </div>
                <div className="right-section">
                    <img
                        src={sideimage}
                        alt=""
                        className="right-image"
                    />
                </div>
            </div>
        </div>
    )
}
