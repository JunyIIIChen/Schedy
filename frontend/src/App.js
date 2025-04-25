
import './App.css';
import { Navbar } from './Component/Navbar/Navbar';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import LoginSignup from './Pages/LoginSignup';
import { Footer } from './Component/Footer/Footer.jsx'
import Availability from './Pages/Availability.jsx'
import Calendar from './Pages/Calendar'
import Settings from './Pages/Settings'
import Operation from './Pages/Operation'
import { LandingPage } from './Pages/LandingPage.jsx';
import { HomePage } from './Pages/HomePage.jsx';
import OnboardingPage from './Pages/OnboardingPage.jsx';



function App() {
  return (
    <div>
      <BrowserRouter>
        <Navbar></Navbar>
        <Routes>
          <Route path='/' element={<LandingPage></LandingPage>} />
          <Route path='login' element={<LoginSignup></LoginSignup>}></Route>
          <Route path='homepage' element={<HomePage></HomePage>}></Route>
          <Route path='/availability' element={<Availability></Availability>} />
          <Route path='/calendar' element={<Calendar></Calendar>} />
          <Route path='/settings' element={<Settings> </Settings>} />
          <Route path='/operation' element={<Operation> </Operation>} />
          <Route path='/OnboardingPage' element={<OnboardingPage> </OnboardingPage>} />
        </Routes>
        <Footer/>
      </BrowserRouter>
      
    </div>
  );
}

export default App;
