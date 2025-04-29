import React from 'react'
import './Footer.css'
import instagram_icon from '../Assets/instagram_icon.png'
import whatsapp_icon from '../Assets/whatsapp_icon.png'

export const Footer = () => {
    return (
        <div className='footer'>

            <div className="footer-copyright">
                <hr/>
                <p>Copyright @ 2025 - All Right Reserved.</p>

            </div>
            <div className="footer-social-icon">
                <div className="footer-icons-container">
                    <img src={instagram_icon} alt=""/>
                </div>
                <div className="footer-icons-container">
                    <img src={whatsapp_icon} alt=""/>
                </div>
            </div>
        </div>
    )
}
