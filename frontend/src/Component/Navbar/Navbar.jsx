// src/Component/Navbar.jsx
import './Navbar.css';
import logo from '../Assets/logo.png';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const isLoggedIn = localStorage.getItem('auth-token');

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('schedule-id');
    window.location.replace('/');
  };

  return (
    <div className='navbar'>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div className='nav-logo'>
          <img src={logo} alt="" />
        </div>
      </Link>

      <div className='nav-menu'>
        {isLoggedIn && (
          <>
            <Link to="/homepage" className='nav-menu-item'>
              Chat with AI
            </Link>
            <Link to="/calendar" className='nav-menu-item'>
              Calendar
            </Link>
            <Link to="/settings" className='nav-menu-item'>
              Settings
            </Link>
          </>
        )}
      </div>

      <div className='nav-login-cart'>
        {isLoggedIn ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/login">
            <button>Login</button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
