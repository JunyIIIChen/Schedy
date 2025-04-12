
import './App.css';
import { Navbar } from './Component/Navbar/Navbar';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import LoginSignup from './Pages/LoginSignup';
import { LandingPage } from './Pages/LandingPage.jsx';
import { Footer } from './Component/Footer/Footer.jsx'



function App() {
  return (
    <div>
      <div className="glow-background" />
      <BrowserRouter>
        <Navbar></Navbar>
        <Routes>
          <Route path='/' element={<LandingPage></LandingPage>} />
          <Route path='login' element={<LoginSignup></LoginSignup>}></Route>
        </Routes>
        <Footer/>
      </BrowserRouter>
      
    </div>
  );
}

export default App;
