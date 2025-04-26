import './Navbar.css';
import logo from '../Assets/logo.png';
import {Link} from 'react-router-dom';

export const Navbar = () => {
    const isLoggedIn = localStorage.getItem('auth-token');

    return (
        <div className='navbar'>
            <Link to="/" style={{textDecoration: 'none'}}>
                <div className='nav-logo'>
                    <img src={logo} alt=""/>
                    <p>Schedy</p>
                </div>
            </Link>

            <div className='nav-menu'>
                <Link to="/homepage" className='nav-menu-item'>
                    Chat with AI
                </Link>

                {isLoggedIn && (
                    <Link to="/calendar" className='nav-menu-item'>
                        Calendar
                    </Link>
                )}

                {isLoggedIn && (
                    <Link to="/settings" className='nav-menu-item'>
                        Settings
                    </Link>
                )}
            </div>


            <div className='nav-login-cart'>
                {isLoggedIn ? (
                    <button onClick={() => {
                        localStorage.removeItem('auth-token');
                        window.location.replace('/');
                    }}>Logout</button>
                ) : (
                    <Link to='login'>
                        <button>Login</button>
                    </Link>
                )}
            </div>
        </div>
    );
};