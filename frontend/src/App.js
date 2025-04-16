
import './App.css';
import { Navbar } from './Component/Navbar/Navbar';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import LoginSignup from './Pages/LoginSignup';
import { Footer } from './Component/Footer/Footer.jsx'
import Availability from './Pages/Availability.jsx'
import { LandingPage } from './Pages/LandingPage.jsx';



function App() {
  return (
    <div>
      <BrowserRouter>
        <Navbar></Navbar>
        <Routes>
          <Route path='/' element={<LandingPage></LandingPage>} />
          <Route path='login' element={<LoginSignup></LoginSignup>}></Route>
          <Route path='/availability' element={<Availability></Availability>} />
        </Routes>
        <Footer/>
      </BrowserRouter>
      
    </div>
  );
}

export default App;
