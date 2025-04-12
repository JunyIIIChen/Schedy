import './Navbar.css'
import logo from '../Assets/logo.png'
import { Link } from 'react-router-dom'

export const Navbar = () => {
  return (
    <div className='navbar'>
      {/* left area： About button */}
      <div className="nav-left">
        {/* <Link to="/about" style={{ textDecoration: 'none' }}> */}
          <p>About</p>
        {/* </Link> */}
      </div>

      {/* middle area：Logo */}
      <div className="nav-center">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div className='nav-logo'>
            <img src={logo} alt="logo" />
            <p>Scheduler</p>
          </div>
        </Link>
      </div>

      {/* right area：login */}
      <div className="nav-right">
        <div className='nav-login-cart'>
          {localStorage.getItem('auth-token') ? (
            <button
              onClick={() => {
                localStorage.removeItem('auth-token');
                window.location.replace('/');
              }}
            >
              Logout
            </button>
          ) : (
            <Link to='login'>
              <button>Login</button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
