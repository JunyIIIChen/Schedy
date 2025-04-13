import './Navbar.css'
import logo from '../Assets/logo.png'
import { Link } from 'react-router-dom'


export const Navbar = () => {


  return (
      <div className='navbar'>
          <div className='nav-menu'>
              <Link to="/about" className='nav-menu-item'>
                  About
              </Link>
              <Link to="/calendar" className='nav-menu-item'>
                  Calendar
              </Link>
              <Link to="/settings" className='nav-menu-item'>
                  Settings
              </Link>
          </div>

          <Link to="/" style={{textDecoration: 'none'}}>
              <div className='nav-logo'>
                  <img src={logo} alt=""/>
                  <p>Schedy</p>
              </div>
          </Link>

          <div className='nav-login-cart'>
              {localStorage.getItem('auth-token') ? <button onClick={() => {
                  localStorage.removeItem('auth-token');
                  window.location.replace('/');
              }}>Logout</button> : <Link to='login'>
                  <button>Login</button>
              </Link>}

          </div>
      </div>
  )
}
